const mongoose = require('mongoose');

const IdeaSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  category: {
    type: String,
    required: [true, 'Please select a category'],
    enum: ['energy', 'waste', 'water', 'transportation', 'food', 'community', 'business', 'other']
  },
  implementationCost: {
    type: String,
    required: [true, 'Please select an implementation cost'],
    enum: ['low', 'medium', 'high', 'very-high', 'unknown']
  },
  timeToImplement: {
    type: String,
    required: [true, 'Please select an implementation time'],
    enum: ['days', 'weeks', 'months', 'years', 'unknown']
  },
  benefits: {
    type: String,
    required: [true, 'Please add benefits'],
    maxlength: [500, 'Benefits cannot be more than 500 characters']
  },
  challenges: {
    type: String,
    maxlength: [500, 'Challenges cannot be more than 500 characters']
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  potentialImpact: {
    type: Number,
    min: [0, 'Impact score must be between 0 and 10'],
    max: [10, 'Impact score must be between 0 and 10']
  },
  feasibilityScore: {
    type: Number,
    min: [0, 'Feasibility score must be between 0 and 10'],
    max: [10, 'Feasibility score must be between 0 and 10']
  },
  innovationScore: {
    type: Number,
    min: [0, 'Innovation score must be between 0 and 10'],
    max: [10, 'Innovation score must be between 0 and 10']
  },
  feedback: {
    type: String,
    maxlength: [1000, 'Feedback cannot be more than 1000 characters']
  },
  status: {
    type: String,
    enum: ['pending', 'evaluated'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Idea', IdeaSchema);