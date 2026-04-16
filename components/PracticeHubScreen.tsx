/**
 * Practice Hub — 修行 SHUGYŌ
 *
 * Six disciplines of language practice presented as training stations.
 * Traditional ordinal numbering, stroke-tally progress marks, per-skill
 * accent colors. Hub navigates to individual drill screens.
 */

import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  Easing,
} from 'react-native';
import { useStore } from '../store/useStore';
import { KANA_COUNT } from '../curriculum/kana';
import { PARTICLES } from '../curriculum/particles';
import {
  colors,
  fonts,
  fontSize,
  spacing,
  radius,
  shadows,
} from '../theme';

export type DisciplineId =
  | 'kana'
  | 'kanji'
  | 'vocabulary'
  | 'grammar'
  | 'numbers'
  | 'listening';

interface Discipline {
  id: DisciplineId;
  ordinal: string;        // 一 二 三 四 五 六
  native: string;         // 仮名 漢字 etc.
  romaji: string;         // kana / kanji
  title: string;          // English
  tagline: string;        // one-liner
  accent: string;         // discipline color
  tintBg: string;         // soft bg tint
  total: number;          // denominator for progress
}

const DISCIPLINES: Discipline[] = [
  {
    id: 'kana',
    ordinal: '一',
    native: '仮名',
    romaji: 'kana',
    title: 'Syllabary',
    tagline: 'Hiragana & katakana — the bones of written Japanese.',
    accent: '#C53D43',
    tintBg: 'rgba(197, 61, 67, 0.06)',
    total: KANA_COUNT,
  },
  {
    id: 'grammar',
    ordinal: '二',
    native: '文法',
    romaji: 'bunpō',
    title: 'Grammar',
    tagline: 'Particles and sentence patterns that carry meaning.',
    accent: '#6B4C9A',
    tintBg: 'rgba(107, 76, 154, 0.06)',
    total: Object.keys(PARTICLES).length,
  },
  {
    id: 'vocabulary',
    ordinal: '三',
    native: '単語',
    romaji: 'tango',
    title: 'Vocabulary',
    tagline: 'Your personal deck — words you\'ve met in the wild.',
    accent: '#5B8C5A',
    tintBg: 'rgba(91, 140, 90, 0.06)',
    total: 0, // filled dynamically
  },
  {
    id: 'kanji',
    ordinal: '四',
    native: '漢字',
    romaji: 'kanji',
    title: 'Characters',
    tagline: 'Meaning-bearing glyphs arranged by JLPT level.',
    accent: '#2A2522',
    tintBg: 'rgba(42, 37, 34, 0.05)',
    total: 103, // placeholder for N5
  },
  {
    id: 'numbers',
    ordinal: '五',
    native: '数',
    romaji: 'sū',
    title: 'Numbers',
    tagline: 'Counting, counters, dates, quantities.',
    accent: '#B8860B',
    tintBg: 'rgba(184, 134, 11, 0.07)',
    total: 100,
  },
  {
    id: 'listening',
    ordinal: '六',
    native: '聴解',
    romaji: 'chōkai',
    title: 'Listening',
    tagline: 'Train your ear with graded JLPT sentences.',
    accent: '#2D5F8A',
    tintBg: 'rgba(45, 95, 138, 0.06)',
    total: 0, // listening has no fixed total — show "open"
  },
];

interface Props {
  onBack: () => void;
  onSelect: (discipline: DisciplineId) => void;
}

