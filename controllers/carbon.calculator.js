/**
 * Carbon Calculator Module
 * Provides utility functions for carbon footprint calculations
 */

/**
 * Calculate annual CO2e emissions based on household inputs
 * @param {Object} data - Household usage data
 * @param {number} data.electricity - Electricity usage in kWh/month
 * @param {number} data.naturalGas - Natural gas usage in therms/month
 * @param {number} data.water - Water usage in gallons/month
 * @param {number} data.waste - Waste production in lbs/week
 * @param {number} data.transportation - Transportation in miles/week
 * @param {number} data.householdSize - Number of people in household
 * @param {string} data.region - Geographic region
 * @returns {Object} Calculated emissions data
 */
exports.calculateEmissions = (data) => {
  // Define emission factors
  const FACTORS = {
    // lbs CO2 per kWh
    ELECTRICITY: 0.92,
    // lbs CO2 per therm
    NATURAL_GAS: 11.7,
    // lbs CO2 per gallon
    WATER: 0.008,
    // lbs CO2 per lb of waste
    WASTE: 1.9,
    // lbs CO2 per mile (assuming 25 mpg average)
    TRANSPORTATION: 19.6 / 25
  };

  // Define regional adjustment factors
  const REGION_FACTORS = {
    northeast: 1.1,
    midwest: 1.2,
    south: 0.9,
    west: 1.0,
    pacific: 0.8,
    other: 1.0
  };

  // Define regional averages (tons CO2e/year)
  const REGION_AVERAGES = {
    northeast: 10,
    midwest: 12,
    south: 11,
    west: 9,
    pacific: 8,
    other: 10
  };

  // Calculate emissions in tons CO2e/year
  // Convert from lbs to metric tons (1 metric ton = 2204.62 lbs)
  const electricityEmission = data.electricity * FACTORS.ELECTRICITY * 12 / 2204.62;
  const naturalGasEmission = data.naturalGas * FACTORS.NATURAL_GAS * 12 / 2204.62;
  const waterEmission = data.water * FACTORS.WATER * 12 / 2204.62;
  const wasteEmission = data.waste * FACTORS.WASTE * 52 / 2204.62;
  const transportationEmission = data.transportation * FACTORS.TRANSPORTATION * 52 / 2204.62;

  // Apply regional adjustment factor
  const regionFactor = REGION_FACTORS[data.region] || REGION_FACTORS.other;
  
  // Calculate total emissions
  const energyEmission = (electricityEmission + naturalGasEmission) * regionFactor;
  const adjustedWaterEmission = waterEmission * regionFactor;
  const adjustedWasteEmission = wasteEmission * regionFactor;
  const adjustedTransportationEmission = transportationEmission * regionFactor;
  
  // Calculate total emissions
  const totalEmission = energyEmission + adjustedWaterEmission + 
                        adjustedWasteEmission + adjustedTransportationEmission;
  
  // Calculate per-person emissions if household size > 1
  const perPersonEmission = data.householdSize > 1 ? 
    totalEmission / data.householdSize : totalEmission;

  // Compare to regional average
  const regionalAverage = REGION_AVERAGES[data.region] || REGION_AVERAGES.other;
  let comparison = "Average";
  let comparisonPercentage = 0;
  
  // Calculate percentage difference from regional average
  comparisonPercentage = ((totalEmission - regionalAverage) / regionalAverage) * 100;
  
  // Determine comparison category
  if (comparisonPercentage < -10) {
    comparison = "Better";
  } else if (comparisonPercentage > 10) {
    comparison = "Worse";
  } else {
    comparison = "Average";
  }

  // Prepare chart data
  const chartData = {
    labels: ['Energy', 'Transportation', 'Waste', 'Water'],
    data: [
      parseFloat(energyEmission.toFixed(2)),
      parseFloat(adjustedTransportationEmission.toFixed(2)),
      parseFloat(adjustedWasteEmission.toFixed(2)),
      parseFloat(adjustedWaterEmission.toFixed(2))
    ]
  };

  return {
    totalEmission: parseFloat(totalEmission.toFixed(2)),
    perPersonEmission: parseFloat(perPersonEmission.toFixed(2)),
    energyEmission: parseFloat(energyEmission.toFixed(2)),
    transportationEmission: parseFloat(adjustedTransportationEmission.toFixed(2)),
    wasteEmission: parseFloat(adjustedWasteEmission.toFixed(2)),
    waterEmission: parseFloat(adjustedWaterEmission.toFixed(2)),
    comparison,
    comparisonPercentage: parseFloat(comparisonPercentage.toFixed(1)),
    regionalAverage,
    chartData
  };
};

/**
 * Generate personalized recommendations based on emissions data
 * @param {Object} emissionsData - Calculated emissions data
 * @returns {Array} Array of recommendation strings
 */
