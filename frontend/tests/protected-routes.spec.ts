import { test, expect } from '@playwright/test';
import { signUpTestUser, deleteTestUser, TEST_USER_EMAIL, TEST_USER_PASSWORD } from './utils';

test.describe('Protected Routes', () => {
  test('unauth to application', async ({ page }) => {
    await page.goto('/application');
    await expect(page).toHaveURL(/\/login/);
    await expect(page.locator('form').filter({ hasText: 'Sign in' })).toBeVisible();
  });

  test('unauth to admin', async ({ page }) => {
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/login/);
    await expect(page.locator('form').filter({ hasText: 'Sign in' })).toBeVisible();
  });

  //
  test.describe('Protected routes by roles', () => {
    let userID: string;

    test.beforeEach(async () => {
      userID = await signUpTestUser();
    });

    test.afterEach(async () => {
      await deleteTestUser(userID);
    });

    test('student to admin', async ({ page }) => {
      await page.goto('/login');
      await page.getByLabel('Email address').fill(TEST_USER_EMAIL);
      await page.getByLabel('Password').fill(TEST_USER_PASSWORD);
      await page.getByRole('button', { name: 'Sign in' }).click();
      await page.waitForURL(/\/application/);

      await page.goto('/admin');
      await expect(page).toHaveURL(/\/application-status/);
    });
  });
});