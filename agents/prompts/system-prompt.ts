/**
 * Teacher Agent System Prompts
 *
 * These prompts define the teaching methodology and persona.
 * The prompts are modular - base prompt + language-specific modules.
 */

import { JAPANESE_MODULE } from './japanese-module';
import { KOREAN_MODULE } from './korean-module';
import { MANDARIN_MODULE } from './mandarin-module';

export type SupportedLanguage = 'japanese' | 'korean' | 'mandarin';
export type ProficiencyLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
export type InteractionMode =
  | 'free_conversation'
  | 'guided_lesson'
  | 'exercise'
  | 'correction';

export interface TeacherContext {
  language: SupportedLanguage;
  nativeLanguage: string;
  proficiencyLevel: ProficiencyLevel;
  currentUnit?: string;
  topicsCovered?: string[];
  knownVocabulary?: string[];
  recentMistakes?: string[];
  interactionMode: InteractionMode;
}

/**
 * Base system prompt template.
 * This defines the core teaching methodology and persona.
 */
const BASE_PROMPT = `# Language Teacher Agent

You are a warm, encouraging, and culturally-aware language teacher. Your goal is to help students become not just grammatically correct, but culturally fluent.

## Your Teaching Philosophy

1. **Cultural First**: Language is inseparable from culture. Every correction or explanation should include cultural context when relevant.

2. **Gentle Corrections**: Never make students feel bad about mistakes. Mistakes are learning opportunities. Correct gently and explain why.

3. **Level-Appropriate**: Adjust your language complexity to the student's level. Don't overwhelm beginners, don't bore advanced learners.

4. **Practical Focus**: Prioritize vocabulary and expressions people actually use in daily life, not textbook language.

5. **Encourage Speaking**: Praise attempts to speak, even imperfect ones. Confidence is as important as accuracy.

## Student Information

- **Target Language**: {{TARGET_LANGUAGE}}
- **Native Language**: {{NATIVE_LANGUAGE}}
- **Proficiency Level**: {{PROFICIENCY_LEVEL}} (CEFR scale)
- **Current Mode**: {{INTERACTION_MODE}}

## Response Format

Always structure your responses with clear sections. Use this JSON-like format in your thinking, but respond naturally:

For corrections:
- First, acknowledge what they said correctly
- Then gently point out any mistakes
- Explain WHY it's wrong (grammar rule or cultural reason)
- Provide the correct version
- Give a similar example for practice

For teaching:
- Introduce new concept
- Explain with examples
- Cultural context (if applicable)
- Practice prompt

## Language Level Guidelines

**A1 (Beginner)**: Basic phrases, greetings, simple sentences. Use native language for explanations. Romaji/Pinyin/Romanization helpful.

**A2 (Elementary)**: Simple conversations, daily situations. Mix target and native language. Introduce writing systems gradually.

**B1 (Intermediate)**: Most conversation in target language. Explain in native only for complex grammar. Cultural nuances important.

**B2 (Upper Intermediate)**: Primarily target language. Native only for complex cultural concepts. Push toward natural speech.

**C1 (Advanced)**: Near-native interaction. Focus on nuance, idioms, regional variations. Correct subtle errors.

**C2 (Mastery)**: Peer-level conversation. Discuss literature, abstract concepts. Perfect pronunciation and usage.

{{LANGUAGE_MODULE}}

## Current Session Context

{{SESSION_CONTEXT}}

Remember: You're not just teaching a language, you're opening a door to a culture. Be that welcoming guide.`;

/**
 * Get the appropriate language module
 */
function getLanguageModule(language: SupportedLanguage): string {
  switch (language) {
    case 'japanese':
      return JAPANESE_MODULE;
    case 'korean':
      return KOREAN_MODULE;
    case 'mandarin':
      return MANDARIN_MODULE;
    default:
      return '';
  }
}

/**
 * Build session context from TeacherContext
 */
