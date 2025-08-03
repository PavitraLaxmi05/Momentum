const Product = require('../models/product.model');
const { ErrorResponse } = require('../middleware/error.middleware');
const axios = require('axios');

/**
 * Get all products
 * @route GET /api/products
 * @access Private
 */
exports.getProducts = async (req, res, next) => {
  try {
    const { category, minScore, maxPrice, sort, page = 1, limit = 10 } = req.query;
    
    // Build query
    const query = {};
    
    // Filter by category
    if (category) {
      query.category = category;
    }
    
    // Filter by sustainability score
    if (minScore) {
      query.sustainabilityScore = { $gte: parseFloat(minScore) };
    }
    
    // Filter by price
    if (maxPrice) {
      query.price = { $lte: parseFloat(maxPrice) };
    }
    
    // Build sort object
    let sortObj = {};
    if (sort) {
      const sortFields = sort.split(',');
      sortFields.forEach(field => {
        if (field.startsWith('-')) {
          sortObj[field.substring(1)] = -1;
        } else {
          sortObj[field] = 1;
        }
      });
    } else {
      // Default sort by sustainability score (highest first)
      sortObj = { sustainabilityScore: -1 };
    }
    
    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Execute query
    const products = await Product.find(query)
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit));
    
    // Get total count
    const total = await Product.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count: products.length,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      },
      data: products
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single product
 * @route GET /api/products/:id
 * @access Private
 */
exports.getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return next(new ErrorResponse(`Product not found with id of ${req.params.id}`, 404));
    }
    
    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create product
 * @route POST /api/products
 * @access Private (Admin)
 */
exports.createProduct = async (req, res, next) => {
  try {
    // Add user to req.body
    req.body.user = req.user.id;
    
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return next(new ErrorResponse('Not authorized to create products', 403));
    }
    
    const product = await Product.create(req.body);
    
    res.status(201).json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update product
 * @route PUT /api/products/:id
 * @access Private (Admin)
 */
exports.updateProduct = async (req, res, next) => {
  try {
    let product = await Product.findById(req.params.id);
    
    if (!product) {
      return next(new ErrorResponse(`Product not found with id of ${req.params.id}`, 404));
    }
    
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return next(new ErrorResponse('Not authorized to update products', 403));
    }
    
    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete product
 * @route DELETE /api/products/:id
 * @access Private (Admin)
 */
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return next(new ErrorResponse(`Product not found with id of ${req.params.id}`, 404));
    }
    
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return next(new ErrorResponse('Not authorized to delete products', 403));
    }
    
    await product.remove();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Search products
 * @route GET /api/products/search
 * @access Private
 */
exports.searchProducts = async (req, res, next) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return next(new ErrorResponse('Please provide a search query', 400));
    }
    
    // Search using text index
    const products = await Product.find(
      { $text: { $search: q } },
      { score: { $meta: 'textScore' } }
    )
      .sort({ score: { $meta: 'textScore' } })
      .limit(10);
    
    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get product recommendations based on user's carbon footprint
 * @route GET /api/products/recommendations
 * @access Private
 */
