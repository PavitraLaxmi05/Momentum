const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const ctrl = require('../controllers/trade.controller');

router.get('/', ctrl.listTrades); // public list
router.post('/', protect, ctrl.createTrade); // create trade adds +10 CKC

// Admin-only cleanup could be added; for now expose a protected route
router.delete('/leaderboard', protect, ctrl.clearLeaderboard);

module.exports = router;


