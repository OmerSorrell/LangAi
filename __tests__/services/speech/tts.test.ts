/**
 * TTS (Text-to-Speech) Service Tests
 */

import * as Speech from 'expo-speech';
import {
  speak,
  speakForLanguageLearning,
  stopSpeaking,
  isSpeaking,
  isTTSConfigured,
  getAvailableProviders,
  getVoices,
} from '../../../services/speech/tts';

describe('TTS Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('isTTSConfigured', () => {
    it('returns true when expo-speech is available', () => {
      expect(isTTSConfigured()).toBe(true);
    });
  });

  describe('getAvailableProviders', () => {
    it('includes expo-speech by default', () => {
      const providers = getAvailableProviders();
      expect(providers).toContain('expo-speech');
    });

    it('includes elevenlabs when API key is set', () => {
      process.env.EXPO_PUBLIC_ELEVENLABS_API_KEY = 'test-key';
      const providers = getAvailableProviders();
      expect(providers).toContain('elevenlabs');
      delete process.env.EXPO_PUBLIC_ELEVENLABS_API_KEY;
    });
  });

  describe('speak', () => {
    it('calls expo-speech with correct parameters', async () => {
      const result = await speak('Hello', { language: 'japanese' });

      expect(Speech.speak).toHaveBeenCalledWith(
        'Hello',
        expect.objectContaining({
          language: 'ja-JP',
        })
      );
      expect(result.success).toBe(true);
    });

    it('uses English as default language', async () => {
      await speak('Hello');

      expect(Speech.speak).toHaveBeenCalledWith(
        'Hello',
        expect.objectContaining({
          language: 'en-US',
        })
      );
    });

    it('applies custom rate and pitch', async () => {
      await speak('Hello', { rate: 0.8, pitch: 1.2 });

      expect(Speech.speak).toHaveBeenCalledWith(
        'Hello',
        expect.objectContaining({
          rate: 0.8,
          pitch: 1.2,
        })
      );
    });
  });

  describe('speakForLanguageLearning', () => {
    it('speaks Japanese with slower rate', async () => {
      await speakForLanguageLearning('こんにちは', 'japanese');

      expect(Speech.speak).toHaveBeenCalledWith(
        'こんにちは',
        expect.objectContaining({
          language: 'ja-JP',
          rate: 0.85,
        })
      );
    });

    it('speaks Korean correctly', async () => {
      await speakForLanguageLearning('안녕하세요', 'korean');

      expect(Speech.speak).toHaveBeenCalledWith(
        '안녕하세요',
        expect.objectContaining({
          language: 'ko-KR',
        })
      );
    });

    it('speaks Mandarin correctly', async () => {
      await speakForLanguageLearning('你好', 'mandarin');

      expect(Speech.speak).toHaveBeenCalledWith(
        '你好',
        expect.objectContaining({
          language: 'zh-CN',
        })
      );
    });
  });

  describe('stopSpeaking', () => {
    it('stops speech playback', async () => {
      await stopSpeaking();
      expect(Speech.stop).toHaveBeenCalled();
    });
  });

  describe('isSpeaking', () => {
    it('returns speaking state', async () => {
      (Speech.isSpeakingAsync as jest.Mock).mockResolvedValue(true);
      const speaking = await isSpeaking();
      expect(speaking).toBe(true);
    });
  });

  describe('getVoices', () => {
    it('returns available voices', async () => {
      const voices = await getVoices();
      expect(voices.length).toBeGreaterThan(0);
      expect(voices[0]).toHaveProperty('id');
      expect(voices[0]).toHaveProperty('name');
      expect(voices[0]).toHaveProperty('language');
    });

    it('filters voices by language', async () => {
      const voices = await getVoices('japanese');
      // Should include Japanese voices
      expect(voices.some(v => v.language.startsWith('ja'))).toBe(true);
    });
  });
});
