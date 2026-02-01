/**
 * Supabase Database Types
 *
 * TypeScript types for the database schema.
 * These should match your Supabase table definitions.
 */

export type SupportedLanguage = 'japanese' | 'korean' | 'mandarin';
export type ProficiencyLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          display_name: string | null;
          native_language: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          display_name?: string | null;
          native_language?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          display_name?: string | null;
          native_language?: string;
          updated_at?: string;
        };
      };
      user_preferences: {
        Row: {
          id: string;
          user_id: string;
          target_languages: SupportedLanguage[];
          proficiency_levels: Record<SupportedLanguage, ProficiencyLevel>;
          voice_enabled: boolean;
          auto_play_responses: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          target_languages?: SupportedLanguage[];
          proficiency_levels?: Record<SupportedLanguage, ProficiencyLevel>;
          voice_enabled?: boolean;
          auto_play_responses?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          target_languages?: SupportedLanguage[];
          proficiency_levels?: Record<SupportedLanguage, ProficiencyLevel>;
          voice_enabled?: boolean;
          auto_play_responses?: boolean;
          updated_at?: string;
        };
      };
      learning_progress: {
        Row: {
          id: string;
          user_id: string;
          language: SupportedLanguage;
          vocabulary_mastered: string[];
          grammar_points_covered: string[];
          conversation_minutes: number;
          exercises_completed: number;
          current_streak: number;
          last_practice_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          language: SupportedLanguage;
          vocabulary_mastered?: string[];
          grammar_points_covered?: string[];
          conversation_minutes?: number;
          exercises_completed?: number;
          current_streak?: number;
          last_practice_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          vocabulary_mastered?: string[];
          grammar_points_covered?: string[];
          conversation_minutes?: number;
          exercises_completed?: number;
          current_streak?: number;
          last_practice_date?: string | null;
          updated_at?: string;
        };
      };
      conversation_history: {
        Row: {
          id: string;
          user_id: string;
          language: SupportedLanguage;
          messages: ConversationMessageRecord[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          language: SupportedLanguage;
          messages?: ConversationMessageRecord[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          messages?: ConversationMessageRecord[];
          updated_at?: string;
        };
      };
    };
  };
}

export interface ConversationMessageRecord {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  corrections?: CorrectionRecord[];
  cultural_note?: string;
}

export interface CorrectionRecord {
  original: string;
  corrected: string;
  explanation: string;
}

// Helper types for easier access
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type UserPreferences = Database['public']['Tables']['user_preferences']['Row'];
export type LearningProgress = Database['public']['Tables']['learning_progress']['Row'];
export type ConversationHistory = Database['public']['Tables']['conversation_history']['Row'];
