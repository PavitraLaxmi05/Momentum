//carbon.controller.js
const { CarbonEntry, CarbonFootprint } = require('../models/carbon.model');
const { ErrorResponse } = require('../middleware/error.middleware');
const axios = require('axios');
const { calculateCarbonFootprint } = require('./carbon.calculator.controller');

/**
 * Get user's carbon footprint
 * @route GET /api/carbon
 * @access Private
 */
exports.getCarbonFootprint = async (req, res, next) => {
  try {
    let carbonFootprint = await CarbonFootprint.findOne({ user: req.user.id });
    
    // If no carbon footprint exists, create one
    if (!carbonFootprint) {
      carbonFootprint = await CarbonFootprint.create({
        user: req.user.id
      });
    }
    
    res.status(200).json({
      success: true,
      data: carbonFootprint
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add carbon entry
 * @route POST /api/carbon/entries
 * @access Private
 */
exports.addCarbonEntry = async (req, res, next) => {
  try {
    // Get user's carbon footprint
    let carbonFootprint = await CarbonFootprint.findOne({ user: req.user.id });
    
    // If no carbon footprint exists, create one
    if (!carbonFootprint) {
      carbonFootprint = await CarbonFootprint.create({
        user: req.user.id
      });
    }
    
    // Calculate carbon emission based on entry type and quantity
    const { entryType, description, quantity, unit } = req.body;
    let carbonEmission = 0;
    
    // Calculate carbon emission based on entry type and quantity
    // This is a simplified calculation, in a real app you would use more accurate data
    switch (entryType) {
      case 'transportation':
        if (unit === 'km') {
          // Average car emission: 0.12 kg CO2 per km
          carbonEmission = quantity * 0.12;
        }
        break;
      case 'energy':
        if (unit === 'kWh') {
          // Average electricity emission: 0.5 kg CO2 per kWh
          carbonEmission = quantity * 0.5;
        }
        break;
      case 'food':
        if (unit === 'kg') {
          // Average food emission: 2 kg CO2 per kg of food
          carbonEmission = quantity * 2;
        }
        break;
      case 'waste':
        if (unit === 'kg') {
          // Average waste emission: 0.5 kg CO2 per kg of waste
          carbonEmission = quantity * 0.5;
        }
        break;
      case 'water':
        if (unit === 'L') {
          // Average water emission: 0.001 kg CO2 per liter
          carbonEmission = quantity * 0.001;
        }
        break;
      default:
        // Default emission
        carbonEmission = quantity * 0.1;
    }
    
    // Create new entry
    const newEntry = {
      entryType,
      description,
      quantity,
      unit,
      carbonEmission,
      date: new Date(),
      user: req.user.id
    };
    
    // Add entry to carbon footprint
    carbonFootprint.entries.push(newEntry);
    await carbonFootprint.save();
    
    // Update user's carbon footprint in user model
    await req.user.updateOne({ carbonFootprint: carbonFootprint.totalEmission });
    
    res.status(201).json({
      success: true,
      data: carbonFootprint
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete carbon entry
 * @route DELETE /api/carbon/entries/:id
 * @access Private
 */
exports.deleteCarbonEntry = async (req, res, next) => {
  try {
    // Get user's carbon footprint
    const carbonFootprint = await CarbonFootprint.findOne({ user: req.user.id });
    
    if (!carbonFootprint) {
      return next(new ErrorResponse('Carbon footprint not found', 404));
    }
    
    // Find entry index
    const entryIndex = carbonFootprint.entries.findIndex(
      entry => entry._id.toString() === req.params.id
    );
    
    if (entryIndex === -1) {
      return next(new ErrorResponse('Entry not found', 404));
    }
    
    // Remove entry
    carbonFootprint.entries.splice(entryIndex, 1);
    await carbonFootprint.save();
    
    // Update user's carbon footprint in user model
    await req.user.updateOne({ carbonFootprint: carbonFootprint.totalEmission });
    
    res.status(200).json({
      success: true,
      data: carbonFootprint
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get carbon reduction tips
 * @route GET /api/carbon/tips
 * @access Private
 */
exports.getCarbonTips = async (req, res, next) => {
  try {
    // Get user's carbon footprint
    const carbonFootprint = await CarbonFootprint.findOne({ user: req.user.id });
    
    if (!carbonFootprint) {
      return next(new ErrorResponse('Carbon footprint not found', 404));
    }
    
    // Determine which category has the highest emissions
    const categories = [
      { name: 'transportation', value: carbonFootprint.transportationEmission },
      { name: 'energy', value: carbonFootprint.energyEmission },
      { name: 'food', value: carbonFootprint.foodEmission },
      { name: 'waste', value: carbonFootprint.wasteEmission },
      { name: 'water', value: carbonFootprint.waterEmission }
    ];
    
    // Sort categories by emission value (highest first)
    categories.sort((a, b) => b.value - a.value);
    
    // Get tips for the top 2 categories
    const tips = [];
    
    // Transportation tips
    if (categories[0].name === 'transportation' || categories[1].name === 'transportation') {
      tips.push(
        'Use public transportation instead of driving alone',
        'Consider carpooling or ridesharing',
        'Walk or bike for short distances',
        'Maintain your vehicle properly for better fuel efficiency',
        'Consider switching to an electric or hybrid vehicle'
      );
    }
    
    // Energy tips
    if (categories[0].name === 'energy' || categories[1].name === 'energy') {
      tips.push(
        'Switch to LED light bulbs',
        'Unplug electronics when not in use',
        'Use a programmable thermostat',
        'Wash clothes in cold water',
        'Consider installing solar panels'
      );
    }
    
    // Food tips
    if (categories[0].name === 'food' || categories[1].name === 'food') {
      tips.push(
        'Reduce meat consumption',
        'Buy local and seasonal produce',
        'Reduce food waste',
        'Grow your own vegetables',
        'Choose organic and sustainably produced food'
      );
    }
    
    // Waste tips
    if (categories[0].name === 'waste' || categories[1].name === 'waste') {
      tips.push(
        'Recycle properly',
        'Compost food scraps',
        'Reduce single-use plastics',
        'Buy products with less packaging',
        'Repair items instead of replacing them'
      );
    }
    
    // Water tips
    if (categories[0].name === 'water' || categories[1].name === 'water') {
      tips.push(
        'Fix leaky faucets',
        'Take shorter showers',
        'Install water-efficient fixtures',
        'Collect rainwater for gardening',
        'Only run full loads in dishwasher and washing machine'
      );
    }
    
    // If no specific category has high emissions, provide general tips
    if (tips.length === 0) {
      tips.push(
        'Use reusable bags, bottles, and containers',
        'Choose energy-efficient appliances',
        'Support sustainable businesses',
        'Educate yourself about sustainability',
        'Participate in community environmental initiatives'
      );
    }
    
    res.status(200).json({
      success: true,
      data: {
        highestCategory: categories[0].name,
        tips
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get NREL energy data
 * @route GET /api/carbon/energy-data
 * @access Private
 */
exports.getEnergyData = async (req, res, next) => {
  try {
    // Get energy data from NREL API
    const response = await axios.get(
      'https://developer.nrel.gov/api/alt-fuel-stations/v1.json',
      {
        params: {
          api_key: process.env.NREL_API_KEY,
          fuel_type: 'ELEC',
          status: 'E',
          limit: 10
        }
      }
    );
    
    res.status(200).json({
      success: true,
      data: response.data
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Set monthly carbon goal
 * @route PUT /api/carbon/goal
 * @access Private
 */
exports.setMonthlyGoal = async (req, res, next) => {
  try {
    const { monthlyGoal } = req.body;
    
    if (!monthlyGoal || monthlyGoal <= 0) {
      return next(new ErrorResponse('Please provide a valid monthly goal', 400));
    }
    
    // Get user's carbon footprint
    let carbonFootprint = await CarbonFootprint.findOne({ user: req.user.id });
    
    // If no carbon footprint exists, create one
    if (!carbonFootprint) {
      carbonFootprint = await CarbonFootprint.create({
        user: req.user.id,
        monthlyGoal
      });
    } else {
      // Update monthly goal
      carbonFootprint.monthlyGoal = monthlyGoal;
      await carbonFootprint.save();
    }
    
    res.status(200).json({
      success: true,
      data: carbonFootprint
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCarbonFootprint: exports.getCarbonFootprint,
  addCarbonEntry: exports.addCarbonEntry,
  deleteCarbonEntry: exports.deleteCarbonEntry,
  getCarbonTips: exports.getCarbonTips,
  getEnergyData: exports.getEnergyData,
  setMonthlyGoal: exports.setMonthlyGoal,
  calculateCarbonFootprint
};