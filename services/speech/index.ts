/**
 * Speech Services
 *
 * Unified interface for speech-to-text and text-to-speech functionality.
 */

// Speech-to-Text (Whisper)
export {
  transcribeAudio,
  transcribeForLanguageLearning,
  isWhisperConfigured,
  type TranscriptionOptions,
  type TranscriptionResult,
} from './whisper';

// Text-to-Speech
export {
  speak,
  speakForLanguageLearning,
  stopSpeaking,
  isSpeaking,
  isTTSConfigured,
  getAvailableProviders,
  getVoices,
  type TTSProvider,
  type TTSOptions,
  type TTSResult,
  type TTSVoice,
} from './tts';

// Audio Recording
export { audioRecorder, AudioRecorder, type RecordingResult } from './recorder';
