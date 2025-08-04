const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const chatController = require('./controllers/chatController');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const logger = require('./utils/logger');

class BankGPTApp {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3000;
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  setupMiddleware() {
    // Security middleware
    this.app.use(helmet());
    
    // CORS configuration
    this.app.use(cors({
      origin: process.env.CORS_ORIGIN || 'http://localhost:8080',
      credentials: true
    }));

    // Compression
    this.app.use(compression());

    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true }));

    // Rate limiting
    const limiter = rateLimit({
      windowMs: 1 * 60 * 1000, // 1 minute
      max: parseInt(process.env.RATE_LIMIT_REQUESTS_PER_MINUTE) || 60,
      message: {
        error: 'Too many requests from this IP, please try again later.',
        retryAfter: '1 minute'
      },
      standardHeaders: true,
      legacyHeaders: false,
    });
    this.app.use('/api/', limiter);

    // Request logging
    this.app.use((req, res, next) => {
      logger.info(`${req.method} ${req.path}`, {
        ip: req.ip,
        userAgent: req.get('user-agent'),
        timestamp: new Date().toISOString()
      });
      next();
    });
  }

  setupRoutes() {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV
      });
    });

    // API routes
    this.app.use('/api/chat', chatController);

    // Root route
    this.app.get('/', (req, res) => {
      res.json({
        name: 'BankGPT Backend API',
        version: '1.0.0',
        description: 'AI-powered banking advisor backend service',
        endpoints: {
          health: '/health',
          chat: '/api/chat'
        }
      });
    });
  }

  setupErrorHandling() {
    // 404 handler
    this.app.use(notFoundHandler);

    // Global error handler
    this.app.use(errorHandler);
  }

  async start() {
    try {
      // Initialize services
      await this.initializeServices();

      // Start server
      this.app.listen(this.port, () => {
        logger.info(`BankGPT Backend started on port ${this.port}`, {
          environment: process.env.NODE_ENV,
          port: this.port
        });
      });
    } catch (error) {
      logger.error('Failed to start server:', error);
      process.exit(1);
    }
  }

  async initializeServices() {
    // Initialize database connections, cache, etc.
    logger.info('Initializing services...');
    
    // Add service initialization here
    // await databaseService.connect();
    // await cacheService.connect();
    
    logger.info('Services initialized successfully');
  }
}

// Create and start the application
const app = new BankGPTApp();

if (require.main === module) {
  app.start();
}

module.exports = app;