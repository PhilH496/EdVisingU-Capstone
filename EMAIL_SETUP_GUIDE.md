# Email Setup Guide using Supabase

This guide explains how to set up email sending for the BSWD application using Supabase.

## Overview

The application uses Supabase to queue and send psycho-educational assessment referral emails. Emails are stored in a database table and can be processed by:
1. A Supabase Edge Function
2. A background worker
3. Third-party email service integration (SendGrid, Resend, etc.)

## Step 1: Create Email Queue Table in Supabase

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Run the following SQL:

```sql
-- Create email_queue table
CREATE TABLE IF NOT EXISTS email_queue (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  to_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  email_type TEXT NOT NULL,
  student_name TEXT,
  student_id TEXT,
  status TEXT DEFAULT 'pending',
  sent_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_email_queue_status ON email_queue(status);
CREATE INDEX IF NOT EXISTS idx_email_queue_created_at ON email_queue(created_at);
CREATE INDEX IF NOT EXISTS idx_email_queue_type ON email_queue(email_type);

-- Enable Row Level Security
ALTER TABLE email_queue ENABLE ROW LEVEL SECURITY;

-- Create policy for service role (full access)
CREATE POLICY "Allow service role full access" ON email_queue
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create policy for authenticated users (read only their own emails)
CREATE POLICY "Users can view their own emails" ON email_queue
  FOR SELECT
  TO authenticated
  USING (to_email = auth.jwt() ->> 'email');
```

## Step 2: Set Up Email Sending

You have three options:

### Option A: Supabase Edge Function (Recommended)

Create a Supabase Edge Function to process the email queue:

```typescript
// supabase/functions/send-emails/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Get pending emails
  const { data: emails, error } = await supabase
    .from('email_queue')
    .select('*')
    .eq('status', 'pending')
    .limit(10);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const results = [];
  
  for (const email of emails) {
    try {
      // TODO: Integrate with your email service (SendGrid, Resend, etc.)
      // Example with Resend:
      // const response = await fetch('https://api.resend.com/emails', {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     from: 'noreply@yourdomain.com',
      //     to: email.to_email,
      //     subject: email.subject,
      //     text: email.body,
      //   }),
      // });

      // Update status to sent
      await supabase
        .from('email_queue')
        .update({ 
          status: 'sent', 
          sent_at: new Date().toISOString() 
        })
        .eq('id', email.id);

      results.push({ id: email.id, status: 'sent' });
    } catch (err) {
      // Update status to failed
      await supabase
        .from('email_queue')
        .update({ 
          status: 'failed', 
          error_message: err.message 
        })
        .eq('id', email.id);

      results.push({ id: email.id, status: 'failed', error: err.message });
    }
  }

  return new Response(JSON.stringify({ processed: results.length, results }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
```

Deploy the function:
```bash
supabase functions deploy send-emails
```

Set up a cron job to run it every minute:
```sql
-- In Supabase SQL Editor
SELECT cron.schedule(
  'send-emails',
  '* * * * *', -- Every minute
  $$
  SELECT net.http_post(
    url:='https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-emails',
    headers:='{"Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb
  );
  $$
);
```

### Option B: Supabase Database Webhook

Set up a webhook trigger that calls an external email service when a new email is queued:

```sql
-- Create a webhook trigger
CREATE OR REPLACE FUNCTION notify_email_webhook()
RETURNS TRIGGER AS $$
DECLARE
  webhook_url TEXT := 'https://your-email-service.com/send';
BEGIN
  PERFORM net.http_post(
    url := webhook_url,
    body := jsonb_build_object(
      'to', NEW.to_email,
      'subject', NEW.subject,
      'body', NEW.body,
      'email_id', NEW.id
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER email_queue_webhook
  AFTER INSERT ON email_queue
  FOR EACH ROW
  EXECUTE FUNCTION notify_email_webhook();
```

### Option C: External Background Worker

Create a Node.js/Python script that polls the database and sends emails:

```javascript
// email-worker.js
const { createClient } = require('@supabase/supabase-js');
const Resend = require('resend');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
const resend = new Resend(process.env.RESEND_API_KEY);

async function processEmails() {
  const { data: emails } = await supabase
    .from('email_queue')
    .select('*')
    .eq('status', 'pending')
    .limit(10);

  for (const email of emails) {
    try {
      await resend.emails.send({
        from: 'noreply@yourdomain.com',
        to: email.to_email,
        subject: email.subject,
        text: email.body,
      });

      await supabase
        .from('email_queue')
        .update({ status: 'sent', sent_at: new Date().toISOString() })
        .eq('id', email.id);

      console.log(`✓ Email sent to ${email.to_email}`);
    } catch (error) {
      await supabase
        .from('email_queue')
        .update({ status: 'failed', error_message: error.message })
        .eq('id', email.id);

      console.error(`✗ Failed to send to ${email.to_email}:`, error);
    }
  }
}

// Run every 30 seconds
setInterval(processEmails, 30000);
```

## Step 3: Configure Environment Variables

Add to your `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key (for backend only)

# If using external email service:
RESEND_API_KEY=your_resend_api_key
# OR
SENDGRID_API_KEY=your_sendgrid_api_key
```

## Step 4: Test the System

1. Fill out the BSWD form with a valid email address
2. Check the "Requires Psycho-Educational Assessment" checkbox
3. Check the `email_queue` table in Supabase to see the queued email
4. Verify the email was sent (check the `status` field)

## Monitoring

Query pending emails:
```sql
SELECT * FROM email_queue WHERE status = 'pending' ORDER BY created_at DESC;
```

Query failed emails:
```sql
SELECT * FROM email_queue WHERE status = 'failed' ORDER BY created_at DESC;
```

Query sent emails:
```sql
SELECT * FROM email_queue WHERE status = 'sent' ORDER BY sent_at DESC LIMIT 100;
```

## Troubleshooting

### Email not appearing in queue
- Check browser console for API errors
- Verify Supabase connection is working
- Check that the table was created correctly

### Emails stuck in pending
- Make sure you've set up one of the processing methods (Edge Function, Webhook, or Worker)
- Check the processing service logs for errors
- Verify email service API keys are correct

### Permission errors
- Ensure Row Level Security policies are set up correctly
- Use service role key for backend operations
- Check that the API has proper permissions

## Next Steps

1. Choose an email service provider (Resend, SendGrid, AWS SES, etc.)
2. Set up the chosen processing method (Edge Function recommended)
3. Configure custom domain for sending emails
4. Set up email templates with HTML formatting
5. Add email tracking and analytics

## Resources

- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Supabase Database Webhooks](https://supabase.com/docs/guides/database/webhooks)
- [Resend Documentation](https://resend.com/docs)
- [SendGrid Documentation](https://docs.sendgrid.com/)
