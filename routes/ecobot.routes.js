const express = require('express');
const {
  processMessage,
  getSustainabilityTips,
  analyzeProduct,
  getChallenges
} = require('../controllers/ecobot.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// Protect all routes
router.use(protect);

// Routes
router.route('/message')
  .post(processMessage);

router.route('/tips')
  .get(getSustainabilityTips);

router.route('/analyze-product')
  .post(analyzeProduct);

router.route('/challenges')
  .get(getChallenges);

module.exports = router;