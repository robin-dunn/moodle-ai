const openaiService = require('./openaiService');
const geminiService = require('./geminiService');

class AIService {
  constructor() {
    this.provider = process.env.AI_PROVIDER || 'gemini';
  }

  getProvider() {
    return this.provider;
  }

  setProvider(provider) {
    if (provider !== 'openai' && provider !== 'gemini') {
      throw new Error('Invalid AI provider. Must be "openai" or "gemini"');
    }
    this.provider = provider;
  }

  isInitialized() {
    if (this.provider === 'openai') {
      return openaiService.isInitialized();
    } else if (this.provider === 'gemini') {
      return geminiService.isInitialized();
    }
    return false;
  }

  async *streamChat(conversationHistory) {
    if (this.provider === 'openai') {
      yield* openaiService.streamChatWithRetry(conversationHistory);
    } else if (this.provider === 'gemini') {
      yield* geminiService.streamChatWithRetry(conversationHistory);
    } else {
      throw new Error(`Unknown AI provider: ${this.provider}`);
    }
  }

  getModelInfo() {
    if (this.provider === 'openai') {
      return {
        provider: 'OpenAI',
        model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo'
      };
    } else if (this.provider === 'gemini') {
      return {
        provider: 'Google Gemini',
        model: process.env.GEMINI_MODEL || 'gemini-pro'
      };
    }
    return { provider: 'Unknown', model: 'Unknown' };
  }
}

module.exports = new AIService();
