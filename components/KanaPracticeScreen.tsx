/**
 * Kana Practice — 仮名 drill
 *
 * Quick-fire recognition: see a kana, pick the romaji from 4 options.
 * Session tracks accuracy and writes to mastery store.
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  Easing,
} from 'react-native';
import { useStore } from '../store/useStore';
import { KANA_ROWS, ALL_KANA, KanaChar, KanaScript } from '../curriculum/kana';
import { colors, fonts, fontSize, spacing, radius, shadows } from '../theme';

interface Props {
  onBack: () => void;
}

type Phase = 'setup' | 'drill' | 'summary';
type Direction = 'kana-to-romaji' | 'romaji-to-kana';

const SESSION_SIZE = 20;

export function KanaPracticeScreen({ onBack }: Props) {
  const { markKanaLearned, mastery } = useStore();

  const [phase, setPhase] = useState<Phase>('setup');
  const [script, setScript] = useState<KanaScript>('hiragana');
  const [direction, setDirection] = useState<Direction>('kana-to-romaji');
  const [selectedRows, setSelectedRows] = useState<string[]>(['a', 'ka', 'sa']);

  const [queue, setQueue] = useState<KanaChar[]>([]);
  const [qIndex, setQIndex] = useState(0);
  const [options, setOptions] = useState<string[]>([]);
  const [answer, setAnswer] = useState<string | null>(null);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);

  const flashAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const cardAnim = useRef(new Animated.Value(1)).current;

  // ─── Setup helpers ────────────────────────────────────────

  const pool = useMemo<KanaChar[]>(() => {
    if (selectedRows.length === 0) return ALL_KANA;
    return KANA_ROWS
      .filter((r) => selectedRows.includes(r.id))
      .flatMap((r) => r.chars);
  }, [selectedRows]);

  const startDrill = () => {
    if (pool.length < 4) return;
    // Shuffled session of SESSION_SIZE items (with repeats if pool is small)
    const session: KanaChar[] = [];
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    while (session.length < SESSION_SIZE) {
      session.push(...shuffled.sort(() => Math.random() - 0.5));
    }
    const trimmed = session.slice(0, SESSION_SIZE);
    setQueue(trimmed);
    setQIndex(0);
    setCorrect(0);
    setWrong(0);
    buildOptions(trimmed[0]);
    setAnswer(null);
    setPhase('drill');
  };

  const buildOptions = (target: KanaChar) => {
    const correctAnswer = direction === 'kana-to-romaji' ? target.romaji : getScriptChar(target, script);
    const distractorPool = ALL_KANA.filter((c) => c.romaji !== target.romaji);
    const distractors = distractorPool
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map((c) => direction === 'kana-to-romaji' ? c.romaji : getScriptChar(c, script));
    const all = [correctAnswer, ...distractors].sort(() => Math.random() - 0.5);
    setOptions(all);
  };

  const getScriptChar = (c: KanaChar, s: KanaScript) => s === 'hiragana' ? c.hiragana : c.katakana;

  const currentChar = queue[qIndex];
  const prompt = currentChar
    ? (direction === 'kana-to-romaji' ? getScriptChar(currentChar, script) : currentChar.romaji)
    : '';
  const correctOption = currentChar
    ? (direction === 'kana-to-romaji' ? currentChar.romaji : getScriptChar(currentChar, script))
    : '';

  // ─── Answer handling ──────────────────────────────────────

  const handleAnswer = (option: string) => {
    if (answer !== null || !currentChar) return;

    setAnswer(option);
    const isCorrect = option === correctOption;

    if (isCorrect) {
      setCorrect((c) => c + 1);
      markKanaLearned(currentChar.romaji);
      Animated.sequence([
        Animated.timing(flashAnim, { toValue: 1, duration: 150, useNativeDriver: false }),
        Animated.timing(flashAnim, { toValue: 0, duration: 350, useNativeDriver: false }),
      ]).start();
    } else {
      setWrong((w) => w + 1);
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 6, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -6, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
      ]).start();
    }

    setTimeout(() => advance(), isCorrect ? 500 : 1100);
  };

  const advance = () => {
    Animated.timing(cardAnim, {
      toValue: 0,
      duration: 180,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      const next = qIndex + 1;
      if (next >= queue.length) {
        setPhase('summary');
        return;
      }
      setQIndex(next);
      setAnswer(null);
      buildOptions(queue[next]);
      cardAnim.setValue(0);
      Animated.timing(cardAnim, {
        toValue: 1,
        duration: 260,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    });
  };

  const restart = () => {
    setPhase('setup');
    setAnswer(null);
  };

  // ─── Row toggle ────────────────────────────────────────────

  const toggleRow = (id: string) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  };

  const toggleAllRows = () => {
    setSelectedRows((prev) =>
      prev.length === KANA_ROWS.length ? [] : KANA_ROWS.map((r) => r.id)
    );
  };

  // ─── Render: Setup ────────────────────────────────────────

  if (phase === 'setup') {
    return (
      <SafeAreaView style={styles.container}>
        <Header onBack={onBack} title="KANA" subtitle="仮名" />
        <Text style={styles.bgGlyph} pointerEvents="none">仮</Text>

        <View style={styles.setupContent}>
          <Text style={styles.setupEyebrow}>CONFIGURE SESSION</Text>
          <Text style={styles.setupTitle}>Choose your drill</Text>
          <View style={styles.setupRule} />

          {/* Script toggle */}
          <Text style={styles.sectionLabel}>SCRIPT</Text>
          <View style={styles.toggleRow}>
            <ToggleButton
              active={script === 'hiragana'}
              onPress={() => setScript('hiragana')}
              primary="ひらがな"
              secondary="hiragana"
            />
            <ToggleButton
              active={script === 'katakana'}
              onPress={() => setScript('katakana')}
              primary="カタカナ"
              secondary="katakana"
            />
          </View>

          {/* Direction toggle */}
          <Text style={[styles.sectionLabel, { marginTop: spacing.xl }]}>DIRECTION</Text>
          <View style={styles.toggleRow}>
            <ToggleButton
              active={direction === 'kana-to-romaji'}
              onPress={() => setDirection('kana-to-romaji')}
              primary={script === 'hiragana' ? 'あ' : 'ア'}
              arrow="→"
              tertiary="a"
            />
            <ToggleButton
              active={direction === 'romaji-to-kana'}
              onPress={() => setDirection('romaji-to-kana')}
              primary="a"
              arrow="→"
              tertiary={script === 'hiragana' ? 'あ' : 'ア'}
            />
          </View>

          {/* Row selector */}
          <View style={styles.rowsHeader}>
            <Text style={styles.sectionLabel}>ROWS</Text>
            <TouchableOpacity onPress={toggleAllRows} activeOpacity={0.6}>
              <Text style={styles.allToggle}>
                {selectedRows.length === KANA_ROWS.length ? 'none' : 'all'}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.rowGrid}>
            {KANA_ROWS.map((r) => {
              const active = selectedRows.includes(r.id);
              return (
                <TouchableOpacity
                  key={r.id}
                  onPress={() => toggleRow(r.id)}
                  activeOpacity={0.7}
                  style={[styles.rowChip, active && styles.rowChipActive]}
                >
                  <Text style={[styles.rowChipKana, active && styles.rowChipKanaActive]}>
                    {r.kanji}
                  </Text>
                  <Text style={[styles.rowChipLabel, active && styles.rowChipLabelActive]}>
                    {r.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Begin */}
          <View style={styles.beginSection}>
            <View style={styles.beginInfo}>
              <Text style={styles.beginInfoNum}>{pool.length}</Text>
              <Text style={styles.beginInfoLabel}>CHARS IN POOL</Text>
            </View>
            <TouchableOpacity
              onPress={startDrill}
              disabled={pool.length < 4}
              activeOpacity={0.85}
              style={[styles.beginBtn, pool.length < 4 && styles.beginBtnDisabled]}
            >
              <Text style={styles.beginBtnText}>BEGIN · 始</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // ─── Render: Drill ────────────────────────────────────────

  if (phase === 'drill' && currentChar) {
    const accuracy = correct + wrong > 0
      ? Math.round((correct / (correct + wrong)) * 100)
      : 100;

    return (
      <SafeAreaView style={styles.container}>
        <Header
          onBack={onBack}
          title="KANA"
          subtitle="仮名"
          progress={`${String(qIndex + 1).padStart(2, '0')} / ${String(queue.length).padStart(2, '0')}`}
        />

        {/* Thin progress ruler */}
        <View style={styles.progressRuler}>
          <View
            style={[
              styles.progressRulerFill,
              { width: `${((qIndex + 1) / queue.length) * 100}%` },
            ]}
          />
        </View>

        <Text style={styles.bgGlyph} pointerEvents="none">仮</Text>

        {/* Prompt card */}
        <Animated.View
          style={[
            styles.promptCard,
            {
              opacity: cardAnim,
              transform: [
                { translateX: shakeAnim },
                {
                  scale: cardAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.96, 1],
                  }),
                },
              ],
            },
          ]}
        >
          <Animated.View
            style={[
              styles.promptFlash,
              {
                backgroundColor: flashAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['rgba(91, 140, 90, 0)', 'rgba(91, 140, 90, 0.18)'],
                }),
              },
            ]}
          />
          <Text style={styles.promptLabel}>
            {direction === 'kana-to-romaji' ? 'READ' : 'WRITE'}
          </Text>
          <Text
            style={[
              styles.promptChar,
              direction === 'romaji-to-kana' && styles.promptCharRomaji,
            ]}
          >
            {prompt}
          </Text>
          <View style={styles.promptRule} />
          <Text style={styles.promptHint}>
            {direction === 'kana-to-romaji' ? 'what sound?' : 'what kana?'}
          </Text>
        </Animated.View>

        {/* Options grid */}
        <View style={styles.optionsGrid}>
          {options.map((opt, i) => {
            const isSelected = answer === opt;
            const isCorrectOpt = opt === correctOption;
            const showReveal = answer !== null;

            return (
              <TouchableOpacity
                key={`${opt}-${i}`}
                onPress={() => handleAnswer(opt)}
                disabled={answer !== null}
                activeOpacity={0.7}
                style={[
                  styles.option,
                  showReveal && isCorrectOpt && styles.optionCorrect,
                  showReveal && isSelected && !isCorrectOpt && styles.optionWrong,
                  showReveal && !isCorrectOpt && !isSelected && styles.optionDim,
                ]}
              >
                <Text
                  style={[
                    styles.optionText,
                    direction === 'kana-to-romaji'
                      ? styles.optionTextRomaji
                      : styles.optionTextKana,
                    showReveal && isCorrectOpt && styles.optionTextCorrect,
                    showReveal && isSelected && !isCorrectOpt && styles.optionTextWrong,
                  ]}
                >
                  {opt}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Stats footer */}
        <View style={styles.statsBar}>
          <Stat label="CORRECT" value={String(correct).padStart(2, '0')} tint={colors.success} />
          <View style={styles.statDivider} />
          <Stat label="WRONG" value={String(wrong).padStart(2, '0')} tint={wrong > 0 ? colors.error : colors.inkFaint} />
          <View style={styles.statDivider} />
          <Stat label="ACCURACY" value={`${accuracy}%`} />
        </View>
      </SafeAreaView>
    );
  }

  // ─── Render: Summary ──────────────────────────────────────

  const total = correct + wrong;
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
  const grade = accuracy >= 95 ? '秀' : accuracy >= 85 ? '優' : accuracy >= 70 ? '良' : accuracy >= 50 ? '可' : '要';
  const gradeWord = accuracy >= 95 ? 'distinction' : accuracy >= 85 ? 'excellent' : accuracy >= 70 ? 'good' : accuracy >= 50 ? 'passing' : 'practice';

  return (
    <SafeAreaView style={styles.container}>
      <Header onBack={onBack} title="KANA" subtitle="仮名" />
      <Text style={styles.bgGlyph} pointerEvents="none">仮</Text>

      <View style={styles.summaryContent}>
        <View style={styles.summarySealContainer}>
          <View style={styles.summarySeal}>
            <Text style={styles.summarySealKanji}>{grade}</Text>
          </View>
        </View>

        <Text style={styles.summaryGradeWord}>{gradeWord}</Text>
        <View style={styles.summaryRule} />
        <Text style={styles.summaryAccuracy}>{accuracy}<Text style={styles.summaryAccuracyPct}>%</Text></Text>
        <Text style={styles.summaryAccuracyLabel}>ACCURACY</Text>

        <View style={styles.summaryStats}>
          <View style={styles.summaryStat}>
            <Text style={styles.summaryStatNum}>{correct}</Text>
            <Text style={styles.summaryStatLabel}>CORRECT</Text>
          </View>
          <View style={styles.summaryStatDiv} />
          <View style={styles.summaryStat}>
            <Text style={styles.summaryStatNum}>{wrong}</Text>
            <Text style={styles.summaryStatLabel}>WRONG</Text>
          </View>
          <View style={styles.summaryStatDiv} />
          <View style={styles.summaryStat}>
            <Text style={styles.summaryStatNum}>{mastery.kanaLearned.length}</Text>
            <Text style={styles.summaryStatLabel}>TOTAL MASTERED</Text>
          </View>
        </View>

        <View style={styles.summaryActions}>
          <TouchableOpacity onPress={startDrill} activeOpacity={0.85} style={styles.summaryPrimary}>
            <Text style={styles.summaryPrimaryText}>ANOTHER ROUND</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={restart} activeOpacity={0.6} style={styles.summarySecondary}>
            <Text style={styles.summarySecondaryText}>reconfigure</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

// ─── Sub-components ──────────────────────────────────────────

function Header({
  onBack,
  title,
  subtitle,
  progress,
}: {
  onBack: () => void;
  title: string;
  subtitle: string;
  progress?: string;
}) {
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={onBack} style={styles.backTouchable} activeOpacity={0.6}>
        <Text style={styles.backArrow}>‹</Text>
      </TouchableOpacity>
      <View style={styles.headerCenter}>
        <Text style={styles.headerKanji}>{subtitle}</Text>
        <Text style={styles.headerTitle}>{title}</Text>
      </View>
      {progress ? (
        <Text style={styles.headerProgress}>{progress}</Text>
      ) : (
        <View style={{ width: 42 }} />
      )}
    </View>
  );
}

function ToggleButton({
  active,
  onPress,
  primary,
  secondary,
  tertiary,
  arrow,
}: {
  active: boolean;
  onPress: () => void;
  primary: string;
  secondary?: string;
  tertiary?: string;
  arrow?: string;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      style={[styles.toggleBtn, active && styles.toggleBtnActive]}
    >
      <View style={styles.toggleBtnInner}>
        <Text style={[styles.toggleBtnPrimary, active && styles.toggleBtnPrimaryActive]}>
          {primary}
        </Text>
        {arrow && (
          <Text style={[styles.toggleBtnArrow, active && styles.toggleBtnArrowActive]}>
            {arrow}
          </Text>
        )}
        {tertiary && (
          <Text style={[styles.toggleBtnPrimary, active && styles.toggleBtnPrimaryActive]}>
            {tertiary}
          </Text>
        )}
      </View>
      {secondary && (
        <Text style={[styles.toggleBtnSecondary, active && styles.toggleBtnSecondaryActive]}>
          {secondary}
        </Text>
      )}
    </TouchableOpacity>
  );
}

function Stat({ label, value, tint }: { label: string; value: string; tint?: string }) {
  return (
    <View style={styles.stat}>
      <Text style={[styles.statValue, tint && { color: tint }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
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
    fontSize: fontSize.sm, fontWeight: '700', color: colors.ink, letterSpacing: 3,
  },
  headerProgress: {
    fontSize: fontSize.sm, fontFamily: fonts.mono, color: colors.inkMuted,
    fontWeight: '600', letterSpacing: 1, minWidth: 42, textAlign: 'right',
  },

  bgGlyph: {
    position: 'absolute',
    bottom: -100,
    right: -80,
    fontSize: 480,
    color: colors.ink,
    opacity: 0.02,
    fontWeight: '100',
    includeFontPadding: false,
  },

  // ─── Setup phase ───────────────────────────────────────────
  setupContent: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
  },
  setupEyebrow: {
    fontSize: 10,
    color: colors.inkFaint,
    letterSpacing: 3,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  setupTitle: {
    fontSize: fontSize.xl,
    fontFamily: fonts.display,
    fontWeight: '400',
    color: colors.ink,
    letterSpacing: -0.3,
  },
  setupRule: {
    width: 32, height: 1, backgroundColor: colors.ink,
    marginTop: spacing.md, marginBottom: spacing.xl, opacity: 0.4,
  },
  sectionLabel: {
    fontSize: 9, color: colors.inkFaint, letterSpacing: 2.5,
    fontWeight: '700', marginBottom: spacing.sm,
  },
  toggleRow: { flexDirection: 'row', gap: spacing.sm },
  toggleBtn: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgCard,
    alignItems: 'center',
  },
  toggleBtnActive: {
    borderColor: colors.ink,
    backgroundColor: colors.ink,
  },
  toggleBtnInner: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
  },
  toggleBtnPrimary: {
    fontSize: fontSize.lg,
    fontFamily: fonts.display,
    color: colors.ink,
    fontWeight: '500',
  },
  toggleBtnPrimaryActive: { color: colors.bg },
  toggleBtnArrow: {
    fontSize: fontSize.md, color: colors.inkFaint, fontWeight: '300',
  },
  toggleBtnArrowActive: { color: colors.inkFaint },
  toggleBtnSecondary: {
    fontSize: 9, color: colors.inkFaint, letterSpacing: 2,
    fontWeight: '600', textTransform: 'uppercase', marginTop: 4,
  },
  toggleBtnSecondaryActive: { color: colors.inkFaint, opacity: 0.6 },

  rowsHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'baseline', marginTop: spacing.xl,
  },
  allToggle: {
    fontSize: 10, color: colors.inkMuted, letterSpacing: 2,
    fontWeight: '600', textTransform: 'uppercase',
    textDecorationLine: 'underline',
  },
  rowGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm,
  },
  rowChip: {
    width: '22.5%',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgCard,
    alignItems: 'center',
  },
  rowChipActive: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(197, 61, 67, 0.06)',
  },
  rowChipKana: {
    fontSize: fontSize.xl, fontFamily: fonts.display, color: colors.inkMuted,
    fontWeight: '500',
  },
  rowChipKanaActive: { color: colors.primary },
  rowChipLabel: {
    fontSize: 9, color: colors.inkFaint, letterSpacing: 1,
    marginTop: 2, fontWeight: '600',
  },
  rowChipLabelActive: { color: colors.primary, opacity: 0.8 },

  beginSection: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginTop: spacing['2xl'],
    paddingTop: spacing.xl, borderTopWidth: 1, borderTopColor: colors.border,
  },
  beginInfo: {},
  beginInfoNum: {
    fontSize: fontSize['2xl'], fontFamily: fonts.mono,
    color: colors.ink, fontWeight: '400',
  },
  beginInfoLabel: {
    fontSize: 9, color: colors.inkFaint, letterSpacing: 2,
    fontWeight: '700', marginTop: 2,
  },
  beginBtn: {
    backgroundColor: colors.ink,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: 2,
  },
  beginBtnDisabled: { opacity: 0.3 },
  beginBtnText: {
    color: colors.bg, fontSize: fontSize.sm, fontWeight: '700',
    letterSpacing: 2.5,
  },

  // ─── Drill phase ───────────────────────────────────────────
  progressRuler: {
    height: 2, backgroundColor: colors.border, overflow: 'hidden',
  },
  progressRulerFill: {
    height: '100%', backgroundColor: colors.ink,
  },

  promptCard: {
    margin: spacing.xl,
    marginBottom: spacing.lg,
    paddingVertical: spacing['2xl'],
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 2,
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
    ...shadows.md,
  },
  promptFlash: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
  },
  promptLabel: {
    fontSize: 9, color: colors.inkFaint, letterSpacing: 3,
    fontWeight: '700', marginBottom: spacing.lg,
  },
  promptChar: {
    fontSize: 140,
    fontFamily: fonts.display,
    color: colors.ink,
    fontWeight: '300',
    includeFontPadding: false,
    lineHeight: 160,
  },
  promptCharRomaji: {
    fontSize: 96,
    letterSpacing: -2,
  },
  promptRule: {
    width: 32, height: 1, backgroundColor: colors.inkFaint,
    marginTop: spacing.md, opacity: 0.4,
  },
  promptHint: {
    fontSize: 10, color: colors.inkFaint, letterSpacing: 2,
    fontStyle: 'italic', fontFamily: fonts.display,
    marginTop: spacing.sm,
  },

  optionsGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm,
    paddingHorizontal: spacing.xl,
  },
  option: {
    width: '48.5%',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgCard,
    alignItems: 'center',
    minHeight: 72,
    justifyContent: 'center',
  },
  optionCorrect: {
    borderColor: colors.success,
    backgroundColor: colors.successLight,
    borderWidth: 2,
  },
  optionWrong: {
    borderColor: colors.error,
    backgroundColor: colors.errorLight,
    borderWidth: 2,
  },
  optionDim: {
    opacity: 0.35,
  },
  optionText: {
    color: colors.ink,
    fontWeight: '400',
  },
  optionTextKana: {
    fontSize: 40,
    fontFamily: fonts.display,
    lineHeight: 48,
    includeFontPadding: false,
  },
  optionTextRomaji: {
    fontSize: fontSize.xl,
    fontFamily: fonts.mono,
    letterSpacing: 2,
  },
  optionTextCorrect: { color: colors.success, fontWeight: '600' },
  optionTextWrong: { color: colors.error, fontWeight: '600' },

  statsBar: {
    flexDirection: 'row', alignItems: 'stretch',
    paddingHorizontal: spacing.xl, paddingVertical: spacing.md,
    marginTop: 'auto', borderTopWidth: 1, borderTopColor: colors.border,
    backgroundColor: colors.bgElevated,
  },
  statDivider: { width: 1, backgroundColor: colors.border, marginHorizontal: spacing.md },
  stat: { flex: 1, alignItems: 'center' },
  statValue: {
    fontSize: fontSize.lg, fontFamily: fonts.mono,
    color: colors.ink, fontWeight: '600',
  },
  statLabel: {
    fontSize: 9, color: colors.inkFaint, letterSpacing: 2,
    fontWeight: '700', marginTop: 2,
  },

  // ─── Summary phase ─────────────────────────────────────────
  summaryContent: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  summarySealContainer: {
    marginBottom: spacing.lg,
  },
  summarySeal: {
    width: 96, height: 96, borderRadius: 6, borderWidth: 3,
    borderColor: colors.primary, alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(197, 61, 67, 0.04)',
    transform: [{ rotate: '-3deg' }],
  },
  summarySealKanji: {
    fontSize: 54, color: colors.primary, fontWeight: '700',
    fontFamily: fonts.display, includeFontPadding: false,
  },
  summaryGradeWord: {
    fontSize: fontSize.sm, color: colors.inkMuted, letterSpacing: 4,
    textTransform: 'uppercase', fontWeight: '700', marginBottom: spacing.md,
  },
  summaryRule: {
    width: 40, height: 1, backgroundColor: colors.inkFaint,
    opacity: 0.4, marginBottom: spacing.xl,
  },
  summaryAccuracy: {
    fontSize: 88, fontFamily: fonts.mono, color: colors.ink,
    fontWeight: '300', letterSpacing: -2, lineHeight: 96,
    includeFontPadding: false,
  },
  summaryAccuracyPct: {
    fontSize: 32, color: colors.inkMuted,
  },
  summaryAccuracyLabel: {
    fontSize: 9, color: colors.inkFaint, letterSpacing: 3,
    fontWeight: '700', marginTop: 2, marginBottom: spacing['2xl'],
  },
  summaryStats: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.bgCard, borderRadius: 2,
    borderWidth: 1, borderColor: colors.border,
    paddingVertical: spacing.lg, paddingHorizontal: spacing.md,
    marginBottom: spacing['2xl'], ...shadows.sm,
  },
  summaryStat: { alignItems: 'center', minWidth: 80, paddingHorizontal: spacing.sm },
  summaryStatNum: {
    fontSize: fontSize.xl, fontFamily: fonts.mono,
    color: colors.ink, fontWeight: '400',
  },
  summaryStatLabel: {
    fontSize: 8, color: colors.inkFaint, letterSpacing: 2,
    fontWeight: '700', marginTop: 2,
  },
  summaryStatDiv: { width: 1, height: 32, backgroundColor: colors.border },
  summaryActions: {
    alignItems: 'center', gap: spacing.md, width: '100%',
  },
  summaryPrimary: {
    backgroundColor: colors.ink,
    paddingVertical: spacing.lg, paddingHorizontal: spacing['2xl'],
    borderRadius: 2, alignItems: 'center', minWidth: 240,
  },
  summaryPrimaryText: {
    color: colors.bg, fontSize: fontSize.sm, fontWeight: '700',
    letterSpacing: 2.5,
  },
  summarySecondary: { paddingVertical: spacing.sm },
  summarySecondaryText: {
    fontSize: fontSize.sm, color: colors.inkMuted,
    textDecorationLine: 'underline',
  },
});
