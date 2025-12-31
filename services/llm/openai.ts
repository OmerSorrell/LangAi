/**
 * OpenAI LLM Provider
 *
 * Best for: General conversation, cost-effective options (GPT-4o-mini)
 * Models: gpt-4o, gpt-4o-mini, gpt-4-turbo
 */

import {
  LLMProvider,
  Message,
  LLMOptions,
  LLMResponse,
  StreamChunk,
} from './types';

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

export type OpenAIModel =
  | 'gpt-4o'
  | 'gpt-4o-mini'
  | 'gpt-4-turbo'
  | 'gpt-4';

interface OpenAIConfig {
  apiKey: string;
  model?: OpenAIModel;
}

export class OpenAIProvider implements LLMProvider {
  name = 'openai' as const;
  private apiKey: string;
  private model: OpenAIModel;

  constructor(config: OpenAIConfig) {
    this.apiKey = config.apiKey;
    this.model = config.model || 'gpt-4o';
  }

  isConfigured(): boolean {
    return Boolean(this.apiKey);
  }

  async chat(messages: Message[], options?: LLMOptions): Promise<LLMResponse> {
    if (!this.isConfigured()) {
      throw new Error('OpenAI API key not configured');
    }

    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages: messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        max_tokens: options?.maxTokens || 4096,
        ...(options?.temperature !== undefined && {
          temperature: options.temperature,
        }),
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${error}`);
    }

    const data = await response.json();

    return {
      content: data.choices[0]?.message?.content || '',
      usage: {
        inputTokens: data.usage?.prompt_tokens || 0,
        outputTokens: data.usage?.completion_tokens || 0,
        totalTokens: data.usage?.total_tokens || 0,
      },
      model: this.model,
      provider: 'openai',
    };
  }

  async *stream(
    messages: Message[],
    options?: LLMOptions
  ): AsyncGenerator<StreamChunk> {
    if (!this.isConfigured()) {
      throw new Error('OpenAI API key not configured');
    }

    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages: messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        max_tokens: options?.maxTokens || 4096,
        stream: true,
        ...(options?.temperature !== undefined && {
          temperature: options.temperature,
        }),
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${error}`);
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
          const data = line.slice(6).trim();
          if (data === '[DONE]') {
            yield { content: '', done: true };
            return;
          }

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices[0]?.delta?.content || '';
            if (content) {
              yield { content, done: false };
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
 * Factory function to create OpenAI provider with environment config
 */
export function createOpenAIProvider(apiKey?: string): OpenAIProvider | null {
  const key = apiKey || process.env.EXPO_PUBLIC_OPENAI_API_KEY;
  if (!key) return null;
  return new OpenAIProvider({ apiKey: key });
}
