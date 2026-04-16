/**
 * Chat Screen Component
 *
 * Main conversation interface for practicing with the language teacher.
 * Features:
 * - Message history display
 * - Text input
 * - Voice input with Whisper STT
 * - Mode selection
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  SafeAreaView,
  Animated,
} from 'react-native';
import { useStore } from '../store/useStore';
import { ChatBubble } from './ChatBubble';
import { VoiceRecorder } from './VoiceRecorder';
import { ListeningPracticeScreen } from './ListeningPracticeScreen';
import { FlashcardsScreen } from './FlashcardsScreen';
import { PracticeHubScreen, DisciplineId } from './PracticeHubScreen';
import { KanaPracticeScreen } from './KanaPracticeScreen';
import { ComingSoonScreen } from './ComingSoonScreen';
import { ConversationMessage } from '../agents/teacher';
import { InteractionMode } from '../agents/prompts/system-prompt';
import { speakForLanguageLearning, stopSpeaking } from '../services/speech';
import { colors, fonts, fontSize, spacing, radius, shadows, languageColors } from '../theme';

const STARTER_PROMPTS: Record<string, { native: string; english: string; text: string }[]> = {
  japanese: [
    { native: 'はじめまして', english: 'Nice to meet you', text: 'はじめまして。よろしくお願いします。' },
    { native: '今日の天気は？', english: "Today's weather?", text: '今日の天気はどうですか？' },
    { native: '自己紹介して', english: 'Introduce yourself', text: '自己紹介をお願いします。' },
  ],
  korean: [
    { native: '반갑습니다', english: 'Nice to meet you', text: '반갑습니다. 잘 부탁드려요.' },
    { native: '날씨 어때요?', english: "How's the weather?", text: '오늘 날씨가 어때요?' },
    { native: '소개해 주세요', english: 'Introduce yourself', text: '자기소개를 해 주세요.' },
  ],
  mandarin: [
    { native: '很高兴认识你', english: 'Nice to meet you', text: '很高兴认识你。请多指教。' },
    { native: '今天天气怎么样？', english: "Today's weather?", text: '今天天气怎么样？' },
    { native: '请介绍一下', english: 'Introduce yourself', text: '请介绍一下你自己。' },
  ],
};

function getStarterPrompts(language: string | null) {
  if (!language || !STARTER_PROMPTS[language]) return STARTER_PROMPTS.japanese;
  return STARTER_PROMPTS[language];
}

const MODES: { mode: InteractionMode; label: string; icon: string }[] = [
  { mode: 'free_conversation', label: 'Chat', icon: '話' },
  { mode: 'guided_lesson', label: 'Lesson', icon: '学' },
  { mode: 'exercise', label: 'Practice', icon: '練' },
  { mode: 'correction', label: 'Correct', icon: '直' },
];

type InputMode = 'text' | 'voice';

export function ChatScreen() {
  const [inputText, setInputText] = useState('');
  const [inputMode, setInputMode] = useState<InputMode>('voice');
  const [showListening, setShowListening] = useState(false);
  const [showFlashcards, setShowFlashcards] = useState(false);
  const [showPractice, setShowPractice] = useState<'hub' | DisciplineId | null>(null);
  const flatListRef = useRef<FlatList>(null);

  const {
    messages,
    isLoading,
    sendMessage,
    clearMessages,
    interactionMode,
    setInteractionMode,
    activeLanguage,
    preferences,
    setActiveLanguage,
  } = useStore();

  const lastMessageCount = useRef(messages.length);
  const dotsAnim = useRef(new Animated.Value(0)).current;

  // Loading dots animation
  useEffect(() => {
    if (isLoading) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(dotsAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
          Animated.timing(dotsAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
        ])
      ).start();
    } else {
      dotsAnim.setValue(0);
    }
  }, [isLoading]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  // Auto-play new assistant messages
  useEffect(() => {
    if (
      messages.length > lastMessageCount.current &&
      preferences.autoPlayResponses &&
      activeLanguage
    ) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage?.role === 'assistant') {
        speakForLanguageLearning(lastMessage.content, activeLanguage).catch(
          (error) => console.error('Auto-play TTS error:', error)
        );
      }
    }
    lastMessageCount.current = messages.length;
  }, [messages.length, preferences.autoPlayResponses, activeLanguage]);

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;
    const text = inputText.trim();
    setInputText('');
    await sendMessage(text);
  };

  const handleVoiceTranscription = async (text: string) => {
    if (!text.trim() || isLoading) return;
    await sendMessage(text);
  };

  const renderMessage = ({ item }: { item: ConversationMessage }) => (
    <ChatBubble message={item} />
  );

  // Show listening practice screen
  if (showListening) {
    return <ListeningPracticeScreen onBack={() => setShowListening(false)} />;
  }

  // Show flashcards screen
  if (showFlashcards) {
    return <FlashcardsScreen onBack={() => setShowFlashcards(false)} />;
  }

  // Practice flow — hub + discipline drills
  if (showPractice === 'hub') {
    return (
      <PracticeHubScreen
        onBack={() => setShowPractice(null)}
        onSelect={(id) => {
          // Route disciplines that reuse existing screens
          if (id === 'listening') {
            setShowPractice(null);
            setShowListening(true);
            return;
          }
          if (id === 'vocabulary') {
            setShowPractice(null);
            setShowFlashcards(true);
            return;
          }
          setShowPractice(id);
        }}
      />
    );
  }
  if (showPractice === 'kana') {
    return <KanaPracticeScreen onBack={() => setShowPractice('hub')} />;
  }
  if (showPractice === 'kanji' || showPractice === 'grammar' || showPractice === 'numbers') {
    return <ComingSoonScreen discipline={showPractice} onBack={() => setShowPractice('hub')} />;
  }

  const langColor = activeLanguage ? languageColors[activeLanguage] : languageColors.japanese;

  const getLanguageLabel = () => {
    switch (activeLanguage) {
      case 'japanese': return '日本語';
      case 'korean': return '한국어';
      case 'mandarin': return '中文';
      default: return '';
    }
  };

  const getLanguageFlag = () => {
    switch (activeLanguage) {
      case 'japanese': return '🇯🇵';
      case 'korean': return '🇰🇷';
      case 'mandarin': return '🇨🇳';
      default: return '';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => setActiveLanguage(null as any)}
          style={styles.backTouchable}
          activeOpacity={0.6}
        >
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerFlag}>{getLanguageFlag()}</Text>
          <Text style={styles.headerTitle}>{getLanguageLabel()}</Text>
        </View>
        <TouchableOpacity onPress={clearMessages} style={styles.clearButton} activeOpacity={0.6}>
          <Text style={styles.clearButtonText}>Clear</Text>
        </TouchableOpacity>
      </View>

      {/* Mode Selector — primary conversation modes */}
      <View style={styles.modeSelector}>
        {MODES.map(({ mode, label, icon }) => {
          const isActive = interactionMode === mode;
          return (
            <TouchableOpacity
              key={mode}
              style={[
                styles.modeButton,
                isActive && [styles.modeButtonActive, { backgroundColor: langColor.accent }],
              ]}
              onPress={() => setInteractionMode(mode)}
              activeOpacity={0.7}
            >
              <Text style={[styles.modeIcon, isActive && styles.modeIconActive]}>
                {icon}
              </Text>
              <Text style={[styles.modeLabel, isActive && styles.modeLabelActive]}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Tools row — practice disciplines hub */}
      <View style={styles.toolsRow}>
        <TouchableOpacity
          style={styles.toolPill}
          onPress={() => setShowPractice('hub')}
          activeOpacity={0.7}
        >
          <Text style={[styles.toolKanji, { color: langColor.accent }]}>修</Text>
          <Text style={styles.toolLabel}>Practice · six disciplines</Text>
          <Text style={styles.toolArrow}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.messagesContainer}
        keyboardVerticalOffset={90}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(_, index) => index.toString()}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={[styles.emptyIcon, { color: langColor.accent }]}>筆</Text>
              <Text style={styles.emptyTitle}>Begin the conversation</Text>
              <Text style={styles.emptyText}>
                {inputMode === 'voice'
                  ? 'Tap the microphone below to speak'
                  : 'Type a message to begin'}
              </Text>

              {/* Suggested starters */}
              <View style={styles.startersContainer}>
                <Text style={styles.startersLabel}>Try saying</Text>
                {getStarterPrompts(activeLanguage).map((prompt, i) => (
                  <TouchableOpacity
                    key={i}
                    style={styles.starterChip}
                    onPress={() => sendMessage(prompt.text)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.starterNative}>{prompt.native}</Text>
                    <Text style={styles.starterEnglish}>{prompt.english}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          }
        />

        {/* Loading indicator */}
        {isLoading && (
          <Animated.View style={[styles.loadingContainer, { opacity: dotsAnim }]}>
            <View style={styles.loadingDots}>
              <View style={[styles.dot, { backgroundColor: langColor.accent }]} />
              <View style={[styles.dot, styles.dotMiddle, { backgroundColor: langColor.accent }]} />
              <View style={[styles.dot, { backgroundColor: langColor.accent }]} />
            </View>
          </Animated.View>
        )}

        {/* Input Mode Toggle */}
        <View style={styles.inputModeToggle}>
          <TouchableOpacity
            style={[
              styles.inputModeButton,
              inputMode === 'voice' && styles.inputModeButtonActive,
            ]}
            onPress={() => setInputMode('voice')}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.inputModeLabel,
              inputMode === 'voice' && styles.inputModeLabelActive,
            ]}>
              Voice
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.inputModeButton,
              inputMode === 'text' && styles.inputModeButtonActive,
            ]}
            onPress={() => setInputMode('text')}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.inputModeLabel,
              inputMode === 'text' && styles.inputModeLabelActive,
            ]}>
              Type
            </Text>
          </TouchableOpacity>
        </View>

        {/* Voice Input */}
        {inputMode === 'voice' && (
          <View style={styles.voiceInputContainer}>
            <VoiceRecorder
              onTranscription={handleVoiceTranscription}
              disabled={isLoading}
            />
          </View>
        )}

        {/* Text Input */}
        {inputMode === 'text' && (
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Type your message..."
              placeholderTextColor={colors.inkFaint}
              multiline
              maxLength={1000}
              editable={!isLoading}
              onSubmitEditing={handleSend}
              returnKeyType="send"
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                { backgroundColor: langColor.accent },
                (!inputText.trim() || isLoading) && styles.sendButtonDisabled,
              ]}
              onPress={handleSend}
              disabled={!inputText.trim() || isLoading}
              activeOpacity={0.8}
            >
              <Text style={styles.sendButtonText}>→</Text>
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

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
  headerFlag: {
    fontSize: 18,
    marginRight: spacing.sm,
  },
  headerTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.ink,
    letterSpacing: 1,
  },
  clearButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  clearButtonText: {
    color: colors.inkMuted,
    fontSize: fontSize.sm,
  },
  modeSelector: {
    flexDirection: 'row',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.bgCard,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.sm,
  },
  modeButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    backgroundColor: 'transparent',
  },
  modeButtonActive: {
    backgroundColor: colors.primary,
  },
  toolsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgCard,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: spacing.md,
  },
  toolPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.sm,
  },
  toolDivider: {
    width: 1,
    height: 20,
    backgroundColor: colors.border,
  },
  toolKanji: {
    fontSize: 18,
    fontFamily: fonts.display,
    marginRight: spacing.sm,
  },
  toolLabel: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.ink,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  toolArrow: {
    fontSize: fontSize.lg,
    color: colors.inkFaint,
    fontWeight: '300',
    marginRight: spacing.sm,
  },
  modeIcon: {
    fontSize: 16,
    color: colors.inkMuted,
    marginBottom: 2,
  },
  modeIconActive: {
    color: colors.white,
  },
  modeLabel: {
    fontSize: fontSize.xs,
    color: colors.inkMuted,
    fontWeight: '500',
  },
  modeLabelActive: {
    color: colors.white,
    fontWeight: '600',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesList: {
    paddingVertical: spacing.lg,
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing['3xl'],
  },
  emptyIcon: {
    fontSize: 40,
    color: colors.inkFaint,
    marginBottom: spacing.lg,
    opacity: 0.4,
  },
  emptyTitle: {
    fontSize: fontSize.lg,
    fontFamily: fonts.display,
    color: colors.inkMuted,
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: fontSize.sm,
    color: colors.inkFaint,
  },
  startersContainer: {
    marginTop: spacing['2xl'],
    width: '100%',
    paddingHorizontal: spacing.xl,
  },
  startersLabel: {
    fontSize: fontSize.xs,
    color: colors.inkFaint,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    fontWeight: '600',
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  starterChip: {
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  starterNative: {
    fontSize: fontSize.md,
    color: colors.ink,
    fontWeight: '500',
    marginBottom: 2,
  },
  starterEnglish: {
    fontSize: fontSize.xs,
    color: colors.inkMuted,
    letterSpacing: 0.2,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  loadingDots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    opacity: 0.6,
  },
  dotMiddle: {
    opacity: 0.4,
  },
  inputModeToggle: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    backgroundColor: colors.bgMuted,
    gap: spacing.xs,
  },
  inputModeButton: {
    paddingHorizontal: spacing.xl,
    paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: 'transparent',
  },
  inputModeButtonActive: {
    backgroundColor: colors.bgCard,
    ...shadows.sm,
  },
  inputModeLabel: {
    fontSize: fontSize.sm,
    color: colors.inkFaint,
    fontWeight: '500',
  },
  inputModeLabelActive: {
    color: colors.ink,
    fontWeight: '600',
  },
  voiceInputContainer: {
    paddingVertical: spacing.md,
    backgroundColor: colors.bgMuted,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.bgCard,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
    backgroundColor: colors.bgInput,
    borderRadius: radius.xl,
    fontSize: fontSize.md,
    color: colors.ink,
  },
  sendButton: {
    marginLeft: spacing.sm,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: colors.inkFaint,
    opacity: 0.5,
  },
  sendButtonText: {
    color: colors.white,
    fontSize: fontSize.lg,
    fontWeight: '600',
  },
});
