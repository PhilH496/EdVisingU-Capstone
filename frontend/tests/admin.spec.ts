import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

const ADMIN_EMAIL = 'donotdelete@admin.test';
const ADMIN_PASSWORD = 'test';

async function login(page: Page) {
  await page.goto('/login');
  await page.getByLabel('Email address').fill(ADMIN_EMAIL);
  await page.getByLabel('Password').fill(ADMIN_PASSWORD);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL('**/');
}

test.describe('Admin Tests', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.getByRole('link', { name: 'Admin Portal' }).click();
    await page.waitForURL('**/admin');
  });

  test('delete application', async ({ page }) => {
    const firstRow = page.locator('[data-application-id]').first(); // get topmost application
    await expect(firstRow).toBeVisible();
    const applicationId = await firstRow.getAttribute('data-application-id'); // grab expected value to be deleted
    expect(applicationId).toBeTruthy();

    await page.getByRole('button', { name: 'Edit' }).click();
    await page.locator(`#admin-select-${applicationId}`).check();

    page.on('dialog', async (dialog) => {
      if (dialog.type() === 'prompt') await dialog.accept('Test deletion reason');
      else if (dialog.type() === 'confirm') await dialog.accept();
    });

    await page.locator('#admin-delete-selected-btn').click();
    await expect(page.locator('#admin-toolbar-msg')).toContainText('Deleted 1 application(s)', { timeout: 5000 });
    await expect(page.locator(`#admin-app-id-${applicationId}`)).not.toBeAttached();
  });

  test('status change', async ({ page }) => {
    await page.getByRole('button', { name: 'Edit' }).click();
    const firstRow = page.locator('[data-application-id]').first();
    const applicationId = await firstRow.getAttribute('data-application-id');
    await page.locator(`#admin-select-${applicationId}`).check();
    await page.locator('#admin-apply-status-btn').click();
    await expect(page.locator('#admin-toolbar-msg')).toContainText('Applied "Submitted" to 1', { timeout: 5000 });
    await expect(firstRow.locator('text=Submitted').first()).toBeVisible();
  });

  test('run analysis', async ({ page }) => {
    await page.getByRole('link', { name: 'View' }).first().click();
    await page.waitForURL('**/admin/**');
    // doesn't assert any content. only that the ui elements appear so i'm not sure how useful this is
    await page.locator('#admin-run-ai-analysis-btn').click();
    await expect(page.locator('#admin-ai-analysis-card')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('#admin-ai-analysis-reasoning')).toBeVisible();
    await expect(page.locator('#admin-ai-analysis-score')).toBeVisible();
    await expect(page.getByRole('main')).toContainText('AI Reasoning');
  });

  test('select sort assert', async ({ page }) => {
    await page.getByRole('button', { name: 'Edit' }).click();
    await page.locator('#admin-select-all').check();
    await page.locator('#admin-clear-selection-btn').click();

    await page.locator('#admin-sort-by-btn').click();
    await page.getByRole('button', { name: 'Alphabetical (Name)' }).click();
    const firstHeading = page.locator('[data-application-id]').first().locator('h2').first(); 
    await expect(firstHeading).toHaveText(/^A/i); // this test assumes there will always be a student with an A in their name.

    await page.locator('#admin-sort-by-btn').click();
    await page.getByRole('button', { name: 'Application Status' }).click();
    const firstStatus = page.locator('[data-application-id]').first().locator('text=Approved').first(); // this test assumes there will always be approved applications
    await expect(firstStatus).toBeVisible();
  });

  test('details assignee violations', async ({ page }) => {
    const firstRow = page.locator('[data-application-id]').first();
    const applicationId = await firstRow.getAttribute('data-application-id');
    await page.locator(`#admin-details-toggle-${applicationId}`).click();

    await page.getByRole('textbox', { name: 'Assigned To' }).first().fill('John Admin');
    await page.getByRole('button', { name: 'Add violation: Insufficient medical evidence' }).click();
    await page.getByRole('button', { name: 'Add violation: Purchased item/service before approval' }).click();
    await page.getByRole('textbox', { name: 'Other details (optional)' }).first().fill('test details');
    await page.locator(`#admin-save-details-${applicationId}`).click();

    await page.locator(`#admin-details-toggle-${applicationId}`).click(); // once to collapse details tab
    await page.locator(`#admin-details-toggle-${applicationId}`).click(); // again to reopen it

    await expect(page.locator(`#assignee-${applicationId}`)).toHaveValue('John Admin');
    await expect(page.getByRole('button', { name: 'Remove violation: Insufficient medical evidence' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Remove violation: Purchased item/service before approval' })).toBeVisible();
    await expect(page.locator(`#violation-details-${applicationId}`)).toHaveValue('test details');
  });
});

//TODO make test for editing a student application. Currently running issue into bad test data by script.