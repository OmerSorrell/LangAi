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

export interface FlashcardItem {
  id: string;
  term: string;
  reading?: string;
  meaning: string;
  context?: string;
  language: SupportedLanguage;
  level: ProficiencyLevel;
  addedAt: string;
  nextReviewAt: string;
  repetitions: number;
  easeFactor: number;
  interval: number;
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

  // Flashcards
  flashcards: FlashcardItem[];
  addFlashcard: (card: Omit<FlashcardItem, 'id' | 'addedAt' | 'nextReviewAt' | 'repetitions' | 'easeFactor' | 'interval'>) => void;
  removeFlashcard: (id: string) => void;
  updateFlashcard: (id: string, update: Partial<FlashcardItem>) => void;
  getFlashcardsForLanguage: (language: SupportedLanguage) => FlashcardItem[];
  reviewFlashcard: (id: string, quality: number) => void;

  // Practice mastery — per-skill progress tracking
  mastery: {
    kanaLearned: string[];           // list of romaji strings mastered
    kanjiLearned: string[];          // list of kanji chars mastered
    numbersLearned: number[];        // list of numbers mastered
  };
  markKanaLearned: (romaji: string) => void;
  markKanjiLearned: (char: string) => void;
  markNumberLearned: (n: number) => void;
  resetMastery: (skill: 'kana' | 'kanji' | 'numbers') => void;

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

      // Flashcards
      flashcards: [],
      addFlashcard: (card) => {
        const now = new Date().toISOString();
        const newCard: FlashcardItem = {
          ...card,
          id: `fc_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          addedAt: now,
          nextReviewAt: now,
          repetitions: 0,
          easeFactor: 2.5,
          interval: 1,
        };
        set((state) => {
          // Don't add duplicates (same term + language)
          const exists = state.flashcards.some(
            (fc) => fc.term === card.term && fc.language === card.language
          );
          if (exists) return state;
          return { flashcards: [...state.flashcards, newCard] };
        });
      },
      removeFlashcard: (id) =>
        set((state) => ({
          flashcards: state.flashcards.filter((fc) => fc.id !== id),
        })),
      updateFlashcard: (id, update) =>
        set((state) => ({
          flashcards: state.flashcards.map((fc) =>
            fc.id === id ? { ...fc, ...update } : fc
          ),
        })),
      getFlashcardsForLanguage: (language) => {
        return get().flashcards.filter((fc) => fc.language === language);
      },
      reviewFlashcard: (id, quality) => {
        // SM-2 spaced repetition algorithm
        set((state) => ({
          flashcards: state.flashcards.map((fc) => {
            if (fc.id !== id) return fc;
            let { easeFactor, interval, repetitions } = fc;
            if (quality >= 3) {
              if (repetitions === 0) interval = 1;
              else if (repetitions === 1) interval = 6;
              else interval = Math.round(interval * easeFactor);
              repetitions++;
            } else {
              repetitions = 0;
              interval = 1;
            }
            easeFactor = Math.max(
              1.3,
              easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
            );
            const nextReview = new Date();
            nextReview.setDate(nextReview.getDate() + interval);
            return {
              ...fc,
              easeFactor,
              interval,
              repetitions,
              nextReviewAt: nextReview.toISOString(),
            };
          }),
        }));
      },

      // Practice mastery
      mastery: { kanaLearned: [], kanjiLearned: [], numbersLearned: [] },
      markKanaLearned: (romaji) =>
        set((state) => ({
          mastery: {
            ...state.mastery,
            kanaLearned: state.mastery.kanaLearned.includes(romaji)
              ? state.mastery.kanaLearned
              : [...state.mastery.kanaLearned, romaji],
          },
        })),
      markKanjiLearned: (char) =>
        set((state) => ({
          mastery: {
            ...state.mastery,
            kanjiLearned: state.mastery.kanjiLearned.includes(char)
              ? state.mastery.kanjiLearned
              : [...state.mastery.kanjiLearned, char],
          },
        })),
      markNumberLearned: (n) =>
        set((state) => ({
          mastery: {
            ...state.mastery,
            numbersLearned: state.mastery.numbersLearned.includes(n)
              ? state.mastery.numbersLearned
              : [...state.mastery.numbersLearned, n],
          },
        })),
      resetMastery: (skill) =>
        set((state) => ({
          mastery: {
            ...state.mastery,
            ...(skill === 'kana' && { kanaLearned: [] }),
            ...(skill === 'kanji' && { kanjiLearned: [] }),
            ...(skill === 'numbers' && { numbersLearned: [] }),
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
                nativeLanguage: data.profile?.native_language || 'English',
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
        flashcards: state.flashcards,
        mastery: state.mastery,
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
            flashcards: persisted.flashcards ?? currentState.flashcards,
            mastery: persisted.mastery
              ? {
                  kanaLearned: persisted.mastery.kanaLearned ?? [],
                  kanjiLearned: persisted.mastery.kanjiLearned ?? [],
                  numbersLearned: persisted.mastery.numbersLearned ?? [],
                }
              : currentState.mastery,
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
