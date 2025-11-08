import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

interface EmailQueueItem {
  id: string
  to_email: string
  subject: string
  body: string
  email_type: string
  student_name?: string
  student_id?: string
}

const handler = async (_request: Request): Promise<Response> => {
  try {
    // Create Supabase client with service role
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Get pending emails from queue
    const { data: emails, error: fetchError } = await supabase
      .from('email_queue')
      .select('*')
      .eq('status', 'pending')
      .limit(10)

    if (fetchError) {
      console.error('Error fetching emails:', fetchError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch emails', details: fetchError }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    if (!emails || emails.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No pending emails to send', processed: 0 }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const results = []

    // Process each email
    for (const email of emails as EmailQueueItem[]) {
      try {
        // Mark as processing
        await supabase
          .from('email_queue')
          .update({ status: 'processing' })
          .eq('id', email.id)

        // Send email via Resend
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: 'BSWD Services <noreply@yourdomain.com>', // TODO: Change to your domain
            to: email.to_email,
            subject: email.subject,
            text: email.body,
          }),
        })

        const resendData = await res.json()

        if (res.ok) {
          // Mark as sent
          await supabase
            .from('email_queue')
            .update({ 
              status: 'sent', 
              sent_at: new Date().toISOString() 
            })
            .eq('id', email.id)

          results.push({
            id: email.id,
            to: email.to_email,
            status: 'sent',
            resend_id: resendData.id,
          })

          console.log(`✓ Email sent to ${email.to_email} (ID: ${email.id})`)
        } else {
          // Mark as failed
          await supabase
            .from('email_queue')
            .update({ 
              status: 'failed', 
              error_message: JSON.stringify(resendData) 
            })
            .eq('id', email.id)

          results.push({
            id: email.id,
            to: email.to_email,
            status: 'failed',
            error: resendData,
          })

          console.error(`✗ Failed to send email to ${email.to_email}:`, resendData)
        }
      } catch (emailError) {
        // Mark as failed with error
        await supabase
          .from('email_queue')
          .update({ 
            status: 'failed', 
            error_message: String(emailError) 
          })
          .eq('id', email.id)

        results.push({
          id: email.id,
          to: email.to_email,
          status: 'failed',
          error: String(emailError),
        })

        console.error(`✗ Error processing email ${email.id}:`, emailError)
      }
    }

    return new Response(
      JSON.stringify({
        message: 'Email processing complete',
        processed: results.length,
        results,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Handler error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: String(error) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

Deno.serve(handler)
