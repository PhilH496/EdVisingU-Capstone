# Supabase Edge Function Deployment Guide

## Step 1: Install Supabase CLI

```bash
# Windows (PowerShell)
scoop install supabase

# Or use npm
npm install -g supabase
```

## Step 2: Login to Supabase

```bash
supabase login
```

This will open your browser to authorize the CLI.

## Step 3: Link to Your Project

```bash
cd C:\Users\TorpedosVoraus\Capstone\EdVisingU-Capstone
supabase link --project-ref your-project-ref
```

Get your project ref from: https://supabase.com/dashboard/project/_/settings/general

## Step 4: Set Up Environment Variables

### For Local Testing:

1. Copy the example env file:
```bash
cd supabase\functions
copy .env.example .env
```

2. Edit `.env` and fill in:
   - `RESEND_API_KEY`: Get from https://resend.com/api-keys
   - `SUPABASE_URL`: From Project Settings > API
   - `SUPABASE_SERVICE_ROLE_KEY`: From Project Settings > API (service_role key)

### For Production (Deployed Function):

Set secrets in Supabase Dashboard:
1. Go to: Project > Edge Functions > Manage secrets
2. Add these secrets:
   - `RESEND_API_KEY`
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`

Or use CLI:
```bash
supabase secrets set RESEND_API_KEY=re_your_key_here
supabase secrets set SUPABASE_URL=https://your-project.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_key_here
```

## Step 5: Test Locally (Optional)

```bash
# Start local Supabase
supabase start

# Serve the function locally
supabase functions serve send-psycho-ed-email --env-file supabase/functions/.env --no-verify-jwt

# Test it (opens in browser or use curl)
curl http://localhost:54321/functions/v1/send-psycho-ed-email
```

## Step 6: Deploy to Production

```bash
supabase functions deploy send-psycho-ed-email --no-verify-jwt
```

The `--no-verify-jwt` flag allows the function to be called without authentication (needed for our use case).

## Step 7: Get Function URL

After deployment, you'll get a URL like:
```
https://your-project.supabase.co/functions/v1/send-psycho-ed-email
```

## Step 8: Set Up Automatic Email Sending (Cron Job)

### Option A: Using Supabase pg_cron

Run this in Supabase SQL Editor:

```sql
-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule function to run every minute
SELECT cron.schedule(
  'send-pending-emails',
  '* * * * *', -- Every minute
  $$
  SELECT net.http_post(
    url := 'https://your-project.supabase.co/functions/v1/send-psycho-ed-email',
    headers := '{"Content-Type": "application/json"}'::jsonb
  ) AS request_id;
  $$
);

-- View scheduled jobs
SELECT * FROM cron.job;

-- To remove the job (if needed)
-- SELECT cron.unschedule('send-pending-emails');
```

### Option B: Manual Trigger

You can manually trigger email sending by visiting:
```
https://your-project.supabase.co/functions/v1/send-psycho-ed-email
```

Or using curl:
```bash
curl https://your-project.supabase.co/functions/v1/send-psycho-ed-email
```

## Step 9: Configure Resend Domain

1. Go to https://resend.com/domains
2. Add your domain
3. Add DNS records to verify
4. Update the Edge Function `from` email address:
   ```typescript
   from: 'BSWD Services <noreply@yourdomain.com>'
   ```

## Step 10: Test End-to-End

1. Fill out the BSWD form with your email
2. Check the psycho-ed assessment checkbox
3. Verify email appears in `email_queue` table (status: pending)
4. Wait 1 minute for cron job to run (or manually trigger the function)
5. Check email_queue table (status should change to: sent)
6. Check your email inbox!

## Monitoring

### View Email Queue Status

```sql
-- Check pending emails
SELECT * FROM email_queue WHERE status = 'pending' ORDER BY created_at DESC;

-- Check sent emails
SELECT * FROM email_queue WHERE status = 'sent' ORDER BY sent_at DESC LIMIT 10;

-- Check failed emails
SELECT * FROM email_queue WHERE status = 'failed' ORDER BY created_at DESC;

-- Email statistics
SELECT status, COUNT(*) FROM email_queue GROUP BY status;
```

### View Function Logs

Go to: Project > Edge Functions > send-psycho-ed-email > Logs

## Troubleshooting

### Function not deploying
- Make sure Supabase CLI is installed and updated
- Make sure you're logged in: `supabase login`
- Make sure project is linked: `supabase link`

### Emails not sending
- Check function logs for errors
- Verify Resend API key is correct
- Check email_queue table for error_message
- Verify domain is verified in Resend

### "Table not found" error
- Run the `supabase-email-migration.sql` first
- Refresh Supabase schema cache

## Cost Considerations

- **Resend Free Tier**: 100 emails/day, 3,000 emails/month
- **Supabase Edge Functions**: Free tier includes 500K invocations/month
- **pg_cron**: Included in all Supabase plans

This setup is free for most educational use cases!
