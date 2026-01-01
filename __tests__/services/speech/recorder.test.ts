/**
 * Audio Recorder Service Tests
 */

import { AudioRecorder, audioRecorder } from '../../../services/speech/recorder';
import { Audio } from 'expo-av';

describe('AudioRecorder', () => {
  let recorder: AudioRecorder;

  beforeEach(() => {
    recorder = new AudioRecorder();
    jest.clearAllMocks();
  });

  describe('requestPermissions', () => {
    it('requests microphone permissions', async () => {
      const result = await recorder.requestPermissions();

      expect(Audio.requestPermissionsAsync).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('returns false when permission denied', async () => {
      (Audio.requestPermissionsAsync as jest.Mock).mockResolvedValueOnce({
        status: 'denied',
      });

      const result = await recorder.requestPermissions();

      expect(result).toBe(false);
    });
  });

  describe('hasPermissions', () => {
    it('checks current permission status', async () => {
      const result = await recorder.hasPermissions();

      expect(Audio.getPermissionsAsync).toHaveBeenCalled();
      expect(result).toBe(true);
    });
  });

  describe('startRecording', () => {
    it('starts recording after permission granted', async () => {
      await recorder.requestPermissions();
      await recorder.startRecording();

      expect(Audio.setAudioModeAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          allowsRecordingIOS: true,
        })
      );
      expect(Audio.Recording.createAsync).toHaveBeenCalled();
      expect(recorder.getIsRecording()).toBe(true);
    });

    it('throws error when permission not granted', async () => {
      (Audio.requestPermissionsAsync as jest.Mock).mockResolvedValueOnce({
        status: 'denied',
      });

      await expect(recorder.startRecording()).rejects.toThrow(
        'Microphone permission not granted'
      );
    });
  });

  describe('stopRecording', () => {
    it('stops recording and returns URI', async () => {
      await recorder.requestPermissions();
      await recorder.startRecording();

      const result = await recorder.stopRecording();

      expect(result.uri).toBe('file://test-audio.m4a');
      expect(result.duration).toBe(5000);
      expect(recorder.getIsRecording()).toBe(false);
    });

    it('throws error when no active recording', async () => {
      await expect(recorder.stopRecording()).rejects.toThrow(
        'No active recording'
      );
    });

    it('resets audio mode after stopping', async () => {
      await recorder.requestPermissions();
      await recorder.startRecording();
      await recorder.stopRecording();

      expect(Audio.setAudioModeAsync).toHaveBeenLastCalledWith(
        expect.objectContaining({
          allowsRecordingIOS: false,
        })
      );
    });
  });

  describe('cancelRecording', () => {
    it('cancels recording without error when no recording active', async () => {
      await expect(recorder.cancelRecording()).resolves.not.toThrow();
    });

    it('stops and discards recording when active', async () => {
      await recorder.requestPermissions();
      await recorder.startRecording();

      await recorder.cancelRecording();

      expect(recorder.getIsRecording()).toBe(false);
    });
  });

  describe('getIsRecording', () => {
    it('returns false initially', () => {
      expect(recorder.getIsRecording()).toBe(false);
    });

    it('returns true when recording', async () => {
      await recorder.requestPermissions();
      await recorder.startRecording();

      expect(recorder.getIsRecording()).toBe(true);
    });
  });
});

describe('audioRecorder singleton', () => {
  it('exports a singleton instance', () => {
    expect(audioRecorder).toBeInstanceOf(AudioRecorder);
  });
});
