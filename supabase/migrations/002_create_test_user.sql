-- Create test user for Playwright automation tests
-- This user will be used ONLY for automated testing

-- IMPORTANT: Delete existing test user first if it exists
DELETE FROM public.user_profiles WHERE email = 'test@playwright.test';
DELETE FROM auth.users WHERE email = 'test@playwright.test';

-- Step 1: Insert test user into auth.users
DO $$
DECLARE
  test_user_id UUID := '00000000-0000-0000-0000-000000000001'::UUID;
BEGIN
    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      confirmation_sent_at,
      aud,
      role,
      raw_app_meta_data,
      raw_user_meta_data,
      is_super_admin,
      confirmation_token,
      email_change_token_new,
      recovery_token
    )
    VALUES (
      test_user_id,
      '00000000-0000-0000-0000-000000000000',
      'test@playwright.test',
      '$2a$10$yJ3qN5Zr5Zr5Zr5Zr5Zr5uKJ3qN5Zr5Zr5Zr5Zr5Zr5Zr5Zr5Zr', -- Bcrypt hash for 'testpassword123'
      now(),
      now(),
      now(),
      now(),
      'authenticated',
      'authenticated',
      '{"provider":"email","providers":["email"]}',
      '{"full_name":"Test User"}',
      false,
      '',
      '',
      ''
    );
    
    RAISE NOTICE 'Created test user with ID: %', test_user_id;
  ELSE
    RAISE NOTICE 'Test user already exists with ID: %', test_user_id;
  END IF;

  -- Step 2: Ensure user profile exists in user_profiles table
  INSERT INTO public.user_profiles (id, email, role, full_name, created_at, updated_at)
  VALUES (
    test_user_id,
    'test@playwright.test',
    'student', -- Test user is a student
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

  RAISE NOTICE 'Test user profile created/updated';
END $$;


-- SELECT 
--   u.id, 
--   u.email, 
--   p.role, 
--   p.full_name,
--   u.email_confirmed_at
-- FROM auth.users u
-- LEFT JOIN public.user_profiles p ON u.id = p.id
-- WHERE u.email = 'test@playwright.test';
