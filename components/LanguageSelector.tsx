/**
 * Language Selector Component
 *
 * Allows users to select which language they want to learn.
 * Shows supported languages with level selection.
 */

import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Animated,
} from 'react-native';
import { useStore } from '../store/useStore';
import {
  SupportedLanguage,
  ProficiencyLevel,
} from '../agents/prompts/system-prompt';
import {
  colors,
  fonts,
  fontSize,
  spacing,
  radius,
  shadows,
  languageColors,
} from '../theme';

const LANGUAGES: {
  id: SupportedLanguage;
  name: string;
  nativeName: string;
  flag: string;
  description: string;
  greeting: string;
}[] = [
  {
    id: 'japanese',
    name: 'Japanese',
    nativeName: '日本語',
    flag: '🇯🇵',
    description: 'JLPT aligned curriculum',
    greeting: 'はじめまして',
  },
  {
    id: 'korean',
    name: 'Korean',
    nativeName: '한국어',
    flag: '🇰🇷',
    description: 'TOPIK aligned curriculum',
    greeting: '반갑습니다',
  },
  {
    id: 'mandarin',
    name: 'Mandarin',
    nativeName: '中文',
    flag: '🇨🇳',
    description: 'HSK aligned curriculum',
    greeting: '很高兴认识你',
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

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnims = useRef(LANGUAGES.map(() => new Animated.Value(40))).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();

    LANGUAGES.forEach((_, i) => {
      Animated.timing(slideAnims[i], {
        toValue: 0,
        duration: 500,
        delay: 100 + i * 120,
        useNativeDriver: true,
      }).start();
    });
  }, []);

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
      <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
        <Text style={styles.title}>Choose Your Path</Text>
        <Text style={styles.subtitle}>Select a language to begin</Text>
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.languagesContainer}
        showsVerticalScrollIndicator={false}
      >
        {LANGUAGES.map((language, index) => {
          const langColor = languageColors[language.id];
          return (
            <Animated.View
              key={language.id}
              style={[
                styles.languageCard,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnims[index] }],
                },
              ]}
            >
              {/* Language accent bar */}
              <View
                style={[styles.accentBar, { backgroundColor: langColor.accent }]}
              />

              <View style={styles.cardContent}>
                <TouchableOpacity
                  style={styles.languageHeader}
                  onPress={() => handleSelectLanguage(language.id)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.flag}>{language.flag}</Text>
                  <View style={styles.languageInfo}>
                    <Text style={styles.languageName}>{language.name}</Text>
                    <Text style={styles.nativeName}>{language.nativeName}</Text>
                  </View>
                  <View
                    style={[
                      styles.certChip,
                      { backgroundColor: langColor.bg },
                    ]}
                  >
                    <Text
                      style={[styles.certText, { color: langColor.accent }]}
                    >
                      {language.description.split(' ')[0]}
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* Native greeting */}
                <Text style={styles.greeting}>{language.greeting}</Text>

                {/* Level selector */}
                <View style={styles.levelsContainer}>
                  <Text style={styles.levelLabel}>Your level</Text>
                  <View style={styles.levels}>
                    {LEVELS.map((level) => {
                      const isActive =
                        preferences.proficiencyLevels[language.id] === level.id;
                      return (
                        <TouchableOpacity
                          key={level.id}
                          style={[
                            styles.levelButton,
                            isActive && [
                              styles.levelButtonActive,
                              { backgroundColor: langColor.accent },
                            ],
                          ]}
                          onPress={() =>
                            handleSelectLevel(language.id, level.id)
                          }
                          activeOpacity={0.7}
                        >
                          <Text
                            style={[
                              styles.levelText,
                              isActive && styles.levelTextActive,
                            ]}
                          >
                            {level.id}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* Start button */}
                <TouchableOpacity
                  style={[
                    styles.startButton,
                    { backgroundColor: langColor.accent },
                  ]}
                  onPress={() => handleSelectLanguage(language.id)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.startButtonText}>
                    Begin {language.name}
                  </Text>
                  <Text style={styles.startButtonArrow}>→</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    paddingTop: spacing['2xl'],
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  title: {
    fontSize: fontSize['2xl'],
    fontFamily: fonts.display,
    fontWeight: '700',
    color: colors.ink,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.base,
    color: colors.inkMuted,
  },
  scrollView: {
    flex: 1,
  },
  languagesContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing['2xl'],
  },
  languageCard: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    marginBottom: spacing.lg,
    overflow: 'hidden',
    ...shadows.md,
  },
  accentBar: {
    height: 3,
  },
  cardContent: {
    padding: spacing.lg,
  },
  languageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  flag: {
    fontSize: 36,
    marginRight: spacing.md,
  },
  languageInfo: {
    flex: 1,
  },
  languageName: {
    fontSize: fontSize.lg,
    fontFamily: fonts.display,
    fontWeight: '600',
    color: colors.ink,
  },
  nativeName: {
    fontSize: fontSize.base,
    color: colors.inkMuted,
    marginTop: 1,
  },
  certChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
  },
  certText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  greeting: {
    fontSize: fontSize.xl,
    color: colors.inkLight,
    textAlign: 'center',
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.borderLight,
    letterSpacing: 2,
  },
  levelsContainer: {
    marginBottom: spacing.lg,
  },
  levelLabel: {
    fontSize: fontSize.sm,
    fontWeight: '500',
    color: colors.inkMuted,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  levels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  levelButton: {
    paddingHorizontal: 10,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    backgroundColor: colors.bgMuted,
    minWidth: 46,
    alignItems: 'center',
  },
  levelButtonActive: {
    backgroundColor: colors.primary,
  },
  levelText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.inkLight,
  },
  levelTextActive: {
    color: colors.white,
  },
  startButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: radius.md,
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
});
