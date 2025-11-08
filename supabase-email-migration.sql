-- ============================================
-- Email Queue System for BSWD Application
-- ============================================
-- Run this SQL in your Supabase SQL Editor
-- This creates the infrastructure for queuing and sending emails

-- 1. Create email_queue table
CREATE TABLE IF NOT EXISTS email_queue (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  to_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  email_type TEXT NOT NULL,
  student_name TEXT,
  student_id TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'processing')),
  sent_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_email_queue_status ON email_queue(status);
CREATE INDEX IF NOT EXISTS idx_email_queue_created_at ON email_queue(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_queue_type ON email_queue(email_type);
CREATE INDEX IF NOT EXISTS idx_email_queue_to_email ON email_queue(to_email);

-- 3. Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Create trigger for updated_at
DROP TRIGGER IF EXISTS update_email_queue_updated_at ON email_queue;
CREATE TRIGGER update_email_queue_updated_at
  BEFORE UPDATE ON email_queue
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 5. Enable Row Level Security
ALTER TABLE email_queue ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS policies

-- Policy 1: Service role has full access
DROP POLICY IF EXISTS "Allow service role full access" ON email_queue;
CREATE POLICY "Allow service role full access" ON email_queue
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Policy 2: Authenticated users can view emails sent to their email
DROP POLICY IF EXISTS "Users can view their own emails" ON email_queue;
CREATE POLICY "Users can view their own emails" ON email_queue
  FOR SELECT
  TO authenticated
  USING (to_email = auth.jwt() ->> 'email');

-- Policy 3: Allow insert for authenticated users (for queueing emails)
DROP POLICY IF EXISTS "Users can queue emails" ON email_queue;
CREATE POLICY "Users can queue emails" ON email_queue
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy 4: Allow anonymous to insert (if needed for public forms)
DROP POLICY IF EXISTS "Allow anon to queue emails" ON email_queue;
CREATE POLICY "Allow anon to queue emails" ON email_queue
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- 7. Create view for email statistics
CREATE OR REPLACE VIEW email_stats AS
SELECT 
  email_type,
  status,
  COUNT(*) as count,
  MIN(created_at) as first_email,
  MAX(created_at) as last_email
FROM email_queue
GROUP BY email_type, status
ORDER BY email_type, status;

-- 8. Create function to clean up old emails (optional)
CREATE OR REPLACE FUNCTION cleanup_old_emails(days_old INTEGER DEFAULT 30)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM email_queue
  WHERE status = 'sent' 
    AND created_at < NOW() - (days_old || ' days')::INTERVAL;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Grant permissions
GRANT SELECT ON email_stats TO authenticated;
GRANT SELECT ON email_stats TO service_role;

-- ============================================
-- Verification Queries
-- ============================================

-- Check if table was created
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_name = 'email_queue';

-- Check indexes
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'email_queue';

-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'email_queue';

-- ============================================
-- Test Data (Optional - for development)
-- ============================================

-- Uncomment to insert test email
/*
INSERT INTO email_queue (to_email, subject, body, email_type, student_name, student_id)
VALUES (
  'test@example.com',
  'Test Email',
  'This is a test email to verify the system is working.',
  'test',
  'Test Student',
  '12345678'
);
*/

-- Query to view all emails
-- SELECT * FROM email_queue ORDER BY created_at DESC LIMIT 10;

-- ============================================
-- Setup Complete!
-- ============================================
-- Next steps:
-- 1. Set up email sending mechanism (Edge Function, Webhook, or Worker)
-- 2. Configure email service provider (Resend, SendGrid, etc.)
-- 3. Test the system with a real email address
-- 4. Monitor the email_queue table for pending/sent/failed emails
