// Wisdom Bot API Routes
const express = require('express');
const router = express.Router();
const wisdomBotController = require('../controllers/wisdomBot.controller');
const rateLimit = require('express-rate-limit');
const { body } = require('express-validator');
const sanitize = require('express-mongo-sanitize');

// Rate limiting for wisdom bot
const wisdomLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 20, // limit each IP to 20 requests per windowMs
  message: 'Too many wisdom requests, please try again later.'
});

// Input validation middleware
const validateMessage = [
  body('message').isString().trim().notEmpty().escape().isLength({ max: 500 }),
];

// POST /api/wisdom/chat
router.post('/chat', wisdomLimiter, validateMessage, wisdomBotController.chat);

// GET /api/wisdom/session
router.get('/session', wisdomBotController.getSession);

// POST /api/wisdom/feedback
router.post('/feedback', body('feedback').isString().trim().notEmpty().escape(), wisdomBotController.feedback);

// GET /api/wisdom/history
router.get('/history', wisdomBotController.history);

module.exports = router;
