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

// Security middleware
app.use(helmet());

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
app.use(mongoSanitize({
  replaceWith: '_',
  onSanitize: ({ req, key }) => {
    console.warn(`This request[${key}] is sanitized`, req.originalUrl);
  }
}));

app.use(fileUpload({
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max file size
  useTempFiles: true,
  tempFileDir: '/tmp/'
}));

// Serve static files
app.use(express.static(path.join(__dirname, '/')));

// Import routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const ideaRoutes = require('./routes/idea.routes');
const carbonRoutes = require('./routes/carbon.routes');
const ecobotRoutes = require('./routes/ecobot.routes');
const productRoutes = require('./routes/product.routes');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/ideas', ideaRoutes);
app.use('/api/carbon', carbonRoutes);
app.use('/api/ecobot', ecobotRoutes);
app.use('/api/products', productRoutes);

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