/**
 * App State Management with Zustand
 *
 * Manages:
 * - User preferences
 * - Active teacher agent
 * - Conversation state
 * - Learning progress
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
    }),
    {
      name: 'language-teacher-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        preferences: state.preferences,
        activeLanguage: state.activeLanguage,
        progress: state.progress,
        hasCompletedOnboarding: state.hasCompletedOnboarding,
      }),
    }
  )
);
