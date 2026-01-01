/**
 * LLM Provider Tests
 */

import { ClaudeProvider } from '../../../services/llm/claude';
import { OpenAIProvider } from '../../../services/llm/openai';
import { QwenProvider } from '../../../services/llm/qwen';
import { Message } from '../../../services/llm/types';

describe('ClaudeProvider', () => {
  const mockApiKey = 'test-claude-api-key';
  let provider: ClaudeProvider;

  beforeEach(() => {
    provider = new ClaudeProvider({ apiKey: mockApiKey });
  });

  describe('isConfigured', () => {
    it('returns true when API key is provided', () => {
      expect(provider.isConfigured()).toBe(true);
    });

    it('returns false when API key is empty', () => {
      const emptyProvider = new ClaudeProvider({ apiKey: '' });
      expect(emptyProvider.isConfigured()).toBe(false);
    });
  });

  describe('chat', () => {
    const mockMessages: Message[] = [
      { role: 'system', content: 'You are a helpful assistant.' },
      { role: 'user', content: 'Hello!' },
    ];

    it('sends request to Claude API with correct format', async () => {
      const mockResponse = {
        content: [{ text: 'Hello! How can I help you?' }],
        usage: { input_tokens: 10, output_tokens: 8 },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await provider.chat(mockMessages);

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.anthropic.com/v1/messages',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'x-api-key': mockApiKey,
            'anthropic-version': '2023-06-01',
          }),
        })
      );

      expect(result.content).toBe('Hello! How can I help you?');
      expect(result.provider).toBe('claude');
    });

    it('throws error when not configured', async () => {
      const unconfiguredProvider = new ClaudeProvider({ apiKey: '' });
      await expect(unconfiguredProvider.chat(mockMessages)).rejects.toThrow(
        'Claude API key not configured'
      );
    });

    it('throws error on API failure', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        text: () => Promise.resolve('Unauthorized'),
      });

      await expect(provider.chat(mockMessages)).rejects.toThrow(
        'Claude API error: 401'
      );
    });
  });
});

describe('OpenAIProvider', () => {
  const mockApiKey = 'test-openai-api-key';
  let provider: OpenAIProvider;

  beforeEach(() => {
    provider = new OpenAIProvider({ apiKey: mockApiKey });
  });

  describe('isConfigured', () => {
    it('returns true when API key is provided', () => {
      expect(provider.isConfigured()).toBe(true);
    });
  });

  describe('chat', () => {
    const mockMessages: Message[] = [
      { role: 'user', content: 'Hello!' },
    ];

    it('sends request to OpenAI API with correct format', async () => {
      const mockResponse = {
        choices: [{ message: { content: 'Hi there!' } }],
        usage: { prompt_tokens: 5, completion_tokens: 3, total_tokens: 8 },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await provider.chat(mockMessages);

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.openai.com/v1/chat/completions',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            Authorization: `Bearer ${mockApiKey}`,
          }),
        })
      );

      expect(result.content).toBe('Hi there!');
      expect(result.provider).toBe('openai');
    });
  });
});

describe('QwenProvider', () => {
  const mockApiKey = 'test-qwen-api-key';
  let provider: QwenProvider;

  beforeEach(() => {
    provider = new QwenProvider({ apiKey: mockApiKey });
  });

  describe('isConfigured', () => {
    it('returns true when API key is provided', () => {
      expect(provider.isConfigured()).toBe(true);
    });
  });

  describe('chat', () => {
    const mockMessages: Message[] = [
      { role: 'user', content: 'こんにちは' },
    ];

    it('sends request to Qwen API with correct format', async () => {
      const mockResponse = {
        choices: [{ message: { content: 'こんにちは！何かお手伝いできますか？' } }],
        usage: { prompt_tokens: 5, completion_tokens: 10, total_tokens: 15 },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await provider.chat(mockMessages);

      expect(global.fetch).toHaveBeenCalledWith(
        'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
        expect.objectContaining({
          method: 'POST',
        })
      );

      expect(result.content).toBe('こんにちは！何かお手伝いできますか？');
      expect(result.provider).toBe('qwen');
    });
  });
});
