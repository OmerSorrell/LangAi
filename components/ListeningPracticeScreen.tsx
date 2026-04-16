/**
 * Listening Practice Screen
 *
 * Japanese listening comprehension practice with:
 * - Level-oriented sentence generation (JLPT N5–N1)
 * - Slow / Regular pace TTS playback
 * - Sentence breakdown for misunderstood content
 * - Word-by-word translation challenge
 * - Auto-add unknown words to flashcards
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Animated,
  SafeAreaView,
} from 'react-native';
import { useStore } from '../store/useStore';
import { speakForLanguageLearning, stopSpeaking } from '../services/speech';
import { getRandomSentence, JLPTLevel } from '../curriculum/listening-bank';
import { getParticleInfo, looksLikeParticleLabel, ParticleInfo } from '../curriculum/particles';
import { colors, fonts, fontSize, spacing, radius, shadows, languageColors } from '../theme';
import { ProficiencyLevel } from '../agents/prompts/system-prompt';

// Map JLPT levels to CEFR for display
const JLPT_LEVELS = [
  { id: 'N5', cefr: 'A1' as ProficiencyLevel, label: 'N5 · Beginner' },
  { id: 'N4', cefr: 'A2' as ProficiencyLevel, label: 'N4 · Elementary' },
  { id: 'N3', cefr: 'B1' as ProficiencyLevel, label: 'N3 · Intermediate' },
  { id: 'N2', cefr: 'B2' as ProficiencyLevel, label: 'N2 · Upper Int.' },
  { id: 'N1', cefr: 'C1' as ProficiencyLevel, label: 'N1 · Advanced' },
];

type PaceMode = 'slow' | 'regular';

interface SentenceData {
  japanese: string;
  english: string;
  breakdown: {
    word: string;
    reading?: string;
    meaning: string;
  }[];
}

type PracticePhase =
  | 'level_select'
  | 'listening'
  | 'answer'
  | 'breakdown'
  | 'word_challenge'
  | 'result';

interface Props {
  onBack: () => void;
}

export function ListeningPracticeScreen({ onBack }: Props) {
  const { activeLanguage, preferences, addFlashcard } = useStore();

  // State
  const [phase, setPhase] = useState<PracticePhase>('level_select');
  const [selectedLevel, setSelectedLevel] = useState<typeof JLPT_LEVELS[0] | null>(null);
  const [pace, setPace] = useState<PaceMode>('slow');
  const [sentence, setSentence] = useState<SentenceData | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [usedIndices, setUsedIndices] = useState<number[]>([]);
  const [playCount, setPlayCount] = useState(0);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [wordAnswer, setWordAnswer] = useState('');
  const [wordResults, setWordResults] = useState<Record<number, boolean>>({});
  const [unknownWords, setUnknownWords] = useState<number[]>([]);
  const [showFullResult, setShowFullResult] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  const animateIn = useCallback(() => {
    fadeAnim.setValue(0);
    slideAnim.setValue(20);
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  useEffect(() => {
    animateIn();
  }, [phase]);

  const langColor = activeLanguage ? languageColors[activeLanguage] : languageColors.japanese;

  // Pick a sentence from the built-in bank (no API needed)
  const pickSentence = (level: typeof JLPT_LEVELS[0]) => {
    const { sentence: picked, index } = getRandomSentence(
      level.id as JLPTLevel,
      usedIndices
    );
    setUsedIndices((prev) => [...prev, index]);
    setSentence(picked);
    setPlayCount(0);
    setPhase('listening');

    // Auto-play the sentence
    setTimeout(() => playSentence(picked.japanese, pace), 300);
  };

  // Play sentence with TTS
  const playSentence = async (text: string, selectedPace: PaceMode) => {
    if (isSpeaking) {
      await stopSpeaking();
      setIsSpeaking(false);
      return;
    }
    setIsSpeaking(true);
    try {
      await speakForLanguageLearning(text, 'japanese', {
        rate: selectedPace === 'slow' ? 0.6 : 0.95,
      });
      setPlayCount((c) => c + 1);
    } catch (error) {
      console.error('TTS error:', error);
    } finally {
      setIsSpeaking(false);
    }
  };

  // Play a single word
  const playWord = async (text: string) => {
    if (isSpeaking) {
      await stopSpeaking();
      setIsSpeaking(false);
      return;
    }
    setIsSpeaking(true);
    try {
      await speakForLanguageLearning(text, 'japanese', { rate: 0.7 });
    } catch (error) {
      console.error('TTS error:', error);
    } finally {
      setIsSpeaking(false);
    }
  };

  // Check user's full sentence translation
  const checkAnswer = () => {
    if (!sentence) return;
    setPhase('answer');
  };

  // User says they understood — check translation
  const handleUnderstood = () => {
    setPhase('answer');
  };

  // User says they didn't understand — go to breakdown
  const handleNotUnderstood = () => {
    if (!sentence) return;
    setCurrentWordIndex(0);
    setWordResults({});
    setUnknownWords([]);
    setWordAnswer('');
    setPhase('breakdown');
  };

  // Check full translation answer
  const checkFullTranslation = () => {
    if (!sentence) return;
    const isClose = normalizeForComparison(userAnswer)
      .includes(normalizeForComparison(sentence.english).slice(0, Math.max(10, sentence.english.length * 0.4)));
    if (isClose) {
      setCorrectCount((c) => c + 1);
    }
    setShowFullResult(true);
  };

  // Move to next sentence after seeing result
  const handleNextSentence = () => {
    setSessionCount((c) => c + 1);
    resetForNewSentence();
    if (selectedLevel) pickSentence(selectedLevel);
  };

  // Handle word-by-word challenge
  const checkWordAnswer = () => {
    if (!sentence) return;
    const currentWord = sentence.breakdown[currentWordIndex];
    const isCorrect = normalizeForComparison(wordAnswer)
      .includes(normalizeForComparison(currentWord.meaning).slice(0, Math.max(3, currentWord.meaning.length * 0.5)));

    const newResults = { ...wordResults, [currentWordIndex]: isCorrect };
    setWordResults(newResults);

    if (!isCorrect) {
      setUnknownWords((prev) => [...prev, currentWordIndex]);
    }
  };

  // User knows a particle — mark as understood without input
  const markWordKnown = () => {
    if (!sentence) return;
    const newResults = { ...wordResults, [currentWordIndex]: true };
    setWordResults(newResults);
    setWordAnswer('');
  };

  // User doesn't know the word — mark as unknown and reveal meaning
  const markWordUnknown = () => {
    if (!sentence) return;
    const newResults = { ...wordResults, [currentWordIndex]: false };
    setWordResults(newResults);
    setUnknownWords((prev) => [...prev, currentWordIndex]);
    setWordAnswer('');
  };

  const nextWord = () => {
    if (!sentence) return;
    if (currentWordIndex < sentence.breakdown.length - 1) {
      setCurrentWordIndex((i) => i + 1);
      setWordAnswer('');
    } else {
      // Done with all words — add unknown ones to flashcards
      addUnknownToFlashcards();
      setPhase('result');
    }
  };

  // Add unknown words to flashcard deck
  const addUnknownToFlashcards = () => {
    if (!sentence || !selectedLevel || !activeLanguage) return;
    unknownWords.forEach((idx) => {
      const word = sentence.breakdown[idx];
      addFlashcard({
        term: word.word,
        reading: word.reading,
        meaning: word.meaning,
        context: sentence.japanese,
        language: activeLanguage,
        level: selectedLevel.cefr,
      });
    });
  };

  const resetForNewSentence = () => {
    setSentence(null);
    setUserAnswer('');
    setPlayCount(0);
    setCurrentWordIndex(0);
    setWordAnswer('');
    setWordResults({});
    setUnknownWords([]);
    setShowFullResult(false);
  };

  const goBackToLevelSelect = () => {
    resetForNewSentence();
    setUsedIndices([]);
    setPhase('level_select');
    setSessionCount(0);
    setCorrectCount(0);
  };

  // ─── Render Phases ──────────────────────────────────────────

  // LEVEL SELECT
  const renderLevelSelect = () => (
    <Animated.View style={[styles.phaseContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionKanji}>聴</Text>
        <Text style={styles.sectionTitle}>Listening Practice</Text>
        <Text style={styles.sectionSubtitle}>Train your ear for spoken Japanese</Text>
      </View>

      <Text style={styles.label}>Select your level</Text>
      <View style={styles.levelGrid}>
        {JLPT_LEVELS.map((level) => (
          <TouchableOpacity
            key={level.id}
            style={[
              styles.levelCard,
              selectedLevel?.id === level.id && [styles.levelCardSelected, { borderColor: langColor.accent }],
            ]}
            onPress={() => setSelectedLevel(level)}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.levelId,
              selectedLevel?.id === level.id && { color: langColor.accent },
            ]}>
              {level.id}
            </Text>
            <Text style={[
              styles.levelLabel,
              selectedLevel?.id === level.id && { color: colors.ink },
            ]}>
              {level.label.split(' · ')[1]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[styles.label, { marginTop: spacing.xl }]}>Speech pace</Text>
      <View style={styles.paceRow}>
        <TouchableOpacity
          style={[styles.paceButton, pace === 'slow' && [styles.paceButtonActive, { backgroundColor: langColor.accent }]]}
          onPress={() => setPace('slow')}
          activeOpacity={0.7}
        >
          <Text style={[styles.paceIcon, pace === 'slow' && styles.paceIconActive]}>亀</Text>
          <Text style={[styles.paceLabel, pace === 'slow' && styles.paceLabelActive]}>Slow</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.paceButton, pace === 'regular' && [styles.paceButtonActive, { backgroundColor: langColor.accent }]]}
          onPress={() => setPace('regular')}
          activeOpacity={0.7}
        >
          <Text style={[styles.paceIcon, pace === 'regular' && styles.paceIconActive]}>兎</Text>
          <Text style={[styles.paceLabel, pace === 'regular' && styles.paceLabelActive]}>Regular</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[
          styles.startButton,
          { backgroundColor: langColor.accent },
          !selectedLevel && styles.startButtonDisabled,
        ]}
        onPress={() => selectedLevel && pickSentence(selectedLevel)}
        disabled={!selectedLevel}
        activeOpacity={0.8}
      >
        <Text style={styles.startButtonText}>Begin Practice</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  // LISTENING PHASE
  const renderListening = () => (
    <Animated.View style={[styles.phaseContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      <View style={styles.listeningHeader}>
        <Text style={styles.phaseTag}>{selectedLevel?.id} · Listen carefully</Text>
        <Text style={styles.playCountText}>Played {playCount}x</Text>
      </View>

      {/* Play button */}
      <TouchableOpacity
        style={[styles.playButton, { borderColor: langColor.accent }]}
        onPress={() => sentence && playSentence(sentence.japanese, pace)}
        activeOpacity={0.7}
      >
        <Text style={[styles.playButtonIcon, { color: langColor.accent }]}>
          {isSpeaking ? '⏸' : '▶'}
        </Text>
        <Text style={[styles.playButtonLabel, { color: langColor.accent }]}>
          {isSpeaking ? 'Stop' : 'Play again'}
        </Text>
      </TouchableOpacity>

      {/* Pace toggle */}
      <View style={styles.inlinePaceRow}>
        <TouchableOpacity
          style={[styles.inlinePaceBtn, pace === 'slow' && { backgroundColor: langColor.bg }]}
          onPress={() => setPace('slow')}
        >
          <Text style={[styles.inlinePaceText, pace === 'slow' && { color: langColor.accent, fontWeight: '600' }]}>
            Slow
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.inlinePaceBtn, pace === 'regular' && { backgroundColor: langColor.bg }]}
          onPress={() => setPace('regular')}
        >
          <Text style={[styles.inlinePaceText, pace === 'regular' && { color: langColor.accent, fontWeight: '600' }]}>
            Regular
          </Text>
        </TouchableOpacity>
      </View>

      {/* Response options */}
      <View style={styles.responseOptions}>
        <TouchableOpacity
          style={[styles.responseButton, styles.understoodButton, { backgroundColor: colors.success }]}
          onPress={handleUnderstood}
          activeOpacity={0.8}
        >
          <Text style={styles.responseButtonText}>I understood</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.responseButton, styles.notUnderstoodButton]}
          onPress={handleNotUnderstood}
          activeOpacity={0.8}
        >
          <Text style={[styles.responseButtonText, { color: colors.ink }]}>Break it down</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  // ANSWER PHASE — user translates the full sentence
  const renderAnswer = () => (
    <Animated.View style={[styles.phaseContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      <Text style={styles.phaseTag}>Translate what you heard</Text>

      {/* Replay */}
      <TouchableOpacity
        style={styles.miniPlayButton}
        onPress={() => sentence && playSentence(sentence.japanese, pace)}
        activeOpacity={0.7}
      >
        <Text style={styles.miniPlayIcon}>{isSpeaking ? '⏸' : '▶'}</Text>
      </TouchableOpacity>

      <TextInput
        style={styles.translationInput}
        value={userAnswer}
        onChangeText={setUserAnswer}
        placeholder="Type the English translation..."
        placeholderTextColor={colors.inkFaint}
        multiline
        autoFocus
        editable={!showFullResult}
      />

      {!showFullResult ? (
        <TouchableOpacity
          style={[styles.checkButton, { backgroundColor: langColor.accent }, !userAnswer.trim() && styles.startButtonDisabled]}
          onPress={checkFullTranslation}
          disabled={!userAnswer.trim()}
          activeOpacity={0.8}
        >
          <Text style={styles.checkButtonText}>Check</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.resultBlock}>
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Japanese</Text>
            <Text style={styles.resultJapanese}>{sentence?.japanese}</Text>
          </View>
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Correct meaning</Text>
            <Text style={styles.resultEnglish}>{sentence?.english}</Text>
          </View>
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Your answer</Text>
            <Text style={styles.resultUserAnswer}>{userAnswer}</Text>
          </View>

          <View style={styles.postResultActions}>
            <TouchableOpacity
              style={[styles.responseButton, { backgroundColor: langColor.accent, flex: 1 }]}
              onPress={handleNextSentence}
              activeOpacity={0.8}
            >
              <Text style={styles.responseButtonText}>Next sentence</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.responseButton, styles.notUnderstoodButton, { flex: 1 }]}
              onPress={() => {
                setShowFullResult(false);
                handleNotUnderstood();
              }}
              activeOpacity={0.8}
            >
              <Text style={[styles.responseButtonText, { color: colors.ink }]}>Break it down</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </Animated.View>
  );

  // BREAKDOWN PHASE — word by word
  const renderBreakdown = () => {
    if (!sentence) return null;
    const words = sentence.breakdown;

    return (
      <Animated.View style={[styles.phaseContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <Text style={styles.phaseTag}>Word-by-word breakdown</Text>

        {/* Full sentence replay */}
        <TouchableOpacity
          style={styles.miniPlayButton}
          onPress={() => playSentence(sentence.japanese, 'slow')}
          activeOpacity={0.7}
        >
          <Text style={styles.miniPlayIcon}>{isSpeaking ? '⏸' : '▶'}</Text>
          <Text style={styles.miniPlayLabel}>Full sentence (slow)</Text>
        </TouchableOpacity>

        {/* Word progress */}
        <View style={styles.wordProgress}>
          {words.map((_, i) => (
            <View
              key={i}
              style={[
                styles.wordDot,
                i === currentWordIndex && { backgroundColor: langColor.accent, transform: [{ scale: 1.3 }] },
                wordResults[i] === true && { backgroundColor: colors.success },
                wordResults[i] === false && { backgroundColor: colors.error },
              ]}
            />
          ))}
        </View>

        {/* Current word card */}
        <View style={[styles.wordCard, { borderColor: langColor.accent }]}>
          <TouchableOpacity onPress={() => playWord(words[currentWordIndex].word)} activeOpacity={0.7}>
            <Text style={styles.wordJapanese}>{words[currentWordIndex].word}</Text>
            {words[currentWordIndex].reading && (
              <Text style={styles.wordReading}>{words[currentWordIndex].reading}</Text>
            )}
            <Text style={styles.tapToHear}>tap to hear</Text>
          </TouchableOpacity>

          {wordResults[currentWordIndex] === undefined ? (
            (() => {
              const currentWord = words[currentWordIndex];
              const particleInfo = getParticleInfo(currentWord.word);
              const isParticleWord = particleInfo !== null ||
                (currentWord.word.length <= 2 && looksLikeParticleLabel(currentWord.meaning));

              if (isParticleWord && particleInfo) {
                return (
                  <ParticleExplainer
                    info={particleInfo}
                    onGotIt={markWordKnown}
                    onAddToDeck={markWordUnknown}
                  />
                );
              }

              return (
                <>
                  <TextInput
                    style={styles.wordInput}
                    value={wordAnswer}
                    onChangeText={setWordAnswer}
                    placeholder="What does this mean?"
                    placeholderTextColor={colors.inkFaint}
                    autoFocus
                    onSubmitEditing={checkWordAnswer}
                    returnKeyType="done"
                  />
                  <TouchableOpacity
                    style={[styles.checkButton, { backgroundColor: langColor.accent }, !wordAnswer.trim() && styles.startButtonDisabled]}
                    onPress={checkWordAnswer}
                    disabled={!wordAnswer.trim()}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.checkButtonText}>Check</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.dontKnowButton}
                    onPress={markWordUnknown}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.dontKnowButtonText}>I don't know</Text>
                  </TouchableOpacity>
                </>
              );
            })()
          ) : (
            <View style={styles.wordResultContainer}>
              <View style={[
                styles.wordResultBadge,
                { backgroundColor: wordResults[currentWordIndex] ? colors.successLight : colors.errorLight },
              ]}>
                <Text style={[
                  styles.wordResultText,
                  { color: wordResults[currentWordIndex] ? colors.success : colors.error },
                ]}>
                  {wordResults[currentWordIndex] ? 'Correct!' : 'Not quite'}
                </Text>
              </View>
              <Text style={styles.wordMeaning}>
                {words[currentWordIndex].meaning}
              </Text>
              {!wordResults[currentWordIndex] && (
                <Text style={styles.addedToFlashcards}>Added to flashcards</Text>
              )}
              <TouchableOpacity
                style={[styles.nextWordButton, { backgroundColor: langColor.accent }]}
                onPress={nextWord}
                activeOpacity={0.8}
              >
                <Text style={styles.nextWordButtonText}>
                  {currentWordIndex < words.length - 1 ? 'Next word' : 'See results'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Animated.View>
    );
  };

  // RESULT PHASE
  const renderResult = () => {
    if (!sentence) return null;
    const totalWords = sentence.breakdown.length;
    const knownCount = totalWords - unknownWords.length;

    return (
      <Animated.View style={[styles.phaseContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <Text style={styles.sectionKanji}>結</Text>
        <Text style={styles.resultTitle}>Breakdown Complete</Text>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: colors.success }]}>{knownCount}</Text>
            <Text style={styles.statLabel}>Known</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: colors.error }]}>{unknownWords.length}</Text>
            <Text style={styles.statLabel}>To review</Text>
          </View>
        </View>

        {/* Full sentence reveal */}
        <View style={styles.revealBlock}>
          <Text style={styles.revealJapanese}>{sentence.japanese}</Text>
          <Text style={styles.revealEnglish}>{sentence.english}</Text>
        </View>

        {/* Breakdown summary */}
        <ScrollView style={styles.breakdownList} showsVerticalScrollIndicator={false}>
          {sentence.breakdown.map((word, i) => (
            <View key={i} style={[
              styles.breakdownRow,
              unknownWords.includes(i) && { backgroundColor: colors.errorLight },
            ]}>
              <Text style={styles.breakdownWord}>{word.word}</Text>
              {word.reading && <Text style={styles.breakdownReading}>{word.reading}</Text>}
              <Text style={styles.breakdownMeaning}>{word.meaning}</Text>
              {unknownWords.includes(i) && (
                <Text style={styles.flashcardBadge}>flashcard</Text>
              )}
            </View>
          ))}
        </ScrollView>

        {unknownWords.length > 0 && (
          <Text style={styles.flashcardNotice}>
            {unknownWords.length} word{unknownWords.length > 1 ? 's' : ''} added to your flashcard deck
          </Text>
        )}

        <View style={styles.postResultActions}>
          <TouchableOpacity
            style={[styles.responseButton, { backgroundColor: langColor.accent, flex: 1 }]}
            onPress={handleNextSentence}
            activeOpacity={0.8}
          >
            <Text style={styles.responseButtonText}>Next sentence</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.responseButton, styles.notUnderstoodButton, { flex: 1 }]}
            onPress={goBackToLevelSelect}
            activeOpacity={0.8}
          >
            <Text style={[styles.responseButtonText, { color: colors.ink }]}>Change level</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  };

  // ─── Main Render ─────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backTouchable} activeOpacity={0.6}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>聴解 Listening</Text>
        </View>
        {sessionCount > 0 ? (
          <Text style={styles.sessionScore}>{correctCount}/{sessionCount}</Text>
        ) : (
          <View style={{ width: 36 }} />
        )}
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentInner}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {phase === 'level_select' && renderLevelSelect()}
        {phase === 'listening' && renderListening()}
        {phase === 'answer' && renderAnswer()}
        {(phase === 'breakdown' || phase === 'word_challenge') && renderBreakdown()}
        {phase === 'result' && renderResult()}
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Particle Explainer ──────────────────────────────────────

