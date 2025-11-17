import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface EmailRequest {
  email: string
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { email }: EmailRequest = await req.json()

    if (!email) {
      throw new Error('Email is required')
    }

    console.log('Processing newsletter confirmation for:', email)

    // Get environment variables
    const resendApiKey = Deno.env.get('RESEND_API_KEY') || 're_iKL9MbpS_CGkpw81ALHCPFAr28dSWeXch'
    const adminEmail = Deno.env.get('ADMIN_EMAIL') || 'materiamse@gmail.com'
    const siteUrl = Deno.env.get('NEXT_PUBLIC_SITE_URL') || 'https://materiamse.com'

    // Send confirmation email to subscriber
    const subscriberEmailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'newsletter@materiamse.com',
        to: [email],
        subject: 'Welcome to Materia MSE Newsletter!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #059669; margin: 0;">Welcome to Materia MSE!</h1>
            </div>
            <p style="font-size: 16px; line-height: 1.6;">Thank you for subscribing to our newsletter! You're now part of our growing materials science community.</p>
            
            <div style="background-color: #f8fafd; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #059669; margin-top: 0;">What you'll receive:</h3>
              <ul style="margin: 0; padding-left: 20px;">
                <li>Latest blog posts on materials science</li>
                <li>Community updates and events</li>
                <li>Research insights and breakthroughs</li>
                <li>Exclusive content for subscribers</li>
              </ul>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${siteUrl}/#blog" 
                 style="background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">
                Explore Our Blog
              </a>
            </div>

            <p style="font-size: 16px; line-height: 1.6;">We're excited to have you as part of our materials science community!</p>
            
            <div style="border-top: 1px solid #e2e8f0; margin-top: 30px; padding-top: 20px;">
              <p style="color: #5a6a7f; font-size: 14px; margin: 0;">
                Best regards,<br>
                The Materia MSE Team<br>
                <a href="${siteUrl}" style="color: #059669;">materiamse.com</a>
              </p>
            </div>
          </div>
        `,
      }),
    })

    // Send notification to admin
    const adminEmailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'newsletter@materiamse.com',
        to: [adminEmail],
        subject: 'New Newsletter Subscription',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #059669;">New Newsletter Subscription</h2>
            <div style="background-color: #f8fafd; padding: 15px; border-radius: 6px;">
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Subscribed at:</strong> ${new Date().toLocaleString()}</p>
            </div>
            <p style="margin-top: 20px;">
              <a href="${siteUrl}/#admin" style="color: #059669;">View in Admin Dashboard</a>
            </p>
          </div>
        `,
      }),
    })

    console.log('Subscriber email response:', subscriberEmailResponse.status)
    console.log('Admin email response:', adminEmailResponse.status)

    if (!subscriberEmailResponse.ok) {
      const errorText = await subscriberEmailResponse.text()
      console.error('Failed to send subscriber email:', errorText)
    }

    if (!adminEmailResponse.ok) {
      const errorText = await adminEmailResponse.text()
      console.error('Failed to send admin email:', errorText)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Newsletter subscription confirmed and emails sent' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error in newsletter confirmation:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})