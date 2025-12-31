/**
 * LLM Provider Abstraction Layer
 *
 * This module defines the interface for all LLM providers,
 * enabling easy swapping and multi-LLM routing for different tasks.
 */

export type LLMProviderName = 'claude' | 'openai' | 'qwen' | 'gemini';

export type TaskType =
  | 'conversation'           // General conversation practice
  | 'grammar_correction'     // Correcting user's grammar
  | 'cultural_explanation'   // Deep cultural context
  | 'vocabulary'             // Vocabulary teaching
  | 'exercise_generation'    // Creating exercises/tests
  | 'translation';           // Translation tasks

export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMOptions {
  temperature?: number;       // 0-1, default 0.7
  maxTokens?: number;         // Max response tokens
  stream?: boolean;           // Enable streaming
  taskType?: TaskType;        // For routing to optimal model
}

export interface LLMResponse {
  content: string;
  usage?: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
  model: string;
  provider: LLMProviderName;
}

export interface StreamChunk {
  content: string;
  done: boolean;
}

/**
 * Abstract interface that all LLM providers must implement.
 * This enables easy swapping of models without changing business logic.
 */
export interface LLMProvider {
  name: LLMProviderName;

  /**
   * Send a chat completion request
   */
  chat(messages: Message[], options?: LLMOptions): Promise<LLMResponse>;

  /**
   * Stream a chat completion response
   * Returns an async iterator of content chunks
   */
  stream(messages: Message[], options?: LLMOptions): AsyncGenerator<StreamChunk>;

  /**
   * Check if the provider is properly configured (API key exists, etc.)
   */
  isConfigured(): boolean;
}

/**
 * Configuration for task-based LLM routing.
 * Different tasks can be routed to different LLMs for optimal performance.
 */
export interface LLMRoutingConfig {
  default: LLMProviderName;
  tasks?: Partial<Record<TaskType, LLMProviderName>>;
}

/**
 * Environment configuration for LLM providers
 */
export interface LLMEnvConfig {
  claudeApiKey?: string;
  openaiApiKey?: string;
  qwenApiKey?: string;
  geminiApiKey?: string;
}
