/**
 * Teacher Agent
 *
 * The main language teaching agent that orchestrates:
 * - LLM interactions with appropriate routing
 * - System prompt management
 * - Conversation state
 * - Correction tracking
 */

import { getLLMRouter, Message, TaskType, StreamChunk } from '../services/llm';
import {
  buildTeacherPrompt,
  getGreetingPrompt,
  TeacherContext,
  SupportedLanguage,
  ProficiencyLevel,
  InteractionMode,
} from './prompts/system-prompt';

export interface TeacherConfig {
  language: SupportedLanguage;
  nativeLanguage?: string;
  proficiencyLevel?: ProficiencyLevel;
}

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  corrections?: Correction[];
  culturalNote?: string;
}

export interface Correction {
  original: string;
  corrected: string;
  explanation: string;
  grammarPoint?: string;
}

export interface TeacherResponse {
  content: string;
  corrections?: Correction[];
  culturalNote?: string;
  vocabularyHighlighted?: string[];
  grammarPoint?: string;
}

export class TeacherAgent {
  private context: TeacherContext;
  private conversationHistory: ConversationMessage[] = [];
  private router = getLLMRouter();

  constructor(config: TeacherConfig) {
    this.context = {
      language: config.language,
      nativeLanguage: config.nativeLanguage || 'English',
      proficiencyLevel: config.proficiencyLevel || 'A1',
      interactionMode: 'free_conversation',
      knownVocabulary: [],
      recentMistakes: [],
      topicsCovered: [],
    };
  }

  /**
   * Get a greeting for starting a new conversation
   */
  getGreeting(): string {
    return getGreetingPrompt(this.context);
  }

  /**
   * Send a message and get a response
   */
  async sendMessage(userMessage: string): Promise<TeacherResponse> {
    // Add user message to history
    this.conversationHistory.push({
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
    });

    // Build messages array for LLM
    const messages: Message[] = [
      { role: 'system', content: buildTeacherPrompt(this.context) },
      ...this.conversationHistory.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
    ];

    // Determine task type based on context
    const taskType = this.determineTaskType(userMessage);

    // Get response from LLM
    const response = await this.router.chat(messages, {
      taskType,
      temperature: 0.7,
    });

    // Parse the response for structured data
    const parsed = this.parseResponse(response.content);

    // Add assistant response to history
    this.conversationHistory.push({
      role: 'assistant',
      content: response.content,
      timestamp: new Date(),
      corrections: parsed.corrections,
      culturalNote: parsed.culturalNote,
    });

    // Update context based on response
    this.updateContext(parsed);

    return parsed;
  }

  /**
   * Stream a response for real-time display
   */
  async *streamMessage(userMessage: string): AsyncGenerator<string> {
    // Add user message to history
    this.conversationHistory.push({
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
    });

    // Build messages array for LLM
    const messages: Message[] = [
      { role: 'system', content: buildTeacherPrompt(this.context) },
      ...this.conversationHistory.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
    ];

    const taskType = this.determineTaskType(userMessage);
    let fullResponse = '';

    for await (const chunk of this.router.stream(messages, {
      taskType,
      temperature: 0.7,
    })) {
      if (chunk.content) {
        fullResponse += chunk.content;
        yield chunk.content;
      }
    }

    // Parse and store the complete response
    const parsed = this.parseResponse(fullResponse);

    this.conversationHistory.push({
      role: 'assistant',
      content: fullResponse,
      timestamp: new Date(),
      corrections: parsed.corrections,
      culturalNote: parsed.culturalNote,
    });

    this.updateContext(parsed);
  }

  /**
   * Generate an exercise based on current context
   */
  async generateExercise(
    type: 'vocabulary' | 'grammar' | 'listening' | 'speaking'
  ): Promise<string> {
    const exercisePrompt = `Generate a ${type} exercise appropriate for a ${this.context.proficiencyLevel} level student learning ${this.context.language}.

${this.context.topicsCovered?.length ? `Topics covered so far: ${this.context.topicsCovered.join(', ')}` : ''}
${this.context.recentMistakes?.length ? `Recent mistakes to address: ${this.context.recentMistakes.join(', ')}` : ''}

Provide clear instructions, the exercise content, and the correct answers (marked clearly).`;

    const messages: Message[] = [
      { role: 'system', content: buildTeacherPrompt(this.context) },
      { role: 'user', content: exercisePrompt },
    ];

    const response = await this.router.chat(messages, {
      taskType: 'exercise_generation',
      temperature: 0.8,
    });

    return response.content;
  }

