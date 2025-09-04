// Main server file for Momentum platform
// Load environment variables from .env file
require('dotenv').config();

// Important environment variables that should be set:
// - PORT: Server port (default: 3000)
// - MONGODB_URI: MongoDB connection string
// - JWT_SECRET: Secret for JWT token generation
// - OPENAI_API_KEY: OpenAI API key for AI features
// - CLARIFAI_API_KEY: Clarifai API key for image analysis
// - NREL_API_KEY: NREL API key for energy data
// - CORS_ORIGIN: Allowed origins for CORS (default: '*')

// SECURITY NOTE: The following dependencies have known vulnerabilities and should be updated:
// - axios: Vulnerable to CSRF and SSRF attacks
// - protobufjs: Vulnerable to prototype pollution
// - semver: Vulnerable to ReDoS
// Run 'npm audit fix --force' to address these issues (may include breaking changes)
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fileUpload = require('express-fileupload');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const { check, validationResult } = require('express-validator');
const { errorHandler } = require('./middleware/error.middleware');

// Create Express app
const app = express();

// Add session management
const session = require('express-session');
const uuid = require('uuid');
app.use(session({
  genid: () => uuid.v4(),
  secret: process.env.SESSION_SECRET || 'momentum_wisdom_secret',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false, httpOnly: true, maxAge: 24 * 60 * 60 * 1000 }
}));

// Add request logging
const morgan = require('morgan');
app.use(morgan('dev'));

// Add XSS protection
const xss = require('xss-clean');
app.use(xss());

// Set security HTTP headers
app.disable('x-powered-by'); // Reduce fingerprinting

// Middleware
// Configure CORS with more restrictive options
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*', // Ideally set specific origins in production
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400 // 24 hours
}));

// Security middleware with custom CSP to allow inline scripts and external resources
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "cdn.jsdelivr.net", "*.jsdelivr.net"],
      styleSrc: ["'self'", "'unsafe-inline'", "cdn.jsdelivr.net", "*.jsdelivr.net"],
      imgSrc: ["'self'", "data:", "images.unsplash.com", "*.unsplash.com", "*.tile.openstreetmap.org", "a.tile.openstreetmap.org", "b.tile.openstreetmap.org", "c.tile.openstreetmap.org", "blob:"],
      connectSrc: ["'self'", "*.openstreetmap.org"],
      fontSrc: ["'self'", "cdn.jsdelivr.net", "*.jsdelivr.net"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  // Disable Cross-Origin Embedder Policy to fix ERR_BLOCKED_BY_RESPONSE.NotSameOriginAfterDefaultedToSameOriginByCoep error
  crossOriginEmbedderPolicy: false
}));

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes'
  }
});

// Apply rate limiting to all API routes
app.use('/api', apiLimiter);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Sanitize data against NoSQL query injection
// Custom sanitization to avoid mutating req.query
app.use((req, res, next) => {
  // Sanitize body and params only
  req.body = mongoSanitize.sanitize(req.body);
  req.params = mongoSanitize.sanitize(req.params);
  // skip req.query
  next();
});



// Comment out express-fileupload as we're using multer for file uploads
// app.use(fileUpload({
//   limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max file size
//   useTempFiles: true,
//   tempFileDir: '/tmp/'
// }));

// Serve static files
app.use(express.static(path.join(__dirname, '/')));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Import routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const ideaRoutes = require('./routes/idea.routes');
const carbonRoutes = require('./routes/carbon.routes');
const ecobotRoutes = require('./routes/ecobot.routes');
const productRoutes = require('./routes/product.routes');
const tradeRoutes = require('./routes/trade.routes');
const sustainabilityRoutes = require('./routes/sustainability.routes');
const circularityRoutes = require('./routes/circularity.routes');

const wisdomBotRoutes = require('./routes/wisdomBot.routes');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/ideas', ideaRoutes);
app.use('/api/carbon', carbonRoutes);
app.use('/api/ecobot', ecobotRoutes);
app.use('/api/products', productRoutes);
app.use('/api/trades', tradeRoutes);
app.use('/api/sustainability', sustainabilityRoutes);
app.use('/api/circularity', circularityRoutes);

app.use('/api/wisdom', wisdomBotRoutes);

// Serve index.html for the root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Handle 404 errors for routes that don't exist
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`
  });
});

// Error handler middleware (should be after all routes)
app.use(errorHandler);

// Connect to MongoDB and start server
const connectDB = require('./config/db');

// Start the server
const PORT = process.env.PORT || 3000;
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    
    // Start Express server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Initialize server
startServer();