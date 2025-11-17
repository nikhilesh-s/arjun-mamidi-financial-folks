import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface NewsletterRequest {
  email: string
  blogTitle: string
  blogSlug: string
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { email, blogTitle, blogSlug }: NewsletterRequest = await req.json()

    if (!email || !blogTitle || !blogSlug) {
      throw new Error('Email, blog title, and blog slug are required')
    }

    console.log('Sending newsletter email to:', email)

    // Get environment variables
    const resendApiKey = Deno.env.get('RESEND_API_KEY') || 're_iKL9MbpS_CGkpw81ALHCPFAr28dSWeXch'
    const siteUrl = Deno.env.get('NEXT_PUBLIC_SITE_URL') || 'https://materiamse.com'

    // Send newsletter email
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'newsletter@materiamse.com',
        to: [email],
        subject: `New Post: ${blogTitle}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #059669; margin: 0;">New Blog Post Published!</h1>
            </div>
            
            <div style="background-color: #f8fafd; padding: 25px; border-radius: 8px; text-align: center; margin: 20px 0;">
              <h2 style="color: #333; margin: 0 0 15px 0; font-size: 24px;">${blogTitle}</h2>
              <p style="color: #5a6a7f; margin: 0; font-size: 16px;">We've just published a new blog post that we think you'll find interesting.</p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${siteUrl}/#blog-post-${blogSlug}" 
                 style="background-color: #059669; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">
                Read the Full Post
              </a>
            </div>

            <div style="background-color: #ecfdf5; padding: 20px; border-radius: 8px; margin: 30px 0;">
              <h3 style="color: #059669; margin-top: 0;">While you're here...</h3>
              <p style="margin: 10px 0;">Check out our other resources:</p>
              <ul style="margin: 0; padding-left: 20px;">
                <li><a href="${siteUrl}/#blog" style="color: #059669;">Browse all blog posts</a></li>
                <li><a href="${siteUrl}/#about" style="color: #059669;">Learn about our community</a></li>
                <li><a href="${siteUrl}/#join" style="color: #059669;">Join our community</a></li>
              </ul>
            </div>

            <div style="border-top: 1px solid #e2e8f0; margin-top: 30px; padding-top: 20px; text-align: center;">
              <p style="color: #5a6a7f; font-size: 14px; margin: 0;">
                You're receiving this email because you subscribed to the Materia MSE newsletter.
                <br><br>
                <a href="${siteUrl}" style="color: #059669;">Visit our website</a> | 
                <a href="${siteUrl}/#blog" style="color: #059669;">Read more posts</a>
              </p>
            </div>
          </div>
        `,
      }),
    })

    console.log('Newsletter email response:', emailResponse.status)

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text()
      throw new Error(`Failed to send email: ${emailResponse.status} - ${errorText}`)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Newsletter email sent successfully' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error sending newsletter email:', error)
    
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