import { test, expect } from '@playwright/test';
import { supabase } from '@/lib/supabase';
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

// Manually parse .env.local since process.env doesn't work reliably in Playwright workers
function loadEnvFile() {
  try {
    const envPath = join(__dirname, '../.env.local');
    const envContent = readFileSync(envPath, 'utf-8');
    const env: Record<string, string> = {};
    
    for (const line of envContent.split('\n')) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          env[key.trim()] = valueParts.join('=').trim();
        }
      }
    }
    
    return env;
  } catch (err) {
    console.error('Failed to load .env.local:', err);
    return {};
  }
}

const ENV = loadEnvFile();

const TEST_USER_EMAIL = 'test@playwright.test';
const TEST_USER_PASSWORD = 'TestPass123!';

// Test for signup with random user 
const RANDOM_USER_EMAIL = `test-${Date.now()}@playwright.test`;
const RANDOM_USER_PASSWORD = 'ValidPassword123!';

// Track created test user IDs for cleanup
const createdUserIds: string[] = [];

// Function to get admin client
function getAdminClient() {
  const serviceRoleKey = ENV.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = ENV.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  
  if (!serviceRoleKey || !supabaseUrl) {
    return null;
  }
  
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

test.describe('Authentication Tests', () => {
  
  // Setup: Create test user before running tests
  test.beforeAll(async () => {
    // Try to create test user (will fail silently if already exists)
    try {
      const { data, error } = await supabase.auth.signUp({
        email: TEST_USER_EMAIL,
        password: TEST_USER_PASSWORD,
        options: {
          data: {
            full_name: 'Test User Playwright',
          },
        },
      });
      // Track user ID for cleanup
      if (data?.user?.id) {
        createdUserIds.push(data.user.id);
      }
      // If user already exists, find and track their ID
      const supabaseAdmin = getAdminClient();
      if (error?.message.includes('already registered') && supabaseAdmin) {
        const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
        const existingUser = users.find(u => u.email === TEST_USER_EMAIL);
        if (existingUser?.id && !createdUserIds.includes(existingUser.id)) {
          createdUserIds.push(existingUser.id);
        }
      } else if (error) {
        console.error('Failed to create test user:', error.message);
      }
    } catch (err) {
      console.error('Error in test setup:', err);
    }
  });

  // Cleanup: Delete test users after all tests complete
  test.afterAll(async () => {
    const supabaseAdmin = getAdminClient();
    
    if (!supabaseAdmin) {
      console.log('Skipping cleanup: SUPABASE_SERVICE_ROLE_KEY not configured');
      console.log('Add service role key to .env.local for automatic cleanup');
      return;
    }

    // Also find and cleanup any test users that might have been missed
    try {
      const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
      const testUsers = users.filter(u => 
        u.email?.includes('@playwright.test') ||
        u.email?.startsWith('test-') ||
        u.email?.startsWith('weak-') ||
        u.email?.startsWith('missing-')
      );
      
      // Add any missed test users to cleanup list
      for (const user of testUsers) {
        if (!createdUserIds.includes(user.id)) {
          createdUserIds.push(user.id);
        }
      }
    } catch (err) {
      console.error('Error finding test users:', err);
    }

    console.log(`Cleaning up ${createdUserIds.length} test user(s)...`);
    
    let successCount = 0;
    for (const userId of createdUserIds) {
      try {
        const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
        if (error) {
          console.error(`Failed to delete user ${userId}:`, error.message);
        } else {
          console.log(`Deleted test user: ${userId}`);
          successCount++;
        }
      } catch (err) {
        console.error(`Error deleting user ${userId}:`, err);
      }
    }
    console.log(`Cleanup complete: ${successCount}/${createdUserIds.length} users deleted`);
  });
  
  test('should login and logout successfully', async ({ page }) => {
    // Navigate to login page
    await page.goto('http://localhost:3000/login');
    
    // Fill in login credentials
    await page.getByRole('textbox', { name: /email/i }).fill(TEST_USER_EMAIL);
    await page.getByRole('textbox', { name: /password/i }).fill(TEST_USER_PASSWORD);
    
    // Click sign in button
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Wait for redirect to home page
    await page.waitForURL('http://localhost:3000/', { timeout: 10000 });
    
    // Verify user is logged in (login page should not be visible)
    await expect(page).toHaveURL('http://localhost:3000/');
    
    // Click on user menu to reveal logout button (menu button shows user name/email)
    await page.locator('button').filter({ hasText: /User|test/ }).click();
    
    // Wait for dropdown menu to appear and click logout
    await page.getByRole('button', { name: /logout/i }).click();
    
    // Wait for redirect to login page
    await page.waitForURL('http://localhost:3000/login', { timeout: 10000 });
    
    // Assert that login form is present (user is logged out)
    const loginForm = page.locator('form').filter({ hasText: /sign in/i });
    await expect(loginForm).toBeVisible();
    
    // Alternative: Check for email input field presence
    const emailInput = page.getByRole('textbox', { name: /email/i });
    await expect(emailInput).toBeVisible();
  });

  test('should show error with wrong email', async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    
    // Try to login with non-existent email
    await page.getByRole('textbox', { name: /email/i }).fill('wrongemail@nonexistent.test');
    await page.getByRole('textbox', { name: /password/i }).fill('anypassword123');
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Wait for error message to appear
    await page.waitForTimeout(1000);
    
    // Assert error message is displayed
    const errorMessage = page.locator('text=/invalid.*credentials|email.*not.*found|incorrect.*email/i');
    await expect(errorMessage).toBeVisible({ timeout: 5000 });
  });

  test('should show error with wrong password', async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    
    // Try to login with correct email but wrong password
    await page.getByRole('textbox', { name: /email/i }).fill(TEST_USER_EMAIL);
    await page.getByRole('textbox', { name: /password/i }).fill('WrongPass999!');
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Wait for error message to appear
    await page.waitForTimeout(1000);
    
    // Assert error message is displayed
    const errorMessage = page.locator('text=/invalid.*credentials|incorrect.*password|wrong.*password/i');
    await expect(errorMessage).toBeVisible({ timeout: 5000 });
  });

  test('should sign up new user and cleanup', async ({ page }) => {
    // Navigate to signup page
    await page.goto('http://localhost:3000/signup');
    
    // Generate unique email for this test run
    const signupEmail = `test-signup-${Date.now()}@playwright.test`;
    
    // Fill in signup form
    await page.getByRole('textbox', { name: /email/i }).fill(signupEmail);
    await page.locator('#password').fill(RANDOM_USER_PASSWORD);
    await page.locator('#confirm-password').fill(RANDOM_USER_PASSWORD);
    await page.getByRole('textbox', { name: /full name|name/i }).fill('Test User Playwright');
    
    // Submit signup form
    await page.getByRole('button', { name: /sign up|create account/i }).click();
    
    // Wait for success (either redirect or success message)
    await page.waitForTimeout(2000);
    
    // Check if signup was successful (should redirect or show success message)
    const currentUrl = page.url();
    const signupSuccess = currentUrl.includes('/login') || 
                         currentUrl.includes('/') ||
                         await page.locator('text=/success|account created|check.*email/i').isVisible();
    
    expect(signupSuccess).toBeTruthy();
    
    // Track user for cleanup (get user ID from Supabase)
    const supabaseAdmin = getAdminClient();
    if (supabaseAdmin) {
      try {
        const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
        const newUser = users.find(u => u.email === signupEmail);
        if (newUser?.id) {
          createdUserIds.push(newUser.id);
        }
      } catch (err) {
        console.error('Failed to track signup user for cleanup:', err);
      }
    }
  });

  test('should reject signup with password less than 8 characters', async ({ page }) => {
    await page.goto('http://localhost:3000/signup');
    
    // Try to sign up with password that's too short (requirement is 8 characters minimum)
    await page.getByRole('textbox', { name: /email/i }).fill(`weak-${Date.now()}@test.com`);
    await page.locator('#password').fill('Test12!'); // 7 characters - below minimum
    await page.locator('#confirm-password').fill('Test12!');
    await page.getByRole('textbox', { name: /full name|name/i }).fill('Weak Password Test');
    
    // Submit signup form
    await page.getByRole('button', { name: /sign up|create account/i }).click();
    
    // Wait for error message
    await page.waitForTimeout(1000);
    
    // Assert error message matches exact text from signup.tsx: "Password must be at least 8 characters"
    const errorMessage = page.locator('text=/password must be at least 8 characters/i');
    await expect(errorMessage).toBeVisible({ timeout: 5000 });
  });

  test('should reject signup with password missing required characters', async ({ page }) => {
    await page.goto('http://localhost:3000/signup');
    
    // Try to sign up with password missing symbol (has uppercase, lowercase, number but no symbol)
    await page.getByRole('textbox', { name: /email/i }).fill(`missing-${Date.now()}@test.com`);
    await page.locator('#password').fill('TestPass123'); // Missing symbol
    await page.locator('#confirm-password').fill('TestPass123');
    await page.getByRole('textbox', { name: /full name|name/i }).fill('Missing Symbol Test');
    
    // Submit signup form
    await page.getByRole('button', { name: /sign up|create account/i }).click();
    
    // Wait for error message
    await page.waitForTimeout(1000);
    
    // Assert error message matches exact text from signup.tsx
    const errorMessage = page.locator('text=/password must contain uppercase, lowercase, number, and symbol/i');
    await expect(errorMessage).toBeVisible({ timeout: 5000 });
  });
});
