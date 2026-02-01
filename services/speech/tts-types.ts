/**
 * TTS (Text-to-Speech) Type Definitions
 */

export type TTSProvider = 'elevenlabs' | 'expo-speech';

export interface TTSVoice {
  id: string;
  name: string;
  language: string;
  provider: TTSProvider;
}

export interface TTSOptions {
  /** Voice ID or name */
  voice?: string;
  /** Speaking rate (0.5 - 2.0, default 1.0) */
  rate?: number;
  /** Pitch adjustment (0.5 - 2.0, default 1.0) */
  pitch?: number;
  /** Target language for voice selection */
  language?: 'japanese' | 'korean' | 'mandarin' | 'english';
}

export interface TTSResult {
  /** Duration in milliseconds */
  duration?: number;
  /** Whether playback completed successfully */
  success: boolean;
}

export interface TTSService {
  /** Check if the service is configured */
  isConfigured(): boolean;
  /** Speak text aloud */
  speak(text: string, options?: TTSOptions): Promise<TTSResult>;
  /** Stop any current speech */
  stop(): Promise<void>;
  /** Check if currently speaking */
  isSpeaking(): Promise<boolean>;
  /** Get available voices for a language */
  getVoices(language?: string): Promise<TTSVoice[]>;
}

// Default voices for each language (ElevenLabs)
export const DEFAULT_VOICES: Record<string, { elevenlabs: string; name: string }> = {
  japanese: { elevenlabs: 'Yuki', name: 'Yuki (Japanese)' },
  korean: { elevenlabs: 'Seoyeon', name: 'Seoyeon (Korean)' },
  mandarin: { elevenlabs: 'Lily', name: 'Lily (Mandarin)' },
  english: { elevenlabs: 'Rachel', name: 'Rachel (English)' },
};
