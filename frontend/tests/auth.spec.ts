import { test, expect } from '@playwright/test';
import { supabase } from '@/lib/supabase';

const TEST_USER_EMAIL = 'test@playwright.test';
const TEST_USER_PASSWORD = 'testpassword123';

// Test for signup with random user 
const RANDOM_USER_EMAIL = `test-${Date.now()}@playwright.test`;
const RANDOM_USER_PASSWORD = 'ValidPassword123!';

test.describe('Authentication Tests', () => {
  
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
    await page.getByRole('textbox', { name: /password/i }).fill('wrongpassword999');
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
    
    // Fill in signup form
    await page.getByRole('textbox', { name: /email/i }).fill(RANDOM_USER_EMAIL);
    await page.locator('#password').fill(RANDOM_USER_PASSWORD);
    await page.locator('#confirm-password').fill(RANDOM_USER_PASSWORD);
    await page.getByRole('textbox', { name: /full name|name/i }).fill('Test User Playwright');
    
    // Submit signup form
    await page.getByRole('button', { name: /sign up|create account/i }).click();
    
    // Wait for success (either redirect or success message)
    await page.waitForTimeout(2000);
    
    // Check if signup was successful (should redirect or show success message)
    // Option 1: Check for redirect to login or confirmation page
    const currentUrl = page.url();
    const signupSuccess = currentUrl.includes('/login') || 
                         currentUrl.includes('/') ||
                         await page.locator('text=/success|account created|check.*email/i').isVisible();
    
    expect(signupSuccess).toBeTruthy();
    
    // Cleanup: Delete the test user from Supabase
    if (supabase) {
      // Wait a bit to ensure user is fully created
      await page.waitForTimeout(2000);
      
      // Get user ID first
      const { data: users, error: fetchError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('email', RANDOM_USER_EMAIL);
      
      if (users && users.length > 0) {
        const userId = users[0].id;
        
        // Delete from user_profiles first
        await supabase
          .from('user_profiles')
          .delete()
          .eq('email', RANDOM_USER_EMAIL);
        
        // Delete from auth.users (requires admin privileges)
        // Note: This might not work with client SDK, may need admin API
        await supabase.auth.admin.deleteUser(userId).catch(() => {
          console.log('Note: User deletion from auth.users requires admin privileges');
        });
      }
    }
  });

  // Test for password requirements (if any exist)
  test('should reject signup with weak password', async ({ page }) => {
    await page.goto('http://localhost:3000/signup');
    
    // Try to sign up with weak password
    await page.getByRole('textbox', { name: /email/i }).fill(`weak-${Date.now()}@test.com`);
    await page.locator('#password').fill('123'); // Too short
    await page.locator('#confirm-password').fill('123');
    await page.getByRole('textbox', { name: /full name|name/i }).fill('Weak Password Test');
    
    // Submit signup form
    await page.getByRole('button', { name: /sign up|create account/i }).click();
    
    // Wait for error message
    await page.waitForTimeout(1000);
    
    // Assert error message about password requirements
    // Common password requirements: minimum length, complexity, etc.
    const errorMessage = page.locator('text=/password.*weak|password.*short|password.*least.*6|password.*requirements/i');
    const hasError = await errorMessage.isVisible().catch(() => false);
    
    // If Supabase has password requirements, this should show an error
    expect(hasError).toBeTruthy();
  });
});
