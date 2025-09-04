const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth.middleware');
const SustainabilityController = require('../controllers/sustainability.controller');

// Apply authentication middleware to all routes
router.use(authMiddleware);

/**
 * @route   GET /api/sustainability/influencers
 * @desc    Get sustainability influencers data
 * @access  Private
 */
router.get('/influencers', SustainabilityController.getInfluencers);

/**
 * @route   GET /api/sustainability/projects
 * @desc    Get sustainable building projects data
 * @access  Private
 */
router.get('/projects', SustainabilityController.getProjects);

/**
 * @route   POST /api/sustainability/submit
 * @desc    Submit user sustainability story
 * @access  Private
 */
router.post('/submit', SustainabilityController.submitStory);

/**
 * @route   GET /api/sustainability/stories
 * @desc    Get user-generated sustainability stories
 * @access  Private
 */
router.get('/stories', SustainabilityController.getStories);

/**
 * @route   POST /api/sustainability/stories/:id/like
 * @desc    Like a sustainability story
 * @access  Private
 */
router.post('/stories/:id/like', SustainabilityController.likeStory);

/**
 * @route   POST /api/sustainability/stories/:id/comment
 * @desc    Add comment to sustainability story
 * @access  Private
 */
router.post('/stories/:id/comment', SustainabilityController.commentStory);

/**
 * @route   POST /api/sustainability/refresh
 * @desc    Manually refresh influencer and project data
 * @access  Private (Admin only)
 */
router.post('/refresh', SustainabilityController.refreshData);

module.exports = router;