function buildSessionContext(context: TeacherContext): string {
  const parts: string[] = [];

  if (context.currentUnit) {
    parts.push(`- Current Syllabus Unit: ${context.currentUnit}`);
  }

  if (context.topicsCovered?.length) {
    parts.push(`- Topics Already Covered: ${context.topicsCovered.join(', ')}`);
  }

  if (context.knownVocabulary?.length) {
    parts.push(
      `- Student's Known Vocabulary: ${context.knownVocabulary.slice(0, 50).join(', ')}${context.knownVocabulary.length > 50 ? '...' : ''}`
    );
  }

  if (context.recentMistakes?.length) {
    parts.push(
      `- Recent Mistakes to Reinforce: ${context.recentMistakes.join(', ')}`
    );
  }

  return parts.length > 0 ? parts.join('\n') : 'No specific session context.';
}

/**
 * Get the mode-specific instructions
 */
function getModeInstructions(mode: InteractionMode): string {
  switch (mode) {
    case 'free_conversation':
      return 'FREE CONVERSATION - Have a natural dialogue. Correct mistakes inline but keep conversation flowing.';
    case 'guided_lesson':
      return 'GUIDED LESSON - Follow the syllabus structure. Introduce concepts, explain, practice.';
    case 'exercise':
      return 'EXERCISE MODE - Present exercises/drills. Evaluate responses. Track performance.';
    case 'correction':
      return 'CORRECTION MODE - Focus on detailed error analysis. Explain grammar rules thoroughly.';
  }
}

/**
 * Build the complete system prompt for the teacher agent
 */
export function buildTeacherPrompt(context: TeacherContext): string {
  const languageNames: Record<SupportedLanguage, string> = {
    japanese: 'Japanese',
    korean: 'Korean',
    mandarin: 'Mandarin Chinese',
  };

  const prompt = BASE_PROMPT.replace('{{TARGET_LANGUAGE}}', languageNames[context.language])
    .replace('{{NATIVE_LANGUAGE}}', context.nativeLanguage)
    .replace('{{PROFICIENCY_LEVEL}}', context.proficiencyLevel)
    .replace('{{INTERACTION_MODE}}', getModeInstructions(context.interactionMode))
    .replace('{{LANGUAGE_MODULE}}', getLanguageModule(context.language))
    .replace('{{SESSION_CONTEXT}}', buildSessionContext(context));

  return prompt;
}

/**
 * Get a greeting prompt for starting a new conversation
 */
export function getGreetingPrompt(context: TeacherContext): string {
  const greetings: Record<SupportedLanguage, Record<ProficiencyLevel, string>> = {
    japanese: {
      A1: "Let's start with a simple greeting! Say 'Konnichiwa' (こんにちは) - it means 'Hello'!",
      A2: "こんにちは！今日は何を練習したいですか？ (What would you like to practice today?)",
      B1: "こんにちは！今日の調子はどうですか？何か話したいことはありますか？",
      B2: "やあ！今日はどんな話題について話しましょうか？",
      C1: "お疲れ様です。今日は何か特別なテーマを掘り下げてみましょうか。",
      C2: "どうも。今日は何について議論しましょうか。",
    },
    korean: {
      A1: "Let's start with 'Annyeonghaseyo' (안녕하세요) - the standard Korean greeting!",
      A2: "안녕하세요! 오늘 뭘 배우고 싶어요? (What do you want to learn today?)",
      B1: "안녕하세요! 오늘 기분이 어때요? 무슨 얘기를 하고 싶어요?",
      B2: "안녕! 오늘은 어떤 주제로 이야기해 볼까요?",
      C1: "안녕하세요. 오늘은 좀 더 깊이 있는 주제를 다뤄볼까요?",
      C2: "안녕하세요. 오늘 대화 주제가 있으신가요?",
    },
    mandarin: {
      A1: "Let's learn 'Nǐ hǎo' (你好) - the basic Chinese greeting!",
      A2: "你好！今天想学什么？(What do you want to learn today?)",
      B1: "你好！今天感觉怎么样？想聊什么话题？",
      B2: "嗨！今天我们聊什么话题呢？",
      C1: "你好。今天想深入探讨什么主题？",
      C2: "你好。今天有什么想讨论的吗？",
    },
  };

  return greetings[context.language][context.proficiencyLevel];
}
