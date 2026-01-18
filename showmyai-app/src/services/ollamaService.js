class OllamaService {
  constructor() {
    this.baseUrl = process.env.OLLAMA_BASE_URL || 'http://ollama:11434';
    this.model = process.env.OLLAMA_MODEL || 'phi3';
    this.temperature = parseFloat(process.env.OLLAMA_TEMPERATURE || '0.7');
    this.initialized = false;
  }

  async initialize() {
    try {
      // Check if Ollama is available
      const response = await fetch(`${this.baseUrl}/api/tags`);
      if (response.ok) {
        const data = await response.json();
        const models = data.models || [];

        // Check if our model is available
        const modelExists = models.some(m => m.name.includes(this.model));

        if (modelExists) {
          this.initialized = true;
          console.log(`Ollama service initialized with model: ${this.model}`);
        } else {
          console.log(`Ollama model "${this.model}" not found. Available models:`, models.map(m => m.name));
          console.log(`Run: docker exec alpine-moodle-ollama-1 ollama pull ${this.model}`);
        }
      }
    } catch (error) {
      console.error('Failed to initialize Ollama service:', error.message);
      console.log('Make sure Ollama container is running');
    }
  }

  isInitialized() {
    return this.initialized;
  }

  async *streamChat(conversationHistory) {
    if (!Array.isArray(conversationHistory) || conversationHistory.length === 0) {
      throw new Error('Conversation history is required');
    }

    try {
      // Convert conversation history to Ollama format
      const messages = conversationHistory.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          messages: messages,
          stream: true,
          options: {
            temperature: this.temperature,
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.trim()) {
            try {
              const data = JSON.parse(line);

              if (data.message && data.message.content) {
                yield { token: data.message.content, done: false };
              }

              if (data.done) {
                yield { token: '', done: true, finishReason: 'stop' };
              }
            } catch (e) {
              console.error('Error parsing Ollama response:', e.message);
            }
          }
        }
      }

    } catch (error) {
      console.error('Ollama streaming error:', error.message);

      if (error.message.includes('ECONNREFUSED') || error.message.includes('fetch failed')) {
        throw new Error('Ollama service not available. Make sure the Ollama container is running.');
      } else if (error.message.includes('model')) {
        throw new Error(`Ollama model "${this.model}" not found. Run: docker exec alpine-moodle-ollama-1 ollama pull ${this.model}`);
      } else {
        throw new Error('Failed to get AI response from Ollama');
      }
    }
  }

  async *streamChatWithRetry(conversationHistory, maxRetries = 2) {
    let lastError = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        yield* this.streamChat(conversationHistory);
        return;
      } catch (error) {
        lastError = error;

        if (attempt < maxRetries - 1) {
          const delay = Math.pow(2, attempt) * 1000;
          console.log(`Ollama request failed, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }

        throw error;
      }
    }

    throw lastError;
  }

  validateService() {
    return this.initialized;
  }
}

module.exports = new OllamaService();
