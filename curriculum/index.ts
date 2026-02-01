/**
 * Curriculum Service
 *
 * Provides access to curriculum data and progress tracking.
 */

import { japaneseCurriculum } from './japanese';
import { koreanCurriculum } from './korean';
import { mandarinCurriculum } from './mandarin';
import {
  Curriculum,
  Unit,
  Lesson,
  SupportedLanguage,
  ProficiencyLevel,
  CurriculumProgress,
  UnitProgress,
  LessonProgress,
} from './types';

// Export all curricula
export const curricula: Record<SupportedLanguage, Curriculum> = {
  japanese: japaneseCurriculum,
  korean: koreanCurriculum,
  mandarin: mandarinCurriculum,
};

/**
 * Get curriculum for a specific language
 */
export function getCurriculum(language: SupportedLanguage): Curriculum {
  return curricula[language];
}

/**
 * Get all units for a language
 */
export function getUnits(language: SupportedLanguage): Unit[] {
  return curricula[language].units;
}

/**
 * Get units filtered by proficiency level
 */
export function getUnitsByLevel(
  language: SupportedLanguage,
  level: ProficiencyLevel
): Unit[] {
  return curricula[language].units.filter((unit) => unit.level === level);
}

/**
 * Get a specific unit by ID
 */
export function getUnit(language: SupportedLanguage, unitId: string): Unit | undefined {
  return curricula[language].units.find((unit) => unit.id === unitId);
}

/**
 * Get a specific lesson by ID
 */
export function getLesson(
  language: SupportedLanguage,
  lessonId: string
): Lesson | undefined {
  for (const unit of curricula[language].units) {
    const lesson = unit.lessons.find((l) => l.id === lessonId);
    if (lesson) return lesson;
  }
  return undefined;
}

/**
 * Get the next lesson in sequence
 */
export function getNextLesson(
  language: SupportedLanguage,
  currentLessonId: string
): Lesson | null {
  const units = curricula[language].units;

  for (let i = 0; i < units.length; i++) {
    const lessons = units[i].lessons;
    const lessonIndex = lessons.findIndex((l) => l.id === currentLessonId);

    if (lessonIndex !== -1) {
      // Found current lesson
      if (lessonIndex < lessons.length - 1) {
        // Next lesson in same unit
        return lessons[lessonIndex + 1];
      } else if (i < units.length - 1) {
        // First lesson of next unit
        return units[i + 1].lessons[0] || null;
      }
    }
  }

  return null;
}

/**
 * Get recommended unit based on proficiency level
 */
export function getRecommendedUnit(
  language: SupportedLanguage,
  level: ProficiencyLevel
): Unit | undefined {
  const levelUnits = getUnitsByLevel(language, level);
  return levelUnits[0];
}

/**
 * Get total lesson count for a language
 */
export function getTotalLessons(language: SupportedLanguage): number {
  return curricula[language].units.reduce(
    (total, unit) => total + unit.lessons.length,
    0
  );
}

/**
 * Get total vocabulary count for a language
 */
export function getTotalVocabulary(language: SupportedLanguage): number {
  let total = 0;
  for (const unit of curricula[language].units) {
    for (const lesson of unit.lessons) {
      total += lesson.vocabulary.length;
    }
  }
  return total;
}

/**
 * Initialize empty progress for a curriculum
 */
export function initializeProgress(
  language: SupportedLanguage
): CurriculumProgress {
  const curriculum = curricula[language];
  const firstUnit = curriculum.units[0];
  const firstLesson = firstUnit?.lessons[0];

  const unitsProgress: Record<string, UnitProgress> = {};

  for (const unit of curriculum.units) {
    const lessonsProgress: Record<string, LessonProgress> = {};

    for (const lesson of unit.lessons) {
      lessonsProgress[lesson.id] = {
        lessonId: lesson.id,
        completed: false,
        timeSpentMinutes: 0,
        vocabularyMastered: [],
        exercisesCompleted: [],
      };
    }

    unitsProgress[unit.id] = {
      unitId: unit.id,
      lessonsProgress,
      unlocked: unit.id === firstUnit?.id, // Only first unit unlocked initially
    };
  }

  return {
    language,
    currentUnitId: firstUnit?.id || '',
    currentLessonId: firstLesson?.id || '',
    unitsProgress,
    totalTimeMinutes: 0,
    lastAccessedAt: new Date().toISOString(),
  };
}

/**
 * Calculate completion percentage for a unit
 */
export function getUnitCompletion(unitProgress: UnitProgress): number {
  const lessons = Object.values(unitProgress.lessonsProgress);
  if (lessons.length === 0) return 0;

  const completed = lessons.filter((l) => l.completed).length;
  return Math.round((completed / lessons.length) * 100);
}

/**
 * Calculate overall curriculum completion
 */
export function getCurriculumCompletion(progress: CurriculumProgress): number {
  const allLessons: LessonProgress[] = [];

  for (const unitProgress of Object.values(progress.unitsProgress)) {
    allLessons.push(...Object.values(unitProgress.lessonsProgress));
  }

  if (allLessons.length === 0) return 0;

  const completed = allLessons.filter((l) => l.completed).length;
  return Math.round((completed / allLessons.length) * 100);
}

/**
 * Check if a unit should be unlocked based on previous completion
 */
export function shouldUnlockUnit(
  progress: CurriculumProgress,
  unitId: string,
  language: SupportedLanguage
): boolean {
  const units = curricula[language].units;
  const unitIndex = units.findIndex((u) => u.id === unitId);

  if (unitIndex <= 0) return true; // First unit always unlocked

  // Check if previous unit is completed
  const previousUnit = units[unitIndex - 1];
  const previousUnitProgress = progress.unitsProgress[previousUnit.id];

  if (!previousUnitProgress) return false;

  return getUnitCompletion(previousUnitProgress) >= 80; // 80% to unlock next
}

// Export types
export * from './types';
