# Quick Deployment Guide - Email System

## ✅ What You Already Have:
1. ✅ Resend API Key configured
2. ✅ Supabase credentials configured
3. ✅ Email queue table created in Supabase
4. ✅ Edge Function code ready

## 🚀 Deploy via Supabase Dashboard (Easiest Method):

### Step 1: Create the Edge Function in Supabase Dashboard

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/lspqgwjlifgepomifbrd
2. Click on **Edge Functions** in the left sidebar
3. Click **Create a new function**
4. Name it: `send-psycho-ed-email`
5. Copy the entire content from `supabase/functions/send-psycho-ed-email/index.ts` and paste it into the editor
6. Click **Deploy**

### Step 2: Set Environment Variables

1. Still in Edge Functions, click on your `send-psycho-ed-email` function
2. Go to the **Settings** tab or **Secrets** section
3. Add these secrets:
   - `RESEND_API_KEY` = `re_Cd3tKhAy_CkHc6TsWpwhg2mDr2NgBTpPa`
   - `SUPABASE_URL` = `https://lspqgwjlifgepomifbrd.supabase.co`
   - `SUPABASE_SERVICE_ROLE_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzcHFnd2psaWZnZXBvbWlmYnJkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTg3NjExNywiZXhwIjoyMDc1NDUyMTE3fQ.MZaptTlbHJA3y5ZPLTQA_SVa6MiSOkKX7x7I7luKuyI`

### Step 3: Set Up Cron Job (Auto-Process Emails)

1. In your Supabase Dashboard, go to **SQL Editor**
2. Click **New Query**
3. Paste this SQL and run it:

```sql
-- Enable pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Create cron job to process email queue every minute
SELECT cron.schedule(
  'process-email-queue',
  '* * * * *', -- Run every minute
  $$
  SELECT net.http_post(
    url:='https://lspqgwjlifgepomifbrd.supabase.co/functions/v1/send-psycho-ed-email',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzcHFnd2psaWZnZXBvbWlmYnJkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTg3NjExNywiZXhwIjoyMDc1NDUyMTE3fQ.MZaptTlbHJA3y5ZPLTQA_SVa6MiSOkKX7x7I7luKuyI"}'::jsonb,
    body:='{}'::jsonb
  ) as request_id;
  $$
);
```

### Step 4: Test the System

1. Go to your application at http://localhost:3000
2. Fill out the form up to the Disability Information step
3. Check the "Psycho-educational Assessment" checkbox
4. Enter your email address (use a real email you can check)
5. Click "Save and Continue"

### Step 5: Verify Email Was Sent

**Check the email queue:**
```sql
SELECT * FROM email_queue ORDER BY created_at DESC LIMIT 5;
```

**Check email stats:**
```sql
SELECT * FROM email_stats;
```

**If you see status = 'sent'**, check your email inbox! 📧

---

## 🐛 Troubleshooting:

### If emails stay in 'pending' status:
1. Check that the cron job is running:
   ```sql
   SELECT * FROM cron.job;
   ```
2. Check cron job runs:
   ```sql
   SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 5;
   ```

### If emails go to 'failed' status:
1. Check error messages:
   ```sql
   SELECT id, to_email, status, error_message, created_at 
   FROM email_queue 
   WHERE status = 'failed' 
   ORDER BY created_at DESC;
   ```

### Manual trigger (for testing):
You can manually trigger the email function:
```sql
SELECT net.http_post(
  url:='https://lspqgwjlifgepomifbrd.supabase.co/functions/v1/send-psycho-ed-email',
  headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzcHFnd2psaWZnZXBvbWlmYnJkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTg3NjExNywiZXhwIjoyMDc1NDUyMTE3fQ.MZaptTlbHJA3y5ZPLTQA_SVa6MiSOkKX7x7I7luKuyI"}'::jsonb,
  body:='{}'::jsonb
) as request_id;
```

---

## 📝 Alternative: Deploy via CLI

If you prefer to use the CLI, follow the detailed steps in `EDGE_FUNCTION_DEPLOYMENT.md`.

For CLI deployment, you'll need to:
1. Get an access token from: https://supabase.com/dashboard/account/tokens
2. Login with: `npx supabase login --token <your-token>`
3. Link project: `npx supabase link --project-ref lspqgwjlifgepomifbrd`
4. Deploy: `npx supabase functions deploy send-psycho-ed-email --no-verify-jwt`
5. Set secrets via CLI or dashboard

---

## 🎉 Success Checklist:
- [ ] Edge Function deployed and showing in dashboard
- [ ] Environment variables set
- [ ] Cron job created and running
- [ ] Test email sent from form
- [ ] Email received in inbox
- [ ] email_queue table showing 'sent' status

**You're all set! Your email system is now live! 🚀**
