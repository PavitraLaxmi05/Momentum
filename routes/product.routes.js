const express = require('express');
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  searchProducts,
  getRecommendations,
  importProducts
} = require('../controllers/product.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

// Protect all routes
router.use(protect);

// Search route
router.route('/search')
  .get(searchProducts);

// Recommendations route
router.route('/recommendations')
  .get(getRecommendations);

// Import products route (admin only)
router.route('/import')
  .post(authorize('admin'), importProducts);

// Standard CRUD routes
router.route('/')
  .get(getProducts)
  .post(authorize('admin'), createProduct);

router.route('/:id')
  .get(getProduct)
  .put(authorize('admin'), updateProduct)
  .delete(authorize('admin'), deleteProduct);

module.exports = router;