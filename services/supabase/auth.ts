/**
 * Supabase Authentication Service
 *
 * Handles user authentication: sign up, login, logout, and session management.
 */

import { AuthError, Session, User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from './client';

export interface AuthResult {
  success: boolean;
  user?: User;
  session?: Session;
  error?: string;
}

/**
 * Sign up a new user with email and password
 */
export async function signUp(
  email: string,
  password: string,
  displayName?: string
): Promise<AuthResult> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: 'Supabase not configured' };
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
        },
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    // Create profile record
    if (data.user) {
      await supabase.from('profiles').insert({
        id: data.user.id,
        email: data.user.email!,
        display_name: displayName || null,
        native_language: 'English',
      });

      // Create default preferences
      await supabase.from('user_preferences').insert({
        user_id: data.user.id,
        target_languages: [],
        proficiency_levels: {
          japanese: 'A1',
          korean: 'A1',
          mandarin: 'A1',
        },
        voice_enabled: true,
        auto_play_responses: true,
      });

      // Create initial progress records for each language
      const languages = ['japanese', 'korean', 'mandarin'] as const;
      for (const language of languages) {
        await supabase.from('learning_progress').insert({
          user_id: data.user.id,
          language,
          vocabulary_mastered: [],
          grammar_points_covered: [],
          conversation_minutes: 0,
          exercises_completed: 0,
          current_streak: 0,
          last_practice_date: null,
        });
      }
    }

    return {
      success: true,
      user: data.user || undefined,
      session: data.session || undefined,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Sign up failed',
    };
  }
}

/**
 * Sign in with email and password
 */
export async function signIn(
  email: string,
  password: string
): Promise<AuthResult> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: 'Supabase not configured' };
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return {
      success: true,
      user: data.user,
      session: data.session,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Sign in failed',
    };
  }
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<AuthResult> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: 'Supabase not configured' };
  }

  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Sign out failed',
    };
  }
}

/**
 * Get the current session
 */
export async function getSession(): Promise<Session | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const { data } = await supabase.auth.getSession();
  return data.session;
}

/**
 * Get the current user
 */
export async function getCurrentUser(): Promise<User | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const { data } = await supabase.auth.getUser();
  return data.user;
}

/**
 * Send password reset email
 */
export async function resetPassword(email: string): Promise<AuthResult> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: 'Supabase not configured' };
  }

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Password reset failed',
    };
  }
}

/**
 * Subscribe to auth state changes
 */
export function onAuthStateChange(
  callback: (event: string, session: Session | null) => void
) {
  if (!isSupabaseConfigured()) {
    return { data: { subscription: { unsubscribe: () => {} } } };
  }

  return supabase.auth.onAuthStateChange(callback);
}
