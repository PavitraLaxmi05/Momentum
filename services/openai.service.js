const { OpenAI } = require('openai');

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Generate idea evaluation using OpenAI
 * @param {Object} idea - Idea object to evaluate
 * @returns {Promise<Object>} - Evaluation results
 */
exports.evaluateIdea = async (idea) => {
  try {
    const prompt = `
    Evaluate this sustainability idea based on its potential impact, feasibility, and innovation:
    
    Title: ${idea.title}
    Description: ${idea.description}
    Category: ${idea.category}
    Target Audience: ${idea.targetAudience}
    Estimated Cost: ${idea.cost}
    Time to Implement: ${idea.timeToImplement} days
    
    Please provide a detailed evaluation with scores (1-10) for:
    1. Potential Impact: How much positive environmental impact could this idea have?
    2. Feasibility: How practical and realistic is this idea to implement?
    3. Innovation: How novel and creative is this idea?
    
    For each criterion, provide a score and a brief explanation. Then provide an overall assessment and suggestions for improvement.
    
    Format your response as a JSON object with the following structure:
    {
      "impact": { "score": number, "explanation": "string" },
      "feasibility": { "score": number, "explanation": "string" },
      "innovation": { "score": number, "explanation": "string" },
      "overallScore": number,
      "assessment": "string",
      "suggestions": ["string"]
    }
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a sustainability expert who evaluates ideas based on their potential environmental impact, feasibility, and innovation. Provide detailed, constructive feedback."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 1000
    });

    // Parse the response as JSON
    const evaluation = JSON.parse(completion.choices[0].message.content);
    
    return evaluation;
  } catch (error) {
    console.error('Error evaluating idea with OpenAI:', error);
    throw new Error('Failed to evaluate idea');
  }
};

/**
 * Generate carbon reduction recommendations based on user's carbon footprint
 * @param {Object} carbonFootprint - User's carbon footprint data
 * @returns {Promise<Object>} - Personalized recommendations
 */
exports.getCarbonRecommendations = async (carbonFootprint) => {
  try {
    const prompt = `
    Based on the following carbon footprint data, provide personalized recommendations for reducing carbon emissions:
    
    Total Emissions: ${carbonFootprint.totalEmission} kg CO2
    Transportation Emissions: ${carbonFootprint.transportationEmission} kg CO2
    Energy Emissions: ${carbonFootprint.energyEmission} kg CO2
    Food Emissions: ${carbonFootprint.foodEmission} kg CO2
    Waste Emissions: ${carbonFootprint.wasteEmission} kg CO2
    Water Emissions: ${carbonFootprint.waterEmission} kg CO2
    
    Please provide 3 specific, actionable recommendations for each of the top 2 emission categories.
    For each recommendation, include:
    1. A brief description of the action
    2. The potential carbon reduction (in kg CO2)
    3. The difficulty level (easy, medium, hard)
    
    Format your response as a JSON object with the following structure:
    {
      "topCategories": ["string", "string"],
      "recommendations": [
        {
          "category": "string",
          "action": "string",
          "potentialReduction": number,
          "difficulty": "string",
          "timeFrame": "string"
        }
      ],
      "summary": "string"
    }
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a carbon footprint expert who provides personalized recommendations for reducing carbon emissions. Your recommendations should be specific, actionable, and tailored to the user's carbon footprint data."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 1000
    });

    // Parse the response as JSON
    const recommendations = JSON.parse(completion.choices[0].message.content);
    
    return recommendations;
  } catch (error) {
    console.error('Error generating carbon recommendations with OpenAI:', error);
    throw new Error('Failed to generate carbon recommendations');
  }
};

/**
 * Generate sustainable living tips
 * @param {string} category - Category for tips (optional)
 * @returns {Promise<Array>} - Array of sustainable living tips
 */
exports.getSustainableTips = async (category = '') => {
  try {
    let prompt = "Provide 5 practical tips for sustainable living that are easy to implement in daily life.";
    
    if (category) {
      prompt = `Provide 5 practical tips for sustainable living related to ${category} that are easy to implement in daily life.`;
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a sustainability expert who provides practical, actionable tips for sustainable living. Your tips should be specific, easy to implement, and have a positive environmental impact."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 500
    });

    // Extract tips from the response
    const tipsText = completion.choices[0].message.content;
    const tipsList = tipsText.split('\n')
      .filter(line => line.trim().length > 0)
      .map(line => line.replace(/^\d+\.\s*/, '').trim())
      .filter(line => line.length > 0);
    
    return tipsList;
  } catch (error) {
    console.error('Error generating sustainable tips with OpenAI:', error);
    throw new Error('Failed to generate sustainable tips');
  }
};