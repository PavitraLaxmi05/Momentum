// test-gemini.js
const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function test() {
    try {
        console.log('Testing API Key...');
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: "Say hello in a wise manner",
        });
        console.log('SUCCESS:', response.text);
    } catch (error) {
        console.error('ERROR:', {
            status: error.status,
            message: error.message,
            code: error.code
        });
    }
}

test();
