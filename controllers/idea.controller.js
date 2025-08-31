const Idea = require('../models/idea.model');
const { ErrorResponse } = require('../middleware/error.middleware');
const OpenAI = require('openai');
console.log('OpenAI response:', evaluationText);
// Initialize OpenAI API
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
    // Add user to request body
    req.body.user = req.user.id;
    
    const idea = await Idea.create(req.body);
    
    res.status(201).json({
      success: true,
      data: idea
    });
  } catch (error) {
    next(error);
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
    next(error);
  }
};

/**
 * Evaluate idea using OpenAI
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
    
    // Prepare prompt for OpenAI
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
  "potentialImpact": [score],
  "feasibilityScore": [score],
  "innovationScore": [score],
  "feedback": "[detailed feedback]"
}`;

    // Call OpenAI API using chat completions (newer API)
    const response = await openai.chat.completions.create({
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
      max_tokens: 500,
      temperature: 0.7,
    });

    // Parse the response
    const evaluationText = response.choices[0].message.content.trim();
    let evaluation;
    
    try {
      // Extract JSON from the response
      const jsonMatch = evaluationText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        evaluation = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Could not parse evaluation');
      }
    } catch (parseError) {
      return next(new ErrorResponse('Failed to parse evaluation results', 500));
    }
    
    // Update idea with evaluation results
    idea.potentialImpact = evaluation.potentialImpact;
    idea.feasibilityScore = evaluation.feasibilityScore;
    idea.innovationScore = evaluation.innovationScore;
    idea.feedback = evaluation.feedback;
    idea.status = 'evaluated';
    
    await idea.save();
    
    res.status(200).json({
      success: true,
      data: idea
    });
  } catch (error) {
    next(error);
  }
};