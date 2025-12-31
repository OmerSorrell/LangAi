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

// Audio Recording
export { audioRecorder, AudioRecorder, type RecordingResult } from './recorder';
