/**
 * Coming Soon — placeholder for disciplines under construction.
 *
 * Presents the upcoming discipline with a preview of what it will
 * contain, styled as a sealed scroll awaiting its opening.
 */

import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  Easing,
} from 'react-native';
import { DisciplineId } from './PracticeHubScreen';
import { colors, fonts, fontSize, spacing, shadows } from '../theme';

interface Props {
  discipline: DisciplineId;
  onBack: () => void;
}

const CONTENT: Record<DisciplineId, {
  ordinal: string;
  native: string;
  romaji: string;
  title: string;
  accent: string;
  tintBg: string;
  preview: string[];
  verb: string;
}> = {
  kana: { ordinal: '一', native: '仮名', romaji: 'kana', title: 'Syllabary', accent: '#C53D43', tintBg: 'rgba(197,61,67,0.06)', preview: [], verb: 'practice' },
  grammar: {
    ordinal: '二', native: '文法', romaji: 'bunpō', title: 'Grammar',
    accent: '#6B4C9A', tintBg: 'rgba(107,76,154,0.06)',
    preview: [
      'Particle browser — every は, が, を, に in one place',
      'Verb conjugation drill — ~ます / ~て / ~た / plain',
      'Sentence-pattern builder with context clues',
      'Keigo register practice — casual → formal → honorific',
    ],
    verb: 'parse',
  },
  vocabulary: { ordinal: '三', native: '単語', romaji: 'tango', title: 'Vocabulary', accent: '#5B8C5A', tintBg: 'rgba(91,140,90,0.06)', preview: [], verb: 'recall' },
  kanji: {
    ordinal: '四', native: '漢字', romaji: 'kanji', title: 'Characters',
    accent: '#2A2522', tintBg: 'rgba(42,37,34,0.05)',
    preview: [
      'JLPT-graded sets: N5 (103) → N4 (181) → N3 (361)',
      'Readings drill — on\'yomi and kun\'yomi',
      'Radical recognition and composition',
      'Stroke-count guessing game',
    ],
    verb: 'inscribe',
  },
  numbers: {
    ordinal: '五', native: '数', romaji: 'sū', title: 'Numbers',
    accent: '#B8860B', tintBg: 'rgba(184,134,11,0.07)',
    preview: [
      'Counting 1–99 in native reading',
      'Counters — 人 for people, 本 for long things, 枚 for flat things',
      'Date and time readings',
      'Prices, phone numbers, addresses',
    ],
    verb: 'enumerate',
  },
  listening: { ordinal: '六', native: '聴解', romaji: 'chōkai', title: 'Listening', accent: '#2D5F8A', tintBg: 'rgba(45,95,138,0.06)', preview: [], verb: 'hear' },
};

