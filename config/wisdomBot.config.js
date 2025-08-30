// Wisdom Bot Config Service
require('dotenv').config();

module.exports = {
  geminiApiKey: process.env.GEMINI_API_KEY,
  sessionSecret: process.env.SESSION_SECRET || 'momentum_wisdom_secret',
  wisdomRateLimit: {
    windowMs: 5 * 60 * 1000,
    max: 20,
  },
  botPersonality: {
    name: 'Sage',
    traditions: [
      'Stoicism',
      'Buddhism',
      'Confucianism',
      'Greek philosophy',
      'Ayurveda'
    ],
    tone: 'Warm, empathetic, modern, relatable',
    style: 'Storytelling, metaphors, practical advice',
  },
  errorLogging: true,
};
