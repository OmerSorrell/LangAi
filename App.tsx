/**
 * Language Teacher App
 *
 * A voice-first language learning app for Japanese, Korean, and Mandarin.
 * Features AI-powered conversation practice with cultural context.
 */

import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useStore } from './store/useStore';
import { ChatScreen } from './components/ChatScreen';
import { LanguageSelector } from './components/LanguageSelector';
import { AuthScreen } from './components/AuthScreen';
import { onAuthStateChange, getSession } from './services/supabase';

function AppContent() {
  const {
    activeLanguage,
    setActiveLanguage,
    isAuthenticated,
    setAuth,
    loadFromCloud,
    hasCompletedOnboarding,
    completeOnboarding,
  } = useStore();

  const [showAuth, setShowAuth] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const initAuth = async () => {
      const session = await getSession();
      if (session?.user) {
        setAuth(session.user.id);
        await loadFromCloud();
      }
      setIsInitializing(false);
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setAuth(session.user.id);
        await loadFromCloud();
      } else if (event === 'SIGNED_OUT') {
        setAuth(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Show auth screen for new users who haven't completed onboarding
  if (!isInitializing && !hasCompletedOnboarding && showAuth) {
    return (
      <AuthScreen
        onAuthSuccess={() => {
          completeOnboarding();
          setShowAuth(false);
        }}
        onSkip={() => {
          completeOnboarding();
          setShowAuth(false);
        }}
      />
    );
  }

  // Show onboarding prompt for new users
  if (!isInitializing && !hasCompletedOnboarding && !showAuth) {
    return (
      <View style={styles.onboardingContainer}>
        <Text style={styles.onboardingTitle}>Welcome!</Text>
        <Text style={styles.onboardingText}>
          Would you like to create an account to sync your progress across devices?
        </Text>
        <TouchableOpacity
          style={styles.onboardingButton}
          onPress={() => setShowAuth(true)}
        >
          <Text style={styles.onboardingButtonText}>Create Account</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.onboardingSkip}
          onPress={() => completeOnboarding()}
        >
          <Text style={styles.onboardingSkipText}>Skip for now</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // If no language selected, show language selector
  if (!activeLanguage) {
    return <LanguageSelector />;
  }

  // Show chat screen with the active language
  return (
    <View style={styles.container}>
      {/* Back button to language selector */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => setActiveLanguage(null as any)}
      >
        <Text style={styles.backButtonText}>← Change Language</Text>
      </TouchableOpacity>

      <ChatScreen />
    </View>
  );
}

export default function App() {
  return (
    <>
      <StatusBar style="auto" />
      <AppContent />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F3F4F6',
  },
  backButtonText: {
    color: '#007AFF',
    fontSize: 16,
  },
  onboardingContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  onboardingTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  onboardingText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  onboardingButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  onboardingButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  onboardingSkip: {
    padding: 12,
  },
  onboardingSkipText: {
    color: '#9CA3AF',
    fontSize: 14,
  },
});
