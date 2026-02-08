/**
 * Supabase Sync Service
 *
 * Syncs local app state with Supabase database.
 * Handles loading user data and saving updates.
 */

import { supabase, isSupabaseConfigured } from './client';
import {
  Profile,
  UserPreferences,
  LearningProgress,
  SupportedLanguage,
  ProficiencyLevel,
} from './types';

/**
 * Fetch user profile from Supabase
 */
export async function fetchProfile(userId: string): Promise<Profile | null> {
  if (!isSupabaseConfigured()) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }

  return data as unknown as Profile;
}

/**
 * Update user profile
 */
export async function updateProfile(
  userId: string,
  updates: Partial<Pick<Profile, 'display_name' | 'native_language'>>
): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  const { error } = await supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId);

  if (error) {
    console.error('Error updating profile:', error);
    return false;
  }

  return true;
}

/**
 * Fetch user preferences from Supabase
 */
export async function fetchPreferences(
  userId: string
): Promise<UserPreferences | null> {
  if (!isSupabaseConfigured()) return null;

  const { data, error } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('Error fetching preferences:', error);
    return null;
  }

  return data as unknown as UserPreferences;
}

/**
 * Update user preferences
 */
export async function updatePreferences(
  userId: string,
  updates: {
    targetLanguages?: SupportedLanguage[];
    proficiencyLevels?: Record<SupportedLanguage, ProficiencyLevel>;
    voiceEnabled?: boolean;
    autoPlayResponses?: boolean;
  }
): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  const dbUpdates: Record<string, any> = {
    updated_at: new Date().toISOString(),
  };

  if (updates.targetLanguages !== undefined) {
    dbUpdates.target_languages = updates.targetLanguages;
  }
  if (updates.proficiencyLevels !== undefined) {
    dbUpdates.proficiency_levels = updates.proficiencyLevels;
  }
  if (updates.voiceEnabled !== undefined) {
    dbUpdates.voice_enabled = updates.voiceEnabled;
  }
  if (updates.autoPlayResponses !== undefined) {
    dbUpdates.auto_play_responses = updates.autoPlayResponses;
  }

  const { error } = await supabase
    .from('user_preferences')
    .update(dbUpdates)
    .eq('user_id', userId);

  if (error) {
    console.error('Error updating preferences:', error);
    return false;
  }

  return true;
}

/**
 * Fetch learning progress for a language
 */
export async function fetchProgress(
  userId: string,
  language?: SupportedLanguage
): Promise<LearningProgress[] | null> {
  if (!isSupabaseConfigured()) return null;

  let query = supabase
    .from('learning_progress')
    .select('*')
    .eq('user_id', userId);

  if (language) {
    query = query.eq('language', language);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching progress:', error);
    return null;
  }

  return data as unknown as LearningProgress[];
}

/**
 * Update learning progress for a language
 */
export async function updateProgress(
  userId: string,
  language: SupportedLanguage,
  updates: {
    vocabularyMastered?: string[];
    grammarPointsCovered?: string[];
    conversationMinutes?: number;
    exercisesCompleted?: number;
    currentStreak?: number;
    lastPracticeDate?: string | null;
  }
): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  const dbUpdates: Record<string, any> = {
    updated_at: new Date().toISOString(),
  };

  if (updates.vocabularyMastered !== undefined) {
    dbUpdates.vocabulary_mastered = updates.vocabularyMastered;
  }
  if (updates.grammarPointsCovered !== undefined) {
    dbUpdates.grammar_points_covered = updates.grammarPointsCovered;
  }
  if (updates.conversationMinutes !== undefined) {
    dbUpdates.conversation_minutes = updates.conversationMinutes;
  }
  if (updates.exercisesCompleted !== undefined) {
    dbUpdates.exercises_completed = updates.exercisesCompleted;
  }
  if (updates.currentStreak !== undefined) {
    dbUpdates.current_streak = updates.currentStreak;
  }
  if (updates.lastPracticeDate !== undefined) {
    dbUpdates.last_practice_date = updates.lastPracticeDate;
  }

  const { error } = await supabase
    .from('learning_progress')
    .update(dbUpdates)
    .eq('user_id', userId)
    .eq('language', language);

  if (error) {
    console.error('Error updating progress:', error);
    return false;
  }

  return true;
}

