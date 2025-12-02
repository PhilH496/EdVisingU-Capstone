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
    // Get request body
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

    const { email, studentName, studentId } = body

    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email address is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Sending email to: ${email}`)

    // Build email content
    const emailSubject = 'Psycho-Educational Assessment Referral'
    const emailBody = `
Dear ${studentName || 'Student'},

You have been referred for a psycho-educational assessment.

Student Information:
- Name: ${studentName || 'N/A'}
- Student ID: ${studentId || 'N/A'}

Please contact BSWD Services for more information about your referral.

Best regards,
BSWD Services Team
    `.trim()

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
        html: `<div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>${emailSubject}</h2>
          <p>Dear ${studentName || 'Student'},</p>
          <p>You have been referred for a psycho-educational assessment.</p>
          
          <h3>Student Information:</h3>
          <ul>
            <li><strong>Name:</strong> ${studentName || 'N/A'}</li>
            <li><strong>Student ID:</strong> ${studentId || 'N/A'}</li>
          </ul>
          
          <p>Please contact BSWD Services for more information about your referral.</p>
          
          <hr style="margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">
            Best regards,<br>
            BSWD Services Team
          </p>
        </div>`,
      }),
    })

    const resendData = await res.json()

    if (res.ok) {
      console.log(`✓ Email sent successfully to ${email}`, resendData)
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Email sent successfully',
          resendId: resendData.id,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } else {
      console.error(`✗ Failed to send email to ${email}:`, resendData)
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Failed to send email',
          details: resendData,
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
  } catch (error) {
    console.error('Handler error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}

Deno.serve(handler)
