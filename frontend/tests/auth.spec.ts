import { test, expect } from '@playwright/test';
import { signUpTestUser, deleteTestUser, TEST_USER_EMAIL, TEST_USER_PASSWORD} from './utils';

const TEST_USER_PASSWORD_SHORT = 'Test123';
const TEST_USER_PASSWORD_NO_SYMBOL = 'TestPass123';

test.describe('Auth Tests', () => {
  let userID: string;

  // this doubles as a signup test if you think about it
  test.beforeAll(async () => {
    userID = await signUpTestUser();
  });

  test.afterAll(async () => {
    if (userID) {
      await deleteTestUser(userID);
    }
  });

  // Login and logout functionality
  test('good login', async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    await page.getByLabel('Email address').fill(TEST_USER_EMAIL);
    await page.getByLabel('Password').fill(TEST_USER_PASSWORD);
    await page.getByRole('button', { name: 'Sign in' }).click();
    await page.locator('button').filter({ hasText: TEST_USER_EMAIL }).click();
    await page.getByRole('button', { name: 'Logout' }).click();
    await page.waitForURL('http://localhost:3000/login');
    await page.locator('form').filter({ hasText: 'Sign in' });
  });
  
  // Assert bad login error
  test('bad login', async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    await page.getByLabel('Email address').fill(TEST_USER_EMAIL);
    await page.getByLabel('Password').fill(TEST_USER_PASSWORD_SHORT);
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page.locator('#login-error')).toBeVisible({ timeout: 10000 }); // need to include this so webkit can consistently see it. i hate webkit
    await expect(page.locator('#login-error')).toHaveText('Invalid login credentials');
  });

  // Assert short password error
  test('bad short password', async ({ page }) => {
    await page.goto('http://localhost:3000/signup');
    await page.getByLabel('Email address').fill(TEST_USER_EMAIL);
    await page.locator('#password').fill(TEST_USER_PASSWORD_SHORT);
    await page.locator('#confirm-password').fill(TEST_USER_PASSWORD_SHORT);
    await page.getByLabel('Full Name').fill('Weak Password Test');
    await page.getByRole('button', { name: 'Sign up' }).click();
    await expect(page.locator('#submit-error')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('#submit-error')).toHaveText('Password must be at least 8 characters');
  });

  // Assert missing symbol error
  test('bad missing symbol password', async ({ page }) => {
    await page.goto('http://localhost:3000/signup');
    await page.getByLabel('Email address').fill(TEST_USER_EMAIL);
    await page.locator('#password').fill(TEST_USER_PASSWORD_NO_SYMBOL);
    await page.locator('#confirm-password').fill(TEST_USER_PASSWORD_NO_SYMBOL);
    await page.getByLabel('Full Name').fill('Missing Symbol Test');
    await page.getByRole('button', { name: 'Sign up' }).click();
    await expect(page.locator('#submit-error')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('#submit-error')).toHaveText('Password must contain uppercase, lowercase, number, and symbol');
  });
});