# Security Guide for StudyPal-AI Production Deployment

## 🔐 Critical Security Practices

### 1. Environment Variables & API Keys

#### Never commit sensitive data to version control:
- ✅ Use `.env.local` for local development
- ✅ Use environment variables in production
- ❌ Never put real API keys in `.env.example`
- ❌ Never commit `.env.local` to git

#### Secure your Stripe keys:
```bash
# Production Environment Variables
NODE_ENV=production
STRIPE_SECRET_KEY=sk_live_YOUR_LIVE_SECRET_KEY
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_LIVE_PUBLISHABLE_KEY
```

#### API Key Security Checklist:
- [ ] Use different keys for development and production
- [ ] Rotate keys regularly (every 90 days)
- [ ] Monitor key usage in Stripe dashboard
- [ ] Set up Stripe alerts for unusual activity
- [ ] Restrict API key permissions to minimum required

### 2. Database Security

#### Customer Data Protection:
- ✅ Encrypt sensitive customer data at rest
- ✅ Use parameterized queries to prevent SQL injection
- ✅ Implement proper access controls
- ✅ Regular database backups with encryption
- ✅ GDPR compliance for EU customers

#### Database Connection Security:
```typescript
// Example Supabase security config
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // Use service role for server-side
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);
```

### 3. Server Security

#### Production Server Configuration:
```typescript
// CORS - Restrict to your domain only
const corsOptions = {
  origin: [
    'https://studypal-ai.com',
    'https://www.studypal-ai.com'
  ],
  credentials: true,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// Rate limiting for production
const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Stricter limit for production
  message: 'Too many requests from this IP',
});
```

### 4. Payment Security

#### Stripe Security Best Practices:
- ✅ Always validate payment amounts server-side
- ✅ Use webhooks to handle payment confirmations
- ✅ Implement idempotency for payment requests
- ✅ Log all payment events securely
- ✅ Set up fraud detection rules in Stripe

#### Webhook Security:
```typescript
// Always verify webhook signatures
try {
  event = stripe.webhooks.constructEvent(
    req.body, 
    sig, 
    process.env.STRIPE_WEBHOOK_SECRET!
  );
} catch (err) {
  console.error('Webhook signature verification failed');
  return res.status(400).send('Invalid signature');
}
```

### 5. Frontend Security

#### Client-Side Protection:
- ✅ Never expose secret keys in frontend code
- ✅ Validate all user inputs before sending to backend
- ✅ Use HTTPS in production
- ✅ Implement CSP headers
- ✅ Sanitize user-generated content

#### Environment Variable Setup:
```typescript
// Only expose what's needed to the client
// VITE_ prefix makes variables available to frontend
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
VITE_SUPABASE_URL=https://...
VITE_SUPABASE_ANON_KEY=... // Anon key only for frontend
```

### 6. Monitoring & Logging

#### Security Monitoring:
- ✅ Monitor API usage and rate limits
- ✅ Set up alerts for failed payments
- ✅ Log security events (failed logins, suspicious activity)
- ✅ Regular security audits
- ✅ Monitor for data breaches

#### Production Logging:
```typescript
// Secure logging - don't log sensitive data
console.log('Payment intent created', { 
  id: paymentIntent.id,
  amount: paymentIntent.amount,
  // Don't log: customer email, card details, etc.
});
```

### 7. Deployment Security

#### Production Deployment Checklist:
- [ ] Environment variables set correctly
- [ ] HTTPS certificate installed
- [ ] Firewall configured
- [ ] Database access restricted
- [ ] API rate limits in place
- [ ] Error handling doesn't expose sensitive info
- [ ] Security headers configured
- [ ] Dependencies updated and scanned for vulnerabilities

#### Server Configuration:
```bash
# Example production environment setup
NODE_ENV=production
PORT=443
SSL_CERT_PATH=/path/to/cert
SSL_KEY_PATH=/path/to/key
DATABASE_URL=postgresql://encrypted_connection
REDIS_URL=redis://secure_connection
```

### 8. Incident Response Plan

#### If a security breach occurs:
1. **Immediate Response:**
   - Rotate all API keys immediately
   - Disable affected accounts
   - Assess scope of breach

2. **Investigation:**
   - Review logs for unauthorized access
   - Identify compromised data
   - Document timeline of events

3. **Notification:**
   - Notify affected customers
   - Report to relevant authorities (if required)
   - Update security measures

4. **Recovery:**
   - Implement additional security measures
   - Monitor for continued threats
   - Conduct post-incident review

### 9. Regular Security Maintenance

#### Monthly Tasks:
- [ ] Review API key usage
- [ ] Update dependencies
- [ ] Check for security alerts
- [ ] Review access logs
- [ ] Test backup and recovery procedures

#### Quarterly Tasks:
- [ ] Security audit
- [ ] Penetration testing
- [ ] Review user permissions
- [ ] Update security policies
- [ ] Train team on security best practices

### 10. Compliance Requirements

#### Legal Considerations:
- **GDPR**: Right to deletion, data portability, consent management
- **CCPA**: California Consumer Privacy Act compliance
- **PCI DSS**: Payment card industry standards (handled by Stripe)
- **SOX**: If publicly traded, financial reporting requirements

## 🚨 Emergency Contacts

- **Stripe Support**: https://support.stripe.com
- **Security Incident Reporting**: security@stripe.com
- **Your hosting provider support**
- **Your legal team**

## 📚 Additional Resources

- [Stripe Security Guide](https://stripe.com/docs/security)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Checklist](https://blog.risingstack.com/node-js-security-checklist/)
- [Express.js Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
