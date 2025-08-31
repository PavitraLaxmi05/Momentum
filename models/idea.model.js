const ideaSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 100 },
  description: { type: String, required: true, trim: true, maxlength: 2000 },
  category: {
    type: String,
    required: true,
    enum: ['energy', 'waste', 'transportation', 'food', 'water', 'community', 'business', 'other']
  },
  implementationCost: {
    type: String,
    enum: ['low', 'medium', 'high', 'very-high', 'unknown'],
    default: 'unknown'
  },
  timeToImplement: {
    type: String,
    enum: ['days', 'weeks', 'months', 'years', 'unknown'],
    default: 'unknown'
  },
  benefits: { type: String, required: true, trim: true, maxlength: 1000 },
  challenges: { type: String, trim: true, maxlength: 1000 },
  potentialImpact: { type: Number, min: 0, max: 10, default: 0 },
  feasibilityScore: { type: Number, min: 0, max: 10, default: 0 },
  innovationScore: { type: Number, min: 0, max: 10, default: 0 },
  overallScore: { type: Number, min: 0, max: 10, default: 0 },
  feedback: { type: String, default: '' },
  status: { type: String, enum: ['pending', 'evaluated', 'implemented'], default: 'pending' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });