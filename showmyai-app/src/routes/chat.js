const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const chatController = require('../controllers/chatController');

router.post('/send',
  [
    body('message')
      .trim()
      .notEmpty()
      .withMessage('Message is required')
      .isLength({ max: 500 })
      .withMessage('Message must be less than 500 characters'),
    body('sessionId')
      .optional()
      .isUUID()
      .withMessage('Invalid session ID format')
  ],
  chatController.sendMessage
);

router.post('/session', chatController.createSession);

router.get('/session/:sessionId', chatController.getSession);

router.delete('/session/:sessionId', chatController.deleteSession);

router.get('/stats', chatController.getStats);

module.exports = router;
