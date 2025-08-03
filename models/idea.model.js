const mongoose = require('mongoose');

const ideaSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Idea title is required'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Idea description is required'],
    trim: true,
    maxlength: [2000, 'Description cannot be more than 2000 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'Energy Efficiency',
      'Waste Reduction',
      'Sustainable Transportation',
      'Circular Economy',
      'Renewable Energy',
      'Water Conservation',
      'Sustainable Agriculture',
      'Green Building',
      'Other'
    ]
  },
  targetAudience: {
    type: String,
    trim: true
  },
  implementationCost: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Unknown'],
    default: 'Unknown'
  },
  timeToImplement: {
    type: String,
    enum: ['Short-term', 'Medium-term', 'Long-term', 'Unknown'],
    default: 'Unknown'
  },
  potentialImpact: {
    type: Number,
    min: 0,
    max: 10,
    default: 0
  },
  feasibilityScore: {
    type: Number,
    min: 0,
    max: 10,
    default: 0
  },
  innovationScore: {
    type: Number,
    min: 0,
    max: 10,
    default: 0
  },
  overallScore: {
    type: Number,
    min: 0,
    max: 10,
    default: 0
  },
  feedback: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'evaluated', 'implemented'],
    default: 'pending'
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
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

// Calculate overall score before saving
ideaSchema.pre('save', function(next) {
  if (this.potentialImpact && this.feasibilityScore && this.innovationScore) {
    this.overallScore = ((this.potentialImpact + this.feasibilityScore + this.innovationScore) / 3).toFixed(1);
  }
  next();
});

const Idea = mongoose.model('Idea', ideaSchema);

module.exports = Idea;