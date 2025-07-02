# Production Deployment Guide for StudyPal-AI

## 🚀 Pre-Deployment Security Checklist

### 1. Environment Setup

#### Production Environment Variables
Create a `.env.production` file (or set environment variables on your hosting platform):

```bash
# CRITICAL: Use LIVE Stripe keys for production
NODE_ENV=production
PORT=443

# Supabase (Production Database)
VITE_SUPABASE_URL=https://your-production-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_production_anon_key

# OpenAI (Production API Key)
VITE_OPENAI_API_KEY=sk-your_production_openai_key

# Stripe LIVE Keys (NOT test keys!)
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_51xxxxx...
STRIPE_SECRET_KEY=sk_live_51xxxxx...
STRIPE_WEBHOOK_SECRET=whsec_1xxxxx...

# Production Price IDs (create these in Stripe Dashboard)
VITE_STRIPE_GOLD_PRICE_ID=price_1xxxxx_live_gold_plan
VITE_STRIPE_DIAMOND_PRICE_ID=price_1xxxxx_live_diamond_plan

# Security Settings
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=50
```

### 2. Stripe Dashboard Setup

#### Create Production Products & Prices:
1. **Log into Stripe Dashboard** (live mode)
2. **Create Products:**
   - Gold Plan: $9.99/month
   - Diamond Plan: $19.99/month
3. **Copy Price IDs** to your environment variables
4. **Set up Webhooks:**
   - Endpoint: `https://yourdomain.com/api/webhook`
   - Events: `payment_intent.succeeded`, `payment_intent.payment_failed`
   - Copy webhook secret to `STRIPE_WEBHOOK_SECRET`

#### Stripe Security Settings:
- Enable fraud detection
- Set up email notifications for failed payments
- Configure dispute management
- Review and set spending limits

### 3. Database Security (Supabase)

#### Production Database Setup:
```sql
-- Create tables for subscription management
CREATE TABLE user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  plan_type TEXT CHECK (plan_type IN ('gold', 'diamond')),
  status TEXT CHECK (status IN ('active', 'canceled', 'past_due')),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create usage tracking table
CREATE TABLE user_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  date DATE DEFAULT CURRENT_DATE,
  requests_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Row Level Security
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_usage ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own subscription" ON user_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own usage" ON user_usage
  FOR SELECT USING (auth.uid() = user_id);
```

### 4. Server Configuration

#### Update server.ts for production:
```typescript
// Production CORS settings
const corsOptions = {
  origin: process.env.CORS_ORIGINS?.split(',') || [
    'https://yourdomain.com',
    'https://www.yourdomain.com'
  ],
  credentials: true,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// Stricter rate limiting for production
const productionLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS!) || 900000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS!) || 50,
  message: 'Too many requests from this IP',
  standardHeaders: true,
  legacyHeaders: false,
});
```

### 5. Build Configuration

#### Production Build Commands:
```json
{
  "scripts": {
    "build:prod": "NODE_ENV=production tsc -b && vite build",
    "start:prod": "NODE_ENV=production node dist/server.js",
    "deploy": "npm run build:prod && npm run start:prod"
  }
}
```

#### Vite Production Config:
```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  build: {
    minify: 'terser',
    sourcemap: false, // Don't expose source maps in production
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          stripe: ['@stripe/stripe-js', '@stripe/react-stripe-js']
        }
      }
    }
  },
  define: {
    'process.env.NODE_ENV': '"production"'
  }
});
```

### 6. SSL/HTTPS Setup

#### SSL Certificate (Required for Stripe):
```bash
# Using Let's Encrypt (free SSL)
sudo apt-get install certbot
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# Or use your hosting provider's SSL certificate
```

#### Express HTTPS Configuration:
```typescript
import https from 'https';
import fs from 'fs';

if (process.env.NODE_ENV === 'production') {
  const options = {
    key: fs.readFileSync(process.env.SSL_KEY_PATH!),
    cert: fs.readFileSync(process.env.SSL_CERT_PATH!)
  };
  
  https.createServer(options, app).listen(443, () => {
    console.log('HTTPS Server running on port 443');
  });
} else {
  app.listen(PORT, () => {
    console.log(`Development server running on port ${PORT}`);
  });
}
```

### 7. Monitoring & Logging

#### Production Logging Setup:
```bash
npm install winston helmet morgan
```

```typescript
import winston from 'winston';
import morgan from 'morgan';

// Production logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// HTTP request logging
app.use(morgan('combined', {
  stream: { write: message => logger.info(message.trim()) }
}));
```

### 8. Deployment Platforms

#### Option 1: Vercel (Recommended for frontend)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Set environment variables in Vercel dashboard
```

#### Option 2: AWS EC2
```bash
# Basic server setup
sudo apt update
sudo apt install nodejs npm nginx
sudo snap install core; sudo snap refresh core
sudo snap install --classic certbot

# PM2 for process management
npm install -g pm2
pm2 start server.js --name "studypal-api"
pm2 startup
pm2 save
```

#### Option 3: Railway
```bash
# Install Railway CLI
npm install -g @railway/cli

# Deploy
railway login
railway init
railway deploy
```

### 9. DNS Configuration

#### Domain Setup:
```bash
# DNS Records needed:
A     @           your.server.ip.address
A     www         your.server.ip.address
CNAME api         yourdomain.com
```

### 10. Post-Deployment Testing

#### Production Testing Checklist:
- [ ] SSL certificate is working (https://)
- [ ] Payment flow works with real credit cards
- [ ] Webhooks are receiving events from Stripe
- [ ] User registration and login work
- [ ] Database connections are secure
- [ ] Rate limiting is working
- [ ] Error pages display correctly
- [ ] Performance is acceptable (< 3s load time)

#### Test Payment Flow:
1. Create test account
2. Subscribe to Gold plan
3. Verify webhook receives `payment_intent.succeeded`
4. Check user's subscription status in database
5. Test premium features access

### 11. Monitoring Setup

#### Health Checks:
```typescript
// Add to server.ts
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});
```

#### Stripe Dashboard Monitoring:
- Set up payment alerts
- Monitor failed payment rates
- Track subscription metrics
- Review dispute activity

### 12. Backup Strategy

#### Database Backups:
```bash
# Automated Supabase backups (enable in dashboard)
# Or manual backups:
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql
```

#### Code Backups:
- Use Git tags for releases
- Maintain staging environment
- Keep previous deployment versions

### 🚨 Emergency Procedures

#### If Stripe Keys Are Compromised:
1. **Immediately disable old keys** in Stripe Dashboard
2. **Generate new keys**
3. **Update environment variables**
4. **Redeploy application**
5. **Monitor for suspicious activity**

#### If Database Is Compromised:
1. **Change all database passwords**
2. **Review access logs**
3. **Notify affected users**
4. **Implement additional security measures**

### 📊 Success Metrics

#### Track These KPIs:
- Conversion rate (visitors → subscribers)
- Payment success rate
- Customer churn rate
- API response times
- Error rates
- Security incidents

## 🎯 Go-Live Checklist

- [ ] All environment variables set correctly
- [ ] SSL certificate installed and working
- [ ] Stripe live keys configured
- [ ] Database production setup complete
- [ ] Webhooks tested and working
- [ ] Rate limiting configured
- [ ] Error handling tested
- [ ] Performance optimization complete
- [ ] Security audit passed
- [ ] Backup procedures in place
- [ ] Monitoring and alerts configured
- [ ] Legal pages updated (Privacy Policy, Terms of Service)
- [ ] Customer support system ready

**🎉 Once all items are checked, you're ready to launch!**
