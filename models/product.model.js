const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'Home & Living',
      'Fashion',
      'Food & Beverages',
      'Beauty & Personal Care',
      'Electronics',
      'Transportation',
      'Energy',
      'Office Supplies',
      'Other'
    ]
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price must be a positive number']
  },
  currency: {
    type: String,
    default: 'USD',
    enum: ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'INR']
  },
  imageUrl: {
    type: String,
    default: ''
  },
  productUrl: {
    type: String,
    required: [true, 'Product URL is required']
  },
  brand: {
    type: String,
    required: [true, 'Brand is required'],
    trim: true
  },
  sustainabilityFeatures: [{
    type: String,
    enum: [
      'Recycled Materials',
      'Biodegradable',
      'Compostable',
      'Energy Efficient',
      'Water Efficient',
      'Locally Produced',
      'Fair Trade',
      'Organic',
      'Vegan',
      'Cruelty-Free',
      'Plastic-Free',
      'Carbon Neutral',
      'Renewable Energy Powered',
      'Repairable',
      'Recyclable Packaging',
      'Other'
    ]
  }],
  sustainabilityScore: {
    type: Number,
    min: 0,
    max: 10,
    default: 0
  },
  carbonFootprint: {
    type: Number,
    min: 0,
    default: 0
  },
  carbonFootprintUnit: {
    type: String,
    default: 'kg CO2e'
  },
  certifications: [{
    type: String,
    enum: [
      'Energy Star',
      'LEED',
      'FSC',
      'Fair Trade',
      'USDA Organic',
      'B Corp',
      'Rainforest Alliance',
      'Cradle to Cradle',
      'GOTS',
      'Green Seal',
      'EPEAT',
      'Other'
    ]
  }],
  verified: {
    type: Boolean,
    default: false
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Create text index for search functionality
productSchema.index({ 
  name: 'text', 
  description: 'text', 
  brand: 'text',
  category: 'text'
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;