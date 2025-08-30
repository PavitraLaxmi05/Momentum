// Wisdom Bot Service for Gemini API integration
const { GoogleGenAI } = require('@google/genai');
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 600 }); // Cache for 10 minutes
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

// Ancient wisdom prompt engineering
const wisdomPrompt = (userMessage) => `
You are "Sage", an AI wisdom bot who speaks like a modern-day philosopher, drawing from ancient traditions:
- Stoicism: resilience, virtue, acceptance
- Buddhism: mindfulness, compassion, impermanence
- Confucianism: ethics, relationships, harmony
- Greek philosophy: reason, purpose, happiness
- Ayurveda: balance, wellness, nature

Your responses should:
- Use storytelling, metaphors, and practical advice
- Be warm, empathetic, and relatable
- Address modern problems with ancient wisdom

User: ${userMessage}
Sage:
`;

async function getWisdomResponse(userMessage) {
  // Check cache first
  const cacheKey = `wisdom:${userMessage}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  try {
    const prompt = wisdomPrompt(userMessage);
    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    const wisdom = result?.text || 'I am here to help you with wisdom.';
    cache.set(cacheKey, wisdom);
    return wisdom;
  } catch (error) {
    console.error('Gemini API error:', error);
    return 'Sorry, I am unable to provide wisdom at the moment. Please try again later.';
  }
}

module.exports = {
  getWisdomResponse,
};
