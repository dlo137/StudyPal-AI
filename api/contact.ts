import nodemailer from 'nodemailer';

// Simple rate limiting using in-memory storage (for production, consider Redis)
const submissions = new Map();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const MAX_SUBMISSIONS = 5;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const userSubmissions = submissions.get(ip) || [];
  
  // Clean old submissions
  const recentSubmissions = userSubmissions.filter(
    (timestamp: number) => now - timestamp < RATE_LIMIT_WINDOW
  );
  
  submissions.set(ip, recentSubmissions);
  
  return recentSubmissions.length >= MAX_SUBMISSIONS;
}

function recordSubmission(ip: string): void {
  const now = Date.now();
  const userSubmissions = submissions.get(ip) || [];
  userSubmissions.push(now);
  submissions.set(ip, userSubmissions);
}

export default async function handler(req: any, res: any) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check rate limiting
    const clientIP = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || 'unknown';
    const ip = Array.isArray(clientIP) ? clientIP[0] : clientIP;
    
    if (isRateLimited(ip)) {
      return res.status(429).json({ error: 'Too many contact form submissions, please try again later.' });
    }

    const { name, email, subject, message } = req.body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Create transporter using environment variables
    const transporter = nodemailer.createTransport({
      service: 'gmail', // or your email service
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Email content
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.CONTACT_EMAIL || process.env.EMAIL_USER,
      subject: `StudyPal Contact: ${subject}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
        <hr>
        <p><em>Sent from StudyPal Contact Form</em></p>
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);
    
    // Record successful submission for rate limiting
    recordSubmission(ip);

    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Contact form error:', error);
    
    if (error.message === 'Too many contact form submissions, please try again later.') {
      return res.status(429).json({ error: error.message });
    }
    
    res.status(500).json({ error: 'Failed to send email' });
  }
}
