/**
 * Whisper Speech-to-Text Service
 *
 * Handles audio transcription using OpenAI's Whisper API.
 * Optimized for Asian language recognition with language hints.
 */

import { SupportedLanguage } from '../../agents/prompts/system-prompt';

const WHISPER_API_URL = 'https://api.openai.com/v1/audio/transcriptions';

export interface TranscriptionOptions {
  /** Target language for better accuracy */
  language?: SupportedLanguage;
  /** Optional prompt to guide transcription */
  prompt?: string;
  /** Response format */
  responseFormat?: 'json' | 'text' | 'verbose_json';
}

export interface TranscriptionResult {
  text: string;
  language?: string;
  duration?: number;
  segments?: Array<{
    start: number;
    end: number;
    text: string;
  }>;
}

/**
 * Map our supported languages to Whisper language codes
 */
function getWhisperLanguageCode(language?: SupportedLanguage): string | undefined {
  if (!language) return undefined;

  const languageMap: Record<SupportedLanguage, string> = {
    japanese: 'ja',
    korean: 'ko',
    mandarin: 'zh',
  };

  return languageMap[language];
}

/**
 * Transcribe audio using Whisper API
 *
 * @param audioUri - URI to the audio file
 * @param options - Transcription options
 * @returns Transcription result
 */
export async function transcribeAudio(
  audioUri: string,
  options: TranscriptionOptions = {}
): Promise<TranscriptionResult> {
  const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error(
      'OpenAI API key not configured. Set EXPO_PUBLIC_OPENAI_API_KEY in your .env file.'
    );
  }

  // Create form data with the audio file
  const formData = new FormData();

  // Fetch the audio file and create a blob
  const response = await fetch(audioUri);
  const blob = await response.blob();

  // Append the audio file
  formData.append('file', blob, 'audio.m4a');
  formData.append('model', 'whisper-1');

  // Add language hint if provided (improves accuracy)
  const languageCode = getWhisperLanguageCode(options.language);
  if (languageCode) {
    formData.append('language', languageCode);
  }

  // Add response format
  formData.append('response_format', options.responseFormat || 'verbose_json');

  // Add prompt for context (helps with domain-specific vocabulary)
  if (options.prompt) {
    formData.append('prompt', options.prompt);
  }

  const apiResponse = await fetch(WHISPER_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body: formData,
  });

  if (!apiResponse.ok) {
    const error = await apiResponse.text();
    throw new Error(`Whisper API error: ${apiResponse.status} - ${error}`);
  }

  const data = await apiResponse.json();

  return {
    text: data.text,
    language: data.language,
    duration: data.duration,
    segments: data.segments,
  };
}

/**
 * Transcribe audio with language-learning optimized settings
 *
 * This function provides context to Whisper to improve accuracy
 * for language learning scenarios (mixed native/target language).
 */
export async function transcribeForLanguageLearning(
  audioUri: string,
  targetLanguage: SupportedLanguage,
  proficiencyLevel: string
): Promise<TranscriptionResult> {
  // Build a context prompt based on the learning scenario
  const contextPrompts: Record<SupportedLanguage, string> = {
    japanese:
      'This is a Japanese language learning conversation. The speaker may mix Japanese and English. Common phrases include greetings, self-introductions, and daily conversations.',
    korean:
      'This is a Korean language learning conversation. The speaker may mix Korean and English. Common phrases include greetings, honorifics, and daily conversations.',
    mandarin:
      'This is a Mandarin Chinese language learning conversation. The speaker may mix Chinese and English. Pay attention to tones and pinyin.',
  };

  return transcribeAudio(audioUri, {
    language: targetLanguage,
    prompt: contextPrompts[targetLanguage],
    responseFormat: 'verbose_json',
  });
}

/**
 * Check if Whisper API is configured and available
 */
export function isWhisperConfigured(): boolean {
  return Boolean(process.env.EXPO_PUBLIC_OPENAI_API_KEY);
}