export function ComingSoonScreen({ discipline, onBack }: Props) {
  const c = CONTENT[discipline];
  const enter = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(enter, {
      toValue: 1,
      duration: 600,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backTouchable} activeOpacity={0.6}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerKanji}>{c.native}</Text>
          <Text style={styles.headerTitle}>{c.title.toUpperCase()}</Text>
        </View>
        <View style={{ width: 42 }} />
      </View>

      {/* Background ghost */}
      <Text style={[styles.bgGlyph, { color: c.accent }]} pointerEvents="none">
        {c.native[0]}
      </Text>

      <View style={styles.content}>
        <Animated.View
          style={{
            opacity: enter,
            transform: [{
              translateY: enter.interpolate({ inputRange: [0, 1], outputRange: [24, 0] }),
            }],
          }}
        >
          {/* Ordinal + seal */}
          <View style={styles.topRow}>
            <Text style={[styles.ordinal, { color: c.accent }]}>{c.ordinal}</Text>
            <View style={[styles.sealRing, { borderColor: c.accent }]}>
              <Text style={[styles.sealKanji, { color: c.accent }]}>封</Text>
            </View>
          </View>

          {/* Title block */}
          <View style={styles.titleBlock}>
            <Text style={[styles.nativeHuge, { color: c.accent }]}>{c.native}</Text>
            <Text style={styles.titleEn}>{c.title}</Text>
            <Text style={styles.romaji}>· {c.romaji} ·</Text>
          </View>

          {/* Sealed notice */}
          <View style={[styles.sealedBanner, { backgroundColor: c.tintBg, borderLeftColor: c.accent }]}>
            <Text style={styles.sealedLabel}>SEALED · 未開封</Text>
            <Text style={styles.sealedBody}>
              This discipline is still being forged. When it opens,
              you'll {c.verb} with the drills below.
            </Text>
          </View>

          {/* Preview list */}
          <Text style={styles.previewHeading}>WHAT'S COMING</Text>
          <View style={styles.previewList}>
            {c.preview.map((item, i) => (
              <View key={i} style={styles.previewItem}>
                <Text style={[styles.previewBullet, { color: c.accent }]}>
                  {String(i + 1).padStart(2, '0')}
                </Text>
                <View style={styles.previewBulletRule} />
                <Text style={styles.previewText}>{item}</Text>
              </View>
            ))}
          </View>

          {/* Footer */}
          <View style={styles.footerRule} />
          <Text style={styles.footerHint}>
            in the meantime · walk another discipline
          </Text>
          <TouchableOpacity onPress={onBack} activeOpacity={0.75} style={styles.backToHub}>
            <Text style={styles.backToHubArrow}>←</Text>
            <Text style={styles.backToHubText}>RETURN TO HUB</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.bgCard,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backTouchable: { width: 42, height: 36, justifyContent: 'center' },
  backArrow: { fontSize: 28, color: colors.inkLight, fontWeight: '300' },
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  headerKanji: { fontSize: 20, color: colors.inkMuted, opacity: 0.7 },
  headerTitle: {
    fontSize: fontSize.sm, fontWeight: '700', color: colors.ink, letterSpacing: 3,
  },

  bgGlyph: {
    position: 'absolute',
    top: 100, right: -140,
    fontSize: 540,
    opacity: 0.04,
    fontWeight: '100',
    includeFontPadding: false,
  },

  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
  },

  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  ordinal: {
    fontSize: 44,
    fontFamily: fonts.display,
    fontWeight: '400',
    includeFontPadding: false,
    opacity: 0.9,
  },
  sealRing: {
    width: 52, height: 52, borderRadius: 4, borderWidth: 2,
    alignItems: 'center', justifyContent: 'center',
    transform: [{ rotate: '-4deg' }],
    backgroundColor: 'rgba(197, 61, 67, 0.03)',
  },
  sealKanji: {
    fontSize: 26, fontFamily: fonts.display, fontWeight: '700',
    includeFontPadding: false,
  },

  titleBlock: {
    marginBottom: spacing['2xl'],
  },
  nativeHuge: {
    fontSize: 76,
    fontFamily: fonts.display,
    fontWeight: '600',
    letterSpacing: 2,
    includeFontPadding: false,
    lineHeight: 84,
    marginBottom: spacing.sm,
  },
  titleEn: {
    fontSize: fontSize.xl,
    fontFamily: fonts.display,
    color: colors.ink,
    fontWeight: '400',
    letterSpacing: -0.3,
  },
  romaji: {
    fontSize: 10,
    color: colors.inkFaint,
    letterSpacing: 3,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginTop: spacing.xs,
  },

  sealedBanner: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderLeftWidth: 3,
    borderRadius: 2,
    marginBottom: spacing['2xl'],
  },
  sealedLabel: {
    fontSize: 9, letterSpacing: 2.5, fontWeight: '700',
    color: colors.inkMuted, marginBottom: spacing.xs,
  },
  sealedBody: {
    fontSize: fontSize.sm, color: colors.inkLight,
    lineHeight: 22, fontStyle: 'italic', fontFamily: fonts.display,
  },

  previewHeading: {
    fontSize: 9, color: colors.inkFaint, letterSpacing: 2.5,
    fontWeight: '700', marginBottom: spacing.md,
  },
  previewList: {
    gap: spacing.md,
    marginBottom: spacing['2xl'],
  },
  previewItem: {
    flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md,
  },
  previewBullet: {
    fontSize: 11, fontFamily: fonts.mono, fontWeight: '700',
    letterSpacing: 1, marginTop: 2,
  },
  previewBulletRule: {
    width: 16, height: 1, backgroundColor: colors.border,
    marginTop: 10,
  },
  previewText: {
    flex: 1, fontSize: fontSize.sm, color: colors.ink,
    lineHeight: 22,
  },

  footerRule: {
    width: 40, height: 1, backgroundColor: colors.inkFaint,
    opacity: 0.4, marginBottom: spacing.md,
  },
  footerHint: {
    fontSize: 11, color: colors.inkFaint, fontStyle: 'italic',
    fontFamily: fonts.display, marginBottom: spacing.md,
    letterSpacing: 0.3,
  },
  backToHub: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    alignSelf: 'flex-start', paddingVertical: spacing.sm,
  },
  backToHubArrow: {
    fontSize: fontSize.md, color: colors.ink, fontWeight: '300',
  },
  backToHubText: {
    fontSize: 10, color: colors.ink, fontWeight: '700',
    letterSpacing: 2.5,
  },
});
