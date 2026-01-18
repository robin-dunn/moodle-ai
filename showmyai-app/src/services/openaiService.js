const OpenAI = require('openai');

class OpenAIService {
  constructor() {
    this.client = null;
    this.model = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';
    this.temperature = parseFloat(process.env.OPENAI_TEMPERATURE || '0.7');
    this.maxTokens = parseInt(process.env.OPENAI_MAX_TOKENS || '1000');
  }

  initialize(apiKey) {
    if (!apiKey) {
      throw new Error('OpenAI API key is required');
    }

    this.client = new OpenAI({
      apiKey: apiKey,
    });

    console.log(`OpenAI service initialized with model: ${this.model}`);
  }

  isInitialized() {
    return this.client !== null;
  }

  async *streamChat(conversationHistory) {
    if (!this.isInitialized()) {
      throw new Error('OpenAI service not initialized');
    }

    if (!Array.isArray(conversationHistory) || conversationHistory.length === 0) {
      throw new Error('Conversation history is required');
    }

    const messages = conversationHistory.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    try {
      const stream = await this.client.chat.completions.create({
        model: this.model,
        messages: messages,
        temperature: this.temperature,
        max_tokens: this.maxTokens,
        stream: true,
      });

      for await (const chunk of stream) {
        const token = chunk.choices[0]?.delta?.content;
        const finishReason = chunk.choices[0]?.finish_reason;

        if (token) {
          yield { token, done: false };
        }

        if (finishReason) {
          yield { token: '', done: true, finishReason };
        }
      }
    } catch (error) {
      console.error('OpenAI streaming error:', error.message);

      if (error.status === 401) {
        throw new Error('Invalid OpenAI API key');
      } else if (error.status === 429) {
        throw new Error('OpenAI rate limit exceeded. Please try again later.');
      } else if (error.status >= 500) {
        throw new Error('OpenAI service temporarily unavailable');
      } else {
        throw new Error('Failed to get AI response');
      }
    }
  }

  async *streamChatWithRetry(conversationHistory, maxRetries = 3) {
    let lastError = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        yield* this.streamChat(conversationHistory);
        return;
      } catch (error) {
        lastError = error;

        if (error.message.includes('rate limit') && attempt < maxRetries - 1) {
          const delay = Math.pow(2, attempt) * 1000;
          console.log(`Rate limit hit, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }

        throw error;
      }
    }

    throw lastError;
  }

  validateApiKey() {
    return this.client !== null;
  }
}

module.exports = new OpenAIService();
