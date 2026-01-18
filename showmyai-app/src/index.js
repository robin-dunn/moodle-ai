require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const assignmentRoutes = require('./routes/assignments');
const chatRoutes = require('./routes/chat');
const { chatRateLimiter } = require('./middleware/rateLimit');
const openaiService = require('./services/openaiService');
const geminiService = require('./services/geminiService');
const ollamaService = require('./services/ollamaService');
const aiService = require('./services/aiService');
const sessionManager = require('./services/sessionManager');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize AI services
async function initializeAIServices() {
  let aiInitialized = false;

  // Try to initialize Ollama (local LLM)
  try {
    await ollamaService.initialize();
    if (ollamaService.isInitialized()) {
      console.log('Ollama service initialized successfully');
      aiInitialized = true;
    }
  } catch (error) {
    console.error('Failed to initialize Ollama service:', error.message);
  }

  // Try to initialize Gemini
  if (process.env.GEMINI_API_KEY) {
    try {
      geminiService.initialize(process.env.GEMINI_API_KEY);
      console.log('Gemini service initialized successfully');
      if (!aiInitialized) {
        aiInitialized = true;
      }
    } catch (error) {
      console.error('Failed to initialize Gemini service:', error.message);
    }
  }

  // Try to initialize OpenAI
  if (process.env.OPENAI_API_KEY) {
    try {
      openaiService.initialize(process.env.OPENAI_API_KEY);
      console.log('OpenAI service initialized successfully');
      if (!aiInitialized) {
        aiInitialized = true;
      }
    } catch (error) {
      console.error('Failed to initialize OpenAI service:', error.message);
    }
  }

  // Set provider based on AI_PROVIDER environment variable or auto-detect
  if (process.env.AI_PROVIDER) {
    const preferredProvider = process.env.AI_PROVIDER.toLowerCase();
    if (preferredProvider === 'ollama' && ollamaService.isInitialized()) {
      aiService.setProvider('ollama');
      console.log('Using Ollama as AI provider (from AI_PROVIDER setting)');
    } else if (preferredProvider === 'openai' && openaiService.isInitialized()) {
      aiService.setProvider('openai');
      console.log('Using OpenAI as AI provider (from AI_PROVIDER setting)');
    } else if (preferredProvider === 'gemini' && geminiService.isInitialized()) {
      aiService.setProvider('gemini');
      console.log('Using Gemini as AI provider (from AI_PROVIDER setting)');
    }
  } else {
    // Auto-detect: prefer Ollama, then Gemini, then OpenAI
    if (ollamaService.isInitialized()) {
      aiService.setProvider('ollama');
    } else if (geminiService.isInitialized()) {
      aiService.setProvider('gemini');
    } else if (openaiService.isInitialized()) {
      aiService.setProvider('openai');
    }
  }

  if (!aiInitialized) {
    console.warn('No AI service available. Chat features will not be available.');
    console.warn('Make sure Ollama is running, or set GEMINI_API_KEY or OPENAI_API_KEY.');
  } else {
    const modelInfo = aiService.getModelInfo();
    console.log(`Active AI Provider: ${modelInfo.provider} (${modelInfo.model})`);
  }
}

// Initialize AI services on startup
initializeAIServices().catch(err => {
  console.error('Error during AI service initialization:', err);
});

app.use(helmet({
  contentSecurityPolicy: false,
}));

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'views')));

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'Show My AI',
    timestamp: new Date().toISOString()
  });
});

app.use('/', assignmentRoutes);

app.use('/api/chat', chatRateLimiter, chatRoutes);

setInterval(() => {
  sessionManager.cleanupOldSessions();
}, 3600000); // Run cleanup every hour

app.use((req, res) => {
  res.status(404).send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>404 - Not Found</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          margin: 0;
          background-color: #f5f5f5;
        }
        .error-container {
          text-align: center;
          padding: 2rem;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        h1 { color: #333; }
        p { color: #666; }
        a {
          color: #007bff;
          text-decoration: none;
        }
      </style>
    </head>
    <body>
      <div class="error-container">
        <h1>404 - Page Not Found</h1>
        <p>The page you are looking for does not exist.</p>
        <p><a href="/">Go back to home</a></p>
      </div>
    </body>
    </html>
  `);
});

app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>500 - Server Error</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          margin: 0;
          background-color: #f5f5f5;
        }
        .error-container {
          text-align: center;
          padding: 2rem;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        h1 { color: #dc3545; }
        p { color: #666; }
      </style>
    </head>
    <body>
      <div class="error-container">
        <h1>500 - Internal Server Error</h1>
        <p>Something went wrong. Please try again later.</p>
      </div>
    </body>
    </html>
  `);
});

const server = app.listen(PORT, () => {
  console.log(`Show My AI app listening on port ${PORT}`);
  console.log(`Health check available at http://localhost:${PORT}/health`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

module.exports = app;