exports.getRecommendations = async (req, res, next) => {
  try {
    // Get user's carbon footprint categories
    const user = await req.user.populate('carbonFootprint');
    
    if (!user.carbonFootprint) {
      return next(new ErrorResponse('Carbon footprint not found', 404));
    }
    
    // Determine which category has the highest emissions
    const categories = [
      { name: 'transportation', value: user.carbonFootprint.transportationEmission },
      { name: 'energy', value: user.carbonFootprint.energyEmission },
      { name: 'food', value: user.carbonFootprint.foodEmission },
      { name: 'waste', value: user.carbonFootprint.wasteEmission },
      { name: 'water', value: user.carbonFootprint.waterEmission }
    ];
    
    // Sort categories by emission value (highest first)
    categories.sort((a, b) => b.value - a.value);
    
    // Map carbon categories to product categories
    const categoryMap = {
      transportation: 'Transportation',
      energy: 'Energy',
      food: 'Food & Beverage',
      waste: 'Home & Garden',
      water: 'Home & Garden'
    };
    
    // Get product recommendations for the top category
    const productCategory = categoryMap[categories[0].name];
    
    const products = await Product.find({ category: productCategory })
      .sort({ sustainabilityScore: -1 })
      .limit(5);
    
    res.status(200).json({
      success: true,
      data: {
        highestEmissionCategory: categories[0].name,
        recommendedProducts: products
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Import products from external API
 * @route POST /api/products/import
 * @access Private (Admin)
 */
exports.importProducts = async (req, res, next) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return next(new ErrorResponse('Not authorized to import products', 403));
    }
    
    // This is a placeholder for importing products from an external API
    // In a real application, you would connect to a product database or API
    const sampleProducts = [
      {
        name: 'Eco-friendly Water Bottle',
        description: 'Reusable water bottle made from recycled materials',
        category: 'Home & Garden',
        price: 25.99,
        currency: 'USD',
        imageUrl: 'https://example.com/water-bottle.jpg',
        productUrl: 'https://example.com/products/water-bottle',
        brand: 'EcoLife',
        sustainabilityFeatures: ['Recycled Materials', 'Plastic-Free', 'BPA-Free'],
        sustainabilityScore: 4.5,
        carbonFootprint: 2.3,
        certifications: ['B Corp', 'Climate Neutral']
      },
      {
        name: 'Solar Phone Charger',
        description: 'Portable solar charger for mobile devices',
        category: 'Energy',
        price: 49.99,
        currency: 'USD',
        imageUrl: 'https://example.com/solar-charger.jpg',
        productUrl: 'https://example.com/products/solar-charger',
        brand: 'SolarPower',
        sustainabilityFeatures: ['Renewable Energy', 'Energy Efficient', 'Durable'],
        sustainabilityScore: 4.8,
        carbonFootprint: 1.5,
        certifications: ['Energy Star']
      },
      {
        name: 'Bamboo Toothbrush Set',
        description: 'Set of 4 biodegradable bamboo toothbrushes',
        category: 'Personal Care',
        price: 12.99,
        currency: 'USD',
        imageUrl: 'https://example.com/bamboo-toothbrush.jpg',
        productUrl: 'https://example.com/products/bamboo-toothbrush',
        brand: 'EcoSmile',
        sustainabilityFeatures: ['Biodegradable', 'Plastic-Free', 'Compostable'],
        sustainabilityScore: 4.7,
        carbonFootprint: 0.8,
        certifications: ['Plastic-Free Certified']
      },
      {
        name: 'Organic Cotton T-Shirt',
        description: 'Soft t-shirt made from 100% organic cotton',
        category: 'Clothing',
        price: 29.99,
        currency: 'USD',
        imageUrl: 'https://example.com/organic-tshirt.jpg',
        productUrl: 'https://example.com/products/organic-tshirt',
        brand: 'EcoWear',
        sustainabilityFeatures: ['Organic', 'Fair Trade', 'Non-Toxic Dyes'],
        sustainabilityScore: 4.2,
        carbonFootprint: 3.1,
        certifications: ['GOTS', 'Fair Trade']
      },
      {
        name: 'Electric Bike',
        description: 'Eco-friendly electric bicycle for commuting',
        category: 'Transportation',
        price: 1299.99,
        currency: 'USD',
        imageUrl: 'https://example.com/electric-bike.jpg',
        productUrl: 'https://example.com/products/electric-bike',
        brand: 'GreenRide',
        sustainabilityFeatures: ['Zero Emissions', 'Energy Efficient', 'Durable'],
        sustainabilityScore: 4.9,
        carbonFootprint: 5.2,
        certifications: ['UL Certified']
      }
    ];
    
    // Insert sample products
    await Product.insertMany(sampleProducts);
    
    res.status(201).json({
      success: true,
      count: sampleProducts.length,
      data: sampleProducts
    });
  } catch (error) {
    next(error);
  }
};