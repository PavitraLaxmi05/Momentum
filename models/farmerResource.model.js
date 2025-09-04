const mongoose = require('mongoose');

const farmerResourceSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  location: { type: String, required: true, trim: true },
  contact: { type: String, required: true, trim: true },
  resource: {
    type: String,
    required: true,
    enum: ['vegetables','fruits','grains','dairy','meat','eggs','honey','herbs','solar','compost','other']
  },
  quantity: { type: Number, required: true, min: 0 },
  points: { type: Number, default: 0, min: 0 },
  description: { type: String, trim: true, maxlength: 1000 },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true, collection: 'farmer_resources' });

farmerResourceSchema.index({ resource: 1, location: 1 });

module.exports = mongoose.model('FarmerResource', farmerResourceSchema);


