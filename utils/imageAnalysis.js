const { ClarifaiStub, grpc } = require('clarifai-nodejs-grpc');

// Initialize Clarifai
const stub = ClarifaiStub.grpc();
const metadata = new grpc.Metadata();
metadata.set('authorization', `Key ${process.env.CLARIFAI_API_KEY}`);

/**
 * Analyze image using Clarifai's general model
 * @param {string} imageUrl - URL of the image to analyze
 * @returns {Promise<Array>} - Array of concepts detected in the image
 */
const analyzeImage = async (imageUrl) => {
  return new Promise((resolve, reject) => {
    stub.PostModelOutputs(
      {
        model_id: 'general-image-recognition',
        inputs: [{ data: { image: { url: imageUrl } } }]
      },
      metadata,
      (err, response) => {
        if (err) {
          reject(`Error: ${err}`);
          return;
        }

        if (response.status.code !== 10000) {
          reject(`Received failed status: ${response.status.description}`);
          return;
        }

        // Get concepts (objects detected in the image)
        const concepts = response.outputs[0].data.concepts;
        resolve(concepts);
      }
    );
  });
};

/**
 * Check if an image contains sustainable items
 * @param {string} imageUrl - URL of the image to analyze
 * @returns {Promise<Object>} - Sustainability analysis results
 */
const analyzeSustainability = async (imageUrl) => {
  try {
    const concepts = await analyzeImage(imageUrl);
    
    // List of sustainable items to check for
    const sustainableItems = [
      'recycling', 'solar', 'renewable', 'organic', 'bamboo',
      'bicycle', 'plant', 'garden', 'compost', 'reusable',
      'electric vehicle', 'solar panel', 'wind turbine', 'green'
    ];
    
    // List of unsustainable items to check for
    const unsustainableItems = [
      'plastic', 'disposable', 'styrofoam', 'gasoline', 'coal',
      'oil', 'pollution', 'waste', 'trash', 'garbage'
    ];
    
    // Check for sustainable and unsustainable items
    const foundSustainable = [];
    const foundUnsustainable = [];
    
    concepts.forEach(concept => {
      const name = concept.name.toLowerCase();
      const value = concept.value;
      
      // Only consider concepts with confidence > 0.5
      if (value > 0.5) {
        // Check if concept matches any sustainable item
        sustainableItems.forEach(item => {
          if (name.includes(item)) {
            foundSustainable.push({
              name: concept.name,
              confidence: value
            });
          }
        });
        
        // Check if concept matches any unsustainable item
        unsustainableItems.forEach(item => {
          if (name.includes(item)) {
            foundUnsustainable.push({
              name: concept.name,
              confidence: value
            });
          }
        });
      }
    });
    
    // Calculate sustainability score (0-100)
    let sustainabilityScore = 50; // Neutral starting point
    
    // Add points for sustainable items
    sustainabilityScore += foundSustainable.length * 10;
    
    // Subtract points for unsustainable items
    sustainabilityScore -= foundUnsustainable.length * 10;
    
    // Ensure score is within 0-100 range
    sustainabilityScore = Math.max(0, Math.min(100, sustainabilityScore));
    
    return {
      sustainabilityScore,
      sustainableItems: foundSustainable,
      unsustainableItems: foundUnsustainable,
      allConcepts: concepts.slice(0, 10) // Return top 10 concepts
    };
  } catch (error) {
    throw new Error(`Error analyzing image: ${error}`);
  }
};

module.exports = {
  analyzeImage,
  analyzeSustainability
};