import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'

// Simple rate limiting using Deno KV (or in-memory for now)
const submissions = new Map()
const RATE_LIMIT_WINDOW = 15 * 60 * 1000 // 15 minutes
const MAX_SUBMISSIONS = 5

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const userSubmissions = submissions.get(ip) || []
  
  // Clean old submissions
  const recentSubmissions = userSubmissions.filter(
    (timestamp: number) => now - timestamp < RATE_LIMIT_WINDOW
  )
  
  submissions.set(ip, recentSubmissions)
  
  return recentSubmissions.length >= MAX_SUBMISSIONS
}

function recordSubmission(ip: string): void {
  const now = Date.now()
  const userSubmissions = submissions.get(ip) || []
  userSubmissions.push(now)
  submissions.set(ip, userSubmissions)
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Get client IP for rate limiting
    const clientIP = req.headers.get('x-forwarded-for') || 
                     req.headers.get('x-real-ip') || 
                     'unknown'
    
    if (isRateLimited(clientIP)) {
      return new Response(
        JSON.stringify({ error: 'Too many contact form submissions, please try again later.' }),
        { 
          status: 429, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const { name, email, subject, message } = await req.json()

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return new Response(
        JSON.stringify({ error: 'All fields are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email format' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Send email using multiple fallback methods
    const emailData = {
      to: 'studypalhelpdesk@gmail.com',  // Your email address
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
        <p><em>Reply to: ${email}</em></p>
      `
    }

    let emailSent = false

    // Method 1: Try Resend API (if configured)
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    if (resendApiKey && !emailSent) {
      try {
        const resendResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'onboarding@resend.dev',  // Use Resend's default verified domain
            to: [emailData.to],
            reply_to: email,  // Set reply-to as the user's email
            subject: emailData.subject,
            html: emailData.html,
          }),
        })

        if (resendResponse.ok) {
          emailSent = true
          console.log('✅ Email sent via Resend successfully')
        } else {
          const errorText = await resendResponse.text()
          console.error('❌ Resend failed:', errorText)
          console.error('Resend status:', resendResponse.status)
        }
      } catch (error) {
        console.error('Resend error:', error)
      }
    }

    // Method 2: Try EmailJS API (free service)
    if (!emailSent) {
      try {
        const emailJSResponse = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            service_id: 'default_service',
            template_id: 'template_contact',
            user_id: Deno.env.get('EMAILJS_PUBLIC_KEY'),
            template_params: {
              to_email: emailData.to,
              from_name: name,
              from_email: email,
              subject: subject,
              message: message,
              reply_to: email
            }
          }),
        })

        if (emailJSResponse.ok) {
          emailSent = true
          console.log('Email sent via EmailJS')
        }
      } catch (error) {
        console.error('EmailJS error:', error)
      }
    }

    // Method 3: Use a webhook (Zapier/Make.com) if configured
    const webhookUrl = Deno.env.get('EMAIL_WEBHOOK_URL')
    if (webhookUrl && !emailSent) {
      try {
        const webhookResponse = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name,
            email,
            subject,
            message,
            to: emailData.to,
            timestamp: new Date().toISOString()
          }),
        })

        if (webhookResponse.ok) {
          emailSent = true
          console.log('Email sent via webhook')
        }
      } catch (error) {
        console.error('Webhook error:', error)
      }
    }

    // Method 4: Direct email fallback using a simple email service
    if (!emailSent) {
      try {
        // Use a simple email API that doesn't require domain verification
        const mailgunResponse = await fetch('https://api.mailgun.net/v3/sandboxdomain/messages', {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${btoa('api:' + (Deno.env.get('MAILGUN_API_KEY') || ''))}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            from: 'StudyPal Contact <mailgun@sandboxdomain.mailgun.org>',
            to: emailData.to,
            subject: emailData.subject,
            html: emailData.html,
          }),
        })

        if (mailgunResponse.ok) {
          emailSent = true
          console.log('✅ Email sent via Mailgun')
        }
      } catch (error) {
        console.error('Mailgun error:', error)
      }
    }

    // Method 5: Fallback - at least log the submission for manual processing
    if (!emailSent) {
      console.log('📧 CONTACT FORM SUBMISSION (EMAIL NOT SENT):', {
        name,
        email,
        subject,
        message,
        timestamp: new Date().toISOString(),
        note: 'Please configure email service (RESEND_API_KEY, EMAILJS_PUBLIC_KEY, or EMAIL_WEBHOOK_URL)',
        hasResendKey: !!Deno.env.get('RESEND_API_KEY')
      })
      
      // Still return success to user, but log that email wasn't sent
      console.warn('⚠️ Contact form submitted but no email sent')
    }

    // Record successful submission for rate limiting
    recordSubmission(clientIP)

    return new Response(
      JSON.stringify({ 
        message: emailSent ? 'Contact form submitted and email sent successfully' : 'Contact form submitted successfully',
        emailSent 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Contact form error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to process contact form' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
