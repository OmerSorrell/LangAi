/**
 * Audio Recorder Service
 *
 * Handles audio recording using expo-av.
 * Provides a clean interface for recording voice input.
 */

import { Audio } from 'expo-av';
import { Platform } from 'react-native';

export interface RecordingResult {
  uri: string;
  duration: number;
}

// Recording settings optimized for speech recognition
const RECORDING_OPTIONS: Audio.RecordingOptions = {
  isMeteringEnabled: true,
  android: {
    extension: '.m4a',
    outputFormat: Audio.AndroidOutputFormat.MPEG_4,
    audioEncoder: Audio.AndroidAudioEncoder.AAC,
    sampleRate: 16000,
    numberOfChannels: 1,
    bitRate: 128000,
  },
  ios: {
    extension: '.m4a',
    outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
    audioQuality: Audio.IOSAudioQuality.HIGH,
    sampleRate: 16000,
    numberOfChannels: 1,
    bitRate: 128000,
    linearPCMBitDepth: 16,
    linearPCMIsBigEndian: false,
    linearPCMIsFloat: false,
  },
  web: {
    mimeType: 'audio/webm',
    bitsPerSecond: 128000,
  },
};

class AudioRecorder {
  private recording: Audio.Recording | null = null;
  private isRecording = false;
  private permissionGranted = false;

  /**
   * Request microphone permissions
   */
  async requestPermissions(): Promise<boolean> {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      this.permissionGranted = status === 'granted';
      return this.permissionGranted;
    } catch (error) {
      console.error('Error requesting audio permissions:', error);
      return false;
    }
  }

  /**
   * Check if permissions are granted
   */
  async hasPermissions(): Promise<boolean> {
    const { status } = await Audio.getPermissionsAsync();
    this.permissionGranted = status === 'granted';
    return this.permissionGranted;
  }

  /**
   * Start recording audio
   */
  async startRecording(): Promise<void> {
    try {
      // Check permissions
      if (!this.permissionGranted) {
        const granted = await this.requestPermissions();
        if (!granted) {
          throw new Error('Microphone permission not granted');
        }
      }

      // Configure audio mode for recording
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        // On iOS, we need to set the proper category for recording
        ...(Platform.OS === 'ios' && {
          interruptionModeIOS: 1, // DoNotMix
        }),
      });

      // Create and start recording
      const { recording } = await Audio.Recording.createAsync(RECORDING_OPTIONS);

      this.recording = recording;
      this.isRecording = true;
    } catch (error) {
      console.error('Error starting recording:', error);
      throw error;
    }
  }

  /**
   * Stop recording and return the audio file URI
   */
  async stopRecording(): Promise<RecordingResult> {
    if (!this.recording || !this.isRecording) {
      throw new Error('No active recording');
    }

    try {
      // Stop the recording
      await this.recording.stopAndUnloadAsync();

      // Reset audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
      });

      // Get the recording URI and status
      const uri = this.recording.getURI();
      const status = await this.recording.getStatusAsync();

      if (!uri) {
        throw new Error('Recording URI not available');
      }

      // Clean up
      this.recording = null;
      this.isRecording = false;

      return {
        uri,
        duration: status.durationMillis || 0,
      };
    } catch (error) {
      console.error('Error stopping recording:', error);
      this.recording = null;
      this.isRecording = false;
      throw error;
    }
  }

  /**
   * Cancel recording without saving
   */
  async cancelRecording(): Promise<void> {
    if (!this.recording) return;

    try {
      await this.recording.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });
    } catch (error) {
      console.error('Error canceling recording:', error);
    } finally {
      this.recording = null;
      this.isRecording = false;
    }
  }

  /**
   * Get current recording status
   */
  getIsRecording(): boolean {
    return this.isRecording;
  }

  /**
   * Get current audio levels (for visualization)
   */
  async getMetering(): Promise<number> {
    if (!this.recording || !this.isRecording) return 0;

    try {
      const status = await this.recording.getStatusAsync();
      // Metering is in dB, normalize to 0-1 range
      const metering = status.metering || -160;
      // Convert dB to linear scale (roughly 0-1)
      return Math.max(0, Math.min(1, (metering + 60) / 60));
    } catch {
      return 0;
    }
  }
}

// Export singleton instance
export const audioRecorder = new AudioRecorder();

// Export class for testing
export { AudioRecorder };
