const mongoose = require('mongoose');

const tradeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  username: { type: String, required: true, trim: true },
  offering: { type: String, required: true, trim: true, maxlength: 300 },
  seeking: { type: String, required: true, trim: true, maxlength: 300 },
  category: {
    type: String,
    required: true,
    enum: [
      'saving-water',
      'saving-electricity',
      'planting-trees',
      'recycling-waste',
      'reusing-plastic'
    ]
  },
  ckcPoints: { type: Number, default: 10, min: 0 }
}, { timestamps: true, collection: 'trades' });

tradeSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Trade', tradeSchema);


