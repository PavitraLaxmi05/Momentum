// Wisdom Bot Controller
const { getWisdomResponse } = require('../services/wisdomBot.service');

// POST /api/wisdom/chat
exports.chat = async (req, res, next) => {
  try {
    const { message } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ success: false, error: 'Message is required.' });
    }
    const wisdom = await getWisdomResponse(message);
    res.json({ success: true, wisdom });
  } catch (err) {
    next(err);
  }
};

// GET /api/wisdom/session
exports.getSession = (req, res) => {
  res.json({ success: true, session: req.sessionID });
};

// POST /api/wisdom/feedback
exports.feedback = (req, res) => {
  // Store feedback (could be extended to save in DB)
  const { feedback } = req.body;
  if (!feedback) {
    return res.status(400).json({ success: false, error: 'Feedback is required.' });
  }
  // For now, just acknowledge
  res.json({ success: true, message: 'Thank you for your feedback!' });
};

// GET /api/wisdom/history
exports.history = (req, res) => {
  // For demo, return empty history
  res.json({ success: true, history: [] });
};
