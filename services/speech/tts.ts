/**
 * TTS (Text-to-Speech) Service
 *
 * Unified interface for text-to-speech with automatic provider fallback.
 * - ElevenLabs: High-quality, natural voices (requires API key)
 * - Expo Speech: Free, device-based fallback
 */

import { TTSProvider, TTSOptions, TTSResult, TTSVoice, TTSService } from './tts-types';
import { elevenLabsService, isElevenLabsConfigured } from './elevenlabs';
import { expoSpeechService, isExpoSpeechConfigured } from './expo-tts';

// Provider preference order
const PROVIDER_PRIORITY: TTSProvider[] = ['elevenlabs', 'expo-speech'];

// Get the service for a provider
function getService(provider: TTSProvider): TTSService {
  switch (provider) {
    case 'elevenlabs':
      return elevenLabsService;
    case 'expo-speech':
      return expoSpeechService;
    default:
      return expoSpeechService;
  }
}

// Get the best available provider
function getBestProvider(): TTSProvider {
  if (isElevenLabsConfigured()) {
    return 'elevenlabs';
  }
  return 'expo-speech';
}

/**
 * Check which TTS providers are available
 */
export function getAvailableProviders(): TTSProvider[] {
  const available: TTSProvider[] = [];

  if (isElevenLabsConfigured()) {
    available.push('elevenlabs');
  }
  if (isExpoSpeechConfigured()) {
    available.push('expo-speech');
  }

  return available;
}

/**
 * Check if any TTS provider is configured
 */
export function isTTSConfigured(): boolean {
  return getAvailableProviders().length > 0;
}

/**
 * Speak text using the best available provider
 */
export async function speak(
  text: string,
  options: TTSOptions & { provider?: TTSProvider } = {}
): Promise<TTSResult> {
  const provider = options.provider || getBestProvider();
  const service = getService(provider);

  if (!service.isConfigured()) {
    // Fall back to expo-speech if preferred provider not available
    if (provider !== 'expo-speech') {
      console.warn(`${provider} not configured, falling back to expo-speech`);
      return expoSpeechService.speak(text, options);
    }
    throw new Error('No TTS provider available');
  }

  try {
    return await service.speak(text, options);
  } catch (error) {
    // Try fallback on error
    if (provider !== 'expo-speech') {
      console.warn(`${provider} failed, falling back to expo-speech:`, error);
      return expoSpeechService.speak(text, options);
    }
    throw error;
  }
}

/**
 * Stop any current speech
 */
export async function stopSpeaking(): Promise<void> {
  // Stop all providers
  await Promise.all([
    elevenLabsService.stop().catch(() => {}),
    expoSpeechService.stop().catch(() => {}),
  ]);
}

/**
 * Check if currently speaking
 */
export async function isSpeaking(): Promise<boolean> {
  const results = await Promise.all([
    elevenLabsService.isSpeaking().catch(() => false),
    expoSpeechService.isSpeaking().catch(() => false),
  ]);
  return results.some((r) => r);
}

/**
 * Get available voices for a language
 */
export async function getVoices(
  language?: string,
  provider?: TTSProvider
): Promise<TTSVoice[]> {
  if (provider) {
    const service = getService(provider);
    return service.getVoices(language);
  }

  // Get voices from all providers
  const [elevenLabsVoices, expoVoices] = await Promise.all([
    isElevenLabsConfigured()
      ? elevenLabsService.getVoices(language)
      : Promise.resolve([]),
    expoSpeechService.getVoices(language),
  ]);

  return [...elevenLabsVoices, ...expoVoices];
}

/**
 * Speak text optimized for language learning
 * Automatically selects the right voice for the target language
 */
export async function speakForLanguageLearning(
  text: string,
  targetLanguage: 'japanese' | 'korean' | 'mandarin',
  options: Omit<TTSOptions, 'language'> = {}
): Promise<TTSResult> {
  return speak(text, {
    ...options,
    language: targetLanguage,
    // Slightly slower rate for better comprehension
    rate: options.rate || 0.85,
  });
}

// Export types
export type { TTSProvider, TTSOptions, TTSResult, TTSVoice };
