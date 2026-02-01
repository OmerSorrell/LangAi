/**
 * Supabase Services
 *
 * Backend services for authentication and data sync.
 */

// Client
export { supabase, isSupabaseConfigured } from './client';

// Authentication
export {
  signUp,
  signIn,
  signOut,
  getSession,
  getCurrentUser,
  resetPassword,
  onAuthStateChange,
  type AuthResult,
} from './auth';

// Data Sync
export {
  fetchProfile,
  updateProfile,
  fetchPreferences,
  updatePreferences,
  fetchProgress,
  updateProgress,
  incrementConversationTime,
  updateStreak,
  syncToCloud,
  loadFromCloud,
} from './sync';

// Types
export type {
  Database,
  Profile,
  UserPreferences,
  LearningProgress,
  ConversationHistory,
  SupportedLanguage,
  ProficiencyLevel,
} from './types';
