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
  const durationInterval = useRef<NodeJS.Timeout | null>(null);
  const meteringInterval = useRef<NodeJS.Timeout | null>(null);

  const { activeLanguage, preferences } = useStore();

  // Pulse animation while recording
  useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }

    return () => {
      pulseAnim.stopAnimation();
    };
  }, [isRecording, pulseAnim]);

  // Duration counter while recording
  useEffect(() => {
    if (isRecording) {
      setRecordingDuration(0);
      durationInterval.current = setInterval(() => {
        setRecordingDuration((d) => d + 1);
      }, 1000);

      // Audio level metering
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
      // Stop recording and transcribe
      await stopAndTranscribe();
    } else {
      // Start recording
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

      // Minimum recording duration check (500ms)
      if (result.duration < 500) {
        setIsProcessing(false);
        return;
      }

      // Transcribe the audio
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

  return (
    <View style={styles.container}>
      {/* Recording duration */}
      {isRecording && (
        <View style={styles.durationContainer}>
          <View style={styles.recordingDot} />
          <Text style={styles.durationText}>{formatDuration(recordingDuration)}</Text>
        </View>
      )}

      {/* Audio level indicator */}
      {isRecording && (
        <View style={styles.levelContainer}>
          <View style={[styles.levelBar, { width: `${audioLevel * 100}%` }]} />
        </View>
      )}

      {/* Microphone button */}
      <Animated.View
        style={[
          styles.buttonWrapper,
          { transform: [{ scale: isRecording ? pulseAnim : 1 }] },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.button,
            isRecording && styles.buttonRecording,
            (disabled || isProcessing) && styles.buttonDisabled,
          ]}
          onPress={handlePress}
          disabled={disabled || isProcessing}
          activeOpacity={0.7}
        >
          {isProcessing ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonIcon}>{isRecording ? '⏹' : '🎤'}</Text>
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
    paddingVertical: 8,
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    marginRight: 6,
  },
  durationText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#EF4444',
  },
  levelContainer: {
    width: 120,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    marginBottom: 12,
    overflow: 'hidden',
  },
  levelBar: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 2,
  },
  buttonWrapper: {
    marginBottom: 8,
  },
  button: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  buttonRecording: {
    backgroundColor: '#EF4444',
  },
  buttonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  buttonIcon: {
    fontSize: 24,
  },
  statusText: {
    fontSize: 12,
    color: '#6B7280',
  },
});
