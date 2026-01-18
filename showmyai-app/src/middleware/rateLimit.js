const rateLimit = require('express-rate-limit');

const chatRateLimiter = rateLimit({
  windowMs: parseInt(process.env.CHAT_RATE_LIMIT_WINDOW || '3600000'), // 1 hour
  max: parseInt(process.env.CHAT_RATE_LIMIT_MAX_REQUESTS || '100'),
  message: {
    error: 'Too many requests from this session. Please try again later.',
    retryAfter: '1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.body.sessionId || req.ip;
  },
  handler: (req, res) => {
    res.status(429).json({
      error: 'Rate limit exceeded',
      message: 'Too many chat requests. Please try again later.',
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000)
    });
  }
});

module.exports = {
  chatRateLimiter
};
