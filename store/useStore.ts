/**
 * App State Management with Zustand
 *
 * Manages:
 * - User preferences
 * - Active teacher agent
 * - Conversation state
 * - Learning progress
 * - Authentication state
 * - Cloud sync
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  TeacherAgent,
  createTeacher,
  ConversationMessage,
} from '../agents/teacher';
import {
  SupportedLanguage,
  ProficiencyLevel,
  InteractionMode,
} from '../agents/prompts/system-prompt';
import {
  syncToCloud,
  loadFromCloud,
  isSupabaseConfigured,
} from '../services/supabase';

export interface UserPreferences {
  nativeLanguage: string;
  targetLanguages: SupportedLanguage[];
  proficiencyLevels: Record<SupportedLanguage, ProficiencyLevel>;
  voiceEnabled: boolean;
  autoPlayResponses: boolean;
}

export interface LearningProgress {
  language: SupportedLanguage;
  vocabularyMastered: string[];
  grammarPointsCovered: string[];
  conversationMinutes: number;
  exercisesCompleted: number;
  currentStreak: number;
  lastPracticeDate: string | null;
}

interface AppState {
  // User preferences
  preferences: UserPreferences;
  setPreferences: (prefs: Partial<UserPreferences>) => void;

  // Active language and teacher
  activeLanguage: SupportedLanguage | null;
  setActiveLanguage: (lang: SupportedLanguage) => void;

  // Teacher agent (not persisted)
  teacher: TeacherAgent | null;
  initializeTeacher: (language: SupportedLanguage) => void;

  // Conversation state
  messages: ConversationMessage[];
  isLoading: boolean;
  sendMessage: (content: string) => Promise<void>;
  clearMessages: () => void;

  // Interaction mode
  interactionMode: InteractionMode;
  setInteractionMode: (mode: InteractionMode) => void;

  // Learning progress
  progress: Record<SupportedLanguage, LearningProgress>;
  updateProgress: (
    language: SupportedLanguage,
    update: Partial<LearningProgress>
  ) => void;

  // Onboarding
  hasCompletedOnboarding: boolean;
  completeOnboarding: () => void;

  // Authentication
  userId: string | null;
  isAuthenticated: boolean;
  setAuth: (userId: string | null) => void;

  // Cloud sync
  isSyncing: boolean;
  lastSyncedAt: string | null;
  syncWithCloud: () => Promise<void>;
  loadFromCloud: () => Promise<void>;
}

const defaultPreferences: UserPreferences = {
  nativeLanguage: 'English',
  targetLanguages: [],
  proficiencyLevels: {
    japanese: 'A1',
    korean: 'A1',
    mandarin: 'A1',
  },
  voiceEnabled: true,
  autoPlayResponses: true,
};

const defaultProgress: LearningProgress = {
  language: 'japanese',
  vocabularyMastered: [],
  grammarPointsCovered: [],
  conversationMinutes: 0,
  exercisesCompleted: 0,
  currentStreak: 0,
  lastPracticeDate: null,
};

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Preferences
      preferences: defaultPreferences,
      setPreferences: (prefs) =>
        set((state) => ({
          preferences: { ...state.preferences, ...prefs },
        })),

      // Active language
      activeLanguage: null,
      setActiveLanguage: (lang) => {
        set({ activeLanguage: lang });
        get().initializeTeacher(lang);
      },

      // Teacher agent
      teacher: null,
      initializeTeacher: (language) => {
        const { preferences } = get();
        const teacher = createTeacher({
          language,
          nativeLanguage: preferences.nativeLanguage,
          proficiencyLevel: preferences.proficiencyLevels[language],
        });

        // Add greeting as first message
        const greeting = teacher.getGreeting();
        set({
          teacher,
          messages: [
            {
              role: 'assistant',
              content: greeting,
              timestamp: new Date(),
            },
          ],
        });
      },

      // Messages
      messages: [],
      isLoading: false,
      sendMessage: async (content) => {
        const { teacher } = get();
        if (!teacher) return;

        // Add user message immediately
        set((state) => ({
          messages: [
            ...state.messages,
            { role: 'user', content, timestamp: new Date() },
          ],
          isLoading: true,
        }));

        try {
          // Get response from teacher
          const response = await teacher.sendMessage(content);

          // Add assistant response
          set((state) => ({
            messages: [
              ...state.messages,
              {
                role: 'assistant',
                content: response.content,
                timestamp: new Date(),
                corrections: response.corrections,
                culturalNote: response.culturalNote,
              },
            ],
            isLoading: false,
          }));

          // Update practice time
          const { activeLanguage, updateProgress } = get();
          if (activeLanguage) {
            updateProgress(activeLanguage, {
              lastPracticeDate: new Date().toISOString(),
            });
          }
        } catch (error) {
          console.error('Error sending message:', error);
          set({ isLoading: false });
        }
      },
      clearMessages: () => {
        const { teacher } = get();
        if (teacher) {
          teacher.clearHistory();
          const greeting = teacher.getGreeting();
          set({
            messages: [
              {
                role: 'assistant',
                content: greeting,
                timestamp: new Date(),
              },
            ],
          });
        } else {
          set({ messages: [] });
        }
      },

      // Interaction mode
      interactionMode: 'free_conversation',
      setInteractionMode: (mode) => {
        const { teacher } = get();
        if (teacher) {
          teacher.setMode(mode);
        }
        set({ interactionMode: mode });
      },

      // Progress
      progress: {
        japanese: { ...defaultProgress, language: 'japanese' },
        korean: { ...defaultProgress, language: 'korean' },
        mandarin: { ...defaultProgress, language: 'mandarin' },
      },
      updateProgress: (language, update) =>
        set((state) => ({
          progress: {
            ...state.progress,
            [language]: { ...state.progress[language], ...update },
          },
        })),

      // Onboarding
      hasCompletedOnboarding: false,
      completeOnboarding: () => set({ hasCompletedOnboarding: true }),

      // Authentication
      userId: null,
      isAuthenticated: false,
      setAuth: (userId) =>
        set({
          userId,
          isAuthenticated: !!userId,
        }),

      // Cloud sync
      isSyncing: false,
      lastSyncedAt: null,
      syncWithCloud: async () => {
        const state = get();
        if (!state.userId || !isSupabaseConfigured()) return;

        set({ isSyncing: true });
        try {
          await syncToCloud(state.userId, {
            preferences: state.preferences,
            progress: state.progress,
          });
          set({ lastSyncedAt: new Date().toISOString() });
        } catch (error) {
          console.error('Sync error:', error);
        } finally {
          set({ isSyncing: false });
        }
      },
      loadFromCloud: async () => {
        const state = get();
        if (!state.userId || !isSupabaseConfigured()) return;

        set({ isSyncing: true });
        try {
          const data = await loadFromCloud(state.userId);

          if (data.preferences) {
            set({
              preferences: {
                nativeLanguage: data.preferences.native_language || 'English',
                targetLanguages: data.preferences.target_languages || [],
                proficiencyLevels: data.preferences.proficiency_levels || {
                  japanese: 'A1',
                  korean: 'A1',
                  mandarin: 'A1',
                },
                voiceEnabled: data.preferences.voice_enabled ?? true,
                autoPlayResponses: data.preferences.auto_play_responses ?? true,
              },
            });
          }

          if (data.progress && data.progress.length > 0) {
            const progressMap: Record<SupportedLanguage, LearningProgress> = {
              japanese: { ...defaultProgress, language: 'japanese' },
              korean: { ...defaultProgress, language: 'korean' },
              mandarin: { ...defaultProgress, language: 'mandarin' },
            };

            for (const p of data.progress) {
              progressMap[p.language] = {
                language: p.language,
                vocabularyMastered: p.vocabulary_mastered || [],
                grammarPointsCovered: p.grammar_points_covered || [],
                conversationMinutes: p.conversation_minutes || 0,
                exercisesCompleted: p.exercises_completed || 0,
                currentStreak: p.current_streak || 0,
                lastPracticeDate: p.last_practice_date,
              };
            }

            set({ progress: progressMap });
          }

          set({ lastSyncedAt: new Date().toISOString() });
        } catch (error) {
          console.error('Load from cloud error:', error);
        } finally {
          set({ isSyncing: false });
        }
      },
    }),
    {
      name: 'language-teacher-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        preferences: state.preferences,
        activeLanguage: state.activeLanguage,
        progress: state.progress,
        hasCompletedOnboarding: state.hasCompletedOnboarding,
        userId: state.userId,
        isAuthenticated: state.isAuthenticated,
        lastSyncedAt: state.lastSyncedAt,
      }),
      // Deep merge to avoid read-only property errors
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<AppState> | undefined;
        return {
          ...currentState,
          ...(persisted ? {
            preferences: { ...currentState.preferences, ...persisted.preferences },
            activeLanguage: persisted.activeLanguage ?? currentState.activeLanguage,
            progress: {
              ...currentState.progress,
              ...(persisted.progress ? {
                japanese: { ...currentState.progress.japanese, ...persisted.progress.japanese },
                korean: { ...currentState.progress.korean, ...persisted.progress.korean },
                mandarin: { ...currentState.progress.mandarin, ...persisted.progress.mandarin },
              } : {}),
            },
            hasCompletedOnboarding: persisted.hasCompletedOnboarding ?? currentState.hasCompletedOnboarding,
            userId: persisted.userId ?? currentState.userId,
            isAuthenticated: persisted.isAuthenticated ?? currentState.isAuthenticated,
            lastSyncedAt: persisted.lastSyncedAt ?? currentState.lastSyncedAt,
          } : {}),
        };
      },
    }
  )
);
