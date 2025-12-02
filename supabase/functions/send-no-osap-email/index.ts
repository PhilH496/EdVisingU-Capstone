const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const handler = async (request: Request): Promise<Response> => {
  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Get request 
    let body;
    try {
      body = await request.json()
    } catch (parseError) {
      console.error('Failed to parse JSON body:', parseError)
      return new Response(
        JSON.stringify({ 
          error: 'Invalid JSON in request body',
          details: String(parseError) 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { email, studentName, studentId, firstName, lastName } = body

    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email address is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Sending No OSAP notification email to: ${email}`)

    const fullName = studentName || `${firstName || ''} ${lastName || ''}`.trim() || 'Student'
    
    // Generate unique Issue ID
    const issueId = `OSAP-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`

    // Build email content
    const emailSubject = 'BSWD Application - OSAP Application Required'
    const emailBody = `
Dear ${fullName},

We noticed that you indicated you do not have an OSAP application when completing your BSWD (Bursary for Students with Disabilities) application.

Contact Email: ${email}

IMPORTANT: An OSAP application is required to be eligible for BSWD funding. 

Next Steps:
1. Apply for OSAP at https://www.ontario.ca/page/osap-ontario-student-assistance-program
2. Once your OSAP application is submitted, please return to complete your BSWD application
3. Contact the Financial Aid office if you need assistance with your OSAP application

If you believe you received this email in error, please contact BSWD Services.

Best regards,
BSWD Services Team

---
Issue ID: ${issueId}
    `.trim()

    // Check if API key exists
    if (!RESEND_API_KEY) {
      console.error('RESEND_API_KEY is not set')
      return new Response(
        JSON.stringify({ error: 'Email service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Sending email via Resend API...')
    console.log('To:', email)
    console.log('From: BSWD Services <onboarding@resend.dev>')

    // Send email via Resend
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'BSWD Services <noreply@bswd-application.com>',
        to: [email],
        subject: emailSubject,
        html: `<div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px;">
          <h2 style="color: #1e3a8a;">${emailSubject}</h2>
          <p>Dear ${fullName},</p>
          <p>We noticed that you indicated you <strong>do not have an OSAP application</strong> when completing your BSWD (Bursary for Students with Disabilities) application.</p>
          
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Contact Email:</strong> ${email}</p>
          </div>
          
          <div style="background-color: #fef3c7; padding: 15px; border-left: 4px solid #f59e0b; margin: 20px 0;">
            <p style="margin: 0;"><strong>IMPORTANT:</strong> An OSAP application is required to be eligible for BSWD funding.</p>
          </div>
          
          <h3>Next Steps:</h3>
          <ol>
            <li>Apply for OSAP at <a href="https://www.ontario.ca/page/osap-ontario-student-assistance-program" style="color: #1e3a8a;">https://www.ontario.ca/page/osap-ontario-student-assistance-program</a></li>
            <li>Once your OSAP application is submitted, please return to complete your BSWD application</li>
            <li>Contact the Financial Aid office if you need assistance with your OSAP application</li>
          </ol>
          
          <p style="color: #666; font-size: 14px; margin-top: 20px;">If you believe you received this email in error, please contact BSWD Services.</p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="color: #666; font-size: 12px;">
            Best regards,<br>
            <strong>BSWD Services Team</strong>
          </p>
          <p style="color: #999; font-size: 11px; margin-top: 20px; padding-top: 10px; border-top: 1px solid #e5e7eb;">
            Issue ID: <strong>${issueId}</strong>
          </p>
        </div>`,
      }),
    })

    const resendData = await res.json()
    
    console.log('Resend API response status:', res.status)
    console.log('Resend API response data:', JSON.stringify(resendData, null, 2))

    if (res.ok) {
      console.log(`✓ No OSAP email sent successfully to ${email}`, resendData)
      return new Response(
        JSON.stringify({
          success: true,
          message: 'No OSAP notification email sent successfully',
          resendId: resendData.id,
          issueId: issueId,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    } else {
      console.error('❌ Resend API error:', resendData)
      console.error('Response status:', res.status)
      return new Response(
        JSON.stringify({
          error: 'Failed to send email via Resend',
          details: resendData,
          status: res.status,
          message: resendData.message || resendData.error || 'Unknown error from Resend API'
        }),
        {
          status: res.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }
  } catch (error) {
    console.error('Error in send-no-osap-email function:', error)
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
}

Deno.serve(handler)
