// Jest setup file

// Mock expo env
jest.mock('expo/virtual/env', () => ({
  env: process.env,
}));

// Mock expo-av
jest.mock('expo-av', () => ({
  Audio: {
    Recording: {
      createAsync: jest.fn().mockResolvedValue({
        recording: {
          stopAndUnloadAsync: jest.fn().mockResolvedValue(undefined),
          getURI: jest.fn().mockReturnValue('file://test-audio.m4a'),
          getStatusAsync: jest.fn().mockResolvedValue({ durationMillis: 5000 }),
        },
      }),
    },
    requestPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
    getPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
    setAudioModeAsync: jest.fn().mockResolvedValue(undefined),
    AndroidOutputFormat: { MPEG_4: 2 },
    AndroidAudioEncoder: { AAC: 3 },
    IOSOutputFormat: { MPEG4AAC: 'aac' },
    IOSAudioQuality: { HIGH: 127 },
  },
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock react-native
jest.mock('react-native', () => ({
  Platform: { OS: 'ios' },
  StyleSheet: { create: (styles) => styles },
  View: 'View',
  Text: 'Text',
  TouchableOpacity: 'TouchableOpacity',
  TextInput: 'TextInput',
  FlatList: 'FlatList',
  ActivityIndicator: 'ActivityIndicator',
  SafeAreaView: 'SafeAreaView',
  Animated: {
    View: 'Animated.View',
    Value: jest.fn(() => ({
      setValue: jest.fn(),
      stopAnimation: jest.fn(),
    })),
    timing: jest.fn(() => ({ start: jest.fn() })),
    loop: jest.fn(() => ({ start: jest.fn() })),
    sequence: jest.fn(() => ({ start: jest.fn() })),
  },
  Alert: {
    alert: jest.fn(),
  },
}));

// Mock fetch for API calls
global.fetch = jest.fn();

// Mock FormData
global.FormData = class FormData {
  constructor() {
    this.data = {};
  }
  append(key, value) {
    this.data[key] = value;
  }
};

// Mock Blob
global.Blob = class Blob {
  constructor(parts, options) {
    this.parts = parts;
    this.options = options;
  }
};

// Reset mocks between tests
beforeEach(() => {
  jest.clearAllMocks();
  if (global.fetch) {
    global.fetch.mockReset();
  }
});
