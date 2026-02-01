/**
 * Curriculum Type Definitions
 *
 * Structures for lessons, units, and learning paths.
 */

export type SupportedLanguage = 'japanese' | 'korean' | 'mandarin';
export type ProficiencyLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export type ExerciseType =
  | 'vocabulary'
  | 'grammar'
  | 'reading'
  | 'listening'
  | 'speaking'
  | 'writing'
  | 'conversation';

export interface VocabularyItem {
  term: string;
  reading?: string; // Furigana for Japanese, Pinyin for Mandarin
  meaning: string;
  example?: string;
  exampleTranslation?: string;
  audioUrl?: string;
}

export interface GrammarPoint {
  pattern: string;
  meaning: string;
  formation: string;
  examples: {
    sentence: string;
    translation: string;
  }[];
  notes?: string;
}

export interface Exercise {
  id: string;
  type: ExerciseType;
  instruction: string;
  content: any; // Varies by exercise type
  hints?: string[];
  difficulty: 1 | 2 | 3; // Easy, Medium, Hard
}

export interface Lesson {
  id: string;
  title: string;
  titleNative: string; // Title in target language
  description: string;
  objectives: string[];
  estimatedMinutes: number;
  vocabulary: VocabularyItem[];
  grammarPoints: GrammarPoint[];
  exercises: Exercise[];
  culturalNote?: string;
  conversationPrompts: string[];
}

export interface Unit {
  id: string;
  number: number;
  title: string;
  titleNative: string;
  description: string;
  level: ProficiencyLevel;
  lessons: Lesson[];
  certification?: string; // e.g., "JLPT N5", "TOPIK I", "HSK 1"
}

export interface Curriculum {
  language: SupportedLanguage;
  name: string;
  description: string;
  units: Unit[];
}

export interface LessonProgress {
  lessonId: string;
  completed: boolean;
  completedAt?: string;
  score?: number; // 0-100
  timeSpentMinutes: number;
  vocabularyMastered: string[];
  exercisesCompleted: string[];
}

export interface UnitProgress {
  unitId: string;
  lessonsProgress: Record<string, LessonProgress>;
  unlocked: boolean;
  completedAt?: string;
}

export interface CurriculumProgress {
  language: SupportedLanguage;
  currentUnitId: string;
  currentLessonId: string;
  unitsProgress: Record<string, UnitProgress>;
  totalTimeMinutes: number;
  lastAccessedAt: string;
}
