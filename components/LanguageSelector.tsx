/**
 * Language Selector Component
 *
 * Allows users to select which language they want to learn.
 * Shows supported languages with level selection.
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useStore } from '../store/useStore';
import {
  SupportedLanguage,
  ProficiencyLevel,
} from '../agents/prompts/system-prompt';

const LANGUAGES: {
  id: SupportedLanguage;
  name: string;
  nativeName: string;
  flag: string;
  description: string;
}[] = [
  {
    id: 'japanese',
    name: 'Japanese',
    nativeName: '日本語',
    flag: '🇯🇵',
    description: 'JLPT aligned curriculum',
  },
  {
    id: 'korean',
    name: 'Korean',
    nativeName: '한국어',
    flag: '🇰🇷',
    description: 'TOPIK aligned curriculum',
  },
  {
    id: 'mandarin',
    name: 'Mandarin',
    nativeName: '中文',
    flag: '🇨🇳',
    description: 'HSK aligned curriculum',
  },
];

const LEVELS: { id: ProficiencyLevel; label: string; description: string }[] = [
  { id: 'A1', label: 'A1', description: 'Beginner' },
  { id: 'A2', label: 'A2', description: 'Elementary' },
  { id: 'B1', label: 'B1', description: 'Intermediate' },
  { id: 'B2', label: 'B2', description: 'Upper Int.' },
  { id: 'C1', label: 'C1', description: 'Advanced' },
  { id: 'C2', label: 'C2', description: 'Mastery' },
];

export function LanguageSelector() {
  const { preferences, setPreferences, setActiveLanguage } = useStore();

  const handleSelectLanguage = (language: SupportedLanguage) => {
    setActiveLanguage(language);
  };

  const handleSelectLevel = (language: SupportedLanguage, level: ProficiencyLevel) => {
    setPreferences({
      proficiencyLevels: {
        ...preferences.proficiencyLevels,
        [language]: level,
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Choose Your Language</Text>
        <Text style={styles.subtitle}>
          Select a language to start learning
        </Text>
      </View>

      <View style={styles.languagesContainer}>
        {LANGUAGES.map((language) => (
          <View key={language.id} style={styles.languageCard}>
            <TouchableOpacity
              style={styles.languageHeader}
              onPress={() => handleSelectLanguage(language.id)}
            >
              <Text style={styles.flag}>{language.flag}</Text>
              <View style={styles.languageInfo}>
                <Text style={styles.languageName}>{language.name}</Text>
                <Text style={styles.nativeName}>{language.nativeName}</Text>
                <Text style={styles.description}>{language.description}</Text>
              </View>
            </TouchableOpacity>

            {/* Level selector */}
            <View style={styles.levelsContainer}>
              <Text style={styles.levelLabel}>Your Level:</Text>
              <View style={styles.levels}>
                {LEVELS.map((level) => (
                  <TouchableOpacity
                    key={level.id}
                    style={[
                      styles.levelButton,
                      preferences.proficiencyLevels[language.id] === level.id &&
                        styles.levelButtonActive,
                    ]}
                    onPress={() => handleSelectLevel(language.id, level.id)}
                  >
                    <Text
                      style={[
                        styles.levelText,
                        preferences.proficiencyLevels[language.id] ===
                          level.id && styles.levelTextActive,
                      ]}
                    >
                      {level.id}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Start button */}
            <TouchableOpacity
              style={styles.startButton}
              onPress={() => handleSelectLanguage(language.id)}
            >
              <Text style={styles.startButtonText}>
                Start Learning {language.name}
              </Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    padding: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  languagesContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  languageCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  languageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  flag: {
    fontSize: 40,
    marginRight: 16,
  },
  languageInfo: {
    flex: 1,
  },
  languageName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  nativeName: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 2,
  },
  description: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 4,
  },
  levelsContainer: {
    marginBottom: 16,
  },
  levelLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  levels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  levelButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    minWidth: 48,
    alignItems: 'center',
  },
  levelButtonActive: {
    backgroundColor: '#007AFF',
  },
  levelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  levelTextActive: {
    color: '#FFFFFF',
  },
  startButton: {
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
