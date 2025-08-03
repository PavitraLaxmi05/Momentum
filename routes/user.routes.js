const express = require('express');
const { protect, authorize } = require('../middleware/auth.middleware');
const User = require('../models/user.model');
const { ErrorResponse } = require('../middleware/error.middleware');

const router = express.Router();

// Protect all routes
router.use(protect);

/**
 * Get all users
 * @route GET /api/users
 * @access Private (Admin only)
 */
router.get('/', authorize('admin'), async (req, res, next) => {
  try {
    const users = await User.find().select('-password');
    
    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Get user by ID
 * @route GET /api/users/:id
 * @access Private (Admin only)
 */
router.get('/:id', authorize('admin'), async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
    }
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Update user role
 * @route PUT /api/users/:id/role
 * @access Private (Admin only)
 */
router.put('/:id/role', authorize('admin'), async (req, res, next) => {
  try {
    const { role } = req.body;
    
    if (!role || !['user', 'admin'].includes(role)) {
      return next(new ErrorResponse('Please provide a valid role', 400));
    }
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
    }
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Delete user
 * @route DELETE /api/users/:id
 * @access Private (Admin only)
 */
router.delete('/:id', authorize('admin'), async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
    }
    
    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user.id) {
      return next(new ErrorResponse('You cannot delete your own account', 400));
    }
    
    await user.deleteOne();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Get user sustainability stats
 * @route GET /api/users/stats/sustainability
 * @access Private
 */
router.get('/stats/sustainability', async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('sustainabilityScore carbonFootprint');
    
    // Get user's carbon footprint data
    const carbonFootprint = await req.user.populate('carbonFootprint');
    
    res.status(200).json({
      success: true,
      data: {
        sustainabilityScore: user.sustainabilityScore,
        carbonFootprint: user.carbonFootprint,
        carbonDetails: carbonFootprint || {}
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;