export function PracticeHubScreen({ onBack, onSelect }: Props) {
  const { mastery, flashcards, activeLanguage } = useStore();

  // Animation — staggered card entrance
  const cardAnims = useRef(DISCIPLINES.map(() => new Animated.Value(0))).current;
  const heroAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(heroAnim, {
      toValue: 1,
      duration: 700,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    Animated.stagger(
      70,
      cardAnims.map((a) =>
        Animated.timing(a, {
          toValue: 1,
          duration: 500,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        })
      )
    ).start();
  }, []);

  // Pull live progress values per discipline
  const getProgress = (d: Discipline): { done: number; total: number } => {
    switch (d.id) {
      case 'kana':
        return { done: mastery.kanaLearned.length, total: KANA_COUNT };
      case 'kanji':
        return { done: mastery.kanjiLearned.length, total: d.total };
      case 'numbers':
        return { done: mastery.numbersLearned.length, total: d.total };
      case 'vocabulary': {
        const langCards = activeLanguage
          ? flashcards.filter((f) => f.language === activeLanguage)
          : flashcards;
        return { done: langCards.length, total: 0 };
      }
      case 'grammar':
        return { done: 0, total: d.total };
      case 'listening':
        return { done: 0, total: 0 };
    }
  };

  // Total mastery across disciplines (for hero bar)
  const totalMastered = mastery.kanaLearned.length + mastery.kanjiLearned.length + mastery.numbersLearned.length;
  const totalPossible = KANA_COUNT + 103 + 100;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backTouchable} activeOpacity={0.6}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerKanji}>修</Text>
          <Text style={styles.headerTitle}>PRACTICE</Text>
        </View>
        <View style={{ width: 42 }} />
      </View>

      {/* Background ghost glyph */}
      <Text style={styles.bgGlyph} pointerEvents="none">修</Text>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <Animated.View
          style={[
            styles.hero,
            {
              opacity: heroAnim,
              transform: [{
                translateY: heroAnim.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }),
              }],
            },
          ]}
        >
          <Text style={styles.heroEyebrow}>六つの修行 · SIX DISCIPLINES</Text>
          <Text style={styles.heroTitle}>
            Walk the disciplines{'\n'}in any order.
          </Text>
          <View style={styles.heroRule} />

          {/* Overall mastery ruler */}
          <View style={styles.masteryRow}>
            <Text style={styles.masteryLabel}>TOTAL MASTERED</Text>
            <View style={styles.masteryCount}>
              <Text style={styles.masteryNum}>{String(totalMastered).padStart(3, '0')}</Text>
              <Text style={styles.masterySlash}>/</Text>
              <Text style={styles.masteryDen}>{totalPossible}</Text>
            </View>
          </View>
          <View style={styles.masteryBar}>
            <View
              style={[
                styles.masteryFill,
                { width: `${Math.min(100, (totalMastered / totalPossible) * 100)}%` },
              ]}
            />
          </View>
        </Animated.View>

        {/* Discipline cards */}
        <View style={styles.disciplines}>
          {DISCIPLINES.map((d, i) => {
            const { done, total } = getProgress(d);
            return (
              <Animated.View
                key={d.id}
                style={{
                  opacity: cardAnims[i],
                  transform: [{
                    translateY: cardAnims[i].interpolate({
                      inputRange: [0, 1],
                      outputRange: [24, 0],
                    }),
                  }],
                }}
              >
                <DisciplineCard
                  discipline={d}
                  done={done}
                  total={total}
                  onPress={() => onSelect(d.id)}
                />
              </Animated.View>
            );
          })}
        </View>

        {/* Footer aphorism */}
        <View style={styles.footerBlock}>
          <View style={styles.footerRule} />
          <Text style={styles.footerAphorism}>
            千里の道も一歩から
          </Text>
          <Text style={styles.footerAphorismTrans}>
            a journey of a thousand ri begins with a single step
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Discipline Card ─────────────────────────────────────────

