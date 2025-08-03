const { ErrorResponse } = require('../middleware/error.middleware');
const dialogflow = require('@google-cloud/dialogflow');
const { OpenAI } = require('openai');
const path = require('path');

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Process a message with Dialogflow
 * @route POST /api/ecobot/message
 * @access Private
 */
exports.processMessage = async (req, res, next) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return next(new ErrorResponse('Please provide a message', 400));
    }
    
    // Create a new session
    const projectId = process.env.DIALOGFLOW_PROJECT_ID;
    const sessionId = req.user.id;
    const sessionClient = new dialogflow.SessionsClient({
      keyFilename: path.join(__dirname, '../config/dialogflow-credentials.json')
    });
    const sessionPath = sessionClient.projectAgentSessionPath(projectId, sessionId);
    
    // The text query request
    const request = {
      session: sessionPath,
      queryInput: {
        text: {
          text: message,
          languageCode: 'en-US',
        },
      },
    };
    
    // Send request and get response
    const responses = await sessionClient.detectIntent(request);
    const result = responses[0].queryResult;
    
    // Check if Dialogflow could handle the query
    if (result.intent.displayName === 'Default Fallback Intent') {
      // If Dialogflow couldn't handle it, use OpenAI as a fallback
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are EcoBot, a helpful assistant focused on sustainability, eco-friendly practices, and environmental conservation. Provide concise, practical advice about sustainable living, reducing carbon footprints, and making environmentally conscious choices. Keep responses under 150 words and focus on actionable tips."
          },
          {
            role: "user",
            content: message
          }
        ],
        max_tokens: 150
      });
      
      return res.status(200).json({
        success: true,
        data: {
          text: completion.choices[0].message.content,
          source: 'openai'
        }
      });
    }
    
    // Return the Dialogflow response
    res.status(200).json({
      success: true,
      data: {
        text: result.fulfillmentText,
        intent: result.intent.displayName,
        confidence: result.intentDetectionConfidence,
        source: 'dialogflow'
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get sustainability tips from OpenAI
 * @route GET /api/ecobot/tips
 * @access Private
 */
exports.getSustainabilityTips = async (req, res, next) => {
  try {
    const { category } = req.query;
    
    let prompt = "Provide 5 practical sustainability tips for everyday life. Focus on actionable advice that's easy to implement.";
    
    if (category) {
      prompt = `Provide 5 practical sustainability tips related to ${category}. Focus on actionable advice that's easy to implement.`;
    }
    
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are EcoBot, a helpful assistant focused on sustainability. Provide your response in a JSON array format with each tip as an object containing 'tip' (string) and 'difficulty' (string: 'easy', 'medium', or 'hard') properties."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 500
    });
    
    // Parse the response as JSON
    let tips;
    try {
      tips = JSON.parse(completion.choices[0].message.content);
    } catch (error) {
      // If parsing fails, return the raw text
      return res.status(200).json({
        success: true,
        data: {
          tips: [{ tip: completion.choices[0].message.content, difficulty: 'medium' }]
        }
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        tips
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Analyze product sustainability with OpenAI
 * @route POST /api/ecobot/analyze-product
 * @access Private
 */
exports.analyzeProduct = async (req, res, next) => {
  try {
    const { productName, description } = req.body;
    
    if (!productName) {
      return next(new ErrorResponse('Please provide a product name', 400));
    }
    
    const productDesc = description || '';
    
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are EcoBot, a sustainability expert. Analyze the given product and provide a sustainability assessment. Your response should be in JSON format with the following properties: 'sustainabilityScore' (number between 1-5), 'positiveAspects' (array of strings), 'concerns' (array of strings), and 'alternatives' (array of more sustainable alternatives)."
        },
        {
          role: "user",
          content: `Analyze the sustainability of this product: ${productName}. ${productDesc ? 'Additional details: ' + productDesc : ''}`
        }
      ],
      max_tokens: 500
    });
    
    // Parse the response as JSON
    let analysis;
    try {
      analysis = JSON.parse(completion.choices[0].message.content);
    } catch (error) {
      // If parsing fails, return the raw text
      return res.status(200).json({
        success: true,
        data: {
          analysis: {
            sustainabilityScore: 3,
            assessment: completion.choices[0].message.content
          }
        }
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        analysis
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get eco-friendly challenges
 * @route GET /api/ecobot/challenges
 * @access Private
 */
exports.getChallenges = async (req, res, next) => {
  try {
    // These would typically come from a database
    // For now, we'll use hardcoded challenges
    const challenges = [
      {
        id: 1,
        title: 'Zero Waste Week',
        description: 'Try to produce no landfill waste for an entire week',
        difficulty: 'hard',
        duration: 7, // days
        points: 100,
        tips: [
          'Use reusable containers and bags',
          'Compost food scraps',
          'Buy package-free products',
          'Refuse single-use items'
        ]
      },
      {
        id: 2,
        title: 'Meatless Monday',
        description: 'Go vegetarian or vegan every Monday for a month',
        difficulty: 'medium',
        duration: 30, // days
        points: 50,
        tips: [
          'Try plant-based protein sources like beans and tofu',
          'Explore vegetarian recipes online',
          'Visit local vegetarian restaurants',
          'Start with familiar dishes and substitute meat'
        ]
      },
      {
        id: 3,
        title: 'Plastic-Free Day',
        description: 'Avoid all single-use plastics for a day',
        difficulty: 'medium',
        duration: 1, // days
        points: 30,
        tips: [
          'Bring your own water bottle and coffee cup',
          'Use cloth bags for shopping',
          'Choose products with plastic-free packaging',
          'Prepare food at home to avoid takeout containers'
        ]
      },
      {
        id: 4,
        title: 'Energy Saver',
        description: 'Reduce your energy consumption by 20% for a week',
        difficulty: 'medium',
        duration: 7, // days
        points: 75,
        tips: [
          'Unplug electronics when not in use',
          'Use natural light during the day',
          'Hang clothes to dry instead of using a dryer',
          'Take shorter showers'
        ]
      },
      {
        id: 5,
        title: 'Local Food Challenge',
        description: 'Eat only locally produced food (within 100 miles) for a weekend',
        difficulty: 'hard',
        duration: 2, // days
        points: 60,
        tips: [
          'Visit farmers markets',
          'Research local food producers',
          'Cook meals from scratch',
          'Try preserving seasonal local produce'
        ]
      }
    ];
    
    res.status(200).json({
      success: true,
      count: challenges.length,
      data: challenges
    });
  } catch (error) {
    next(error);
  }
};