const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const ctrl = require('../controllers/circularity.controller');

// Public list endpoints
router.get('/farmers', ctrl.listFarmerResources);
router.get('/communities', ctrl.listCommunityNeeds);

// Create endpoints (auth optional: will attach user if provided)
router.post('/farmers', protect, ctrl.createFarmerResource);
router.post('/communities', protect, ctrl.createCommunityNeed);

module.exports = router;


