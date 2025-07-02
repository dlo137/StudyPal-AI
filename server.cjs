const express = require('express');
const Stripe = require('stripe');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
require('dotenv').config({ path: '.env.local' });

// Environment validation
const requiredEnvVars = ['STRIPE_SECRET_KEY'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 payment requests per windowMs
  message: 'Too many payment requests from this IP, please try again later.',
});

app.use(limiter);

// CORS configuration
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
  credentials: true,
}));

// Middleware for parsing JSON (except for webhooks)
app.use((req, res, next) => {
  if (req.originalUrl === '/webhook') {
    next();
  } else {
    express.json({ limit: '10mb' })(req, res, next);
  }
});

// Input validation helper
function validateCreatePaymentRequest(body) {
  const { amount, currency, planType } = body;
  
  if (!amount || typeof amount !== 'number' || amount <= 0) {
    return 'Invalid amount';
  }
  
  if (!currency || typeof currency !== 'string') {
    return 'Invalid currency';
  }
  
  if (!planType || !['gold', 'diamond'].includes(planType)) {
    return 'Invalid plan type';
  }
  
  return null;
}

// Create payment intent endpoint
app.post('/api/create-payment-intent', paymentLimiter, async (req, res) => {
  try {
    console.log('Creating payment intent for:', req.body);
    
    // Validate request body
    const validationError = validateCreatePaymentRequest(req.body);
    if (validationError) {
      return res.status(400).json({ 
        error: validationError,
        code: 'VALIDATION_ERROR'
      });
    }

    const { amount, currency, planType, userEmail, userId } = req.body;

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: currency,
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        planType,
        userEmail: userEmail || 'unknown',
        userId: userId || 'unknown',
      },
    });

    console.log('Payment intent created:', paymentIntent.id);

    res.json({
      client_secret: paymentIntent.client_secret,
      id: paymentIntent.id,
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    
    // Handle specific Stripe errors
    if (error.type === 'StripeCardError') {
      res.status(400).json({ 
        error: 'Your card was declined.',
        code: 'CARD_DECLINED'
      });
    } else if (error.type === 'StripeRateLimitError') {
      res.status(429).json({ 
        error: 'Too many requests made to the API too quickly.',
        code: 'RATE_LIMIT'
      });
    } else if (error.type === 'StripeInvalidRequestError') {
      res.status(400).json({ 
        error: 'Invalid parameters were supplied to Stripe\'s API.',
        code: 'INVALID_REQUEST'
      });
    } else if (error.type === 'StripeAPIError') {
      res.status(500).json({ 
        error: 'An error occurred internally with Stripe\'s API.',
        code: 'STRIPE_API_ERROR'
      });
    } else if (error.type === 'StripeConnectionError') {
      res.status(502).json({ 
        error: 'Some kind of error occurred during the HTTPS communication.',
        code: 'CONNECTION_ERROR'
      });
    } else if (error.type === 'StripeAuthenticationError') {
      res.status(401).json({ 
        error: 'You probably used an incorrect API key.',
        code: 'AUTHENTICATION_ERROR'
      });
    } else {
      res.status(500).json({ 
        error: 'An unexpected error occurred.',
        code: 'INTERNAL_ERROR'
      });
    }
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'StudyPal Payment Server'
  });
});

// Catch all for undefined routes
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    code: 'NOT_FOUND'
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    code: 'INTERNAL_ERROR'
  });
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`✅ Health check: http://localhost:${PORT}/api/health`);
  console.log(`✅ Payment endpoint: http://localhost:${PORT}/api/create-payment-intent`);
});
