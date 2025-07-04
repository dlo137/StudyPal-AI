import express from 'express';
import Stripe from 'stripe';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

// Load environment variables from .env.local file
dotenv.config({ path: '.env.local' });

// Environment validation
const requiredEnvVars = ['STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
});

// Configure email transporter (using Gmail SMTP)
const emailTransporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'studypalhelpdesk@gmail.com',
    pass: process.env.EMAIL_APP_PASSWORD || '', // Will gracefully fail if empty
  },
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

// CORS configuration - restrict to your domain in production
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com', 'https://www.yourdomain.com'] // Replace with your actual domain
    : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'], // Dev origins
  credentials: true,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));

// Body parsing middleware (with size limits)
app.use('/api/webhook', express.raw({ type: 'application/json', limit: '1mb' }));
app.use(express.json({ limit: '10mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'StudyPal Payment Server is running' });
});

// Rate limiter for contact form
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 contact form submissions per windowMs
  message: 'Too many contact form submissions from this IP, please try again later.',
});

// Contact form endpoint
app.post('/api/contact', contactLimiter, async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Input validation
    if (!name || !email || !subject || !message) {
      res.status(400).json({ 
        error: 'All fields are required' 
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ 
        error: 'Invalid email address' 
      });
      return;
    }

    // Prepare email content
    const mailOptions = {
      from: process.env.EMAIL_USER || 'studypalhelpdesk@gmail.com',
      to: 'studypalhelpdesk@gmail.com',
      subject: `StudyPal Contact Form: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #8C52FF;">New Contact Form Submission</h2>
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Subject:</strong> ${subject}</p>
          </div>
          <div style="background-color: #ffffff; padding: 20px; border-left: 4px solid #8C52FF; margin: 20px 0;">
            <h3>Message:</h3>
            <p style="white-space: pre-wrap;">${message}</p>
          </div>
          <hr style="margin: 30px 0;">
          <p style="color: #666; font-size: 12px;">
            This email was sent from the StudyPal contact form. 
            Reply directly to respond to ${name} at ${email}.
          </p>
        </div>
      `,
      replyTo: email, // This allows you to reply directly to the sender
    };

    // Send email
    try {
      await emailTransporter.sendMail(mailOptions);
      console.log(`Contact form submitted by ${name} (${email}): ${subject}`);
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Log the contact form submission even if email fails
      console.log('=== CONTACT FORM SUBMISSION ===');
      console.log(`Name: ${name}`);
      console.log(`Email: ${email}`);
      console.log(`Subject: ${subject}`);
      console.log(`Message: ${message}`);
      console.log('===============================');
      
      // For now, we'll still return success so the user doesn't see an error
      // In production, you might want to store this in a database
    }

    res.json({ 
      success: true, 
      message: 'Message received successfully' 
    });

  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({ 
      error: 'Failed to send email. Please try again later.' 
    });
  }
});

