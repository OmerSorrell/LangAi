/**
 * Expo Speech TTS Service
 *
 * Free text-to-speech using device's built-in speech synthesis.
 * Works offline and requires no API key.
 */

import * as Speech from 'expo-speech';
import { TTSService, TTSOptions, TTSResult, TTSVoice } from './tts-types';

// Language code mapping
const LANGUAGE_CODES: Record<string, string> = {
  japanese: 'ja-JP',
  korean: 'ko-KR',
  mandarin: 'zh-CN',
  english: 'en-US',
};

export function isExpoSpeechConfigured(): boolean {
  // Expo speech is always available on device
  return true;
}

export async function getExpoVoices(language?: string): Promise<TTSVoice[]> {
  try {
    const voices = await Speech.getAvailableVoicesAsync();

    // Filter by language if specified
    const languageCode = language ? LANGUAGE_CODES[language] : undefined;
    const filtered = languageCode
      ? voices.filter((v) => v.language.startsWith(languageCode.split('-')[0]))
      : voices;

    return filtered.map((voice) => ({
      id: voice.identifier,
      name: voice.name,
      language: voice.language,
      provider: 'expo-speech' as const,
    }));
  } catch (error) {
    console.error('Error getting expo-speech voices:', error);
    return [];
  }
}

export async function speakWithExpo(
  text: string,
  options: TTSOptions = {}
): Promise<TTSResult> {
  const language = options.language || 'english';
  const languageCode = LANGUAGE_CODES[language] || 'en-US';

  return new Promise((resolve, reject) => {
    const startTime = Date.now();

    Speech.speak(text, {
      language: languageCode,
      pitch: options.pitch || 1.0,
      rate: options.rate || 0.9, // Slightly slower for language learning
      voice: options.voice,
      onStart: () => {
        // Speech started
      },
      onDone: () => {
        const duration = Date.now() - startTime;
        resolve({ success: true, duration });
      },
      onError: (error) => {
        console.error('Expo speech error:', error);
        reject(new Error('Speech synthesis failed'));
      },
      onStopped: () => {
        resolve({ success: false });
      },
    });
  });
}

export async function stopExpoSpeech(): Promise<void> {
  await Speech.stop();
}

export async function isExpoSpeaking(): Promise<boolean> {
  return await Speech.isSpeakingAsync();
}

export const expoSpeechService: TTSService = {
  isConfigured: isExpoSpeechConfigured,
  speak: speakWithExpo,
  stop: stopExpoSpeech,
  isSpeaking: isExpoSpeaking,
  getVoices: getExpoVoices,
};
