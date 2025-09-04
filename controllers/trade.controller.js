const Trade = require('../models/trade.model');
const User = require('../models/user.model');

exports.createTrade = async (req, res, next) => {
  try {
    const { offering, seeking, category } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId).select('username sustainabilityScore');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const trade = await Trade.create({
      user: userId,
      username: user.username,
      offering,
      seeking,
      category,
      ckcPoints: 10
    });

    // Increment user's CKC points by 10
    user.sustainabilityScore = (user.sustainabilityScore || 0) + 10;
    await user.save();

    res.status(201).json({ success: true, data: {
      trade,
      updatedUser: { id: user._id, sustainabilityScore: user.sustainabilityScore }
    }});
  } catch (err) {
    next(err);
  }
};

exports.listTrades = async (req, res, next) => {
  try {
    const trades = await Trade.find().sort({ createdAt: -1 }).lean();
    res.status(200).json({ success: true, count: trades.length, data: trades });
  } catch (err) {
    next(err);
  }
};

exports.clearLeaderboard = async (req, res, next) => {
  try {
    // remove all trades
    await Trade.deleteMany({});
    res.status(200).json({ success: true, message: 'Leaderboard cleared' });
  } catch (err) {
    next(err);
  }
};


