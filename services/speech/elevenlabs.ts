/**
 * ElevenLabs TTS Service
 *
 * High-quality text-to-speech using ElevenLabs API.
 * Supports multiple languages with natural-sounding voices.
 */

import { Audio } from 'expo-av';
import { TTSService, TTSOptions, TTSResult, TTSVoice } from './tts-types';

const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1';

// ElevenLabs voice IDs for different languages
// These are multilingual v2 voices that support Japanese, Korean, and Chinese
const VOICE_IDS: Record<string, string> = {
  // Multilingual voices
  rachel: '21m00Tcm4TlvDq8ikWAM',
  josh: 'TxGEqnHWrfWFTfGW9XjX',
  bella: 'EXAVITQu4vr4xnSDxMaL',
  adam: 'pNInz6obpgDQGcFmaJgB',
  // Asian language optimized (if available)
  yuki: 'Yuki', // Placeholder - use actual ID
  seoyeon: 'Seoyeon', // Placeholder - use actual ID
  lily: 'Lily', // Placeholder - use actual ID
};

// Language to voice mapping
const LANGUAGE_VOICES: Record<string, string> = {
  japanese: 'rachel', // Multilingual voice works well for Japanese
  korean: 'bella', // Multilingual voice works well for Korean
  mandarin: 'josh', // Multilingual voice works well for Mandarin
  english: 'rachel',
};

function getApiKey(): string | undefined {
  // Try multiple environment variable patterns
  return (
    process.env.EXPO_PUBLIC_ELEVENLABS_API_KEY ||
    process.env.ELEVENLABS_API_KEY
  );
}

export function isElevenLabsConfigured(): boolean {
  return !!getApiKey();
}

export async function getElevenLabsVoices(): Promise<TTSVoice[]> {
  const apiKey = getApiKey();
  if (!apiKey) return [];

  try {
    const response = await fetch(`${ELEVENLABS_API_URL}/voices`, {
      headers: {
        'xi-api-key': apiKey,
      },
    });

    if (!response.ok) {
      console.error('Failed to fetch ElevenLabs voices');
      return [];
    }

    const data = await response.json();
    return data.voices.map((voice: any) => ({
      id: voice.voice_id,
      name: voice.name,
      language: 'multilingual',
      provider: 'elevenlabs' as const,
    }));
  } catch (error) {
    console.error('Error fetching ElevenLabs voices:', error);
    return [];
  }
}

export async function speakWithElevenLabs(
  text: string,
  options: TTSOptions = {}
): Promise<TTSResult> {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('ElevenLabs API key not configured');
  }

  // Select voice based on language or use provided voice
  const language = options.language || 'english';
  const voiceKey = options.voice || LANGUAGE_VOICES[language] || 'rachel';
  const voiceId = VOICE_IDS[voiceKey] || voiceKey;

  try {
    // Generate speech
    const response = await fetch(
      `${ELEVENLABS_API_URL}/text-to-speech/${voiceId}/stream`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': apiKey,
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.5,
            use_speaker_boost: true,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`);
    }

    // Get audio data as blob
    const audioBlob = await response.blob();

    // Convert blob to base64 for expo-av
    const reader = new FileReader();
    const base64Promise = new Promise<string>((resolve, reject) => {
      reader.onloadend = () => {
        const base64 = reader.result as string;
        // Remove data URL prefix
        const base64Data = base64.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(audioBlob);
    });

    const base64Audio = await base64Promise;

    // Play audio using expo-av
    const { sound } = await Audio.Sound.createAsync(
      { uri: `data:audio/mpeg;base64,${base64Audio}` },
      { shouldPlay: true }
    );

    // Wait for playback to complete
    return new Promise((resolve) => {
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
          resolve({ success: true, duration: status.durationMillis });
        }
      });
    });
  } catch (error) {
    console.error('ElevenLabs TTS error:', error);
    throw error;
  }
}

// Sound instance for stopping playback
let currentSound: Audio.Sound | null = null;

export async function stopElevenLabs(): Promise<void> {
  if (currentSound) {
    try {
      await currentSound.stopAsync();
      await currentSound.unloadAsync();
      currentSound = null;
    } catch (error) {
      console.error('Error stopping ElevenLabs playback:', error);
    }
  }
}

export const elevenLabsService: TTSService = {
  isConfigured: isElevenLabsConfigured,
  speak: speakWithElevenLabs,
  stop: stopElevenLabs,
  isSpeaking: async () => {
    if (!currentSound) return false;
    const status = await currentSound.getStatusAsync();
    return status.isLoaded && status.isPlaying;
  },
  getVoices: getElevenLabsVoices,
};
