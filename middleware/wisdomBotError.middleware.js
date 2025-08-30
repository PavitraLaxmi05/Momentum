// Wisdom Bot Error Handling Middleware
module.exports = (err, req, res, next) => {
  console.error('Wisdom Bot Error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error',
    advice: 'If this persists, please try again later or contact support.'
  });
};
