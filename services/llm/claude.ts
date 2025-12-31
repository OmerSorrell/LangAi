/**
 * Claude (Anthropic) LLM Provider
 *
 * Best for: Teaching explanations, cultural context, maintaining personas
 * Models: claude-3-5-sonnet, claude-3-5-haiku, claude-3-opus
 */

import {
  LLMProvider,
  Message,
  LLMOptions,
  LLMResponse,
  StreamChunk,
} from './types';

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';
const CLAUDE_VERSION = '2023-06-01';

export type ClaudeModel =
  | 'claude-sonnet-4-20250514'
  | 'claude-3-5-sonnet-20241022'
  | 'claude-3-5-haiku-20241022'
  | 'claude-3-opus-20240229';

interface ClaudeConfig {
  apiKey: string;
  model?: ClaudeModel;
}

export class ClaudeProvider implements LLMProvider {
  name = 'claude' as const;
  private apiKey: string;
  private model: ClaudeModel;

  constructor(config: ClaudeConfig) {
    this.apiKey = config.apiKey;
    this.model = config.model || 'claude-3-5-sonnet-20241022';
  }

  isConfigured(): boolean {
    return Boolean(this.apiKey);
  }

  async chat(messages: Message[], options?: LLMOptions): Promise<LLMResponse> {
    if (!this.isConfigured()) {
      throw new Error('Claude API key not configured');
    }

    // Separate system message from conversation
    const systemMessage = messages.find((m) => m.role === 'system');
    const conversationMessages = messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }));

    const response = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': CLAUDE_VERSION,
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: options?.maxTokens || 4096,
        system: systemMessage?.content,
        messages: conversationMessages,
        ...(options?.temperature !== undefined && {
          temperature: options.temperature,
        }),
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Claude API error: ${response.status} - ${error}`);
    }

    const data = await response.json();

    return {
      content: data.content[0]?.text || '',
      usage: {
        inputTokens: data.usage?.input_tokens || 0,
        outputTokens: data.usage?.output_tokens || 0,
        totalTokens:
          (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0),
      },
      model: this.model,
      provider: 'claude',
    };
  }

  async *stream(
    messages: Message[],
    options?: LLMOptions
  ): AsyncGenerator<StreamChunk> {
    if (!this.isConfigured()) {
      throw new Error('Claude API key not configured');
    }

    const systemMessage = messages.find((m) => m.role === 'system');
    const conversationMessages = messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }));

    const response = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': CLAUDE_VERSION,
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: options?.maxTokens || 4096,
        system: systemMessage?.content,
        messages: conversationMessages,
        stream: true,
        ...(options?.temperature !== undefined && {
          temperature: options.temperature,
        }),
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Claude API error: ${response.status} - ${error}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body');

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') {
            yield { content: '', done: true };
            return;
          }

          try {
            const parsed = JSON.parse(data);
            if (parsed.type === 'content_block_delta') {
              yield {
                content: parsed.delta?.text || '',
                done: false,
              };
            }
          } catch {
            // Skip malformed JSON
          }
        }
      }
    }

    yield { content: '', done: true };
  }
}

/**
 * Factory function to create Claude provider with environment config
 */
export function createClaudeProvider(apiKey?: string): ClaudeProvider | null {
  const key = apiKey || process.env.EXPO_PUBLIC_CLAUDE_API_KEY;
  if (!key) return null;
  return new ClaudeProvider({ apiKey: key });
}
