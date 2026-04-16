/**
 * Flashcards Screen — 札 FUDA
 *
 * A tactile card-catalog review interface built on SM-2 spaced repetition.
 * Physical-card aesthetic: stacked deck with visible shoulders, 3D flip
 * reveal, ink-stamp rating seals. Rice-paper & sumi-ink design language.
 */

import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  SafeAreaView,
  Animated,
  Easing,
} from 'react-native';
import { useStore, FlashcardItem } from '../store/useStore';
import { speakForLanguageLearning } from '../services/speech';
import {
  colors,
  fonts,
  fontSize,
  spacing,
  radius,
  shadows,
  languageColors,
} from '../theme';

interface Props {
  onBack: () => void;
}

// SM-2 quality values — mapped to four recall buttons (Anki-style)
const RATINGS = [
  { quality: 1, label: 'Again', kanji: '再', color: colors.error,   bg: colors.errorLight,   hint: '< 1 day' },
  { quality: 3, label: 'Hard',  kanji: '難', color: colors.warning, bg: colors.warningLight, hint: 'shorter' },
  { quality: 4, label: 'Good',  kanji: '良', color: colors.success, bg: colors.successLight, hint: 'normal'  },
  { quality: 5, label: 'Easy',  kanji: '易', color: colors.gold,    bg: colors.goldLight,    hint: 'longer'  },
] as const;

const LANGUAGE_SIGIL: Record<string, { kanji: string; tag: string }> = {
  japanese: { kanji: '日', tag: '日本語' },
  korean:   { kanji: '韓', tag: '한국어' },
  mandarin: { kanji: '中', tag: '中文' },
};

