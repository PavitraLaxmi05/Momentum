const mongoose = require('mongoose');

const communityNeedSchema = new mongoose.Schema({
  representativeName: { type: String, required: true, trim: true },
  communityName: { type: String, required: true, trim: true },
  location: { type: String, required: true, trim: true },
  contact: { type: String, required: true, trim: true },
  need: {
    type: String,
    required: true,
    enum: ['vegetables','fruits','grains','dairy','meat','eggs','fertilizers','solar','water','education','other']
  },
  quantity: { type: Number, required: true, min: 0 },
  points: { type: Number, default: 0, min: 0 },
  description: { type: String, trim: true, maxlength: 1000 },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true, collection: 'community_needs' });

communityNeedSchema.index({ need: 1, location: 1 });

module.exports = mongoose.model('CommunityNeed', communityNeedSchema);


