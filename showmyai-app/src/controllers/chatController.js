const { validationResult } = require('express-validator');
const sessionManager = require('../services/sessionManager');
const aiService = require('../services/aiService');

const sendMessage = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { message, sessionId } = req.body;

  try {
    let session;

    if (sessionId) {
      session = sessionManager.getSession(sessionId);
      if (!session) {
        // Session expired or not found, create a new one
        const newSessionId = sessionManager.createSession();
        session = sessionManager.getSession(newSessionId);
      }
    } else {
      const newSessionId = sessionManager.createSession();
      session = sessionManager.getSession(newSessionId);
    }

    sessionManager.addMessage(session.sessionId, 'user', message);

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    res.write(`data: ${JSON.stringify({ type: 'session', sessionId: session.sessionId })}\n\n`);

    let fullResponse = '';

    try {
      for await (const chunk of aiService.streamChat(session.conversationHistory)) {
        if (chunk.token) {
          fullResponse += chunk.token;
        }

        res.write(`data: ${JSON.stringify(chunk)}\n\n`);

        if (chunk.done) {
          sessionManager.addMessage(session.sessionId, 'assistant', fullResponse);
          break;
        }
      }
    } catch (error) {
      console.error('Streaming error:', error.message);
      res.write(`data: ${JSON.stringify({
        type: 'error',
        error: error.message || 'An error occurred while processing your request'
      })}\n\n`);
    }

    res.end();
  } catch (error) {
    console.error('Chat controller error:', error);

    if (!res.headersSent) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
};

const getSession = (req, res) => {
  const { sessionId } = req.params;

  if (!sessionId) {
    return res.status(400).json({ error: 'Session ID is required' });
  }

  const session = sessionManager.getSession(sessionId);

  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  res.json({
    sessionId: session.sessionId,
    conversationHistory: session.conversationHistory,
    createdAt: session.createdAt,
    lastActivity: session.lastActivity,
    messageCount: session.conversationHistory.length
  });
};

const deleteSession = (req, res) => {
  const { sessionId } = req.params;

  if (!sessionId) {
    return res.status(400).json({ error: 'Session ID is required' });
  }

  const deleted = sessionManager.deleteSession(sessionId);

  if (!deleted) {
    return res.status(404).json({ error: 'Session not found' });
  }

  res.json({ success: true, message: 'Session deleted successfully' });
};

const createSession = (req, res) => {
  try {
    const sessionId = sessionManager.createSession();
    const session = sessionManager.getSession(sessionId);

    res.json({
      sessionId: session.sessionId,
      createdAt: session.createdAt
    });
  } catch (error) {
    console.error('Create session error:', error);
    res.status(500).json({ error: 'Failed to create session' });
  }
};

const getStats = (req, res) => {
  const modelInfo = aiService.getModelInfo();
  res.json({
    activeSessions: sessionManager.getSessionCount(),
    aiInitialized: aiService.isInitialized(),
    provider: modelInfo.provider,
    model: modelInfo.model
  });
};

module.exports = {
  sendMessage,
  getSession,
  deleteSession,
  createSession,
  getStats
};