export function FlashcardsScreen({ onBack }: Props) {
  const {
    activeLanguage,
    getFlashcardsForLanguage,
    reviewFlashcard,
    removeFlashcard,
  } = useStore();

  const langColor = activeLanguage ? languageColors[activeLanguage] : languageColors.japanese;
  const sigil = activeLanguage ? LANGUAGE_SIGIL[activeLanguage] : LANGUAGE_SIGIL.japanese;

  // Freeze deck order at session start — most-due first, then oldest-added
  const [deck] = useState<FlashcardItem[]>(() => {
    if (!activeLanguage) return [];
    const cards = getFlashcardsForLanguage(activeLanguage);
    return [...cards].sort((a, b) => {
      const aDue = new Date(a.nextReviewAt).getTime();
      const bDue = new Date(b.nextReviewAt).getTime();
      if (aDue !== bDue) return aDue - bDue;
      return new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime();
    });
  });

  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [reviewed, setReviewed] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [ratingHistory, setRatingHistory] = useState<number[]>([]);

  // Animations
  const flipAnim = useRef(new Animated.Value(0)).current;
  const cardEnter = useRef(new Animated.Value(0)).current;
  const cardExitX = useRef(new Animated.Value(0)).current;
  const cardExitScale = useRef(new Animated.Value(1)).current;
  const cardExitOpacity = useRef(new Animated.Value(1)).current;
  const shoulderShift = useRef(new Animated.Value(0)).current;
  const sealPulse = useRef(new Animated.Value(0)).current;

  const currentCard = deck[index];
  const remaining = deck.length - index;
  const isDone = index >= deck.length;

  // Entry animation — card rises into place
  useEffect(() => {
    Animated.sequence([
      Animated.delay(80),
      Animated.spring(cardEnter, {
        toValue: 1,
        friction: 9,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Seal pulse when card advances
  useEffect(() => {
    if (!currentCard) return;
    sealPulse.setValue(0);
    Animated.timing(sealPulse, {
      toValue: 1,
      duration: 800,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [index]);

  // ─── Actions ───────────────────────────────────────────────

  const handleFlip = () => {
    const target = flipped ? 0 : 180;
    Animated.spring(flipAnim, {
      toValue: target,
      friction: 8,
      tension: 12,
      useNativeDriver: true,
    }).start();
    setFlipped(!flipped);
  };

  const playAudio = () => {
    if (!currentCard || !activeLanguage) return;
    speakForLanguageLearning(currentCard.term, activeLanguage, { rate: 0.8 }).catch(() => {});
  };

  const handleRate = (quality: number) => {
    if (!currentCard) return;

    reviewFlashcard(currentCard.id, quality);
    setReviewed((r) => r + 1);
    setRatingHistory((h) => [...h, quality]);

    if (quality >= 4) {
      setStreak((s) => {
        const next = s + 1;
        setBestStreak((b) => Math.max(b, next));
        return next;
      });
    } else {
      setStreak(0);
    }

    // Direction of exit telegraphs the outcome — right = good, left = again
    const exitDirection = quality >= 4 ? 1 : -1;

    Animated.parallel([
      Animated.timing(cardExitX, {
        toValue: exitDirection * 500,
        duration: 380,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(cardExitScale, {
        toValue: 0.85,
        duration: 380,
        useNativeDriver: true,
      }),
      Animated.timing(cardExitOpacity, {
        toValue: 0,
        duration: 380,
        useNativeDriver: true,
      }),
      Animated.timing(shoulderShift, {
        toValue: 1,
        duration: 380,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Reset for next card
      setIndex((i) => i + 1);
      setFlipped(false);
      flipAnim.setValue(0);
      cardExitX.setValue(0);
      cardExitScale.setValue(1);
      cardExitOpacity.setValue(1);
      shoulderShift.setValue(0);
    });
  };

  const handleRemove = () => {
    if (!currentCard) return;
    removeFlashcard(currentCard.id);
    // Treat as skip — advance with no rating
    Animated.timing(cardExitOpacity, {
      toValue: 0,
      duration: 240,
      useNativeDriver: true,
    }).start(() => {
      setIndex((i) => i + 1);
      setFlipped(false);
      flipAnim.setValue(0);
      cardExitOpacity.setValue(1);
    });
  };

  // ─── Interpolations ────────────────────────────────────────

  const frontRotate = flipAnim.interpolate({
    inputRange: [0, 180],
    outputRange: ['0deg', '180deg'],
  });
  const backRotate = flipAnim.interpolate({
    inputRange: [0, 180],
    outputRange: ['180deg', '360deg'],
  });
  const frontOpacity = flipAnim.interpolate({
    inputRange: [0, 89, 90, 180],
    outputRange: [1, 1, 0, 0],
  });
  const backOpacity = flipAnim.interpolate({
    inputRange: [0, 89, 90, 180],
    outputRange: [0, 0, 1, 1],
  });

  const cardTranslateY = cardEnter.interpolate({
    inputRange: [0, 1],
    outputRange: [40, 0],
  });
  const cardEnterOpacity = cardEnter.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  // Shoulder cards scale up slightly as the active card exits
  const shoulder1Scale = shoulderShift.interpolate({
    inputRange: [0, 1],
    outputRange: [0.96, 0.98],
  });
  const shoulder1TranslateY = shoulderShift.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -6],
  });
  const shoulder2Scale = shoulderShift.interpolate({
    inputRange: [0, 1],
    outputRange: [0.92, 0.94],
  });

  const sealScale = sealPulse.interpolate({
    inputRange: [0, 0.4, 1],
    outputRange: [0.6, 1.1, 1],
  });
  const sealOpacity = sealPulse.interpolate({
    inputRange: [0, 0.3, 1],
    outputRange: [0, 1, 1],
  });

  // ─── Render: Empty State ───────────────────────────────────

  if (deck.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <Header onBack={onBack} progress={null} />
        <View style={styles.emptyWrap}>
          {/* Decorative empty deck stack */}
          <View style={styles.emptyDeckContainer}>
            <View style={[styles.emptyDeckCard, styles.emptyDeckCard3]} />
            <View style={[styles.emptyDeckCard, styles.emptyDeckCard2]} />
            <View style={[styles.emptyDeckCard, styles.emptyDeckCard1]}>
              <Text style={styles.emptyDeckGlyph}>札</Text>
              <View style={[styles.emptySealDot, { backgroundColor: langColor.accent }]} />
            </View>
          </View>

          <Text style={styles.emptyTitle}>Your deck is empty</Text>
          <View style={styles.emptyRule} />
          <Text style={styles.emptyBody}>
            Words you don't recognize during{'\n'}listening practice land here.
          </Text>
          <Text style={styles.emptyHint}>札 · fuda · card</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ─── Render: Session Complete ──────────────────────────────

  if (isDone) {
    const avg = ratingHistory.length
      ? ratingHistory.reduce((a, b) => a + b, 0) / ratingHistory.length
      : 0;
    const grade = avg >= 4.5 ? '秀' : avg >= 3.8 ? '優' : avg >= 3 ? '良' : avg >= 2 ? '可' : '要';

    return (
      <SafeAreaView style={styles.container}>
        <Header onBack={onBack} progress={null} />
        <View style={styles.doneWrap}>
          <View style={[styles.doneSeal, { borderColor: langColor.accent }]}>
            <Text style={[styles.doneSealKanji, { color: langColor.accent }]}>完</Text>
          </View>
          <Text style={styles.doneTitle}>Session complete</Text>
          <View style={styles.doneRule} />

          <View style={styles.doneStats}>
            <View style={styles.doneStat}>
              <Text style={styles.doneStatNum}>{reviewed}</Text>
              <Text style={styles.doneStatLabel}>Reviewed</Text>
            </View>
            <View style={styles.doneStatDivider} />
            <View style={styles.doneStat}>
              <Text style={styles.doneStatNum}>{bestStreak}</Text>
              <Text style={styles.doneStatLabel}>Best streak</Text>
            </View>
            <View style={styles.doneStatDivider} />
            <View style={styles.doneStat}>
              <Text style={[styles.doneStatNum, styles.doneStatKanji]}>{grade}</Text>
              <Text style={styles.doneStatLabel}>Grade</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.doneButton, { backgroundColor: colors.ink }]}
            onPress={onBack}
            activeOpacity={0.85}
          >
            <Text style={styles.doneButtonText}>Return</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ─── Render: Active Review ─────────────────────────────────

  return (
    <SafeAreaView style={styles.container}>
      <Header onBack={onBack} progress={{ current: index + 1, total: deck.length }} />

      {/* Ghost character in background — 札 fuda mark */}
      <Text style={styles.bgGlyph} pointerEvents="none">札</Text>

      <View style={styles.stage}>
        {/* Shoulder cards — the deck peeking out behind the active one */}
        {remaining > 2 && (
          <Animated.View
            style={[
              styles.cardShell,
              styles.shoulderCard,
              {
                transform: [
                  { translateY: 18 },
                  { scale: shoulder2Scale },
                  { rotate: '-1.2deg' },
                ],
              },
            ]}
          >
            <View style={styles.shoulderInner} />
          </Animated.View>
        )}
        {remaining > 1 && (
          <Animated.View
            style={[
              styles.cardShell,
              styles.shoulderCard,
              {
                transform: [
                  { translateY: shoulder1TranslateY },
                  { scale: shoulder1Scale },
                  { rotate: '0.8deg' },
                ],
              },
            ]}
          >
            <View style={styles.shoulderInner} />
          </Animated.View>
        )}

        {/* Active card wrapper with enter + exit transforms */}
        <Animated.View
          style={[
            styles.cardWrapper,
            {
              opacity: Animated.multiply(cardEnterOpacity, cardExitOpacity),
              transform: [
                { translateY: cardTranslateY },
                { translateX: cardExitX },
                { scale: cardExitScale },
              ],
            },
          ]}
        >
          <TouchableWithoutFeedback onPress={handleFlip}>
            <View>
              {/* FRONT FACE */}
              <Animated.View
                style={[
                  styles.cardShell,
                  styles.cardFace,
                  {
                    opacity: frontOpacity,
                    transform: [{ perspective: 1200 }, { rotateY: frontRotate }],
                  },
                ]}
              >
                {/* Decorative corner brackets */}
                <Text style={[styles.cornerBracket, styles.bracketTL]}>「</Text>
                <Text style={[styles.cornerBracket, styles.bracketBR]}>」</Text>

                {/* Language seal — upper right vermillion stamp */}
                <Animated.View
                  style={[
                    styles.seal,
                    {
                      borderColor: langColor.accent,
                      opacity: sealOpacity,
                      transform: [{ scale: sealScale }, { rotate: '4deg' }],
                    },
                  ]}
                >
                  <Text style={[styles.sealGlyph, { color: langColor.accent }]}>{sigil.kanji}</Text>
                </Animated.View>

                {/* Card index — monospace lower-right */}
                <Text style={styles.cardIndex}>
                  {String(index + 1).padStart(2, '0')} / {String(deck.length).padStart(2, '0')}
                </Text>

                {/* Level tag — CEFR */}
                <View style={styles.levelTag}>
                  <Text style={styles.levelTagText}>{currentCard.level}</Text>
                </View>

                {/* Term — the hero */}
                <View style={styles.termBlock}>
                  {currentCard.reading && (
                    <Text style={styles.reading}>{currentCard.reading}</Text>
                  )}
                  <Text
                    style={styles.term}
                    numberOfLines={2}
                    adjustsFontSizeToFit
                  >
                    {currentCard.term}
                  </Text>
                </View>

                {/* Footer hint + speaker */}
                <View style={styles.frontFooter}>
                  <TouchableOpacity
                    onPress={(e) => {
                      e.stopPropagation();
                      playAudio();
                    }}
                    style={styles.speakerButton}
                    activeOpacity={0.6}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                  >
                    <Text style={styles.speakerIcon}>♪</Text>
                  </TouchableOpacity>
                  <View style={styles.tapHintRow}>
                    <View style={styles.hintDash} />
                    <Text style={styles.tapHint}>tap to reveal</Text>
                    <View style={styles.hintDash} />
                  </View>
                </View>
              </Animated.View>

              {/* BACK FACE */}
              <Animated.View
                style={[
                  styles.cardShell,
                  styles.cardFace,
                  styles.cardBack,
                  {
                    opacity: backOpacity,
                    transform: [{ perspective: 1200 }, { rotateY: backRotate }],
                  },
                ]}
              >
                <Text style={[styles.cornerBracket, styles.bracketTL]}>「</Text>
                <Text style={[styles.cornerBracket, styles.bracketBR]}>」</Text>

                <Text style={styles.cardIndex}>
                  {String(index + 1).padStart(2, '0')} / {String(deck.length).padStart(2, '0')}
                </Text>

                <View style={styles.backContent}>
                  <Text style={styles.backLabel}>MEANING</Text>
                  <Text style={styles.meaning}>{currentCard.meaning}</Text>

                  {currentCard.context && (
                    <>
                      <View style={styles.inkDivider} />
                      <Text style={styles.backLabel}>IN CONTEXT</Text>
                      <Text style={styles.context}>{currentCard.context}</Text>
                    </>
                  )}

                  <View style={styles.inkDivider} />
                  <View style={styles.termRecap}>
                    {currentCard.reading && (
                      <Text style={styles.termRecapReading}>{currentCard.reading}</Text>
                    )}
                    <Text style={styles.termRecapTerm}>{currentCard.term}</Text>
                  </View>
                </View>

                <View style={styles.backFooterTagRow}>
                  <Text style={styles.repTag}>rep · {currentCard.repetitions}</Text>
                  <Text style={styles.repTag}>ease · {currentCard.easeFactor.toFixed(2)}</Text>
                </View>
              </Animated.View>
            </View>
          </TouchableWithoutFeedback>
        </Animated.View>
      </View>

      {/* Rating stamps — only show when flipped */}
      <View style={styles.ratingContainer}>
        {flipped ? (
          <Animated.View style={styles.ratingRow}>
            {RATINGS.map((r) => (
              <RatingStamp key={r.quality} rating={r} onPress={() => handleRate(r.quality)} />
            ))}
          </Animated.View>
        ) : (
          <View style={styles.ratingRowPlaceholder}>
            <TouchableOpacity
              onPress={handleRemove}
              activeOpacity={0.5}
              style={styles.removeBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.removeBtnText}>remove from deck</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Session footer stats */}
      <View style={styles.sessionBar}>
        <SessionStat label="REVIEWED" value={String(reviewed).padStart(2, '0')} />
        <View style={styles.sessionBarDivider} />
        <SessionStat label="STREAK" value={String(streak).padStart(2, '0')} highlight={streak >= 3} />
        <View style={styles.sessionBarDivider} />
        <SessionStat label="REMAINING" value={String(remaining).padStart(2, '0')} />
      </View>
    </SafeAreaView>
  );
}

// ─── Sub-components ──────────────────────────────────────────

function Header({
  onBack,
  progress,
}: {
  onBack: () => void;
  progress: { current: number; total: number } | null;
}) {
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={onBack} style={styles.backTouchable} activeOpacity={0.6}>
        <Text style={styles.backArrow}>‹</Text>
      </TouchableOpacity>
      <View style={styles.headerCenter}>
        <Text style={styles.headerKanji}>札</Text>
        <Text style={styles.headerTitle}>FLASHCARDS</Text>
      </View>
      {progress ? (
        <Text style={styles.headerProgress}>
          {String(progress.current).padStart(2, '0')}
          <Text style={styles.headerProgressSlash}>/</Text>
          {String(progress.total).padStart(2, '0')}
        </Text>
      ) : (
        <View style={{ width: 42 }} />
      )}
    </View>
  );
}

function RatingStamp({
  rating,
  onPress,
}: {
  rating: typeof RATINGS[number];
  onPress: () => void;
}) {
  const press = useRef(new Animated.Value(1)).current;
  return (
    <Animated.View style={[styles.stampWrap, { transform: [{ scale: press }] }]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={() => {
          Animated.spring(press, { toValue: 0.94, friction: 5, useNativeDriver: true }).start();
        }}
        onPressOut={() => {
          Animated.spring(press, { toValue: 1, friction: 4, useNativeDriver: true }).start();
        }}
        activeOpacity={0.85}
        style={[styles.stamp, { backgroundColor: rating.bg, borderColor: rating.color }]}
      >
        <Text style={[styles.stampKanji, { color: rating.color }]}>{rating.kanji}</Text>
        <Text style={[styles.stampLabel, { color: rating.color }]}>{rating.label}</Text>
        <Text style={styles.stampHint}>{rating.hint}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

function SessionStat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <View style={styles.sessionStat}>
      <Text style={[styles.sessionStatValue, highlight && styles.sessionStatValueHot]}>
        {value}
      </Text>
      <Text style={styles.sessionStatLabel}>{label}</Text>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────

const CARD_WIDTH = 320;
const CARD_HEIGHT = 420;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },

  // Header
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
  backTouchable: {
    width: 42,
    height: 36,
    justifyContent: 'center',
  },
  backArrow: {
    fontSize: 28,
    color: colors.inkLight,
    fontWeight: '300',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerKanji: {
    fontSize: 20,
    color: colors.inkMuted,
    opacity: 0.7,
  },
  headerTitle: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.ink,
    letterSpacing: 3,
  },
  headerProgress: {
    fontSize: fontSize.sm,
    fontFamily: fonts.mono,
    color: colors.inkMuted,
    fontWeight: '600',
    letterSpacing: 1,
  },
  headerProgressSlash: {
    color: colors.inkFaint,
    marginHorizontal: 2,
  },

  // Background glyph
  bgGlyph: {
    position: 'absolute',
    top: 80,
    right: -60,
    fontSize: 420,
    color: colors.ink,
    opacity: 0.025,
    fontWeight: '200',
    includeFontPadding: false,
  },

  // Stage — where the card lives
  stage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: spacing.lg,
  },

  cardWrapper: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
  },

  cardShell: {
    position: 'absolute',
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: '#FFFEF9',
    borderRadius: 2,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.lg,
  },

  // Shoulder (deck) cards behind the active card
  shoulderCard: {
    backgroundColor: colors.bgElevated,
  },
  shoulderInner: {
    flex: 1,
    margin: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderStyle: 'dashed',
    borderRadius: 1,
    opacity: 0.5,
  },

  // Card face (front & back)
  cardFace: {
    padding: spacing.xl,
    backfaceVisibility: 'hidden',
  },
  cardBack: {
    backgroundColor: colors.bgCard,
  },

  // Decorative brackets
  cornerBracket: {
    position: 'absolute',
    fontSize: 44,
    color: colors.inkFaint,
    opacity: 0.5,
    fontFamily: fonts.display,
    includeFontPadding: false,
  },
  bracketTL: {
    top: spacing.md,
    left: spacing.md,
  },
  bracketBR: {
    bottom: spacing.md,
    right: spacing.md,
    transform: [{ rotate: '180deg' }],
  },

  // Vermillion seal stamp
  seal: {
    position: 'absolute',
    top: spacing.xl,
    right: spacing.xl,
    width: 46,
    height: 46,
    borderRadius: 4,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(197, 61, 67, 0.04)',
  },
  sealGlyph: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: fonts.display,
    includeFontPadding: false,
  },

  // Card index
  cardIndex: {
    position: 'absolute',
    bottom: spacing.xl,
    right: spacing.xl,
    fontSize: 10,
    fontFamily: fonts.mono,
    color: colors.inkFaint,
    letterSpacing: 1.5,
  },

  // CEFR level tag
  levelTag: {
    position: 'absolute',
    top: spacing.xl,
    left: spacing.xl + 20,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 2,
    backgroundColor: colors.ink,
  },
  levelTagText: {
    fontSize: 9,
    fontFamily: fonts.mono,
    color: colors.bg,
    letterSpacing: 2,
    fontWeight: '700',
  },

  // Term (hero)
  termBlock: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  reading: {
    fontSize: fontSize.md,
    color: colors.inkMuted,
    fontStyle: 'italic',
    fontFamily: fonts.display,
    marginBottom: spacing.lg,
    letterSpacing: 2,
  },
  term: {
    fontSize: 76,
    color: colors.ink,
    fontWeight: '300',
    textAlign: 'center',
    letterSpacing: -1,
    lineHeight: 88,
    includeFontPadding: false,
  },

  // Front footer
  frontFooter: {
    position: 'absolute',
    bottom: spacing['2xl'],
    left: 0,
    right: 0,
    alignItems: 'center',
    gap: spacing.md,
  },
  speakerButton: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg,
  },
  speakerIcon: {
    fontSize: 22,
    color: colors.inkLight,
  },
  tapHintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  hintDash: {
    width: 24,
    height: 1,
    backgroundColor: colors.inkFaint,
    opacity: 0.5,
  },
  tapHint: {
    fontSize: 9,
    color: colors.inkFaint,
    letterSpacing: 3,
    textTransform: 'uppercase',
    fontWeight: '600',
  },

  // Back content
  backContent: {
    flex: 1,
    justifyContent: 'center',
    paddingTop: spacing.xl,
    paddingBottom: spacing['2xl'],
  },
  backLabel: {
    fontSize: 9,
    color: colors.inkFaint,
    letterSpacing: 3,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  meaning: {
    fontSize: 28,
    color: colors.ink,
    fontFamily: fonts.display,
    fontStyle: 'italic',
    lineHeight: 36,
    marginBottom: spacing.lg,
  },
  context: {
    fontSize: fontSize.base,
    color: colors.inkLight,
    lineHeight: 24,
    marginBottom: spacing.lg,
  },
  inkDivider: {
    height: 1,
    backgroundColor: colors.ink,
    opacity: 0.12,
    marginVertical: spacing.md,
    marginRight: spacing['3xl'],
  },
  termRecap: {
    marginTop: spacing.sm,
  },
  termRecapReading: {
    fontSize: fontSize.xs,
    color: colors.inkMuted,
    fontStyle: 'italic',
    marginBottom: 2,
  },
  termRecapTerm: {
    fontSize: fontSize.xl,
    color: colors.ink,
    fontWeight: '400',
  },
  backFooterTagRow: {
    position: 'absolute',
    bottom: spacing.xl,
    left: spacing.xl,
    flexDirection: 'row',
    gap: spacing.md,
  },
  repTag: {
    fontSize: 9,
    fontFamily: fonts.mono,
    color: colors.inkFaint,
    letterSpacing: 1.5,
  },

  // Ratings
  ratingContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  ratingRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  ratingRowPlaceholder: {
    height: 88,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: spacing.sm,
  },
  removeBtn: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  removeBtnText: {
    fontSize: 10,
    color: colors.inkFaint,
    letterSpacing: 2,
    textTransform: 'uppercase',
    textDecorationLine: 'underline',
    textDecorationStyle: 'dotted',
  },

  // Stamps
  stampWrap: {
    flex: 1,
  },
  stamp: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xs,
    borderRadius: 2,
    borderWidth: 1.5,
    alignItems: 'center',
    gap: 2,
  },
  stampKanji: {
    fontSize: 22,
    fontWeight: '700',
    fontFamily: fonts.display,
    includeFontPadding: false,
    marginBottom: 2,
  },
  stampLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  stampHint: {
    fontSize: 8,
    color: colors.inkFaint,
    letterSpacing: 1,
    marginTop: 2,
    fontFamily: fonts.mono,
  },

  // Session bar
  sessionBar: {
    flexDirection: 'row',
    alignItems: 'stretch',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.bgElevated,
  },
  sessionBarDivider: {
    width: 1,
    backgroundColor: colors.border,
    marginHorizontal: spacing.md,
  },
  sessionStat: {
    flex: 1,
    alignItems: 'center',
  },
  sessionStatValue: {
    fontSize: fontSize.lg,
    fontFamily: fonts.mono,
    color: colors.ink,
    fontWeight: '600',
    letterSpacing: 1,
  },
  sessionStatValueHot: {
    color: colors.primary,
  },
  sessionStatLabel: {
    fontSize: 9,
    color: colors.inkFaint,
    letterSpacing: 2,
    marginTop: 2,
    fontWeight: '600',
  },

  // Empty state
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing['2xl'],
  },
  emptyDeckContainer: {
    width: 180,
    height: 220,
    marginBottom: spacing['2xl'],
  },
  emptyDeckCard: {
    position: 'absolute',
    width: 180,
    height: 220,
    backgroundColor: colors.bgCard,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.md,
  },
  emptyDeckCard1: {
    transform: [{ rotate: '-3deg' }],
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyDeckCard2: {
    transform: [{ rotate: '2deg' }, { translateX: 6 }, { translateY: 4 }],
    opacity: 0.6,
  },
  emptyDeckCard3: {
    transform: [{ rotate: '6deg' }, { translateX: 12 }, { translateY: 8 }],
    opacity: 0.3,
  },
  emptyDeckGlyph: {
    fontSize: 72,
    color: colors.inkFaint,
    fontWeight: '200',
    opacity: 0.4,
  },
  emptySealDot: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 10,
    height: 10,
    borderRadius: 5,
    opacity: 0.8,
  },
  emptyTitle: {
    fontSize: fontSize.xl,
    fontFamily: fonts.display,
    fontWeight: '400',
    color: colors.ink,
    marginBottom: spacing.md,
    letterSpacing: 0.5,
  },
  emptyRule: {
    width: 40,
    height: 1,
    backgroundColor: colors.inkFaint,
    marginBottom: spacing.lg,
  },
  emptyBody: {
    fontSize: fontSize.sm,
    color: colors.inkMuted,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing['2xl'],
  },
  emptyHint: {
    fontSize: 10,
    color: colors.inkFaint,
    letterSpacing: 3,
    textTransform: 'uppercase',
    fontFamily: fonts.mono,
  },

  // Done state
  doneWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing['2xl'],
  },
  doneSeal: {
    width: 96,
    height: 96,
    borderRadius: 6,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
    transform: [{ rotate: '-4deg' }],
    backgroundColor: 'rgba(197, 61, 67, 0.04)',
  },
  doneSealKanji: {
    fontSize: 54,
    fontWeight: '700',
    fontFamily: fonts.display,
    includeFontPadding: false,
  },
  doneTitle: {
    fontSize: fontSize['2xl'],
    fontFamily: fonts.display,
    fontWeight: '400',
    color: colors.ink,
    marginBottom: spacing.md,
  },
  doneRule: {
    width: 60,
    height: 1,
    backgroundColor: colors.inkFaint,
    marginBottom: spacing['2xl'],
  },
  doneStats: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgCard,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing['2xl'],
    ...shadows.sm,
  },
  doneStat: {
    alignItems: 'center',
    minWidth: 80,
  },
  doneStatNum: {
    fontSize: 32,
    fontFamily: fonts.mono,
    color: colors.ink,
    fontWeight: '300',
    letterSpacing: -1,
  },
  doneStatKanji: {
    fontFamily: fonts.display,
    color: colors.primary,
    fontWeight: '700',
  },
  doneStatLabel: {
    fontSize: 9,
    color: colors.inkFaint,
    letterSpacing: 2,
    marginTop: 4,
    fontWeight: '600',
  },
  doneStatDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border,
    marginHorizontal: spacing.md,
  },
  doneButton: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing['3xl'],
    borderRadius: radius.lg,
    minWidth: 200,
    alignItems: 'center',
  },
  doneButtonText: {
    color: colors.bg,
    fontSize: fontSize.md,
    fontWeight: '600',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});
