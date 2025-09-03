//carbon.routes.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const {
  getCarbonFootprint,
  addCarbonEntry,
  deleteCarbonEntry,
  getCarbonTips,
  getEnergyData,
  setMonthlyGoal,
  calculateCarbonFootprint,
  getTrades,
  createTrade
} = require('../controllers/carbon.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// Configure multer storage for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../public/uploads'));
  },
  filename: (req, file, cb) => {
    cb(null, `bill-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|pdf/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only .png, .jpg, .jpeg, and .pdf files are allowed'));
    }
  }
});

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

// New route for calculating carbon footprint
router.route('/calculate')
  .post(upload.single('bill'), calculateCarbonFootprint);

// Added routes for trade creation and fetching
router.route('/trades')
  .get(getTrades)
  .post(createTrade);

module.exports = router;