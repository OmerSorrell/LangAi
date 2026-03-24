/**
 * Curriculum Screen
 *
 * Browse units and lessons, track progress, and start learning.
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Animated,
} from 'react-native';
import { useStore } from '../store/useStore';
import {
  getCurriculum,
  getUnitCompletion,
  getCurriculumCompletion,
  initializeProgress,
  Unit,
  Lesson,
  CurriculumProgress,
} from '../curriculum';
import { colors, fonts, fontSize, spacing, radius, shadows, languageColors } from '../theme';

interface CurriculumScreenProps {
  onSelectLesson: (lesson: Lesson, unit: Unit) => void;
  onBack: () => void;
}

export function CurriculumScreen({ onSelectLesson, onBack }: CurriculumScreenProps) {
  const { activeLanguage, preferences } = useStore();
  const [expandedUnit, setExpandedUnit] = useState<string | null>(null);
  const [progress] = useState<CurriculumProgress | null>(() =>
    activeLanguage ? initializeProgress(activeLanguage) : null
  );

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  if (!activeLanguage) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Please select a language first.</Text>
      </SafeAreaView>
    );
  }

  const curriculum = getCurriculum(activeLanguage);
  const level = preferences.proficiencyLevels[activeLanguage];
  const langColor = languageColors[activeLanguage];

  const getLanguageEmoji = () => {
    switch (activeLanguage) {
      case 'japanese': return '🇯🇵';
      case 'korean': return '🇰🇷';
      case 'mandarin': return '🇨🇳';
      default: return '';
    }
  };

  const toggleUnit = (unitId: string) => {
    setExpandedUnit(expandedUnit === unitId ? null : unitId);
  };

  const overallProgress = progress ? getCurriculumCompletion(progress) : 0;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton} activeOpacity={0.6}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerEmoji}>{getLanguageEmoji()}</Text>
          <Text style={styles.headerTitle}>{curriculum.name}</Text>
        </View>
        <View style={styles.levelBadge}>
          <Text style={[styles.levelBadgeText, { color: langColor.accent }]}>{level}</Text>
        </View>
      </View>

      <Animated.ScrollView
        style={[styles.scrollView, { opacity: fadeAnim }]}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Progress Overview */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Overall Progress</Text>
            <Text style={[styles.progressPercent, { color: langColor.accent }]}>
              {overallProgress}%
            </Text>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.max(overallProgress, 2)}%`,
                  backgroundColor: langColor.accent,
                },
              ]}
            />
          </View>
        </View>

        {/* Units List */}
        {curriculum.units.map((unit, unitIndex) => {
          const unitProgress = progress?.unitsProgress[unit.id];
          const completion = unitProgress ? getUnitCompletion(unitProgress) : 0;
          const isExpanded = expandedUnit === unit.id;
          const isLocked = unitProgress ? !unitProgress.unlocked : true;

          return (
            <View key={unit.id} style={[styles.unitCard, isLocked && styles.unitCardLocked]}>
              {/* Unit Header */}
              <TouchableOpacity
                style={styles.unitHeader}
                onPress={() => !isLocked && toggleUnit(unit.id)}
                disabled={isLocked}
                activeOpacity={0.7}
              >
                <View style={styles.unitLeft}>
                  <View style={[
                    styles.unitNumberCircle,
                    { backgroundColor: isLocked ? colors.bgMuted : langColor.bg },
                  ]}>
                    {isLocked ? (
                      <Text style={styles.lockIcon}>🔒</Text>
                    ) : (
                      <Text style={[styles.unitNumberText, { color: langColor.accent }]}>
                        {unit.number}
                      </Text>
                    )}
                  </View>
                  <View style={styles.unitInfo}>
                    <Text style={[styles.unitTitle, isLocked && styles.textMuted]}>
                      {unit.title}
                    </Text>
                    <Text style={styles.unitTitleNative}>{unit.titleNative}</Text>
                    {unit.certification && (
                      <View style={[styles.certChip, { backgroundColor: langColor.bg }]}>
                        <Text style={[styles.certChipText, { color: langColor.accent }]}>
                          {unit.certification}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
                <View style={styles.unitRight}>
                  {!isLocked && (
                    <>
                      <Text style={[styles.completionText, { color: langColor.accent }]}>
                        {completion}%
                      </Text>
                      <Text style={styles.expandIcon}>{isExpanded ? '▾' : '▸'}</Text>
                    </>
                  )}
                </View>
              </TouchableOpacity>

              {/* Description */}
              {!isLocked && (
                <Text style={styles.unitDescription}>{unit.description}</Text>
              )}

              {/* Lessons List */}
              {isExpanded && (
                <View style={styles.lessonsList}>
                  {unit.lessons.map((lesson, index) => {
                    const lessonProgress = unitProgress?.lessonsProgress[lesson.id];
                    const isCompleted = lessonProgress?.completed || false;

                    return (
                      <TouchableOpacity
                        key={lesson.id}
                        style={styles.lessonItem}
                        onPress={() => onSelectLesson(lesson, unit)}
                        activeOpacity={0.7}
                      >
                        <View style={[
                          styles.lessonNumber,
                          isCompleted && { backgroundColor: colors.successLight },
                        ]}>
                          {isCompleted ? (
                            <Text style={styles.checkIcon}>✓</Text>
                          ) : (
                            <Text style={styles.lessonIndex}>{index + 1}</Text>
                          )}
                        </View>
                        <View style={styles.lessonInfo}>
                          <Text style={styles.lessonTitle}>{lesson.title}</Text>
                          <Text style={styles.lessonTitleNative}>
                            {lesson.titleNative}
                          </Text>
                          <View style={styles.lessonMeta}>
                            <Text style={styles.lessonMetaText}>
                              {lesson.estimatedMinutes} min
                            </Text>
                            <View style={styles.metaDot} />
                            <Text style={styles.lessonMetaText}>
                              {lesson.vocabulary.length} words
                            </Text>
                          </View>
                        </View>
                        <Text style={[styles.chevron, { color: langColor.accent }]}>›</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>
          );
        })}
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.bgCard,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  backArrow: {
    fontSize: 28,
    color: colors.inkLight,
    fontWeight: '300',
  },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerEmoji: {
    fontSize: 20,
    marginRight: spacing.sm,
  },
  headerTitle: {
    fontSize: fontSize.lg,
    fontFamily: fonts.display,
    fontWeight: '600',
    color: colors.ink,
  },
  levelBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    backgroundColor: colors.bgMuted,
  },
  levelBadgeText: {
    fontSize: fontSize.sm,
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing['3xl'],
  },
  progressCard: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    ...shadows.sm,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  progressLabel: {
    fontSize: fontSize.sm,
    fontWeight: '500',
    color: colors.inkMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  progressPercent: {
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.bgMuted,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  unitCard: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    marginBottom: spacing.md,
    padding: spacing.lg,
    ...shadows.sm,
  },
  unitCardLocked: {
    opacity: 0.55,
  },
  unitHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  unitLeft: {
    flexDirection: 'row',
    flex: 1,
  },
  unitNumberCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  unitNumberText: {
    fontSize: fontSize.md,
    fontWeight: '700',
  },
  lockIcon: {
    fontSize: 14,
  },
  unitInfo: {
    flex: 1,
  },
  unitTitle: {
    fontSize: fontSize.md,
    fontFamily: fonts.display,
    fontWeight: '600',
    color: colors.ink,
    marginBottom: 2,
  },
  textMuted: {
    color: colors.inkMuted,
  },
  unitTitleNative: {
    fontSize: fontSize.sm,
    color: colors.inkMuted,
    marginBottom: spacing.xs,
  },
  certChip: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
    marginTop: spacing.xs,
  },
  certChipText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  unitRight: {
    alignItems: 'flex-end',
    marginLeft: spacing.md,
  },
  completionText: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    marginBottom: 2,
  },
  expandIcon: {
    fontSize: 14,
    color: colors.inkFaint,
  },
  unitDescription: {
    fontSize: fontSize.sm,
    color: colors.inkMuted,
    lineHeight: 19,
    marginTop: spacing.sm,
    paddingLeft: 52,
  },
  lessonsList: {
    marginTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: spacing.sm,
  },
  lessonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  lessonNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.bgMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  lessonIndex: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.inkMuted,
  },
  checkIcon: {
    fontSize: 14,
    color: colors.success,
    fontWeight: '700',
  },
  lessonInfo: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: fontSize.base,
    fontWeight: '500',
    color: colors.ink,
    marginBottom: 1,
  },
  lessonTitleNative: {
    fontSize: fontSize.sm,
    color: colors.inkMuted,
    marginBottom: spacing.xs,
  },
  lessonMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lessonMetaText: {
    fontSize: fontSize.xs,
    color: colors.inkFaint,
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.inkFaint,
    marginHorizontal: spacing.sm,
  },
  chevron: {
    fontSize: 22,
    fontWeight: '300',
    marginLeft: spacing.sm,
  },
  errorText: {
    fontSize: fontSize.md,
    color: colors.inkMuted,
    textAlign: 'center',
    marginTop: 40,
  },
});