const PARTICLE_FAMILY_COLORS: Record<ParticleInfo['family'], string> = {
  topic: colors.purple,
  subject: colors.primary,
  object: colors.warning,
  direction: '#2D5F8A',
  means: colors.gold,
  possessive: colors.success,
  location: '#2D5F8A',
  connector: colors.inkLight,
};

function ParticleExplainer({
  info,
  onGotIt,
  onAddToDeck,
}: {
  info: ParticleInfo;
  onGotIt: () => void;
  onAddToDeck: () => void;
}) {
  const familyColor = PARTICLE_FAMILY_COLORS[info.family];

  return (
    <View style={particleStyles.wrap}>
      {/* Grammar tag */}
      <View style={particleStyles.header}>
        <View style={[particleStyles.tag, { borderColor: familyColor }]}>
          <Text style={[particleStyles.tagText, { color: familyColor }]}>PARTICLE · 助詞</Text>
        </View>
        <Text style={[particleStyles.role, { color: familyColor }]}>{info.role}</Text>
      </View>

      <View style={particleStyles.divider} />

      {/* What it does */}
      <Text style={particleStyles.sectionLabel}>WHAT IT DOES</Text>
      <Text style={particleStyles.function}>{info.function}</Text>

      {/* How to read it */}
      <Text style={particleStyles.sectionLabel}>HOW TO READ IT</Text>
      <Text style={particleStyles.rule}>{info.rule}</Text>

      {/* Example */}
      <View style={[particleStyles.exampleBox, { borderLeftColor: familyColor }]}>
        <Text style={particleStyles.exampleJapanese}>{info.example.japanese}</Text>
        <Text style={particleStyles.exampleEnglish}>{info.example.english}</Text>
        {info.example.highlight && (
          <Text style={[particleStyles.exampleHighlight, { color: familyColor }]}>
            {info.example.highlight}
          </Text>
        )}
      </View>

      {/* Actions */}
      <View style={particleStyles.actions}>
        <TouchableOpacity
          style={[particleStyles.primaryBtn, { backgroundColor: familyColor }]}
          onPress={onGotIt}
          activeOpacity={0.85}
        >
          <Text style={particleStyles.primaryBtnText}>Got it</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={particleStyles.secondaryBtn}
          onPress={onAddToDeck}
          activeOpacity={0.6}
        >
          <Text style={particleStyles.secondaryBtnText}>Save for review</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const particleStyles = StyleSheet.create({
  wrap: {
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
  },
  header: {
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  tag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: 2,
    borderWidth: 1,
    marginBottom: spacing.sm,
  },
  tagText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 2,
    fontFamily: fonts.mono,
  },
  role: {
    fontSize: fontSize.xl,
    fontFamily: fonts.display,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginBottom: spacing.lg,
  },
  sectionLabel: {
    fontSize: 9,
    color: colors.inkFaint,
    letterSpacing: 2,
    fontWeight: '700',
    marginBottom: spacing.xs,
    marginTop: spacing.md,
  },
  function: {
    fontSize: fontSize.base,
    color: colors.ink,
    lineHeight: 22,
    marginBottom: spacing.sm,
  },
  rule: {
    fontSize: fontSize.sm,
    color: colors.inkLight,
    fontStyle: 'italic',
    fontFamily: fonts.display,
    lineHeight: 21,
    marginBottom: spacing.lg,
  },
  exampleBox: {
    backgroundColor: colors.bgElevated,
    borderLeftWidth: 3,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
    borderRadius: 2,
  },
  exampleJapanese: {
    fontSize: fontSize.lg,
    color: colors.ink,
    fontWeight: '500',
    marginBottom: 4,
  },
  exampleEnglish: {
    fontSize: fontSize.sm,
    color: colors.inkMuted,
    fontStyle: 'italic',
    fontFamily: fonts.display,
    marginBottom: spacing.sm,
  },
  exampleHighlight: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    letterSpacing: 0.3,
    fontFamily: fonts.mono,
  },
  actions: {
    gap: spacing.sm,
  },
  primaryBtn: {
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: colors.white,
    fontSize: fontSize.md,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  secondaryBtn: {
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  secondaryBtnText: {
    fontSize: fontSize.sm,
    color: colors.inkMuted,
    textDecorationLine: 'underline',
  },
});

// ─── Helpers ─────────────────────────────────────────────────

function normalizeForComparison(text: string): string {
  return text
    .toLowerCase()
    .replace(/[.,!?;:'"()]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// ─── Styles ──────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
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
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backArrow: {
    fontSize: 28,
    color: colors.inkLight,
    fontWeight: '300',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.ink,
    letterSpacing: 1,
  },
  sessionScore: {
    fontSize: fontSize.sm,
    color: colors.inkMuted,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  contentInner: {
    padding: spacing.xl,
    paddingBottom: spacing['3xl'],
  },
  // Phase container
  phaseContainer: {
    flex: 1,
  },

  // Section header
  sectionHeader: {
    alignItems: 'center',
    marginBottom: spacing['2xl'],
  },
  sectionKanji: {
    fontSize: 48,
    color: colors.inkFaint,
    textAlign: 'center',
    marginBottom: spacing.sm,
    opacity: 0.3,
  },
  sectionTitle: {
    fontSize: fontSize.xl,
    fontFamily: fonts.display,
    fontWeight: '700',
    color: colors.ink,
    textAlign: 'center',
  },
  sectionSubtitle: {
    fontSize: fontSize.sm,
    color: colors.inkMuted,
    textAlign: 'center',
    marginTop: spacing.xs,
  },

  // Labels
  label: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.inkMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.md,
  },

  // Level grid
  levelGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  levelCard: {
    flex: 1,
    minWidth: 90,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.bgCard,
    alignItems: 'center',
    ...shadows.sm,
  },
  levelCardSelected: {
    borderWidth: 2,
    backgroundColor: colors.bgElevated,
  },
  levelId: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.inkLight,
    marginBottom: 2,
  },
  levelLabel: {
    fontSize: fontSize.xs,
    color: colors.inkFaint,
  },

  // Pace
  paceRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  paceButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.bgCard,
    gap: spacing.sm,
    ...shadows.sm,
  },
  paceButtonActive: {
    borderColor: 'transparent',
  },
  paceIcon: {
    fontSize: 20,
    color: colors.inkMuted,
  },
  paceIconActive: {
    color: colors.white,
  },
  paceLabel: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.inkMuted,
  },
  paceLabelActive: {
    color: colors.white,
  },

  // Start button
  startButton: {
    marginTop: spacing['2xl'],
    paddingVertical: spacing.lg,
    borderRadius: radius.lg,
    alignItems: 'center',
  },
  startButtonDisabled: {
    opacity: 0.4,
  },
  startButtonText: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.white,
    letterSpacing: 0.5,
  },

  // Listening phase
  listeningHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  phaseTag: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.inkMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.lg,
  },
  playCountText: {
    fontSize: fontSize.sm,
    color: colors.inkFaint,
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['2xl'],
    borderRadius: radius.xl,
    borderWidth: 2,
    backgroundColor: colors.bgCard,
    gap: spacing.md,
    marginBottom: spacing.xl,
    ...shadows.md,
  },
  playButtonIcon: {
    fontSize: 32,
  },
  playButtonLabel: {
    fontSize: fontSize.lg,
    fontWeight: '600',
  },

  // Inline pace
  inlinePaceRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing['2xl'],
  },
  inlinePaceBtn: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.bgMuted,
  },
  inlinePaceText: {
    fontSize: fontSize.sm,
    color: colors.inkMuted,
    fontWeight: '500',
  },

  // Response options
  responseOptions: {
    gap: spacing.md,
  },
  responseButton: {
    paddingVertical: spacing.lg,
    borderRadius: radius.lg,
    alignItems: 'center',
  },
  understoodButton: {},
  notUnderstoodButton: {
    backgroundColor: colors.bgMuted,
    borderWidth: 1,
    borderColor: colors.border,
  },
  responseButtonText: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.white,
  },

  // Mini play button
  miniPlayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  miniPlayIcon: {
    fontSize: 20,
    color: colors.inkMuted,
  },
  miniPlayLabel: {
    fontSize: fontSize.sm,
    color: colors.inkMuted,
  },

  // Translation input
  translationInput: {
    minHeight: 80,
    padding: spacing.lg,
    backgroundColor: colors.bgInput,
    borderRadius: radius.md,
    fontSize: fontSize.md,
    color: colors.ink,
    textAlignVertical: 'top',
    marginBottom: spacing.lg,
  },

  // Check button
  checkButton: {
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    alignItems: 'center',
  },
  checkButtonText: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.white,
  },
  dontKnowButton: {
    paddingVertical: spacing.sm,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  dontKnowButtonText: {
    fontSize: fontSize.sm,
    color: colors.inkMuted,
    textDecorationLine: 'underline',
  },

  // Result block
  resultBlock: {
    gap: spacing.lg,
  },
  resultRow: {
    backgroundColor: colors.bgCard,
    padding: spacing.lg,
    borderRadius: radius.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.border,
  },
  resultLabel: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.inkFaint,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  resultJapanese: {
    fontSize: fontSize.lg,
    color: colors.ink,
    fontWeight: '500',
  },
  resultEnglish: {
    fontSize: fontSize.base,
    color: colors.success,
    fontWeight: '500',
  },
  resultUserAnswer: {
    fontSize: fontSize.base,
    color: colors.ink,
  },
  postResultActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },

  // Word card
  wordProgress: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  wordDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  wordCard: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.xl,
    padding: spacing.xl,
    borderWidth: 1.5,
    alignItems: 'center',
    ...shadows.md,
  },
  wordJapanese: {
    fontSize: fontSize['2xl'],
    fontWeight: '700',
    color: colors.ink,
    marginBottom: spacing.xs,
  },
  wordReading: {
    fontSize: fontSize.base,
    color: colors.inkMuted,
    marginBottom: spacing.sm,
  },
  tapToHear: {
    fontSize: fontSize.xs,
    color: colors.inkFaint,
    marginBottom: spacing.xl,
  },
  wordInput: {
    width: '100%',
    padding: spacing.md,
    backgroundColor: colors.bgInput,
    borderRadius: radius.md,
    fontSize: fontSize.md,
    color: colors.ink,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  wordResultContainer: {
    alignItems: 'center',
    width: '100%',
    gap: spacing.md,
  },
  wordResultBadge: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
  },
  wordResultText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  wordMeaning: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.ink,
  },
  addedToFlashcards: {
    fontSize: fontSize.xs,
    color: colors.gold,
    fontWeight: '500',
  },
  nextWordButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing['2xl'],
    borderRadius: radius.lg,
    marginTop: spacing.sm,
  },
  nextWordButtonText: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.white,
  },

  // Result phase
  resultTitle: {
    fontSize: fontSize.xl,
    fontFamily: fonts.display,
    fontWeight: '700',
    color: colors.ink,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.bgCard,
    padding: spacing.lg,
    borderRadius: radius.md,
    alignItems: 'center',
    ...shadows.sm,
  },
  statNumber: {
    fontSize: fontSize['2xl'],
    fontWeight: '700',
  },
  statLabel: {
    fontSize: fontSize.xs,
    color: colors.inkMuted,
    marginTop: spacing.xs,
  },
  revealBlock: {
    backgroundColor: colors.bgCard,
    padding: spacing.xl,
    borderRadius: radius.md,
    marginBottom: spacing.xl,
    ...shadows.sm,
  },
  revealJapanese: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.ink,
    marginBottom: spacing.sm,
  },
  revealEnglish: {
    fontSize: fontSize.base,
    color: colors.inkMuted,
  },
  breakdownList: {
    maxHeight: 250,
    marginBottom: spacing.lg,
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.sm,
    marginBottom: spacing.xs,
    gap: spacing.md,
  },
  breakdownWord: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.ink,
    minWidth: 80,
  },
  breakdownReading: {
    fontSize: fontSize.sm,
    color: colors.inkMuted,
    minWidth: 60,
  },
  breakdownMeaning: {
    fontSize: fontSize.sm,
    color: colors.inkLight,
    flex: 1,
  },
  flashcardBadge: {
    fontSize: fontSize.xs,
    color: colors.gold,
    fontWeight: '600',
  },
  flashcardNotice: {
    fontSize: fontSize.sm,
    color: colors.gold,
    textAlign: 'center',
    fontWeight: '500',
    marginBottom: spacing.lg,
  },
});
