/**
 * Lesson Screen
 *
 * Displays lesson content including vocabulary, grammar, and exercises.
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
import { Lesson, Unit, VocabularyItem, GrammarPoint } from '../curriculum';
import { speakForLanguageLearning, stopSpeaking } from '../services/speech';
import { useStore } from '../store/useStore';
import { colors, fonts, fontSize, spacing, radius, shadows, languageColors } from '../theme';

interface LessonScreenProps {
  lesson: Lesson;
  unit: Unit;
  onBack: () => void;
  onStartPractice: () => void;
}

type TabType = 'overview' | 'vocabulary' | 'grammar' | 'practice';

export function LessonScreen({
  lesson,
  unit,
  onBack,
  onStartPractice,
}: LessonScreenProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [playingTerm, setPlayingTerm] = useState<string | null>(null);
  const { activeLanguage } = useStore();

  const langColor = activeLanguage ? languageColors[activeLanguage] : languageColors.japanese;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [activeTab]);

  const handlePlayVocabulary = async (item: VocabularyItem) => {
    if (!activeLanguage) return;

    if (playingTerm === item.term) {
      await stopSpeaking();
      setPlayingTerm(null);
      return;
    }

    setPlayingTerm(item.term);
    try {
      await speakForLanguageLearning(item.term, activeLanguage);
    } catch (error) {
      console.error('TTS error:', error);
    } finally {
      setPlayingTerm(null);
    }
  };

  const renderOverview = () => (
    <Animated.ScrollView style={[styles.tabContent, { opacity: fadeAnim }]}>
      {/* Description */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About this lesson</Text>
        <Text style={styles.description}>{lesson.description}</Text>
      </View>

      {/* Objectives */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Learning Objectives</Text>
        {lesson.objectives.map((objective, index) => (
          <View key={index} style={styles.objectiveItem}>
            <View style={[styles.objectiveDot, { backgroundColor: langColor.accent }]} />
            <Text style={styles.objectiveText}>{objective}</Text>
          </View>
        ))}
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: langColor.accent }]}>
            {lesson.vocabulary.length}
          </Text>
          <Text style={styles.statLabel}>Words</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: langColor.accent }]}>
            {lesson.grammarPoints.length}
          </Text>
          <Text style={styles.statLabel}>Grammar</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: langColor.accent }]}>
            {lesson.estimatedMinutes}
          </Text>
          <Text style={styles.statLabel}>Minutes</Text>
        </View>
      </View>

      {/* Cultural Note */}
      {lesson.culturalNote && (
        <View style={styles.culturalNote}>
          <View style={styles.culturalNoteHeader}>
            <View style={styles.culturalDot} />
            <Text style={styles.culturalNoteTitle}>Cultural Insight</Text>
          </View>
          <Text style={styles.culturalNoteText}>{lesson.culturalNote}</Text>
        </View>
      )}

      {/* Start Button */}
      <TouchableOpacity
        style={[styles.startButton, { backgroundColor: langColor.accent }]}
        onPress={onStartPractice}
        activeOpacity={0.8}
      >
        <Text style={styles.startButtonText}>Start Practice</Text>
        <Text style={styles.startButtonArrow}>→</Text>
      </TouchableOpacity>
    </Animated.ScrollView>
  );

  const renderVocabulary = () => (
    <Animated.ScrollView style={[styles.tabContent, { opacity: fadeAnim }]}>
      {lesson.vocabulary.map((item, index) => (
        <View key={index} style={styles.vocabCard}>
          <View style={styles.vocabHeader}>
            <View style={styles.vocabTermContainer}>
              <Text style={styles.vocabTerm}>{item.term}</Text>
              {item.reading && (
                <Text style={styles.vocabReading}>{item.reading}</Text>
              )}
            </View>
            <TouchableOpacity
              style={[styles.playButton, { backgroundColor: langColor.bg }]}
              onPress={() => handlePlayVocabulary(item)}
              activeOpacity={0.7}
            >
              <Text style={styles.playIcon}>
                {playingTerm === item.term ? '■' : '▶'}
              </Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.vocabMeaning}>{item.meaning}</Text>
          {item.example && (
            <View style={styles.exampleContainer}>
              <Text style={styles.exampleText}>{item.example}</Text>
              <Text style={styles.exampleTranslation}>
                {item.exampleTranslation}
              </Text>
            </View>
          )}
        </View>
      ))}
    </Animated.ScrollView>
  );

  const renderGrammar = () => (
    <Animated.ScrollView style={[styles.tabContent, { opacity: fadeAnim }]}>
      {lesson.grammarPoints.length === 0 ? (
        <Text style={styles.emptyText}>
          No grammar points in this lesson.
        </Text>
      ) : (
        lesson.grammarPoints.map((point, index) => (
          <View key={index} style={styles.grammarCard}>
            <Text style={[styles.grammarPattern, { color: colors.purple }]}>
              {point.pattern}
            </Text>
            <Text style={styles.grammarMeaning}>{point.meaning}</Text>

            <View style={styles.formationBox}>
              <Text style={styles.formationLabel}>Formation</Text>
              <Text style={styles.formationText}>{point.formation}</Text>
            </View>

            <Text style={styles.examplesLabel}>Examples</Text>
            {point.examples.map((example, i) => (
              <View key={i} style={styles.grammarExample}>
                <Text style={styles.grammarSentence}>{example.sentence}</Text>
                <Text style={styles.grammarTranslation}>
                  {example.translation}
                </Text>
              </View>
            ))}
            {point.notes && (
              <View style={styles.noteBox}>
                <Text style={styles.noteText}>{point.notes}</Text>
              </View>
            )}
          </View>
        ))
      )}
    </Animated.ScrollView>
  );

  const renderPractice = () => (
    <Animated.ScrollView style={[styles.tabContent, { opacity: fadeAnim }]}>
      <View style={styles.practiceSection}>
        <Text style={styles.practiceTitle}>Conversation Prompts</Text>
        <Text style={styles.practiceDescription}>
          Practice these scenarios with your AI teacher:
        </Text>
        {lesson.conversationPrompts.map((prompt, index) => (
          <TouchableOpacity
            key={index}
            style={styles.promptCard}
            onPress={onStartPractice}
            activeOpacity={0.7}
          >
            <View style={[styles.promptNumber, { backgroundColor: langColor.bg }]}>
              <Text style={[styles.promptNumberText, { color: langColor.accent }]}>
                {index + 1}
              </Text>
            </View>
            <Text style={styles.promptText}>{prompt}</Text>
            <Text style={[styles.promptArrow, { color: langColor.accent }]}>→</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.startButton, { backgroundColor: langColor.accent }]}
        onPress={onStartPractice}
        activeOpacity={0.8}
      >
        <Text style={styles.startButtonText}>Start Conversation</Text>
        <Text style={styles.startButtonArrow}>→</Text>
      </TouchableOpacity>
    </Animated.ScrollView>
  );

  const tabs: { key: TabType; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'vocabulary', label: 'Vocab' },
    { key: 'grammar', label: 'Grammar' },
    { key: 'practice', label: 'Practice' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton} activeOpacity={0.6}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={[styles.unitLabel, { color: langColor.accent }]}>
            Unit {unit.number}
          </Text>
          <Text style={styles.lessonTitle}>{lesson.title}</Text>
          <Text style={styles.lessonTitleNative}>{lesson.titleNative}</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, isActive && styles.tabActive]}
              onPress={() => setActiveTab(tab.key)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.tabText,
                  isActive && [styles.tabTextActive, { color: langColor.accent }],
                ]}
              >
                {tab.label}
              </Text>
              {isActive && (
                <View style={[styles.tabIndicator, { backgroundColor: langColor.accent }]} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Content */}
      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'vocabulary' && renderVocabulary()}
      {activeTab === 'grammar' && renderGrammar()}
      {activeTab === 'practice' && renderPractice()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    backgroundColor: colors.bgCard,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  backArrow: {
    fontSize: 28,
    color: colors.inkLight,
    fontWeight: '300',
  },
  headerInfo: {},
  unitLabel: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  lessonTitle: {
    fontSize: fontSize.xl,
    fontFamily: fonts.display,
    fontWeight: '700',
    color: colors.ink,
    marginBottom: 2,
  },
  lessonTitleNative: {
    fontSize: fontSize.md,
    color: colors.inkMuted,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.bgCard,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    position: 'relative',
  },
  tabActive: {},
  tabText: {
    fontSize: fontSize.sm,
    color: colors.inkFaint,
    fontWeight: '500',
  },
  tabTextActive: {
    fontWeight: '700',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: spacing.lg,
    right: spacing.lg,
    height: 2,
    borderRadius: 1,
  },
  tabContent: {
    flex: 1,
    padding: spacing.lg,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontFamily: fonts.display,
    fontWeight: '600',
    color: colors.ink,
    marginBottom: spacing.sm,
  },
  description: {
    fontSize: fontSize.base,
    color: colors.inkLight,
    lineHeight: 23,
  },
  objectiveItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  objectiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: spacing.sm,
    marginTop: 7,
  },
  objectiveText: {
    flex: 1,
    fontSize: fontSize.base,
    color: colors.inkLight,
    lineHeight: 21,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    ...shadows.sm,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.borderLight,
    marginVertical: spacing.xs,
  },
  statValue: {
    fontSize: fontSize.xl,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: fontSize.xs,
    color: colors.inkMuted,
    marginTop: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  culturalNote: {
    backgroundColor: colors.goldLight,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  culturalNoteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  culturalDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.gold,
    marginRight: spacing.sm,
  },
  culturalNoteTitle: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.gold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  culturalNoteText: {
    fontSize: fontSize.sm,
    color: '#92400E',
    lineHeight: 20,
  },
  startButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: radius.md,
    paddingVertical: 16,
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  startButtonText: {
    color: colors.white,
    fontSize: fontSize.md,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  startButtonArrow: {
    color: colors.white,
    fontSize: fontSize.lg,
    marginLeft: spacing.sm,
    opacity: 0.8,
  },
  vocabCard: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  vocabHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  vocabTermContainer: {},
  vocabTerm: {
    fontSize: fontSize.xl,
    fontWeight: '600',
    color: colors.ink,
  },
  vocabReading: {
    fontSize: fontSize.sm,
    color: colors.inkMuted,
    marginTop: 2,
  },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: {
    fontSize: 12,
    color: colors.primary,
  },
  vocabMeaning: {
    fontSize: fontSize.md,
    color: colors.inkLight,
    marginBottom: spacing.sm,
  },
  exampleContainer: {
    backgroundColor: colors.bgMuted,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  exampleText: {
    fontSize: fontSize.sm,
    color: colors.ink,
    marginBottom: spacing.xs,
  },
  exampleTranslation: {
    fontSize: fontSize.sm,
    color: colors.inkMuted,
    fontStyle: 'italic',
  },
  grammarCard: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.sm,
  },
  grammarPattern: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  grammarMeaning: {
    fontSize: fontSize.md,
    color: colors.inkLight,
    marginBottom: spacing.md,
  },
  formationBox: {
    backgroundColor: colors.purpleLight,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  formationLabel: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.purple,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  formationText: {
    fontSize: fontSize.sm,
    color: '#5B21B6',
    fontFamily: fonts.mono,
  },
  examplesLabel: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.ink,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  grammarExample: {
    marginBottom: spacing.sm,
    paddingLeft: spacing.md,
    borderLeftWidth: 2,
    borderLeftColor: colors.purpleLight,
  },
  grammarSentence: {
    fontSize: fontSize.base,
    color: colors.ink,
    marginBottom: 2,
  },
  grammarTranslation: {
    fontSize: fontSize.sm,
    color: colors.inkMuted,
    fontStyle: 'italic',
  },
  noteBox: {
    backgroundColor: colors.goldLight,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.sm,
  },
  noteText: {
    fontSize: fontSize.sm,
    color: '#92400E',
    lineHeight: 19,
  },
  emptyText: {
    fontSize: fontSize.base,
    color: colors.inkMuted,
    textAlign: 'center',
    marginTop: 40,
    fontStyle: 'italic',
  },
  practiceSection: {
    marginBottom: spacing.xl,
  },
  practiceTitle: {
    fontSize: fontSize.lg,
    fontFamily: fonts.display,
    fontWeight: '600',
    color: colors.ink,
    marginBottom: spacing.sm,
  },
  practiceDescription: {
    fontSize: fontSize.sm,
    color: colors.inkMuted,
    marginBottom: spacing.lg,
  },
  promptCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  promptNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  promptNumberText: {
    fontSize: fontSize.sm,
    fontWeight: '700',
  },
  promptText: {
    flex: 1,
    fontSize: fontSize.base,
    color: colors.inkLight,
  },
  promptArrow: {
    fontSize: fontSize.lg,
    marginLeft: spacing.sm,
    fontWeight: '300',
  },
});
