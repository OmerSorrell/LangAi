/**
 * Voice Recorder Component
 *
 * A microphone button that handles voice recording for speech input.
 * Shows recording state with visual feedback.
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {
  audioRecorder,
  transcribeForLanguageLearning,
  isWhisperConfigured,
} from '../services/speech';
import { useStore } from '../store/useStore';
import { colors, fonts, fontSize, spacing, radius, shadows, languageColors } from '../theme';

interface VoiceRecorderProps {
  onTranscription: (text: string) => void;
  disabled?: boolean;
}

export function VoiceRecorder({ onTranscription, disabled }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const ringAnim = useRef(new Animated.Value(0)).current;
  const durationInterval = useRef<NodeJS.Timeout | null>(null);
  const meteringInterval = useRef<NodeJS.Timeout | null>(null);

  const { activeLanguage, preferences } = useStore();
  const langColor = activeLanguage ? languageColors[activeLanguage] : languageColors.japanese;

  // Pulse animation while recording
  useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 700,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 700,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Ring expansion animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(ringAnim, {
            toValue: 1,
            duration: 1400,
            useNativeDriver: true,
          }),
          Animated.timing(ringAnim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
      ringAnim.setValue(0);
    }

    return () => {
      pulseAnim.stopAnimation();
      ringAnim.stopAnimation();
    };
  }, [isRecording]);

  // Duration counter while recording
  useEffect(() => {
    if (isRecording) {
      setRecordingDuration(0);
      durationInterval.current = setInterval(() => {
        setRecordingDuration((d) => d + 1);
      }, 1000);

      meteringInterval.current = setInterval(async () => {
        const level = await audioRecorder.getMetering();
        setAudioLevel(level);
      }, 100);
    } else {
      if (durationInterval.current) {
        clearInterval(durationInterval.current);
        durationInterval.current = null;
      }
      if (meteringInterval.current) {
        clearInterval(meteringInterval.current);
        meteringInterval.current = null;
      }
      setRecordingDuration(0);
      setAudioLevel(0);
    }

    return () => {
      if (durationInterval.current) clearInterval(durationInterval.current);
      if (meteringInterval.current) clearInterval(meteringInterval.current);
    };
  }, [isRecording]);

  const handlePress = async () => {
    if (disabled || isProcessing) return;

    if (!isWhisperConfigured()) {
      Alert.alert(
        'Voice Not Configured',
        'Please add your OpenAI API key to enable voice input.\n\nSet EXPO_PUBLIC_OPENAI_API_KEY in your .env file.',
        [{ text: 'OK' }]
      );
      return;
    }

    if (isRecording) {
      await stopAndTranscribe();
    } else {
      await startRecording();
    }
  };

  const startRecording = async () => {
    try {
      const hasPermission = await audioRecorder.requestPermissions();
      if (!hasPermission) {
        Alert.alert(
          'Permission Required',
          'Microphone access is required for voice input. Please enable it in your device settings.',
          [{ text: 'OK' }]
        );
        return;
      }

      await audioRecorder.startRecording();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      Alert.alert('Recording Error', 'Failed to start recording. Please try again.');
    }
  };

  const stopAndTranscribe = async () => {
    setIsRecording(false);
    setIsProcessing(true);

    try {
      const result = await audioRecorder.stopRecording();

      if (result.duration < 500) {
        setIsProcessing(false);
        return;
      }

      const transcription = await transcribeForLanguageLearning(
        result.uri,
        activeLanguage || 'japanese',
        preferences.proficiencyLevels[activeLanguage || 'japanese']
      );

      if (transcription.text.trim()) {
        onTranscription(transcription.text.trim());
      }
    } catch (error) {
      console.error('Error transcribing:', error);
      Alert.alert(
        'Transcription Error',
        'Failed to transcribe audio. Please try again.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const ringScale = ringAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.8],
  });

  const ringOpacity = ringAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.3, 0.1, 0],
  });

  return (
    <View style={styles.container}>
      {/* Recording duration */}
      {isRecording && (
        <View style={styles.durationContainer}>
          <View style={styles.recordingDot} />
          <Text style={styles.durationText}>{formatDuration(recordingDuration)}</Text>
        </View>
      )}

      {/* Audio level visualizer */}
      {isRecording && (
        <View style={styles.levelContainer}>
          {[...Array(12)].map((_, i) => {
            const threshold = (i + 1) / 12;
            const isActive = audioLevel >= threshold;
            return (
              <View
                key={i}
                style={[
                  styles.levelSegment,
                  {
                    backgroundColor: isActive
                      ? langColor.accent
                      : colors.borderLight,
                    opacity: isActive ? 0.6 + (i / 12) * 0.4 : 0.3,
                  },
                ]}
              />
            );
          })}
        </View>
      )}

      {/* Expanding ring animation */}
      {isRecording && (
        <Animated.View
          style={[
            styles.ring,
            {
              backgroundColor: langColor.accent,
              transform: [{ scale: ringScale }],
              opacity: ringOpacity,
            },
          ]}
        />
      )}

      {/* Microphone button */}
      <Animated.View
        style={[
          styles.buttonWrapper,
          { transform: [{ scale: pulseAnim }] },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.button,
            { backgroundColor: isRecording ? colors.primary : colors.ink },
            (disabled || isProcessing) && styles.buttonDisabled,
          ]}
          onPress={handlePress}
          disabled={disabled || isProcessing}
          activeOpacity={0.8}
        >
          {isProcessing ? (
            <ActivityIndicator size="small" color={colors.bg} />
          ) : (
            <Text style={styles.buttonIcon}>{isRecording ? '■' : '●'}</Text>
          )}
        </TouchableOpacity>
      </Animated.View>

      {/* Status text */}
      <Text style={styles.statusText}>
        {isProcessing
          ? 'Transcribing...'
          : isRecording
            ? 'Tap to stop'
            : 'Tap to speak'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  recordingDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginRight: spacing.sm,
  },
  durationText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.primary,
    fontFamily: fonts.mono,
  },
  levelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginBottom: spacing.md,
    height: 16,
  },
  levelSegment: {
    width: 3,
    height: 16,
    borderRadius: 2,
  },
  ring: {
    position: 'absolute',
    width: 64,
    height: 64,
    borderRadius: 32,
    top: '50%',
    marginTop: -8,
  },
  buttonWrapper: {
    marginBottom: spacing.sm,
  },
  button: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.md,
  },
  buttonDisabled: {
    backgroundColor: colors.inkFaint,
  },
  buttonIcon: {
    fontSize: 20,
    color: colors.bg,
  },
  statusText: {
    fontSize: fontSize.xs,
    color: colors.inkMuted,
    letterSpacing: 0.3,
  },
});
