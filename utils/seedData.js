const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/user.model');
const Idea = require('../models/idea.model');
const { CarbonFootprint } = require('../models/carbon.model');
const Product = require('../models/product.model');
const connectDB = require('../config/db');
require('dotenv').config();

// Sample users
const users = [
  {
    username: 'admin',
    email: 'admin@momentum.com',
    password: 'Admin@123',
    role: 'admin'
  },
  {
    username: 'user1',
    email: 'user1@example.com',
    password: 'User1@123',
    role: 'user'
  },
  {
    username: 'user2',
    email: 'user2@example.com',
    password: 'User2@123',
    role: 'user'
  }
];

// Sample ideas
const ideas = [
  {
    title: 'Community Composting Program',
    description: 'Create a neighborhood composting program where residents can drop off food waste to be turned into compost for community gardens.',
    category: 'Waste Reduction',
    targetAudience: 'Urban residents',
    cost: 500,
    timeToImplement: 30,
    status: 'pending'
  },
  {
    title: 'Solar-Powered Charging Stations',
    description: 'Install solar-powered charging stations in public parks and plazas for people to charge their devices using renewable energy.',
    category: 'Renewable Energy',
    targetAudience: 'Urban commuters',
    cost: 2000,
    timeToImplement: 60,
    status: 'pending'
  },
  {
    title: 'Bike-to-Work Incentive Program',
    description: 'Create a program that rewards employees who bike to work with incentives like gift cards, extra vacation days, or other perks.',
    category: 'Transportation',
    targetAudience: 'Office workers',
    cost: 1000,
    timeToImplement: 45,
    status: 'pending'
  }
];

// Sample carbon entries
const createCarbonEntries = (userId) => {
  const transportationEntries = [
    {
      entryType: 'transportation',
      description: 'Car commute to work',
      quantity: 20,
      unit: 'km',
      carbonEmission: 2.4,
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      user: userId
    },
    {
      entryType: 'transportation',
      description: 'Bus ride to downtown',
      quantity: 15,
      unit: 'km',
      carbonEmission: 0.9,
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      user: userId
    }
  ];
  
  const energyEntries = [
    {
      entryType: 'energy',
      description: 'Electricity usage',
      quantity: 100,
      unit: 'kWh',
      carbonEmission: 50,
      date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      user: userId
    }
  ];
  
  const foodEntries = [
    {
      entryType: 'food',
      description: 'Beef consumption',
      quantity: 0.5,
      unit: 'kg',
      carbonEmission: 13,
      date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      user: userId
    },
    {
      entryType: 'food',
      description: 'Vegetable consumption',
      quantity: 1,
      unit: 'kg',
      carbonEmission: 2,
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      user: userId
    }
  ];
  
  const wasteEntries = [
    {
      entryType: 'waste',
      description: 'Household waste',
      quantity: 2,
      unit: 'kg',
      carbonEmission: 1,
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      user: userId
    }
  ];
  
  const waterEntries = [
    {
      entryType: 'water',
      description: 'Shower water usage',
      quantity: 100,
      unit: 'L',
      carbonEmission: 0.1,
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      user: userId
    }
  ];
  
  return [...transportationEntries, ...energyEntries, ...foodEntries, ...wasteEntries, ...waterEntries];
};

// Sample products
const products = [
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

// Seed data function
const seedData = async () => {
  try {
    // Connect to database
    await connectDB();
    
    // Clear existing data
    await User.deleteMany({});
    await Idea.deleteMany({});
    await CarbonFootprint.deleteMany({});
    await Product.deleteMany({});
    
    console.log('Cleared existing data');
    
    // Create users
    const createdUsers = [];
    for (const user of users) {
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(user.password, salt);
      
      const newUser = await User.create({
        ...user,
        password: hashedPassword
      });
      
      createdUsers.push(newUser);
    }
    
    console.log(`Created ${createdUsers.length} users`);
    
    // Create ideas (associated with first user)
    const createdIdeas = [];
    for (const idea of ideas) {
      const newIdea = await Idea.create({
        ...idea,
        user: createdUsers[0]._id
      });
      
      createdIdeas.push(newIdea);
    }
    
    console.log(`Created ${createdIdeas.length} ideas`);
    
    // Create carbon footprints for each user
    for (const user of createdUsers) {
      const entries = createCarbonEntries(user._id);
      
      const carbonFootprint = await CarbonFootprint.create({
        user: user._id,
        entries,
        monthlyGoal: 200
      });
      
      // Update user with carbon footprint reference
      await User.findByIdAndUpdate(user._id, {
        carbonFootprint: carbonFootprint._id
      });
    }
    
    console.log(`Created carbon footprints for ${createdUsers.length} users`);
    
    // Create products (associated with admin user)
    const createdProducts = [];
    for (const product of products) {
      const newProduct = await Product.create({
        ...product,
        user: createdUsers[0]._id
      });
      
      createdProducts.push(newProduct);
    }
    
    console.log(`Created ${createdProducts.length} products`);
    
    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error(`Error seeding database: ${error.message}`);
    process.exit(1);
  }
};

// Run the seed function
seedData();