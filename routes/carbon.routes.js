const express = require('express');
const {
  getCarbonFootprint,
  addCarbonEntry,
  deleteCarbonEntry,
  getCarbonTips,
  getEnergyData,
  setMonthlyGoal
} = require('../controllers/carbon.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// Protect all routes
router.use(protect);

// Routes
router.route('/')
  .get(getCarbonFootprint);

router.route('/entries')
  .post(addCarbonEntry);

router.route('/entries/:id')
  .delete(deleteCarbonEntry);

router.route('/tips')
  .get(getCarbonTips);

router.route('/energy-data')
  .get(getEnergyData);

router.route('/goal')
  .put(setMonthlyGoal);

module.exports = router;