  /**
   * Get a detailed correction analysis
   */
  async analyzeCorrection(text: string): Promise<TeacherResponse> {
    const correctionPrompt = `Please analyze the following ${this.context.language} text for any errors or areas of improvement. Provide detailed feedback:

"${text}"

Include:
1. Grammar corrections with explanations
2. Vocabulary suggestions
3. Cultural appropriateness feedback
4. Natural phrasing alternatives`;

    const messages: Message[] = [
      { role: 'system', content: buildTeacherPrompt(this.context) },
      { role: 'user', content: correctionPrompt },
    ];

    // Use grammar correction task type (routes to Qwen for Asian languages)
    const response = await this.router.chat(messages, {
      taskType: 'grammar_correction',
      temperature: 0.3, // Lower temperature for more precise corrections
    });

    return this.parseResponse(response.content);
  }

  /**
   * Set the interaction mode
   */
  setMode(mode: InteractionMode): void {
    this.context.interactionMode = mode;
  }

  /**
   * Update proficiency level
   */
  setLevel(level: ProficiencyLevel): void {
    this.context.proficiencyLevel = level;
  }

  /**
   * Set current syllabus unit
   */
  setCurrentUnit(unit: string): void {
    this.context.currentUnit = unit;
  }

  /**
   * Add vocabulary to known list
   */
  addKnownVocabulary(words: string[]): void {
    this.context.knownVocabulary = [
      ...(this.context.knownVocabulary || []),
      ...words,
    ];
  }

  /**
   * Get conversation history
   */
  getHistory(): ConversationMessage[] {
    return [...this.conversationHistory];
  }

  /**
   * Clear conversation history
   */
  clearHistory(): void {
    this.conversationHistory = [];
  }

  /**
   * Get current context
   */
  getContext(): TeacherContext {
    return { ...this.context };
  }

  /**
   * Determine the best task type for LLM routing
   */
  private determineTaskType(message: string): TaskType {
    const lowerMessage = message.toLowerCase();

    // Check for correction-related keywords
    if (
      lowerMessage.includes('correct') ||
      lowerMessage.includes('mistake') ||
      lowerMessage.includes('wrong') ||
      lowerMessage.includes('error')
    ) {
      return 'grammar_correction';
    }

    // Check for cultural questions
    if (
      lowerMessage.includes('culture') ||
      lowerMessage.includes('polite') ||
      lowerMessage.includes('rude') ||
      lowerMessage.includes('appropriate')
    ) {
      return 'cultural_explanation';
    }

    // Check for vocabulary questions
    if (
      lowerMessage.includes('word for') ||
      lowerMessage.includes('how do you say') ||
      lowerMessage.includes('vocabulary') ||
      lowerMessage.includes('meaning')
    ) {
      return 'vocabulary';
    }

    // Check for translation requests
    if (
      lowerMessage.includes('translate') ||
      lowerMessage.includes('translation')
    ) {
      return 'translation';
    }

    // Default to conversation
    return 'conversation';
  }

  /**
   * Parse LLM response for structured data
   */
  private parseResponse(content: string): TeacherResponse {
    // For now, return the content as-is
    // In a production app, you might parse JSON or structured markers
    const response: TeacherResponse = {
      content,
    };

    // Try to extract cultural notes if marked
    const culturalMatch = content.match(
      /\[Cultural Note\]:\s*(.+?)(?:\n\n|\[|$)/is
    );
    if (culturalMatch) {
      response.culturalNote = culturalMatch[1].trim();
    }

    // Try to extract corrections if marked
    const correctionMatch = content.match(
      /\[Correction\]:\s*"(.+?)"\s*→\s*"(.+?)"\s*(?:because|explanation)?\s*:?\s*(.+?)(?:\n\n|\[|$)/gi
    );
    if (correctionMatch) {
      response.corrections = correctionMatch.map((match) => {
        const parts = match.match(
          /\[Correction\]:\s*"(.+?)"\s*→\s*"(.+?)"\s*(?:because|explanation)?\s*:?\s*(.+)/i
        );
        return {
          original: parts?.[1] || '',
          corrected: parts?.[2] || '',
          explanation: parts?.[3]?.trim() || '',
        };
      });
    }

    return response;
  }

  /**
   * Update context based on the response
   */
  private updateContext(response: TeacherResponse): void {
    // Track corrections as recent mistakes to reinforce
    if (response.corrections?.length) {
      const mistakes = response.corrections.map((c) => c.original);
      this.context.recentMistakes = [
        ...mistakes,
        ...(this.context.recentMistakes || []).slice(0, 10),
      ].slice(0, 15);
    }
  }
}

/**
 * Create a new teacher agent
 */
export function createTeacher(config: TeacherConfig): TeacherAgent {
  return new TeacherAgent(config);
}