// Create payment intent endpoint
app.post('/api/create-payment-intent', paymentLimiter, async (req, res) => {
  try {
    const { amount, currency, planType, userEmail, userId } = req.body;

    // Input validation
    if (!amount || !currency || !planType) {
      res.status(400).json({
        error: 'Missing required fields: amount, currency, planType'
      });
      return;
    }

    // Validate amount (must be positive integer)
    if (typeof amount !== 'number' || amount <= 0 || !Number.isInteger(amount)) {
      res.status(400).json({
        error: 'Amount must be a positive integer in cents'
      });
      return;
    }

    // Validate currency
    if (currency !== 'usd') {
      res.status(400).json({
        error: 'Only USD currency is supported'
      });
      return;
    }

    // Validate planType
    if (!['gold', 'diamond'].includes(planType)) {
      res.status(400).json({
        error: 'Invalid plan type. Must be gold or diamond'
      });
      return;
    }

    // Validate amount matches plan pricing
    const validAmounts = {
      gold: 999, // $9.99
      diamond: 1999 // $19.99
    };

    if (amount !== validAmounts[planType as keyof typeof validAmounts]) {
      res.status(400).json({
        error: 'Amount does not match plan pricing'
      });
      return;
    }

    // Validate email format if provided
    if (userEmail && !/\S+@\S+\.\S+/.test(userEmail)) {
      res.status(400).json({
        error: 'Invalid email format'
      });
      return;
    }

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: currency,
      metadata: {
        planType,
        userEmail: userEmail || '',
        userId: userId || '',
        timestamp: new Date().toISOString(),
      },
      // Enable automatic payment methods
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.json({
      client_secret: paymentIntent.client_secret,
      id: paymentIntent.id,
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({
      error: 'Failed to create payment intent',
      details: process.env.NODE_ENV === 'development' 
        ? (error instanceof Error ? error.message : 'Unknown error')
        : 'Internal server error'
    });
  }
});

// Webhook endpoint for Stripe events
app.post('/api/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  const sig = req.headers['stripe-signature'] as string;
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!endpointSecret) {
    console.error('Stripe webhook secret not configured');
    res.status(400).send('Webhook secret not configured');
    return;
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    res.status(400).send(`Webhook Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    return;
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      console.log('Payment succeeded:', paymentIntent.id);
      
      // Here you would typically:
      // 1. Update user's subscription status in your database
      // 2. Send confirmation email
      // 3. Grant access to premium features
      // 4. Log the transaction securely
      
      break;
    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object as Stripe.PaymentIntent;
      console.log('Payment failed:', failedPayment.id);
      
      // Handle failed payment
      // 1. Log the failure
      // 2. Notify user if needed
      // 3. Update database status
      
      break;
    case 'customer.subscription.created':
      const subscription = event.data.object as Stripe.Subscription;
      console.log('Subscription created:', subscription.id);
      break;
    case 'customer.subscription.deleted':
      const deletedSubscription = event.data.object as Stripe.Subscription;
      console.log('Subscription cancelled:', deletedSubscription.id);
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

// Create subscription endpoint (for recurring payments)
app.post('/api/create-subscription', paymentLimiter, async (req, res) => {
  try {
    const { priceId, customerId, paymentMethodId } = req.body;

    // Input validation
    if (!priceId || !customerId || !paymentMethodId) {
      res.status(400).json({
        error: 'Missing required fields: priceId, customerId, paymentMethodId'
      });
      return;
    }

    // Validate price ID format
    if (!priceId.startsWith('price_')) {
      res.status(400).json({
        error: 'Invalid price ID format'
      });
      return;
    }

    // Validate customer ID format
    if (!customerId.startsWith('cus_')) {
      res.status(400).json({
        error: 'Invalid customer ID format'
      });
      return;
    }

    // Validate payment method ID format
    if (!paymentMethodId.startsWith('pm_')) {
      res.status(400).json({
        error: 'Invalid payment method ID format'
      });
      return;
    }

    // Attach payment method to customer
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });

    // Set as default payment method
    await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_settings: {
        payment_method_options: {
          card: {
            request_three_d_secure: 'automatic',
          },
        },
        payment_method_types: ['card'],
        save_default_payment_method: 'on_subscription',
      },
      expand: ['latest_invoice.payment_intent'],
    });

    res.json(subscription);
  } catch (error) {
    console.error('Error creating subscription:', error);
    res.status(500).json({
      error: 'Failed to create subscription',
      details: process.env.NODE_ENV === 'development' 
        ? (error instanceof Error ? error.message : 'Unknown error')
        : 'Internal server error'
    });
  }
});

// Create customer endpoint
app.post('/api/create-customer', paymentLimiter, async (req, res) => {
  try {
    const { email, name } = req.body;

    // Input validation
    if (!email) {
      res.status(400).json({
        error: 'Email is required'
      });
      return;
    }

    // Validate email format
    if (!/\S+@\S+\.\S+/.test(email)) {
      res.status(400).json({
        error: 'Invalid email format'
      });
      return;
    }

    // Validate name if provided
    if (name && (typeof name !== 'string' || name.trim().length === 0)) {
      res.status(400).json({
        error: 'Name must be a non-empty string'
      });
      return;
    }

    // Check if customer already exists
    const existingCustomers = await stripe.customers.list({
      email: email,
      limit: 1,
    });

    if (existingCustomers.data.length > 0) {
      res.json(existingCustomers.data[0]);
      return;
    }

    const customer = await stripe.customers.create({
      email,
      name: name?.trim() || undefined,
    });

    res.json(customer);
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({
      error: 'Failed to create customer',
      details: process.env.NODE_ENV === 'development' 
        ? (error instanceof Error ? error.message : 'Unknown error')
        : 'Internal server error'
    });
  }
});

app.listen(PORT, () => {
  console.log(`StudyPal Payment Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});
