const jwt = require('jsonwebtoken');
const { ErrorResponse } = require('./error.middleware');

/**
 * Authentication middleware to verify JWT token
 * @description Verifies JWT token and attaches decoded user data to req.user
 */
const protect = async (req, res, next) => {
  let token;

  // Check for token in Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
    console.log('Authorization header found. Extracted token:', token);
  } else {
    console.warn('Authorization header missing or malformed');
  }

  if (!token) {
    console.error('No token provided, authorization denied');
    return next(new ErrorResponse('No token provided, authorization denied', 401));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token verified successfully. Decoded payload:', decoded);
    req.user = decoded; // { id: userId, role: userRole }
    next();
  } catch (error) {
    console.error('JWT verification error:', error.message);
    return next(new ErrorResponse('Invalid token, authorization denied', 401));
  }
};

/**
 * Role-based authorization middleware
 * @param {...String} roles - Roles allowed to access the route
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ErrorResponse('Not authorized to access this route', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(new ErrorResponse(`User role ${req.user.role} is not authorized to access this route`, 403));
    }

    next();
  };
};

module.exports = { protect, authorize };