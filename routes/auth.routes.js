const express = require('express');
const { register, login, getMe, updateProfile, updatePassword, getAuthenticatedUser } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const { upload } = require('../utils/fileUpload');

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.put('/updateprofile', protect, upload.single('profilePicture'), updateProfile);
router.put('/updatepassword', protect, updatePassword);

// Add route for fetching authenticated user profile
router.route('/me')
  .get(protect, getMe);

module.exports = router;