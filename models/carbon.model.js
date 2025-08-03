const mongoose = require('mongoose');

const carbonEntrySchema = new mongoose.Schema({
  entryType: {
    type: String,
    required: [true, 'Entry type is required'],
    enum: ['transportation', 'energy', 'food', 'waste', 'water', 'other']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [0, 'Quantity must be a positive number']
  },
  unit: {
    type: String,
    required: [true, 'Unit is required'],
    enum: ['kg', 'km', 'kWh', 'L', 'pieces', 'hours', 'days']
  },
  carbonEmission: {
    type: Number,
    required: [true, 'Carbon emission is required'],
    min: [0, 'Carbon emission must be a positive number']
  },
  date: {
    type: Date,
    default: Date.now
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

const carbonFootprintSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  totalEmission: {
    type: Number,
    default: 0
  },
  transportationEmission: {
    type: Number,
    default: 0
  },
  energyEmission: {
    type: Number,
    default: 0
  },
  foodEmission: {
    type: Number,
    default: 0
  },
  wasteEmission: {
    type: Number,
    default: 0
  },
  waterEmission: {
    type: Number,
    default: 0
  },
  otherEmission: {
    type: Number,
    default: 0
  },
  entries: [carbonEntrySchema],
  monthlyGoal: {
    type: Number,
    default: 500 // Default monthly goal in kg CO2
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Update total emissions when entries are added or modified
carbonFootprintSchema.pre('save', function(next) {
  if (this.isModified('entries')) {
    // Reset all emission categories
    this.transportationEmission = 0;
    this.energyEmission = 0;
    this.foodEmission = 0;
    this.wasteEmission = 0;
    this.waterEmission = 0;
    this.otherEmission = 0;
    
    // Calculate emissions by category
    this.entries.forEach(entry => {
      switch (entry.entryType) {
        case 'transportation':
          this.transportationEmission += entry.carbonEmission;
          break;
        case 'energy':
          this.energyEmission += entry.carbonEmission;
          break;
        case 'food':
          this.foodEmission += entry.carbonEmission;
          break;
        case 'waste':
          this.wasteEmission += entry.carbonEmission;
          break;
        case 'water':
          this.waterEmission += entry.carbonEmission;
          break;
        case 'other':
          this.otherEmission += entry.carbonEmission;
          break;
      }
    });
    
    // Update total emission
    this.totalEmission = this.transportationEmission + 
                         this.energyEmission + 
                         this.foodEmission + 
                         this.wasteEmission + 
                         this.waterEmission + 
                         this.otherEmission;
    
    this.lastUpdated = Date.now();
  }
  next();
});

const CarbonEntry = mongoose.model('CarbonEntry', carbonEntrySchema);
const CarbonFootprint = mongoose.model('CarbonFootprint', carbonFootprintSchema);

module.exports = { CarbonEntry, CarbonFootprint };