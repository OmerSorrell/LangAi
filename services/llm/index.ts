/**
 * LLM Services
 *
 * Unified interface for interacting with multiple LLM providers.
 *
 * Usage:
 * ```typescript
 * import { getLLMRouter } from '@/services/llm';
 *
 * const router = getLLMRouter();
 *
 * // Basic usage (uses default provider)
 * const response = await router.chat([
 *   { role: 'system', content: 'You are a Japanese teacher...' },
 *   { role: 'user', content: 'How do I say hello?' }
 * ]);
 *
 * // Task-specific routing (auto-selects best provider)
 * const grammarResponse = await router.chat(messages, {
 *   taskType: 'grammar_correction'  // Routes to Qwen for Asian languages
 * });
 *
 * // Streaming
 * for await (const chunk of router.stream(messages)) {
 *   console.log(chunk.content);
 * }
 * ```
 */

// Types
export type {
  LLMProvider,
  LLMProviderName,
  LLMOptions,
  LLMResponse,
  LLMRoutingConfig,
  Message,
  StreamChunk,
  TaskType,
} from './types';

// Providers
export { ClaudeProvider, createClaudeProvider } from './claude';
export { OpenAIProvider, createOpenAIProvider } from './openai';
export { QwenProvider, createQwenProvider } from './qwen';

// Router
export {
  LLMRouter,
  getLLMRouter,
  resetLLMRouter,
  DEFAULT_ROUTING_CONFIG,
} from './router';
