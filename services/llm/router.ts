/**
 * LLM Router
 *
 * Routes different tasks to optimal LLM providers.
 * This enables cost optimization and quality optimization simultaneously.
 *
 * Example routing:
 * - Cultural explanations → Claude (best reasoning)
 * - Grammar corrections → Qwen (best for Asian languages)
 * - Basic conversation → GPT-4o-mini (cheapest)
 */

import {
  LLMProvider,
  LLMProviderName,
  LLMRoutingConfig,
  TaskType,
  Message,
  LLMOptions,
  LLMResponse,
  StreamChunk,
} from './types';
import { ClaudeProvider, createClaudeProvider } from './claude';
import { OpenAIProvider, createOpenAIProvider } from './openai';
import { QwenProvider, createQwenProvider } from './qwen';

/**
 * Default routing configuration
 * Optimized for language teaching with Asian languages
 */
export const DEFAULT_ROUTING_CONFIG: LLMRoutingConfig = {
  default: 'claude',
  tasks: {
    conversation: 'claude',           // Claude for natural teaching persona
    grammar_correction: 'qwen',       // Qwen for CJK accuracy
    cultural_explanation: 'claude',   // Claude for deep reasoning
    vocabulary: 'claude',             // Claude for explanations
    exercise_generation: 'openai',    // GPT-4o-mini for cost
    translation: 'qwen',              // Qwen for Asian translation
  },
};

export class LLMRouter {
  private providers: Map<LLMProviderName, LLMProvider> = new Map();
  private config: LLMRoutingConfig;

  constructor(config?: Partial<LLMRoutingConfig>) {
    this.config = {
      ...DEFAULT_ROUTING_CONFIG,
      ...config,
      tasks: {
        ...DEFAULT_ROUTING_CONFIG.tasks,
        ...config?.tasks,
      },
    };

    this.initializeProviders();
  }

  /**
   * Initialize all available providers based on API keys
   */
  private initializeProviders(): void {
    const claude = createClaudeProvider();
    if (claude) this.providers.set('claude', claude);

    const openai = createOpenAIProvider();
    if (openai) this.providers.set('openai', openai);

    const qwen = createQwenProvider();
    if (qwen) this.providers.set('qwen', qwen);
  }

  /**
   * Get the appropriate provider for a task type
   */
  private getProviderForTask(taskType?: TaskType): LLMProvider {
    let providerName: LLMProviderName;

    if (taskType && this.config.tasks?.[taskType]) {
      providerName = this.config.tasks[taskType]!;
    } else {
      providerName = this.config.default;
    }

    // Try to get the configured provider
    let provider = this.providers.get(providerName);

    // Fallback to any available provider if configured one isn't available
    if (!provider) {
      provider = this.providers.get(this.config.default);
    }

    if (!provider) {
      // Get any available provider
      const available = Array.from(this.providers.values())[0];
      if (!available) {
        throw new Error(
          'No LLM providers configured. Please set at least one API key.'
        );
      }
      provider = available;
    }

    return provider;
  }

  /**
   * Send a chat completion using the appropriate provider
   */
  async chat(messages: Message[], options?: LLMOptions): Promise<LLMResponse> {
    const provider = this.getProviderForTask(options?.taskType);
    return provider.chat(messages, options);
  }

  /**
   * Stream a chat completion using the appropriate provider
   */
  async *stream(
    messages: Message[],
    options?: LLMOptions
  ): AsyncGenerator<StreamChunk> {
    const provider = this.getProviderForTask(options?.taskType);
    yield* provider.stream(messages, options);
  }

  /**
   * Get list of available providers
   */
  getAvailableProviders(): LLMProviderName[] {
    return Array.from(this.providers.keys());
  }

  /**
   * Check if a specific provider is available
   */
  hasProvider(name: LLMProviderName): boolean {
    return this.providers.has(name);
  }

  /**
   * Add a provider manually (useful for testing or custom providers)
   */
  addProvider(provider: LLMProvider): void {
    this.providers.set(provider.name, provider);
  }

  /**
   * Update routing configuration
   */
  updateConfig(config: Partial<LLMRoutingConfig>): void {
    this.config = {
      ...this.config,
      ...config,
      tasks: {
        ...this.config.tasks,
        ...config?.tasks,
      },
    };
  }

  /**
   * Get current routing configuration
   */
  getConfig(): LLMRoutingConfig {
    return { ...this.config };
  }
}

// Singleton instance for app-wide use
let routerInstance: LLMRouter | null = null;

/**
 * Get the global LLM router instance
 */
export function getLLMRouter(config?: Partial<LLMRoutingConfig>): LLMRouter {
  if (!routerInstance) {
    routerInstance = new LLMRouter(config);
  }
  return routerInstance;
}

/**
 * Reset the router (useful for testing)
 */
export function resetLLMRouter(): void {
  routerInstance = null;
}
