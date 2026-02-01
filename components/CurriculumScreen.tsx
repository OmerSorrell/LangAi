/**
 * Curriculum Screen
 *
 * Browse units and lessons, track progress, and start learning.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
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

  if (!activeLanguage) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Please select a language first.</Text>
      </SafeAreaView>
    );
  }

  const curriculum = getCurriculum(activeLanguage);
  const level = preferences.proficiencyLevels[activeLanguage];

  const getLanguageEmoji = () => {
    switch (activeLanguage) {
      case 'japanese': return '🇯🇵';
      case 'korean': return '🇰🇷';
      case 'mandarin': return '🇨🇳';
      default: return '📚';
    }
  };

  const getCertificationBadge = (cert?: string) => {
    if (!cert) return null;
    return (
      <View style={styles.certBadge}>
        <Text style={styles.certText}>{cert}</Text>
      </View>
    );
  };

  const toggleUnit = (unitId: string) => {
    setExpandedUnit(expandedUnit === unitId ? null : unitId);
  };

  const overallProgress = progress ? getCurriculumCompletion(progress) : 0;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {getLanguageEmoji()} {curriculum.name}
        </Text>
      </View>

      {/* Progress Overview */}
      <View style={styles.progressCard}>
        <Text style={styles.progressTitle}>Your Progress</Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${overallProgress}%` }]} />
        </View>
        <Text style={styles.progressText}>
          {overallProgress}% Complete • Level {level}
        </Text>
      </View>

      {/* Units List */}
      <ScrollView style={styles.unitsList} showsVerticalScrollIndicator={false}>
        {curriculum.units.map((unit) => {
          const unitProgress = progress?.unitsProgress[unit.id];
          const completion = unitProgress ? getUnitCompletion(unitProgress) : 0;
          const isExpanded = expandedUnit === unit.id;
          const isLocked = unitProgress ? !unitProgress.unlocked : true;

          return (
            <View key={unit.id} style={styles.unitCard}>
              {/* Unit Header */}
              <TouchableOpacity
                style={[styles.unitHeader, isLocked && styles.unitLocked]}
                onPress={() => !isLocked && toggleUnit(unit.id)}
                disabled={isLocked}
              >
                <View style={styles.unitInfo}>
                  <View style={styles.unitTitleRow}>
                    <Text style={styles.unitNumber}>Unit {unit.number}</Text>
                    {getCertificationBadge(unit.certification)}
                  </View>
                  <Text style={styles.unitTitle}>{unit.title}</Text>
                  <Text style={styles.unitTitleNative}>{unit.titleNative}</Text>
                  <Text style={styles.unitDescription}>{unit.description}</Text>
                </View>
                <View style={styles.unitProgress}>
                  {isLocked ? (
                    <Text style={styles.lockIcon}>🔒</Text>
                  ) : (
                    <>
                      <Text style={styles.completionText}>{completion}%</Text>
                      <Text style={styles.expandIcon}>
                        {isExpanded ? '▼' : '▶'}
                      </Text>
                    </>
                  )}
                </View>
              </TouchableOpacity>

              {/* Lessons List */}
              {isExpanded && (
                <View style={styles.lessonsList}>
                  {unit.lessons.map((lesson, index) => {
                    const lessonProgress =
                      unitProgress?.lessonsProgress[lesson.id];
                    const isCompleted = lessonProgress?.completed || false;

                    return (
                      <TouchableOpacity
                        key={lesson.id}
                        style={styles.lessonItem}
                        onPress={() => onSelectLesson(lesson, unit)}
                      >
                        <View style={styles.lessonNumber}>
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
                            <Text style={styles.lessonDuration}>
                              ⏱ {lesson.estimatedMinutes} min
                            </Text>
                            <Text style={styles.lessonVocab}>
                              📝 {lesson.vocabulary.length} words
                            </Text>
                          </View>
                        </View>
                        <Text style={styles.chevron}>›</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    marginRight: 16,
  },
  backButtonText: {
    color: '#007AFF',
    fontSize: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  progressCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  progressTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#374151',
  },
  unitsList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  unitCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  unitHeader: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'flex-start',
  },
  unitLocked: {
    opacity: 0.6,
  },
  unitInfo: {
    flex: 1,
  },
  unitTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  unitNumber: {
    fontSize: 12,
    fontWeight: '600',
    color: '#007AFF',
    textTransform: 'uppercase',
  },
  certBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  certText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#D97706',
  },
  unitTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  unitTitleNative: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  unitDescription: {
    fontSize: 13,
    color: '#9CA3AF',
    lineHeight: 18,
  },
  unitProgress: {
    alignItems: 'center',
    marginLeft: 12,
  },
  completionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
    marginBottom: 4,
  },
  expandIcon: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  lockIcon: {
    fontSize: 24,
  },
  lessonsList: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  lessonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  lessonNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  lessonIndex: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  checkIcon: {
    fontSize: 16,
    color: '#10B981',
  },
  lessonInfo: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  lessonTitleNative: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4,
  },
  lessonMeta: {
    flexDirection: 'row',
  },
  lessonDuration: {
    fontSize: 12,
    color: '#9CA3AF',
    marginRight: 12,
  },
  lessonVocab: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  chevron: {
    fontSize: 24,
    color: '#D1D5DB',
    marginLeft: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 40,
  },
});