exports.generateRecommendations = (emissionsData) => {
  const recommendations = [];
  
  // Sort emission categories from highest to lowest
  const categories = [
    { name: 'energy', value: emissionsData.energyEmission },
    { name: 'transportation', value: emissionsData.transportationEmission },
    { name: 'waste', value: emissionsData.wasteEmission },
    { name: 'water', value: emissionsData.waterEmission }
  ].sort((a, b) => b.value - a.value);
  
  // Generate recommendations for the highest emission category
  const highestCategory = categories[0].name;
  
  // Add general recommendation based on comparison
  if (emissionsData.comparison === "Worse") {
    recommendations.push(
      `Your carbon footprint is ${Math.abs(emissionsData.comparisonPercentage).toFixed(0)}% higher than the average in your region. Focus on reducing your ${highestCategory} usage for the biggest impact.`
    );
  } else if (emissionsData.comparison === "Better") {
    recommendations.push(
      `Great job! Your carbon footprint is ${Math.abs(emissionsData.comparisonPercentage).toFixed(0)}% lower than the average in your region. You can still improve by focusing on ${highestCategory}.`
    );
  } else {
    recommendations.push(
      `Your carbon footprint is about average for your region. You can make the biggest impact by reducing your ${highestCategory} usage.`
    );
  }
  
  // Add specific recommendations based on highest categories
  if (highestCategory === 'energy') {
    recommendations.push(
      "Switch to LED light bulbs to reduce electricity usage by up to 75%.",
      "Install a programmable thermostat to optimize heating and cooling.",
      "Consider switching to renewable energy through your utility provider.",
      "Seal air leaks around windows and doors to improve energy efficiency."
    );
  } else if (highestCategory === 'transportation') {
    recommendations.push(
      "Consider carpooling or using public transportation when possible.",
      "Combine errands to reduce the number of trips you take.",
      "Consider an electric or hybrid vehicle for your next car purchase.",
      "Maintain proper tire pressure to improve fuel efficiency."
    );
  } else if (highestCategory === 'waste') {
    recommendations.push(
      "Start composting food scraps to reduce landfill waste.",
      "Recycle properly and learn what materials are accepted in your area.",
      "Reduce single-use plastics by using reusable alternatives.",
      "Buy products with minimal packaging or bulk items."
    );
  } else if (highestCategory === 'water') {
    recommendations.push(
      "Fix leaky faucets and toilets promptly.",
      "Install low-flow showerheads and faucet aerators.",
      "Collect rainwater for garden irrigation.",
      "Run dishwashers and washing machines only when full."
    );
  }
  
  return recommendations;
};

/**
 * Analyze historical bill data for anomalies and forecasting
 * @param {Array} historicalData - Array of previous bill data
 * @param {Object} currentData - Current bill data
 * @returns {Object} Analysis results with insights and forecasts
 */
exports.analyzeHistoricalData = (historicalData, currentData) => {
  // If no historical data, return basic message
  if (!historicalData || historicalData.length === 0) {
    return {
      hasAnomaly: false,
      forecast: null,
      insights: ["Start tracking your usage over time to receive personalized insights and forecasts."]
    };
  }
  
  const insights = [];
  let hasAnomaly = false;
  let forecast = null;
  
  // Simple anomaly detection - check if current usage is significantly higher than average
  const electricityHistory = historicalData.map(entry => entry.electricity || 0);
  const avgElectricity = electricityHistory.reduce((sum, val) => sum + val, 0) / electricityHistory.length;
  
  // Check for anomalies (>20% increase)
  if (currentData.electricity > avgElectricity * 1.2) {
    hasAnomaly = true;
    const percentIncrease = ((currentData.electricity - avgElectricity) / avgElectricity * 100).toFixed(0);
    insights.push(
      `Your electricity usage is ${percentIncrease}% higher than your historical average. Check for appliances that might be using more energy than usual.`
    );
  }
  
  // Simple forecasting - linear trend
  if (historicalData.length >= 3) {
    // Use last 3 months to predict trend
    const recent = historicalData.slice(-3);
    const trend = (recent[2].electricity - recent[0].electricity) / 2;
    
    // Forecast next month
    const nextMonth = currentData.electricity + trend;
    forecast = {
      nextMonth: parseFloat(nextMonth.toFixed(2)),
      trend: trend > 0 ? 'increasing' : 'decreasing',
      percentChange: parseFloat((Math.abs(trend) / currentData.electricity * 100).toFixed(1))
    };
    
    // Add insight based on forecast
    if (trend > 0) {
      insights.push(
        `Your electricity usage is trending upward. At this rate, expect about ${forecast.percentChange}% higher usage next month.`
      );
    } else {
      insights.push(
        `Good job! Your electricity usage is trending downward. At this rate, expect about ${forecast.percentChange}% lower usage next month.`
      );
    }
  }
  
  // Add cost-saving insight if we have an anomaly
  if (hasAnomaly) {
    // Assume $0.15 per kWh for cost calculation
    const excessUsage = currentData.electricity - avgElectricity;
    const estimatedSavings = (excessUsage * 0.15).toFixed(2);
    
    insights.push(
      `Reducing your electricity to your usual levels could save approximately $${estimatedSavings} on your next bill.`
    );
  }
  
  return {
    hasAnomaly,
    forecast,
    insights
  };
};