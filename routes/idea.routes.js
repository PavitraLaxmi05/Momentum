const express = require('express');
const { 
  getIdeas, 
  getIdea, 
  createIdea, 
  updateIdea, 
  deleteIdea,
  evaluateIdea 
} = require('../controllers/idea.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// Protect all routes
router.use(protect);

// Routes
router.route('/')
  .get(getIdeas)
  .post(createIdea);

router.route('/:id')
  .get(getIdea)
  .put(updateIdea)
  .delete(deleteIdea);

router.route('/:id/evaluate')
  .post(evaluateIdea);

module.exports = router;