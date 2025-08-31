require("dotenv").config();
// test-openai.js
const OpenAI = require('openai');

// Replace with your actual API key or use process.env for security
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "your-api-key-here" });

async function testOpenAI() {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: "Hello, test message" }],
      max_tokens: 20
    });

    console.log("✅ OpenAI response:");
    console.log(response.choices[0].message.content);
  } catch (error) {
    console.error("❌ OpenAI error:", error.message);
  }
}

testOpenAI();
