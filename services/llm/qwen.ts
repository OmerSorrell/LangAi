/**
 * Qwen (Alibaba) LLM Provider
 *
 * Best for: Asian languages (Japanese, Korean, Chinese)
 * Qwen has superior performance for CJK languages due to training focus.
 *
 * Note: Qwen API is compatible with OpenAI format via DashScope
 * https://dashscope.aliyuncs.com/
 */

import {
  LLMProvider,
  Message,
  LLMOptions,
  LLMResponse,
  StreamChunk,
} from './types';

// Qwen uses DashScope API which is OpenAI-compatible
const QWEN_API_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions';

export type QwenModel =
  | 'qwen-max'           // Most powerful
  | 'qwen-plus'          // Balanced
  | 'qwen-turbo'         // Fast and cheap
  | 'qwen-long';         // Long context

interface QwenConfig {
  apiKey: string;
  model?: QwenModel;
}

export class QwenProvider implements LLMProvider {
  name = 'qwen' as const;
  private apiKey: string;
  private model: QwenModel;

  constructor(config: QwenConfig) {
    this.apiKey = config.apiKey;
    this.model = config.model || 'qwen-plus';
  }

  isConfigured(): boolean {
    return Boolean(this.apiKey);
  }

  async chat(messages: Message[], options?: LLMOptions): Promise<LLMResponse> {
    if (!this.isConfigured()) {
      throw new Error('Qwen API key not configured');
    }

    const response = await fetch(QWEN_API_URL, {
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
      throw new Error(`Qwen API error: ${response.status} - ${error}`);
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
      provider: 'qwen',
    };
  }

  async *stream(
    messages: Message[],
    options?: LLMOptions
  ): AsyncGenerator<StreamChunk> {
    if (!this.isConfigured()) {
      throw new Error('Qwen API key not configured');
    }

    const response = await fetch(QWEN_API_URL, {
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
      throw new Error(`Qwen API error: ${response.status} - ${error}`);
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
 * Factory function to create Qwen provider with environment config
 */
export function createQwenProvider(apiKey?: string): QwenProvider | null {
  const key = apiKey || process.env.EXPO_PUBLIC_QWEN_API_KEY;
  if (!key) return null;
  return new QwenProvider({ apiKey: key });
}