/**
 * Increment conversation time for a language
 */
export async function incrementConversationTime(
  userId: string,
  language: SupportedLanguage,
  minutes: number
): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  // First get current value
  const { data: current } = await supabase
    .from('learning_progress')
    .select('conversation_minutes')
    .eq('user_id', userId)
    .eq('language', language)
    .single();

  const currentMinutes = current?.conversation_minutes || 0;

  return updateProgress(userId, language, {
    conversationMinutes: currentMinutes + minutes,
    lastPracticeDate: new Date().toISOString(),
  });
}

/**
 * Update streak (called when user practices)
 */
export async function updateStreak(
  userId: string,
  language: SupportedLanguage
): Promise<number> {
  if (!isSupabaseConfigured()) return 0;

  // Get current progress
  const { data } = await supabase
    .from('learning_progress')
    .select('current_streak, last_practice_date')
    .eq('user_id', userId)
    .eq('language', language)
    .single();

  if (!data) return 0;

  const today = new Date().toDateString();
  const lastPractice = data.last_practice_date
    ? new Date(data.last_practice_date).toDateString()
    : null;

  let newStreak = data.current_streak;

  if (lastPractice === today) {
    // Already practiced today, no change
    return newStreak;
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  if (lastPractice === yesterday.toDateString()) {
    // Practiced yesterday, increment streak
    newStreak += 1;
  } else {
    // Streak broken, reset to 1
    newStreak = 1;
  }

  await updateProgress(userId, language, {
    currentStreak: newStreak,
    lastPracticeDate: new Date().toISOString(),
  });

  return newStreak;
}

/**
 * Sync all local data to Supabase
 */
export async function syncToCloud(
  userId: string,
  localData: {
    preferences?: {
      nativeLanguage: string;
      targetLanguages: SupportedLanguage[];
      proficiencyLevels: Record<SupportedLanguage, ProficiencyLevel>;
      voiceEnabled: boolean;
      autoPlayResponses: boolean;
    };
    progress?: Record<
      SupportedLanguage,
      {
        vocabularyMastered: string[];
        grammarPointsCovered: string[];
        conversationMinutes: number;
        exercisesCompleted: number;
        currentStreak: number;
        lastPracticeDate: string | null;
      }
    >;
  }
): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  try {
    // Sync preferences
    if (localData.preferences) {
      await updateProfile(userId, {
        native_language: localData.preferences.nativeLanguage,
      });

      await updatePreferences(userId, {
        targetLanguages: localData.preferences.targetLanguages,
        proficiencyLevels: localData.preferences.proficiencyLevels,
        voiceEnabled: localData.preferences.voiceEnabled,
        autoPlayResponses: localData.preferences.autoPlayResponses,
      });
    }

    // Sync progress for each language
    if (localData.progress) {
      for (const [language, progress] of Object.entries(localData.progress)) {
        await updateProgress(userId, language as SupportedLanguage, {
          vocabularyMastered: progress.vocabularyMastered,
          grammarPointsCovered: progress.grammarPointsCovered,
          conversationMinutes: progress.conversationMinutes,
          exercisesCompleted: progress.exercisesCompleted,
          currentStreak: progress.currentStreak,
          lastPracticeDate: progress.lastPracticeDate,
        });
      }
    }

    return true;
  } catch (error) {
    console.error('Error syncing to cloud:', error);
    return false;
  }
}

/**
 * Load all user data from Supabase
 */
export async function loadFromCloud(userId: string): Promise<{
  profile: Profile | null;
  preferences: UserPreferences | null;
  progress: LearningProgress[] | null;
}> {
  const [profile, preferences, progress] = await Promise.all([
    fetchProfile(userId),
    fetchPreferences(userId),
    fetchProgress(userId),
  ]);

  return { profile, preferences, progress };
}
