/**
 * Language Teacher App
 *
 * A voice-first language learning app for Japanese, Korean, and Mandarin.
 * Features AI-powered conversation practice with cultural context.
 */

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useStore } from './store/useStore';
import { ChatScreen } from './components/ChatScreen';
import { LanguageSelector } from './components/LanguageSelector';

function AppContent() {
  const { activeLanguage, setActiveLanguage } = useStore();

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
});
