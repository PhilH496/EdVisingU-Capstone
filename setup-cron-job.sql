-- ============================================
-- Cron Job Setup for Email Processing
-- ============================================
-- Run this SQL in your Supabase SQL Editor
-- This sets up automatic email processing every minute

-- 1. First, create a function to process the email queue
CREATE OR REPLACE FUNCTION process_email_queue()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_email RECORD;
  v_request_id bigint;
BEGIN
  -- Get all pending emails
  FOR v_email IN 
    SELECT * FROM email_queue 
    WHERE status = 'pending' 
    ORDER BY created_at ASC
    LIMIT 10  -- Process up to 10 emails at a time
  LOOP
    BEGIN
      -- Update status to processing
      UPDATE email_queue 
      SET status = 'processing', 
          updated_at = NOW()
      WHERE id = v_email.id;
      
      -- Make HTTP request using pg_net (if available)
      -- Note: This will trigger the edge function to actually send the email
      SELECT INTO v_request_id
        net.http_post(
          url := 'https://lspqgwjlifgepomifbrd.supabase.co/functions/v1/send-psycho-ed-email',
          headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzcHFnd2psaWZnZXBvbWlmYnJkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTg3NjExNywiZXhwIjoyMDc1NDUyMTE3fQ.MZaptTlbHJA3y5ZPLTQA_SVa6MiSOkKX7x7I7luKuyI"}'::jsonb,
          body := json_build_object('emailId', v_email.id)::jsonb
        );
        
      -- If we got here, mark as sent
      UPDATE email_queue 
      SET status = 'sent', 
          sent_at = NOW(),
          updated_at = NOW()
      WHERE id = v_email.id;
      
    EXCEPTION WHEN OTHERS THEN
      -- If anything fails, mark as failed
      UPDATE email_queue 
      SET status = 'failed',
          error_message = SQLERRM,
          retry_count = retry_count + 1,
          updated_at = NOW()
      WHERE id = v_email.id;
    END;
  END LOOP;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION process_email_queue() TO postgres;
GRANT EXECUTE ON FUNCTION process_email_queue() TO service_role;

-- 2. Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 3. Drop existing cron job if it exists (to avoid duplicates)
DO $$
BEGIN
  PERFORM cron.unschedule('process-email-queue');
EXCEPTION
  WHEN OTHERS THEN
    NULL; -- Job doesn't exist yet, that's fine
END $$;

-- 4. Create cron job to process email queue every minute
SELECT cron.schedule(
  'process-email-queue',
  '* * * * *', -- Run every minute
  $$SELECT process_email_queue();$$
);

-- 5. Verify cron job was created
SELECT * FROM cron.job WHERE jobname = 'process-email-queue';

-- ============================================
-- Useful Queries
-- ============================================

-- View all cron jobs
-- SELECT * FROM cron.job;

-- View cron job execution history
-- SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;

-- Manually trigger the email function (for testing)
/*
SELECT process_email_queue();
*/

-- Check email queue status
-- SELECT status, COUNT(*) as count FROM email_queue GROUP BY status;

-- View recent emails
-- SELECT * FROM email_queue ORDER BY created_at DESC LIMIT 10;

-- Delete cron job (if needed)
-- SELECT cron.unschedule('process-email-queue');

-- ============================================
-- Next Steps
-- ============================================
-- 1. Copy this SQL and run it in Supabase SQL Editor
-- 2. Verify the cron job is created (check cron.job table)
-- 3. Test by filling out the form and checking the psycho-ed assessment box
-- 4. Wait 1 minute and check if email status changed to 'sent'
-- 5. Check your inbox for the email!
