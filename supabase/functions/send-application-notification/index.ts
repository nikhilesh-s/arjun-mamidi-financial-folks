import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface ApplicationData {
  full_name: string
  preferred_name?: string
  email: string
  school_organization?: string
  grade_year?: string
  location?: string
  member_type: string
  goals: string
  interests: string[]
  linkedin_website?: string
  newsletter_opt_in: boolean
  how_heard?: string
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const applicationData: ApplicationData = await req.json()

    console.log('Processing application notification for:', applicationData.email)

    // Get environment variables
    const resendApiKey = Deno.env.get('RESEND_API_KEY') || 're_iKL9MbpS_CGkpw81ALHCPFAr28dSWeXch'
    const adminEmail = Deno.env.get('ADMIN_EMAIL') || 'materiamse@gmail.com'
    const siteUrl = Deno.env.get('NEXT_PUBLIC_SITE_URL') || 'https://materiamse.com'

    const memberTypeDescriptions = {
      explorer: 'Explorer - Learn, browse, and ask questions',
      contributor: 'Contributor - Write content and create blogs',
      builder: 'Builder - Work on projects and internships',
      connector: 'Connector - Mentor and network with others'
    }

    // Send confirmation email to applicant
    const applicantEmailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'newsletter@materiamse.com',
        to: [applicationData.email],
        subject: 'Application Received - Materia MSE Community',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #059669; margin: 0;">Application Received!</h1>
            </div>
            
            <p style="font-size: 16px; line-height: 1.6;">Hi ${applicationData.preferred_name || applicationData.full_name},</p>
            
            <p style="font-size: 16px; line-height: 1.6;">Thank you for applying to join the Materia MSE community as a <strong>${memberTypeDescriptions[applicationData.member_type as keyof typeof memberTypeDescriptions] || applicationData.member_type}</strong>.</p>
            
            <div style="background-color: #ecfdf5; border-left: 4px solid #059669; padding: 15px; margin: 20px 0;">
              <p style="margin: 0; font-weight: 600;">What happens next?</p>
              <ul style="margin: 10px 0 0 0; padding-left: 20px;">
                <li>We'll review your application within 2-3 business days</li>
                <li>You'll receive an email notification about your approval status</li>
                <li>Once approved, you'll get access to our community features</li>
              </ul>
            </div>

            <p style="font-size: 16px; line-height: 1.6;">In the meantime, feel free to explore our blog and learn more about materials science!</p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${siteUrl}/#blog" 
                 style="background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; margin-right: 10px;">
                Read Our Blog
              </a>
              <a href="${siteUrl}/#about" 
                 style="background-color: #f8fafd; color: #059669; border: 2px solid #059669; padding: 10px 22px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">
                Learn More
              </a>
            </div>
            
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
        subject: 'New Community Application',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #059669;">New Community Application</h2>
            
            <div style="background-color: #f8fafd; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #333;">Applicant Information</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 5px 0; font-weight: 600;">Name:</td><td style="padding: 5px 0;">${applicationData.full_name}</td></tr>
                <tr><td style="padding: 5px 0; font-weight: 600;">Preferred Name:</td><td style="padding: 5px 0;">${applicationData.preferred_name || 'N/A'}</td></tr>
                <tr><td style="padding: 5px 0; font-weight: 600;">Email:</td><td style="padding: 5px 0;">${applicationData.email}</td></tr>
                <tr><td style="padding: 5px 0; font-weight: 600;">Member Type:</td><td style="padding: 5px 0;">${applicationData.member_type}</td></tr>
                <tr><td style="padding: 5px 0; font-weight: 600;">School/Organization:</td><td style="padding: 5px 0;">${applicationData.school_organization || 'N/A'}</td></tr>
                <tr><td style="padding: 5px 0; font-weight: 600;">Grade/Year:</td><td style="padding: 5px 0;">${applicationData.grade_year || 'N/A'}</td></tr>
                <tr><td style="padding: 5px 0; font-weight: 600;">Location:</td><td style="padding: 5px 0;">${applicationData.location || 'N/A'}</td></tr>
                <tr><td style="padding: 5px 0; font-weight: 600;">LinkedIn/Website:</td><td style="padding: 5px 0;">${applicationData.linkedin_website || 'N/A'}</td></tr>
                <tr><td style="padding: 5px 0; font-weight: 600;">Newsletter Opt-in:</td><td style="padding: 5px 0;">${applicationData.newsletter_opt_in ? 'Yes' : 'No'}</td></tr>
                <tr><td style="padding: 5px 0; font-weight: 600;">How they heard:</td><td style="padding: 5px 0;">${applicationData.how_heard || 'N/A'}</td></tr>
                <tr><td style="padding: 5px 0; font-weight: 600;">Applied at:</td><td style="padding: 5px 0;">${new Date().toLocaleString()}</td></tr>
              </table>
            </div>

            <div style="background-color: #ecfdf5; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <h4 style="margin-top: 0; color: #059669;">Goals</h4>
              <p style="margin: 0;">${applicationData.goals}</p>
            </div>

            <div style="background-color: #f0f9ff; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <h4 style="margin-top: 0; color: #0369a1;">Interests</h4>
              <p style="margin: 0;">${applicationData.interests.join(', ')}</p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${siteUrl}/#admin" 
                 style="background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">
                Review in Admin Dashboard
              </a>
            </div>
          </div>
        `,
      }),
    })

    console.log('Applicant email response:', applicantEmailResponse.status)
    console.log('Admin email response:', adminEmailResponse.status)

    if (!applicantEmailResponse.ok) {
      const errorText = await applicantEmailResponse.text()
      console.error('Failed to send applicant email:', errorText)
    }

    if (!adminEmailResponse.ok) {
      const errorText = await adminEmailResponse.text()
      console.error('Failed to send admin email:', errorText)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Application notification sent' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error in application notification:', error)
    
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