function DisciplineCard({
  discipline,
  done,
  total,
  onPress,
}: {
  discipline: Discipline;
  done: number;
  total: number;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      style={styles.cardWrap}
    >
      {/* Colored left stripe */}
      <View style={[styles.cardStripe, { backgroundColor: discipline.accent }]} />

      <View style={styles.card}>
        {/* Ordinal column */}
        <View style={styles.ordinalCol}>
          <Text style={[styles.ordinal, { color: discipline.accent }]}>
            {discipline.ordinal}
          </Text>
        </View>

        {/* Vertical ink rule */}
        <View style={styles.inkRule} />

        {/* Content */}
        <View style={styles.cardContent}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.cardHeaderLeft}>
              <Text style={styles.disciplineTitle}>{discipline.title}</Text>
              <Text style={styles.disciplineRomaji}>{discipline.romaji}</Text>
            </View>
            <View style={[styles.nativeBlock, { backgroundColor: discipline.tintBg }]}>
              <Text style={[styles.nativeScript, { color: discipline.accent }]}>
                {discipline.native}
              </Text>
            </View>
          </View>

          <Text style={styles.tagline}>{discipline.tagline}</Text>

          <View style={styles.progressRow}>
            <StrokeTally done={done} total={total} color={discipline.accent} />
            <View style={styles.enterGroup}>
              <Text style={styles.enterLabel}>ENTER</Text>
              <Text style={[styles.enterArrow, { color: discipline.accent }]}>→</Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─── Stroke Tally ─────────────────────────────────────────────
// Horizontal marks grouped by 5 — traditional counting. If total is
// absent or too large, falls back to monospace "n / m" readout.

function StrokeTally({
  done,
  total,
  color,
}: {
  done: number;
  total: number;
  color: string;
}) {
  // Too large or unknown — show count only
  if (total === 0 || total > 60) {
    return (
      <View style={styles.tallyFallback}>
        {total === 0 ? (
          <>
            <Text style={[styles.tallyNum, { color }]}>{String(done).padStart(2, '0')}</Text>
            <Text style={styles.tallyLabelAfter}>collected</Text>
          </>
        ) : (
          <>
            <Text style={[styles.tallyNum, { color }]}>{String(done).padStart(3, '0')}</Text>
            <Text style={styles.tallySlash}>/</Text>
            <Text style={styles.tallyDen}>{total}</Text>
          </>
        )}
      </View>
    );
  }

  // Build tick groups of 5
  const groups: number[][] = [];
  for (let i = 0; i < total; i += 5) {
    const group: number[] = [];
    for (let j = 0; j < 5 && i + j < total; j++) {
      group.push(i + j);
    }
    groups.push(group);
  }

  return (
    <View style={styles.tallyWrap}>
      <View style={styles.tallyGroups}>
        {groups.map((group, gi) => (
          <View key={gi} style={styles.tallyGroup}>
            {group.map((idx) => {
              const active = idx < done;
              return (
                <View
                  key={idx}
                  style={[
                    styles.tick,
                    active
                      ? { backgroundColor: color, opacity: 1 }
                      : { backgroundColor: colors.inkFaint, opacity: 0.25 },
                  ]}
                />
              );
            })}
          </View>
        ))}
      </View>
      <Text style={[styles.tallyReadout, { color }]}>
        {String(done).padStart(2, '0')}
        <Text style={styles.tallyReadoutSlash}>/</Text>
        {total}
      </Text>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────

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
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.ink,
    letterSpacing: 3,
  },

  bgGlyph: {
    position: 'absolute',
    top: 180,
    left: -80,
    fontSize: 480,
    color: colors.ink,
    opacity: 0.02,
    fontWeight: '100',
    includeFontPadding: false,
  },

  scroll: { flex: 1 },
  scrollContent: { paddingBottom: spacing['3xl'] },

  // Hero
  hero: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing['2xl'],
    paddingBottom: spacing.xl,
  },
  heroEyebrow: {
    fontSize: 10,
    color: colors.inkFaint,
    letterSpacing: 3,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  heroTitle: {
    fontSize: fontSize['2xl'],
    fontFamily: fonts.display,
    fontWeight: '400',
    color: colors.ink,
    lineHeight: 38,
    letterSpacing: -0.3,
  },
  heroRule: {
    width: 40,
    height: 1,
    backgroundColor: colors.ink,
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
    opacity: 0.4,
  },
  masteryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: spacing.sm,
  },
  masteryLabel: {
    fontSize: 9,
    color: colors.inkFaint,
    letterSpacing: 2.5,
    fontWeight: '700',
  },
  masteryCount: { flexDirection: 'row', alignItems: 'baseline' },
  masteryNum: {
    fontSize: fontSize.xl,
    fontFamily: fonts.mono,
    color: colors.ink,
    fontWeight: '500',
    letterSpacing: 1,
  },
  masterySlash: {
    fontSize: fontSize.md,
    color: colors.inkFaint,
    fontFamily: fonts.mono,
    marginHorizontal: 4,
  },
  masteryDen: {
    fontSize: fontSize.sm,
    color: colors.inkMuted,
    fontFamily: fonts.mono,
  },
  masteryBar: {
    height: 2,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  masteryFill: {
    height: '100%',
    backgroundColor: colors.ink,
  },

  // Disciplines list
  disciplines: {
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },

  // Card
  cardWrap: {
    flexDirection: 'row',
    backgroundColor: colors.bgCard,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    ...shadows.sm,
  },
  cardStripe: {
    width: 3,
  },
  card: {
    flex: 1,
    flexDirection: 'row',
    padding: spacing.lg,
    paddingLeft: spacing.md,
  },
  ordinalCol: {
    width: 32,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 2,
  },
  ordinal: {
    fontSize: 28,
    fontFamily: fonts.display,
    fontWeight: '400',
    includeFontPadding: false,
    opacity: 0.85,
  },
  inkRule: {
    width: 1,
    backgroundColor: colors.border,
    marginHorizontal: spacing.md,
  },
  cardContent: {
    flex: 1,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  cardHeaderLeft: { flex: 1, paddingTop: 2 },
  disciplineTitle: {
    fontSize: fontSize.lg,
    fontFamily: fonts.display,
    fontWeight: '500',
    color: colors.ink,
    letterSpacing: 0.2,
    marginBottom: 2,
  },
  disciplineRomaji: {
    fontSize: 10,
    color: colors.inkFaint,
    letterSpacing: 2,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  nativeBlock: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 2,
    marginLeft: spacing.md,
  },
  nativeScript: {
    fontSize: fontSize.xl,
    fontFamily: fonts.display,
    fontWeight: '600',
    letterSpacing: 1,
    includeFontPadding: false,
  },
  tagline: {
    fontSize: fontSize.sm,
    color: colors.inkMuted,
    lineHeight: 20,
    marginBottom: spacing.md,
    fontStyle: 'italic',
    fontFamily: fonts.display,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  enterGroup: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  enterLabel: {
    fontSize: 9,
    color: colors.inkFaint,
    letterSpacing: 2.5,
    fontWeight: '700',
  },
  enterArrow: { fontSize: 18, fontWeight: '400' },

  // Stroke tally
  tallyWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  tallyGroups: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  tallyGroup: {
    flexDirection: 'row',
    gap: 2,
  },
  tick: {
    width: 2,
    height: 12,
    borderRadius: 1,
  },
  tallyReadout: {
    fontSize: 10,
    fontFamily: fonts.mono,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  tallyReadoutSlash: {
    color: colors.inkFaint,
    marginHorizontal: 1,
  },
  tallyFallback: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  tallyNum: {
    fontSize: fontSize.lg,
    fontFamily: fonts.mono,
    fontWeight: '500',
    letterSpacing: 1,
  },
  tallySlash: {
    fontSize: fontSize.sm,
    color: colors.inkFaint,
    fontFamily: fonts.mono,
  },
  tallyDen: {
    fontSize: fontSize.sm,
    color: colors.inkMuted,
    fontFamily: fonts.mono,
  },
  tallyLabelAfter: {
    fontSize: 9,
    color: colors.inkFaint,
    letterSpacing: 2,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginLeft: 4,
  },

  // Footer
  footerBlock: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing['3xl'],
    paddingBottom: spacing.xl,
  },
  footerRule: {
    width: 32,
    height: 1,
    backgroundColor: colors.inkFaint,
    marginBottom: spacing.lg,
    opacity: 0.5,
  },
  footerAphorism: {
    fontSize: fontSize.lg,
    fontFamily: fonts.display,
    color: colors.inkLight,
    letterSpacing: 2,
    marginBottom: spacing.sm,
  },
  footerAphorismTrans: {
    fontSize: 10,
    color: colors.inkFaint,
    letterSpacing: 1.5,
    fontStyle: 'italic',
    fontFamily: fonts.display,
  },
});
