/**
 * LLM Router Tests
 */

import { LLMRouter, DEFAULT_ROUTING_CONFIG } from '../../../services/llm/router';
import { ClaudeProvider } from '../../../services/llm/claude';
import { LLMProvider, Message, TaskType } from '../../../services/llm/types';

// Mock the provider factory functions
jest.mock('../../../services/llm/claude', () => ({
  ClaudeProvider: jest.fn().mockImplementation(() => ({
    name: 'claude',
    isConfigured: () => true,
    chat: jest.fn().mockResolvedValue({
      content: 'Claude response',
      provider: 'claude',
      model: 'claude-3-5-sonnet',
      usage: { inputTokens: 10, outputTokens: 20, totalTokens: 30 },
    }),
    stream: jest.fn(),
  })),
  createClaudeProvider: jest.fn().mockReturnValue({
    name: 'claude',
    isConfigured: () => true,
    chat: jest.fn().mockResolvedValue({
      content: 'Claude response',
      provider: 'claude',
      model: 'claude-3-5-sonnet',
      usage: { inputTokens: 10, outputTokens: 20, totalTokens: 30 },
    }),
    stream: jest.fn(),
  }),
}));

jest.mock('../../../services/llm/openai', () => ({
  createOpenAIProvider: jest.fn().mockReturnValue(null),
}));

jest.mock('../../../services/llm/qwen', () => ({
  createQwenProvider: jest.fn().mockReturnValue(null),
}));

describe('LLMRouter', () => {
  describe('DEFAULT_ROUTING_CONFIG', () => {
    it('has correct default provider', () => {
      expect(DEFAULT_ROUTING_CONFIG.default).toBe('claude');
    });

    it('has task-specific routing', () => {
      expect(DEFAULT_ROUTING_CONFIG.tasks?.grammar_correction).toBe('qwen');
      expect(DEFAULT_ROUTING_CONFIG.tasks?.cultural_explanation).toBe('claude');
      expect(DEFAULT_ROUTING_CONFIG.tasks?.exercise_generation).toBe('openai');
    });
  });

  describe('getAvailableProviders', () => {
    it('returns list of configured providers', () => {
      const router = new LLMRouter();
      const providers = router.getAvailableProviders();

      // Only Claude is mocked as available
      expect(providers).toContain('claude');
    });
  });

  describe('hasProvider', () => {
    it('returns true for configured provider', () => {
      const router = new LLMRouter();
      expect(router.hasProvider('claude')).toBe(true);
    });

    it('returns false for unconfigured provider', () => {
      const router = new LLMRouter();
      expect(router.hasProvider('gemini')).toBe(false);
    });
  });

  describe('chat', () => {
    it('routes to correct provider based on task type', async () => {
      const router = new LLMRouter();
      const messages: Message[] = [{ role: 'user', content: 'Test' }];

      const response = await router.chat(messages, { taskType: 'conversation' });

      expect(response.provider).toBe('claude');
      expect(response.content).toBe('Claude response');
    });

    it('uses default provider when task type not specified', async () => {
      const router = new LLMRouter();
      const messages: Message[] = [{ role: 'user', content: 'Test' }];

      const response = await router.chat(messages);

      expect(response.provider).toBe('claude');
    });
  });

  describe('updateConfig', () => {
    it('updates routing configuration', () => {
      const router = new LLMRouter();

      router.updateConfig({
        default: 'openai',
        tasks: { conversation: 'openai' },
      });

      const config = router.getConfig();
      expect(config.default).toBe('openai');
      expect(config.tasks?.conversation).toBe('openai');
    });

    it('preserves existing task config when updating', () => {
      const router = new LLMRouter();

      router.updateConfig({
        tasks: { conversation: 'openai' },
      });

      const config = router.getConfig();
      // Original task configs should still exist
      expect(config.tasks?.grammar_correction).toBe('qwen');
      // New config should be added
      expect(config.tasks?.conversation).toBe('openai');
    });
  });

  describe('addProvider', () => {
    it('adds a custom provider', () => {
      const router = new LLMRouter();

      const mockProvider: LLMProvider = {
        name: 'gemini',
        isConfigured: () => true,
        chat: jest.fn(),
        stream: jest.fn() as any,
      };

      router.addProvider(mockProvider);

      expect(router.hasProvider('gemini')).toBe(true);
    });
  });
});
