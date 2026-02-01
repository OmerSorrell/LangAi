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

        {/* Play button for assistant messages */}
        {!isUser && (
          <TouchableOpacity
            style={styles.playButton}
            onPress={handlePlayAudio}
            activeOpacity={0.7}
          >
            {isPlaying ? (
              <ActivityIndicator size="small" color="#007AFF" />
            ) : (
              <Text style={styles.playIcon}>🔊</Text>
            )}
            <Text style={styles.playText}>
              {isPlaying ? 'Stop' : 'Listen'}
            </Text>
          </TouchableOpacity>
        )}

        {/* Cultural Note */}
        {message.culturalNote && (
          <View style={styles.culturalNote}>
            <Text style={styles.culturalNoteLabel}>Cultural Note:</Text>
            <Text style={styles.culturalNoteText}>{message.culturalNote}</Text>
          </View>
        )}

        {/* Corrections */}
        {message.corrections && message.corrections.length > 0 && (
          <View style={styles.corrections}>
            <Text style={styles.correctionsLabel}>Corrections:</Text>
            {message.corrections.map((correction, index) => (
              <CorrectionItem key={index} correction={correction} />
            ))}
          </View>
        )}
      </View>

      <Text style={styles.timestamp}>
        {formatTime(message.timestamp)}
      </Text>
    </View>
  );
}

interface CorrectionItemProps {
  correction: Correction;
}

function CorrectionItem({ correction }: CorrectionItemProps) {
  return (
    <View style={styles.correctionItem}>
      <Text style={styles.correctionOriginal}>
        "{correction.original}" →{' '}
        <Text style={styles.correctionCorrected}>"{correction.corrected}"</Text>
      </Text>
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
    marginVertical: 4,
    marginHorizontal: 12,
    maxWidth: '80%',
  },
  userContainer: {
    alignSelf: 'flex-end',
  },
  assistantContainer: {
    alignSelf: 'flex-start',
  },
  bubble: {
    padding: 12,
    borderRadius: 16,
  },
  userBubble: {
    backgroundColor: '#007AFF',
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: '#E8E8E8',
    borderBottomLeftRadius: 4,
  },
  text: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: '#FFFFFF',
  },
  assistantText: {
    color: '#000000',
  },
  timestamp: {
    fontSize: 11,
    color: '#8E8E93',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  culturalNote: {
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  culturalNoteLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8B5CF6',
    marginBottom: 4,
  },
  culturalNoteText: {
    fontSize: 14,
    color: '#4B5563',
    fontStyle: 'italic',
  },
  corrections: {
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  correctionsLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F59E0B',
    marginBottom: 8,
  },
  correctionItem: {
    marginBottom: 8,
  },
  correctionOriginal: {
    fontSize: 14,
    color: '#DC2626',
  },
  correctionCorrected: {
    color: '#16A34A',
    fontWeight: '600',
  },
  correctionExplanation: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
    marginLeft: 8,
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  playIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  playText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
  },
});
