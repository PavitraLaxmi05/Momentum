const Idea = require('../models/idea.model');
const { ErrorResponse } = require('../middleware/error.middleware');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

/**
 * Get all ideas
 * @route GET /api/ideas
 * @access Private
 */
exports.getIdeas = async (req, res, next) => {
  try {
    const ideas = await Idea.find({ user: req.user.id }).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: ideas.length,
      data: ideas
    });
  } catch (error) {
    console.error('Get ideas error:', error.message, error.stack);
    next(error);
  }
};

/**
 * Get single idea
 * @route GET /api/ideas/:id
 * @access Private
 */
exports.getIdea = async (req, res, next) => {
  try {
    const idea = await Idea.findById(req.params.id);
    
    if (!idea) {
      return next(new ErrorResponse(`Idea not found with id of ${req.params.id}`, 404));
    }
    
    // Make sure user owns the idea
    if (idea.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new ErrorResponse(`User not authorized to access this idea`, 401));
    }
    
    res.status(200).json({
      success: true,
      data: idea
    });
  } catch (error) {
    console.error('Get idea error:', error.message, error.stack);
    next(error);
  }
};

/**
 * Create new idea
 * @route POST /api/ideas
 * @access Private
 */
exports.createIdea = async (req, res, next) => {
  try {
    // Verify req.user exists
    if (!req.user || !req.user.id) {
      return next(new ErrorResponse('User not authenticated', 401));
    }
    
    // Add user to request body
    req.body.user = req.user.id;
    console.log('Creating idea with data:', req.body);
    
    const idea = await Idea.create(req.body);
    
    res.status(201).json({
      success: true,
      data: idea
    });
  } catch (error) {
    console.error('Create idea error:', error.message, error.stack);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return next(new ErrorResponse(`Validation failed: ${messages.join(', ')}`, 400));
    }
    next(new ErrorResponse(`Failed to create idea: ${error.message}`, 500));
  }
};

/**
 * Update idea
 * @route PUT /api/ideas/:id
 * @access Private
 */
exports.updateIdea = async (req, res, next) => {
  try {
    let idea = await Idea.findById(req.params.id);
    
    if (!idea) {
      return next(new ErrorResponse(`Idea not found with id of ${req.params.id}`, 404));
    }
    
    // Make sure user owns the idea
    if (idea.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new ErrorResponse(`User not authorized to update this idea`, 401));
    }
    
    idea = await Idea.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    res.status(200).json({
      success: true,
      data: idea
    });
  } catch (error) {
    console.error('Update idea error:', error.message, error.stack);
    next(error);
  }
};

/**
 * Delete idea
 * @route DELETE /api/ideas/:id
 * @access Private
 */
exports.deleteIdea = async (req, res, next) => {
  try {
    const idea = await Idea.findById(req.params.id);
    
    if (!idea) {
      return next(new ErrorResponse(`Idea not found with id of ${req.params.id}`, 404));
    }
    
    // Make sure user owns the idea
    if (idea.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new ErrorResponse(`User not authorized to delete this idea`, 401));
    }
    
    await idea.remove();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Delete idea error:', error.message, error.stack);
    next(error);
  }
};

/**
 * Evaluate idea using Gemini API
 * @route POST /api/ideas/:id/evaluate
 * @access Private
 */
exports.evaluateIdea = async (req, res, next) => {
  try {
    const idea = await Idea.findById(req.params.id);
    
    if (!idea) {
      return next(new ErrorResponse(`Idea not found with id of ${req.params.id}`, 404));
    }
    
    // Make sure user owns the idea
    if (idea.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new ErrorResponse(`User not authorized to evaluate this idea`, 401));
    }
    
    // Prepare prompt for Gemini
    const prompt = `Evaluate the following sustainability idea and provide scores (0-10) for potential impact, feasibility, and innovation. Also provide detailed feedback.

Idea Title: ${idea.title}
Description: ${idea.description}
Category: ${idea.category}
Implementation Cost: ${idea.implementationCost}
Time to Implement: ${idea.timeToImplement}
Benefits: ${idea.benefits}
Challenges: ${idea.challenges || 'Not specified'}

Please provide your evaluation in the following JSON format:
{
  "potentialImpact": number,
  "feasibilityScore": number,
  "innovationScore": number,
  "feedback": "string"
}`;

    // Call Gemini API with error handling
    let result;
    try {
      result = await model.generateContent({
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
    } catch (apiError) {
      console.error('Gemini API error:', apiError.message, apiError.stack);
      return next(new ErrorResponse(`Gemini API error: ${apiError.message}`, 500));
    }

    // Log the raw response for debugging
    const evaluationText = result.response.text().trim();
    console.log('Gemini response:', evaluationText);

    let evaluation;
    try {
      // Extract JSON from the response, handling markdown or plain JSON
      const jsonMatch = evaluationText.match(/\{[\s\S]*\}/) || evaluationText.match(/```json\n([\s\S]*?)\n```/);
      if (!jsonMatch) {
        throw new Error('Could not parse evaluation response');
      }

      const jsonString = jsonMatch[0] || jsonMatch[1];
      evaluation = JSON.parse(jsonString);

      // Normalize scores if they are arrays
      evaluation.potentialImpact = Array.isArray(evaluation.potentialImpact)
        ? evaluation.potentialImpact[0]
        : evaluation.potentialImpact;
      evaluation.feasibilityScore = Array.isArray(evaluation.feasibilityScore)
        ? evaluation.feasibilityScore[0]
        : evaluation.feasibilityScore;
      evaluation.innovationScore = Array.isArray(evaluation.innovationScore)
        ? evaluation.innovationScore[0]
        : evaluation.innovationScore;

      // Sanitize feedback to replace newlines and other control characters
      evaluation.feedback = evaluation.feedback.replace(/[\n\r\t]+/g, ' ').trim();

      // Validate evaluation structure
      if (evaluation.potentialImpact === undefined || evaluation.feasibilityScore === undefined || 
          evaluation.innovationScore === undefined || !evaluation.feedback) {
        throw new Error('Incomplete evaluation response');
      }
      
      // Truncate feedback if it's too long (over 1000 characters)
      if (evaluation.feedback && evaluation.feedback.length > 1000) {
        evaluation.feedback = evaluation.feedback.substring(0, 997) + '...';
      }
    } catch (parseError) {
      console.error('Evaluation parsing error:', parseError.message, parseError.stack);
      return next(new ErrorResponse(`Failed to parse evaluation results: ${parseError.message}`, 500));
    }
    
    // Update idea with evaluation results
    try {
      idea.potentialImpact = evaluation.potentialImpact;
      idea.feasibilityScore = evaluation.feasibilityScore;
      idea.innovationScore = evaluation.innovationScore;
      idea.feedback = evaluation.feedback;
      idea.status = 'evaluated';
      
      await idea.save();
    } catch (saveError) {
      console.error('Database save error:', saveError.message, saveError.stack);
      return next(new ErrorResponse(`Failed to save evaluation results: ${saveError.message}`, 500));
    }
    
    res.status(200).json({
      success: true,
      data: idea
    });
  } catch (error) {
    console.error('Evaluate idea error:', error.message, error.stack);
    next(error);
  }
};