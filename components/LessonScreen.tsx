/**
 * Lesson Screen
 *
 * Displays lesson content including vocabulary, grammar, and exercises.
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
import { Lesson, Unit, VocabularyItem, GrammarPoint } from '../curriculum';
import { speakForLanguageLearning, stopSpeaking } from '../services/speech';
import { useStore } from '../store/useStore';

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
    <ScrollView style={styles.tabContent}>
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
            <Text style={styles.objectiveBullet}>•</Text>
            <Text style={styles.objectiveText}>{objective}</Text>
          </View>
        ))}
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{lesson.vocabulary.length}</Text>
          <Text style={styles.statLabel}>Vocabulary</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{lesson.grammarPoints.length}</Text>
          <Text style={styles.statLabel}>Grammar</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{lesson.estimatedMinutes}</Text>
          <Text style={styles.statLabel}>Minutes</Text>
        </View>
      </View>

      {/* Cultural Note */}
      {lesson.culturalNote && (
        <View style={styles.culturalNote}>
          <Text style={styles.culturalNoteTitle}>💡 Cultural Insight</Text>
          <Text style={styles.culturalNoteText}>{lesson.culturalNote}</Text>
        </View>
      )}

      {/* Start Button */}
      <TouchableOpacity style={styles.startButton} onPress={onStartPractice}>
        <Text style={styles.startButtonText}>Start Practice</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderVocabulary = () => (
    <ScrollView style={styles.tabContent}>
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
              style={styles.playButton}
              onPress={() => handlePlayVocabulary(item)}
            >
              <Text style={styles.playIcon}>
                {playingTerm === item.term ? '⏹' : '🔊'}
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
    </ScrollView>
  );

  const renderGrammar = () => (
    <ScrollView style={styles.tabContent}>
      {lesson.grammarPoints.length === 0 ? (
        <Text style={styles.emptyText}>
          No grammar points in this lesson.
        </Text>
      ) : (
        lesson.grammarPoints.map((point, index) => (
          <View key={index} style={styles.grammarCard}>
            <Text style={styles.grammarPattern}>{point.pattern}</Text>
            <Text style={styles.grammarMeaning}>{point.meaning}</Text>
            <View style={styles.formationBox}>
              <Text style={styles.formationLabel}>Formation:</Text>
              <Text style={styles.formationText}>{point.formation}</Text>
            </View>
            <Text style={styles.examplesLabel}>Examples:</Text>
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
                <Text style={styles.noteText}>📝 {point.notes}</Text>
              </View>
            )}
          </View>
        ))
      )}
    </ScrollView>
  );

  const renderPractice = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.practiceSection}>
        <Text style={styles.practiceTitle}>Conversation Practice</Text>
        <Text style={styles.practiceDescription}>
          Practice these prompts with your AI teacher:
        </Text>
        {lesson.conversationPrompts.map((prompt, index) => (
          <TouchableOpacity
            key={index}
            style={styles.promptCard}
            onPress={onStartPractice}
          >
            <Text style={styles.promptNumber}>{index + 1}</Text>
            <Text style={styles.promptText}>{prompt}</Text>
            <Text style={styles.promptArrow}>→</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.startButton} onPress={onStartPractice}>
        <Text style={styles.startButtonText}>Start Conversation</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const tabs: { key: TabType; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'vocabulary', label: 'Vocabulary' },
    { key: 'grammar', label: 'Grammar' },
    { key: 'practice', label: 'Practice' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.unitLabel}>Unit {unit.number}</Text>
          <Text style={styles.lessonTitle}>{lesson.title}</Text>
          <Text style={styles.lessonTitleNative}>{lesson.titleNative}</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab.key && styles.tabTextActive,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
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
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    marginBottom: 8,
  },
  backButtonText: {
    color: '#007AFF',
    fontSize: 16,
  },
  headerInfo: {},
  unitLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#007AFF',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  lessonTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  lessonTitleNative: {
    fontSize: 16,
    color: '#6B7280',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 14,
    color: '#6B7280',
  },
  tabTextActive: {
    color: '#007AFF',
    fontWeight: '600',
  },
  tabContent: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    color: '#4B5563',
    lineHeight: 22,
  },
  objectiveItem: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  objectiveBullet: {
    fontSize: 15,
    color: '#10B981',
    marginRight: 8,
  },
  objectiveText: {
    flex: 1,
    fontSize: 15,
    color: '#4B5563',
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  culturalNote: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  culturalNoteTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#D97706',
    marginBottom: 8,
  },
  culturalNoteText: {
    fontSize: 14,
    color: '#92400E',
    lineHeight: 20,
  },
  startButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  vocabCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  vocabHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  vocabTermContainer: {},
  vocabTerm: {
    fontSize: 24,
    fontWeight: '600',
    color: '#111827',
  },
  vocabReading: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  playButton: {
    padding: 8,
  },
  playIcon: {
    fontSize: 20,
  },
  vocabMeaning: {
    fontSize: 16,
    color: '#4B5563',
    marginBottom: 8,
  },
  exampleContainer: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 12,
  },
  exampleText: {
    fontSize: 14,
    color: '#111827',
    marginBottom: 4,
  },
  exampleTranslation: {
    fontSize: 13,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  grammarCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  grammarPattern: {
    fontSize: 20,
    fontWeight: '700',
    color: '#7C3AED',
    marginBottom: 4,
  },
  grammarMeaning: {
    fontSize: 16,
    color: '#4B5563',
    marginBottom: 12,
  },
  formationBox: {
    backgroundColor: '#EDE9FE',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  formationLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7C3AED',
    marginBottom: 4,
  },
  formationText: {
    fontSize: 14,
    color: '#5B21B6',
    fontFamily: 'monospace',
  },
  examplesLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  grammarExample: {
    marginBottom: 8,
    paddingLeft: 12,
    borderLeftWidth: 2,
    borderLeftColor: '#E5E7EB',
  },
  grammarSentence: {
    fontSize: 15,
    color: '#111827',
    marginBottom: 2,
  },
  grammarTranslation: {
    fontSize: 13,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  noteBox: {
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  noteText: {
    fontSize: 13,
    color: '#92400E',
  },
  emptyText: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 40,
  },
  practiceSection: {
    marginBottom: 24,
  },
  practiceTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  practiceDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  promptCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  promptNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EEF2FF',
    textAlign: 'center',
    lineHeight: 28,
    fontSize: 14,
    fontWeight: '600',
    color: '#4F46E5',
    marginRight: 12,
  },
  promptText: {
    flex: 1,
    fontSize: 15,
    color: '#374151',
  },
  promptArrow: {
    fontSize: 18,
    color: '#007AFF',
    marginLeft: 8,
  },
});
