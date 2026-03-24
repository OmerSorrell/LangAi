/**
 * Design System — Ink & Paper
 *
 * East Asian calligraphy-inspired aesthetic:
 * warm rice-paper backgrounds, sumi-ink text,
 * vermillion accents, bamboo greens, gold highlights.
 */

import { Platform } from 'react-native';

// ─── Color Palette ───────────────────────────────────────────────
export const colors = {
  // Backgrounds — warm rice-paper tones
  bg: '#FAF7F2',
  bgCard: '#FFFFFF',
  bgElevated: '#FFF9F0',
  bgMuted: '#F3EDE4',
  bgInput: '#F5F0E8',

  // Primary — vermillion red (temple gates, seals, stamps)
  primary: '#C53D43',
  primaryLight: '#F2DEDE',
  primaryMuted: 'rgba(197, 61, 67, 0.08)',

  // Secondary — sumi ink indigo
  ink: '#2A2522',
  inkLight: '#4A4340',
  inkMuted: '#8C7B75',
  inkFaint: '#B8ADA6',

  // Accent — gold leaf
  gold: '#B8860B',
  goldLight: '#FEF3C7',
  goldMuted: 'rgba(184, 134, 11, 0.1)',

  // Semantic
  success: '#5B8C5A',       // bamboo green
  successLight: '#E8F3E8',
  error: '#C53D43',
  errorLight: '#FDE8E8',
  warning: '#D97706',
  warningLight: '#FEF3C7',

  // Purple — grammar / cultural
  purple: '#6B4C9A',
  purpleLight: '#EDE9FE',
  purpleMuted: 'rgba(107, 76, 154, 0.08)',

  // Borders
  border: '#E8DDD3',
  borderLight: '#F0E8DC',

  // Overlays
  overlay: 'rgba(42, 37, 34, 0.4)',

  // Chat bubbles
  userBubble: '#2A2522',
  userBubbleText: '#FAF7F2',
  assistantBubble: '#F5F0E8',
  assistantBubbleText: '#2A2522',

  // White
  white: '#FFFFFF',
} as const;

// ─── Typography ──────────────────────────────────────────────────
export const fonts = {
  // Display / headings — serif for elegance
  display: Platform.select({
    ios: 'Georgia',
    android: 'serif',
    default: 'Georgia',
  }) as string,

  // Body — system sans for readability (undefined = system default on iOS)
  body: Platform.select({
    ios: undefined,
    android: 'sans-serif',
    default: undefined,
  }) as string | undefined,

  // Monospace — for formations, code
  mono: Platform.select({
    ios: 'Menlo',
    android: 'monospace',
    default: 'monospace',
  }) as string,
};

export const fontSize = {
  xs: 11,
  sm: 13,
  base: 15,
  md: 16,
  lg: 18,
  xl: 22,
  '2xl': 28,
  '3xl': 34,
  hero: 42,
} as const;

export const lineHeight = {
  tight: 1.2,
  normal: 1.5,
  relaxed: 1.7,
} as const;

// ─── Spacing ─────────────────────────────────────────────────────
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
} as const;

// ─── Radius ──────────────────────────────────────────────────────
export const radius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  full: 999,
} as const;

// ─── Shadows ─────────────────────────────────────────────────────
export const shadows = {
  sm: {
    shadowColor: '#2A2522',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  md: {
    shadowColor: '#2A2522',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: '#2A2522',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
} as const;

// ─── Language-specific accent colors ─────────────────────────────
export const languageColors = {
  japanese: { accent: '#C53D43', bg: '#FDE8E8' },   // vermillion
  korean: { accent: '#2D5F8A', bg: '#E3EDF5' },     // dancheong blue
  mandarin: { accent: '#C53D43', bg: '#FDE8E8' },   // cinnabar red
} as const;
