/**
 * Chat Bubble Component
 *
 * Displays a single message in the conversation.
 * Handles both user and assistant messages with different styling.
 * Includes TTS playback for assistant messages.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { ConversationMessage, Correction } from '../agents/teacher';
import { speakForLanguageLearning, stopSpeaking } from '../services/speech';
import { useStore } from '../store/useStore';
import { colors, fonts, fontSize, spacing, radius, shadows } from '../theme';

interface ChatBubbleProps {
  message: ConversationMessage;
}

export function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.role === 'user';
  const [isPlaying, setIsPlaying] = useState(false);
  const { activeLanguage } = useStore();

  const handlePlayAudio = async () => {
    if (isPlaying) {
      await stopSpeaking();
      setIsPlaying(false);
      return;
    }

    if (!activeLanguage) return;

    setIsPlaying(true);
    try {
      await speakForLanguageLearning(message.content, activeLanguage);
    } catch (error) {
      console.error('TTS error:', error);
    } finally {
      setIsPlaying(false);
    }
  };

  return (
    <View
      style={[
        styles.container,
        isUser ? styles.userContainer : styles.assistantContainer,
      ]}
    >
      <View
        style={[
          styles.bubble,
          isUser ? styles.userBubble : styles.assistantBubble,
        ]}
      >
        <Text
          style={[styles.text, isUser ? styles.userText : styles.assistantText]}
        >
          {message.content}
        </Text>

        {/* Play button for assistant messages — subtle icon tucked to right */}
        {!isUser && (
          <TouchableOpacity
            style={styles.playButton}
            onPress={handlePlayAudio}
            activeOpacity={0.6}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            {isPlaying ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Text style={styles.playIcon}>▶</Text>
            )}
          </TouchableOpacity>
        )}

        {/* Cultural Note */}
        {message.culturalNote && (
          <View style={styles.culturalNote}>
            <View style={styles.culturalNoteHeader}>
              <View style={styles.culturalDot} />
              <Text style={styles.culturalNoteLabel}>Cultural Insight</Text>
            </View>
            <Text style={styles.culturalNoteText}>{message.culturalNote}</Text>
          </View>
        )}

        {/* Corrections */}
        {message.corrections && message.corrections.length > 0 && (
          <View style={styles.corrections}>
            <View style={styles.correctionsHeader}>
              <View style={[styles.culturalDot, { backgroundColor: colors.gold }]} />
              <Text style={styles.correctionsLabel}>Corrections</Text>
            </View>
            {message.corrections.map((correction, index) => (
              <CorrectionItem key={index} correction={correction} />
            ))}
          </View>
        )}
      </View>

      {isUser && (
        <Text style={[styles.timestamp, styles.timestampUser]}>
          {formatTime(message.timestamp)}
        </Text>
      )}
    </View>
  );
}

interface CorrectionItemProps {
  correction: Correction;
}

function CorrectionItem({ correction }: CorrectionItemProps) {
  return (
    <View style={styles.correctionItem}>
      <View style={styles.correctionRow}>
        <Text style={styles.correctionOriginal}>{correction.original}</Text>
        <Text style={styles.correctionArrow}>→</Text>
        <Text style={styles.correctionCorrected}>{correction.corrected}</Text>
      </View>
      <Text style={styles.correctionExplanation}>{correction.explanation}</Text>
    </View>
  );
}

function formatTime(date: Date): string {
  return new Intl.DateTimeFormat('en', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(date));
}

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.xs,
    marginHorizontal: spacing.md,
    maxWidth: '82%',
  },
  userContainer: {
    alignSelf: 'flex-end',
  },
  assistantContainer: {
    alignSelf: 'flex-start',
  },
  bubble: {
    padding: spacing.md,
    borderRadius: radius.lg,
  },
  userBubble: {
    backgroundColor: colors.userBubble,
    borderBottomRightRadius: spacing.xs,
  },
  assistantBubble: {
    backgroundColor: colors.assistantBubble,
    borderBottomLeftRadius: spacing.xs,
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingRight: 36, // room for the floating play button
    paddingBottom: spacing.md + 8,
  },
  text: {
    fontSize: fontSize.md,
    lineHeight: 23,
  },
  userText: {
    color: colors.userBubbleText,
  },
  assistantText: {
    color: colors.assistantBubbleText,
  },
  timestamp: {
    fontSize: fontSize.xs,
    color: colors.inkFaint,
    marginTop: spacing.xs,
    alignSelf: 'flex-start',
  },
  timestampUser: {
    alignSelf: 'flex-end',
  },
  playButton: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryMuted,
  },
  playIcon: {
    fontSize: 9,
    color: colors.primary,
    marginLeft: 1, // optical center for play triangle
  },
  culturalNote: {
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  culturalNoteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  culturalDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.purple,
    marginRight: spacing.sm,
  },
  culturalNoteLabel: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.purple,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  culturalNoteText: {
    fontSize: fontSize.sm,
    color: colors.inkLight,
    fontStyle: 'italic',
    lineHeight: 19,
  },
  corrections: {
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  correctionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  correctionsLabel: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.gold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  correctionItem: {
    marginBottom: spacing.sm,
    paddingLeft: spacing.md,
    borderLeftWidth: 2,
    borderLeftColor: colors.goldLight,
  },
  correctionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  correctionOriginal: {
    fontSize: fontSize.sm,
    color: colors.error,
    textDecorationLine: 'line-through',
  },
  correctionArrow: {
    fontSize: fontSize.sm,
    color: colors.inkFaint,
  },
  correctionCorrected: {
    fontSize: fontSize.sm,
    color: colors.success,
    fontWeight: '600',
  },
  correctionExplanation: {
    fontSize: fontSize.xs,
    color: colors.inkMuted,
    marginTop: 2,
    lineHeight: 17,
  },
});
