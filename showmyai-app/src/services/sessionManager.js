const { v4: uuidv4 } = require('uuid');

class SessionManager {
  constructor() {
    this.sessions = new Map();
    this.sessionTimeout = parseInt(process.env.CHAT_SESSION_TIMEOUT || '86400000'); // 24 hours in ms
  }

  createSession() {
    const sessionId = uuidv4();
    const session = {
      sessionId,
      conversationHistory: [],
      createdAt: Date.now(),
      lastActivity: Date.now()
    };

    this.sessions.set(sessionId, session);
    console.log(`Created new session: ${sessionId}`);
    return sessionId;
  }

  getSession(sessionId) {
    const session = this.sessions.get(sessionId);

    if (!session) {
      return null;
    }

    session.lastActivity = Date.now();
    return session;
  }

  addMessage(sessionId, role, content) {
    const session = this.getSession(sessionId);

    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    session.conversationHistory.push({
      role,
      content,
      timestamp: Date.now()
    });

    session.lastActivity = Date.now();
    return session;
  }

  deleteSession(sessionId) {
    const deleted = this.sessions.delete(sessionId);
    if (deleted) {
      console.log(`Deleted session: ${sessionId}`);
    }
    return deleted;
  }

  cleanupOldSessions() {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [sessionId, session] of this.sessions.entries()) {
      const age = now - session.lastActivity;

      if (age > this.sessionTimeout) {
        this.sessions.delete(sessionId);
        cleanedCount++;
        console.log(`Cleaned up inactive session: ${sessionId} (inactive for ${Math.round(age / 1000 / 60)} minutes)`);
      }
    }

    if (cleanedCount > 0) {
      console.log(`Session cleanup: removed ${cleanedCount} inactive sessions`);
    }

    return cleanedCount;
  }

  getSessionCount() {
    return this.sessions.size;
  }

  getAllSessions() {
    return Array.from(this.sessions.values());
  }
}

module.exports = new SessionManager();
