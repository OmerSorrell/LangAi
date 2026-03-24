/**
 * Language Teacher App
 *
 * A voice-first language learning app for Japanese, Korean, and Mandarin.
 * Features AI-powered conversation practice with cultural context.
 */

import React, { useEffect, useState, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useStore } from './store/useStore';
import { ChatScreen } from './components/ChatScreen';
import { LanguageSelector } from './components/LanguageSelector';
import { AuthScreen } from './components/AuthScreen';
import { onAuthStateChange, getSession } from './services/supabase';
import { colors, fonts, fontSize, spacing, radius } from './theme';

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

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [hasCompletedOnboarding, showAuth, activeLanguage]);

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
      <Animated.View
        style={[
          styles.onboardingContainer,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        {/* Decorative seal mark */}
        <View style={styles.sealContainer}>
          <View style={styles.seal}>
            <Text style={styles.sealText}>語</Text>
          </View>
        </View>

        <Text style={styles.onboardingTitle}>Welcome</Text>
        <Text style={styles.onboardingSubtitle}>ようこそ · 환영합니다 · 欢迎</Text>
        <Text style={styles.onboardingText}>
          Your personal language teacher for Japanese, Korean, and Mandarin.
          Create an account to sync progress across devices.
        </Text>

        <TouchableOpacity
          style={styles.onboardingButton}
          onPress={() => setShowAuth(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.onboardingButtonText}>Create Account</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.onboardingSkip}
          onPress={() => completeOnboarding()}
          activeOpacity={0.6}
        >
          <Text style={styles.onboardingSkipText}>Continue without account</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  // If no language selected, show language selector
  if (!activeLanguage) {
    return <LanguageSelector />;
  }

  // Show chat screen with the active language
  return (
    <View style={styles.container}>
      <ChatScreen />
    </View>
  );
}

export default function App() {
  return (
    <>
      <StatusBar style="dark" />
      <AppContent />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  onboardingContainer: {
    flex: 1,
    backgroundColor: colors.bg,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing['2xl'],
  },
  sealContainer: {
    marginBottom: spacing['2xl'],
  },
  seal: {
    width: 88,
    height: 88,
    borderRadius: 12,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ rotate: '-6deg' }],
  },
  sealText: {
    fontSize: 44,
    color: colors.white,
    fontWeight: '300',
  },
  onboardingTitle: {
    fontSize: fontSize['3xl'],
    fontFamily: fonts.display,
    fontWeight: '700',
    color: colors.ink,
    marginBottom: spacing.sm,
  },
  onboardingSubtitle: {
    fontSize: fontSize.base,
    color: colors.inkMuted,
    marginBottom: spacing.xl,
    letterSpacing: 2,
  },
  onboardingText: {
    fontSize: fontSize.base,
    color: colors.inkLight,
    textAlign: 'center',
    marginBottom: spacing['2xl'],
    lineHeight: 24,
    maxWidth: 320,
  },
  onboardingButton: {
    backgroundColor: colors.ink,
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.lg,
    borderRadius: radius.lg,
    marginBottom: spacing.lg,
    minWidth: 240,
    alignItems: 'center',
  },
  onboardingButtonText: {
    color: colors.bg,
    fontSize: fontSize.md,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  onboardingSkip: {
    padding: spacing.md,
  },
  onboardingSkipText: {
    color: colors.inkFaint,
    fontSize: fontSize.sm,
    letterSpacing: 0.3,
  },
});
