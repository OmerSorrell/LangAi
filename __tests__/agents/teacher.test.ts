/**
 * Teacher Agent Tests
 *
 * Tests for system prompts and greeting generation.
 */

import {
  buildTeacherPrompt,
  getGreetingPrompt,
  TeacherContext,
} from '../../agents/prompts/system-prompt';

describe('buildTeacherPrompt', () => {
  it('builds prompt with correct language', () => {
    const context: TeacherContext = {
      language: 'japanese',
      nativeLanguage: 'English',
      proficiencyLevel: 'B1',
      interactionMode: 'free_conversation',
    };

    const prompt = buildTeacherPrompt(context);

    expect(prompt).toContain('Japanese');
    expect(prompt).toContain('English');
    expect(prompt).toContain('B1');
  });

  it('includes Japanese language module content', () => {
    const context: TeacherContext = {
      language: 'japanese',
      nativeLanguage: 'English',
      proficiencyLevel: 'A1',
      interactionMode: 'free_conversation',
    };

    const prompt = buildTeacherPrompt(context);

    // Should include Japanese-specific content
    expect(prompt).toContain('Hiragana');
    expect(prompt).toContain('Keigo');
    expect(prompt).toContain('JLPT');
  });

  it('includes Korean language module content', () => {
    const context: TeacherContext = {
      language: 'korean',
      nativeLanguage: 'English',
      proficiencyLevel: 'A2',
      interactionMode: 'free_conversation',
    };

    const prompt = buildTeacherPrompt(context);

    expect(prompt).toContain('Hangul');
    expect(prompt).toContain('TOPIK');
  });

  it('includes Mandarin language module content', () => {
    const context: TeacherContext = {
      language: 'mandarin',
      nativeLanguage: 'English',
      proficiencyLevel: 'B2',
      interactionMode: 'free_conversation',
    };

    const prompt = buildTeacherPrompt(context);

    expect(prompt).toContain('Hanzi');
    expect(prompt).toContain('HSK');
    expect(prompt).toContain('Pinyin');
  });

  it('includes session context when provided', () => {
    const context: TeacherContext = {
      language: 'korean',
      nativeLanguage: 'English',
      proficiencyLevel: 'A2',
      interactionMode: 'guided_lesson',
      currentUnit: 'Basic Greetings',
      topicsCovered: ['Hangul', 'Numbers'],
    };

    const prompt = buildTeacherPrompt(context);

    expect(prompt).toContain('Basic Greetings');
    expect(prompt).toContain('Hangul');
  });

  it('includes interaction mode instructions', () => {
    const context: TeacherContext = {
      language: 'japanese',
      nativeLanguage: 'English',
      proficiencyLevel: 'A1',
      interactionMode: 'exercise',
    };

    const prompt = buildTeacherPrompt(context);

    expect(prompt).toContain('EXERCISE');
  });
});

describe('getGreetingPrompt', () => {
  it('returns Japanese A1 greeting with English explanation', () => {
    const context: TeacherContext = {
      language: 'japanese',
      nativeLanguage: 'English',
      proficiencyLevel: 'A1',
      interactionMode: 'free_conversation',
    };

    const greeting = getGreetingPrompt(context);

    expect(greeting).toContain('Konnichiwa');
    // A1 should have English explanation
    expect(greeting).toMatch(/[a-zA-Z]/);
  });

  it('returns Korean A1 greeting', () => {
    const context: TeacherContext = {
      language: 'korean',
      nativeLanguage: 'English',
      proficiencyLevel: 'A1',
      interactionMode: 'free_conversation',
    };

    const greeting = getGreetingPrompt(context);

    expect(greeting).toContain('Annyeonghaseyo');
  });

  it('returns Mandarin A1 greeting', () => {
    const context: TeacherContext = {
      language: 'mandarin',
      nativeLanguage: 'English',
      proficiencyLevel: 'A1',
      interactionMode: 'free_conversation',
    };

    const greeting = getGreetingPrompt(context);

    expect(greeting).toContain('Nǐ hǎo');
  });

  it('returns greetings for all levels', () => {
    const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;
    const languages = ['japanese', 'korean', 'mandarin'] as const;

    languages.forEach((language) => {
      levels.forEach((level) => {
        const context: TeacherContext = {
          language,
          nativeLanguage: 'English',
          proficiencyLevel: level,
          interactionMode: 'free_conversation',
        };

        const greeting = getGreetingPrompt(context);

        expect(greeting).toBeTruthy();
        expect(greeting.length).toBeGreaterThan(0);
      });
    });
  });

  it('C2 Japanese greeting is primarily in Japanese', () => {
    const context: TeacherContext = {
      language: 'japanese',
      nativeLanguage: 'English',
      proficiencyLevel: 'C2',
      interactionMode: 'free_conversation',
    };

    const greeting = getGreetingPrompt(context);

    // C2 greetings should contain Japanese characters
    expect(greeting).toMatch(/[\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf]/);
  });

  it('C2 Korean greeting is primarily in Korean', () => {
    const context: TeacherContext = {
      language: 'korean',
      nativeLanguage: 'English',
      proficiencyLevel: 'C2',
      interactionMode: 'free_conversation',
    };

    const greeting = getGreetingPrompt(context);

    // C2 greetings should contain Korean characters
    expect(greeting).toMatch(/[\uac00-\ud7af]/);
  });

  it('C2 Mandarin greeting is primarily in Chinese', () => {
    const context: TeacherContext = {
      language: 'mandarin',
      nativeLanguage: 'English',
      proficiencyLevel: 'C2',
      interactionMode: 'free_conversation',
    };

    const greeting = getGreetingPrompt(context);

    // C2 greetings should contain Chinese characters
    expect(greeting).toMatch(/[\u4e00-\u9fff]/);
  });
});
