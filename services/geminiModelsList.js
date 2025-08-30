// Script to list available Gemini models for your API key
const genai = require('@google/genai');
require('dotenv').config();

async function listModels() {
  try {
    const client = new genai.GenerativeModelClient({ apiKey: process.env.GEMINI_API_KEY });
    const models = await client.listModels();
    console.log('Available Gemini Models:');
    models.forEach(model => {
      console.log(`- ${model.name}`);
      if (model.supportedMethods) {
        console.log(`  Supported methods: ${model.supportedMethods.join(', ')}`);
      }
    });
  } catch (err) {
    console.error('Error listing Gemini models:', err);
  }
}

listModels();
