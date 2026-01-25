-- Create test user profile for Playwright automation tests
-- 
-- STEP 1: Run this SQL first to clean up any existing test user
-- STEP 2: Then create user in Supabase Dashboard UI:
--         Go to Authentication → Users → Add user → Create new user
--         Email: test@playwright.test
--         Password: testpassword123
--         Check "Auto Confirm User" ✅
--         Click "Create user"
-- STEP 3: Run this SQL again to create the user profile

-- ========================================
-- CLEAN UP EXISTING TEST USER (Run this first!)
-- ========================================
DELETE FROM public.user_profiles WHERE email = 'test@playwright.test';
DELETE FROM auth.users WHERE email = 'test@playwright.test';

-- After deleting, go create the user in the UI, then run the SQL below:
-- ========================================
-- STEP A: First check if user exists (Run this to verify user was created)
-- ========================================
SELECT id, email, email_confirmed_at, created_at
FROM auth.users
WHERE email LIKE '%playwright%';

-- If you see the user above, continue to Step B
-- ========================================
-- STEP B: CREATE USER PROFILE (Run after confirming user exists)
-- ========================================

DO $$
DECLARE
  test_user_id UUID;
BEGIN
  -- Get the user ID from auth.users
  SELECT id INTO test_user_id
  FROM auth.users
  WHERE email = 'test@playwright.test';

  IF test_user_id IS NULL THEN
    RAISE EXCEPTION 'Test user not found! Please create user test@playwright.test in Authentication UI first.';
  END IF;

  -- Create or update user profile
  INSERT INTO public.user_profiles (id, email, role, full_name, created_at, updated_at)
  VALUES (
    test_user_id,
    'test@playwright.test',
    'student',
    'Test User',
    now(),
    now()
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    email = EXCLUDED.email,
    role = EXCLUDED.role,
    full_name = EXCLUDED.full_name,
    updated_at = now();

  RAISE NOTICE 'Test user profile created/updated with ID: %', test_user_id;
END $$;

-- Verify the test user and profile exist
SELECT 
  u.id, 
  u.email, 
  p.role, 
  p.full_name,
  u.email_confirmed_at,
  CASE WHEN u.email_confirmed_at IS NOT NULL THEN 'YES' ELSE 'NO' END as email_confirmed
FROM auth.users u
LEFT JOIN public.user_profiles p ON u.id = p.id
WHERE u.email = 'test@playwright.test';
