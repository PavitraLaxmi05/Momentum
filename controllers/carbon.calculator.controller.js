/**
 * Carbon Calculator Controller
 * Handles carbon footprint calculation from bill uploads and manual inputs
 */
const path = require('path');
const axios = require('axios');
const User = require('../models/user.model');
const CarbonFootprint = require('../models/carbon.model').CarbonFootprint;
const { extractDataFromBill } = require('./carbon.ocr');
const { calculateEmissions, generateRecommendations, analyzeHistoricalData } = require('./carbon.calculator');

/**
 * Calculate carbon footprint from uploaded bill or manual inputs
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.calculateCarbonFootprint = async (req, res) => {
  try {
    // Initialize input data
    let inputData = {
      electricity: parseFloat(req.body.electricity) || 0,
      natural_gas: parseFloat(req.body.natural_gas) || 0,
      water: parseFloat(req.body.water) || 0,
      waste: parseFloat(req.body.waste) || 0,
      transportation: parseFloat(req.body.transportation) || 0,
      household_size: parseInt(req.body.household_size) || 1,
      region: req.body.region || 'Other'
    };

    // Process bill upload if present
    if (req.file) {
      const filePath = path.join(__dirname, '..', req.file.path);
      const extractedData = await extractDataFromBill(filePath);
      
      if (extractedData.success) {
        // If OCR was successful, use the extracted electricity value
        inputData.electricity = extractedData.electricity;
        console.log(`Successfully extracted electricity usage: ${extractedData.electricity} kWh`);
      } else {
        console.log('OCR extraction failed, using manual inputs');
      }
    }

    // Calculate emissions
    const emissionResults = calculateEmissions(inputData);
    
    // Get user's historical data for ML analysis
    let mlInsights = [];
    if (req.user) {
      const user = await User.findById(req.user._id).populate('carbonFootprint');
      if (user && user.carbonFootprint) {
        // Analyze historical data if available
        const historicalData = await CarbonFootprint.findById(user.carbonFootprint);
        if (historicalData && historicalData.entries && historicalData.entries.length > 0) {
          const mlResults = analyzeHistoricalData(historicalData.entries, inputData);
          mlInsights = mlResults.insights;
        }
      }
    }

    // Generate recommendations
    const recommendations = generateRecommendations(emissionResults);
    
    // Add ML insights to recommendations if available
    if (mlInsights.length > 0) {
      recommendations.mlInsights = mlInsights;
    }

    // Check if energy is a high emission category and add NREL API data if needed
    if (emissionResults.categoryEmissions.energy > 3) { // Threshold for "high" energy usage
      try {
        // Get EV charging stations from NREL API
        const nrelApiKey = process.env.NREL_API_KEY;
        if (nrelApiKey) {
          const nrelResponse = await axios.get(
            `https://developer.nrel.gov/api/alt-fuel-stations/v1/nearest.json?api_key=${nrelApiKey}&fuel_type=ELEC&limit=3`
          );
          
          if (nrelResponse.data && nrelResponse.data.fuel_stations) {
            const stations = nrelResponse.data.fuel_stations;
            const stationInfo = stations.map(station => {
              return `EV Station: ${station.station_name} at ${station.street_address}`;
            });
            
            recommendations.push(
              "Consider switching to an electric vehicle. Nearby charging stations:",
              ...stationInfo
            );
          }
        }
      } catch (nrelError) {
        console.error('Error fetching NREL data:', nrelError);
      }
    }

    // Return the results
    res.status(200).json({
      success: true,
      totalEmission: emissionResults.totalEmission,
      categoryEmissions: emissionResults.categoryEmissions,
      chartData: emissionResults.chartData,
      comparison: emissionResults.comparison,
      recommendations: recommendations,
      entries: {
        energy: emissionResults.categoryEmissions.energy,
        transportation: emissionResults.categoryEmissions.transportation,
        waste: emissionResults.categoryEmissions.waste,
        water: emissionResults.categoryEmissions.water
      }
    });

  } catch (error) {
    console.error('Error calculating carbon footprint:', error);
    res.status(500).json({
      success: false,
      message: 'Error calculating carbon footprint',
      error: error.message
    });
  }
};