/**
 * Whisper Speech-to-Text Service Tests
 */

// Set up environment before imports
process.env.EXPO_PUBLIC_OPENAI_API_KEY = 'test-openai-key';

import {
  transcribeAudio,
  transcribeForLanguageLearning,
  isWhisperConfigured,
} from '../../../services/speech/whisper';

describe('Whisper Service', () => {
  beforeEach(() => {
    process.env.EXPO_PUBLIC_OPENAI_API_KEY = 'test-openai-key';
    jest.clearAllMocks();
  });

  describe('isWhisperConfigured', () => {
    it('returns true when API key is set', () => {
      expect(isWhisperConfigured()).toBe(true);
    });
  });

  describe('transcribeAudio', () => {
    it('sends correct request to Whisper API', async () => {
      const mockAudioBlob = new Blob(['audio data'], { type: 'audio/m4a' });
      const mockTranscription = {
        text: 'こんにちは',
        language: 'ja',
        duration: 2.5,
      };

      // Mock fetch for audio file
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          blob: () => Promise.resolve(mockAudioBlob),
        })
        // Mock Whisper API response
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockTranscription),
        });

      const result = await transcribeAudio('file://test.m4a', {
        language: 'japanese',
      });

      expect(result.text).toBe('こんにちは');
      expect(result.language).toBe('ja');
      expect(result.duration).toBe(2.5);

      // Verify Whisper API was called
      expect(global.fetch).toHaveBeenCalledTimes(2);
      const whisperCall = (global.fetch as jest.Mock).mock.calls[1];
      expect(whisperCall[0]).toBe(
        'https://api.openai.com/v1/audio/transcriptions'
      );
    });

    it('handles API errors gracefully', async () => {
      const mockAudioBlob = new Blob(['audio data'], { type: 'audio/m4a' });

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          blob: () => Promise.resolve(mockAudioBlob),
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 400,
          text: () => Promise.resolve('Bad Request'),
        });

      await expect(transcribeAudio('file://test.m4a')).rejects.toThrow(
        'Whisper API error: 400'
      );
    });
  });

  describe('transcribeForLanguageLearning', () => {
    it('transcribes Japanese audio correctly', async () => {
      const mockAudioBlob = new Blob(['audio data'], { type: 'audio/m4a' });
      const mockTranscription = {
        text: 'はじめまして',
        language: 'ja',
        duration: 1.5,
      };

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          blob: () => Promise.resolve(mockAudioBlob),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockTranscription),
        });

      const result = await transcribeForLanguageLearning('file://test.m4a', 'japanese', 'A1');

      expect(result.text).toBe('はじめまして');
    });

    it('transcribes Korean audio correctly', async () => {
      const mockAudioBlob = new Blob(['audio data'], { type: 'audio/m4a' });
      const mockTranscription = {
        text: '안녕하세요',
        language: 'ko',
        duration: 1.0,
      };

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          blob: () => Promise.resolve(mockAudioBlob),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockTranscription),
        });

      const result = await transcribeForLanguageLearning(
        'file://test.m4a',
        'korean',
        'B1'
      );

      expect(result.text).toBe('안녕하세요');
    });

    it('transcribes Mandarin audio correctly', async () => {
      const mockAudioBlob = new Blob(['audio data'], { type: 'audio/m4a' });
      const mockTranscription = {
        text: '你好',
        language: 'zh',
        duration: 0.8,
      };

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          blob: () => Promise.resolve(mockAudioBlob),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockTranscription),
        });

      const result = await transcribeForLanguageLearning(
        'file://test.m4a',
        'mandarin',
        'A2'
      );

      expect(result.text).toBe('你好');
    });
  });
});
