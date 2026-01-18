const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiService {
  constructor() {
    this.client = null;
    this.model = process.env.GEMINI_MODEL || 'gemini-1.5-flash-latest';
    this.temperature = parseFloat(process.env.GEMINI_TEMPERATURE || '0.7');
    this.maxTokens = parseInt(process.env.GEMINI_MAX_TOKENS || '1000');
  }

  initialize(apiKey) {
    if (!apiKey) {
      throw new Error('Gemini API key is required');
    }

    this.client = new GoogleGenerativeAI(apiKey);
    console.log(`Gemini service initialized with model: ${this.model}`);
  }

  isInitialized() {
    return this.client !== null;
  }

  async *streamChat(conversationHistory) {
    if (!this.isInitialized()) {
      throw new Error('Gemini service not initialized');
    }

    if (!Array.isArray(conversationHistory) || conversationHistory.length === 0) {
      throw new Error('Conversation history is required');
    }

    try {
      const model = this.client.getGenerativeModel({
        model: this.model,
        generationConfig: {
          temperature: this.temperature,
          maxOutputTokens: this.maxTokens,
        }
      });

      // Convert conversation history to Gemini format
      const history = conversationHistory.slice(0, -1).map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      }));

      const lastMessage = conversationHistory[conversationHistory.length - 1];

      // Start chat with history
      const chat = model.startChat({
        history: history,
        generationConfig: {
          temperature: this.temperature,
          maxOutputTokens: this.maxTokens,
        },
      });

      // Send the last message and stream the response
      const result = await chat.sendMessageStream(lastMessage.content);

      for await (const chunk of result.stream) {
        const text = chunk.text();
        if (text) {
          yield { token: text, done: false };
        }
      }

      yield { token: '', done: true, finishReason: 'stop' };

    } catch (error) {
      console.error('Gemini streaming error:', error.message);

      if (error.message.includes('API key')) {
        throw new Error('Invalid Gemini API key');
      } else if (error.message.includes('not found') || error.message.includes('404')) {
        throw new Error(`Gemini model "${this.model}" not found. Try: gemini-1.5-flash or gemini-1.5-pro`);
      } else if (error.message.includes('quota') || error.message.includes('rate')) {
        throw new Error('Gemini rate limit exceeded. Please try again later.');
      } else if (error.status >= 500) {
        throw new Error('Gemini service temporarily unavailable');
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

module.exports = new GeminiService();
