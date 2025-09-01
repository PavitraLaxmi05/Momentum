require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

async function testGeminiAPI() {
  try {
    // Sample prompt similar to your idea evaluation
    const prompt = `Evaluate the following sustainability idea and provide scores (0-10) for potential impact, feasibility, and innovation. Also provide detailed feedback.

Idea Title: Sustainable Incense
Description: Collecting waste flowers from functions or celebrations and recycling them into incense sticks
Category: waste
Implementation Cost: low
Time to Implement: weeks
Benefits: Reduces flower wastage
Challenges: Collecting them

Please provide your evaluation in the following JSON format:
{
  "potentialImpact": [score],
  "feasibilityScore": [score],
  "innovationScore": [score],
  "feedback": "[detailed feedback]"
}`;

    // Call Gemini API
    const result = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: prompt
            }
          ]
        }
      ],
      generationConfig: {
        maxOutputTokens: 500,
        temperature: 0.7
      }
    });

    // Log the response
    const responseText = result.response.text().trim();
    console.log('Gemini API response:', responseText);

    // Attempt to parse the response as JSON
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/) || responseText.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch) {
        const evaluation = JSON.parse(jsonMatch[0] || jsonMatch[1]);
        console.log('Parsed evaluation:', evaluation);
      } else {
        console.error('Error: Could not find JSON in response');
      }
    } catch (parseError) {
      console.error('Error parsing JSON:', parseError.message);
    }
  } catch (error) {
    console.error('Gemini API error:', error.message, error.stack);
  }
}

testGeminiAPI();