import { test, expect, Page } from '@playwright/test';
import { deleteTestData, generateNumericId, signUpTestUser, deleteTestUser, TEST_USER_EMAIL, TEST_USER_PASSWORD, openDatePicker } from './utils';

const studentID = generateNumericId(8);
const applicationID = 'APP-' + studentID;
const OEN = generateNumericId(9);
const SIN = generateNumericId(9);

async function login(page: Page) {
  await page.goto('http://localhost:3000/login');
  await page.getByLabel('Email').fill(TEST_USER_EMAIL);
  await page.getByLabel('Password').fill(TEST_USER_PASSWORD);
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.waitForURL('http://localhost:3000/');
}

test.describe('Student Form Tests', () => {
  let userID: string;
  
  test.beforeEach(async () => {
    userID = await signUpTestUser();
  });

  test.afterEach(async () => {
    await deleteTestData(applicationID, studentID);
    await deleteTestUser(userID);
  });

  // end-to-end test for student submission process
  test('submission', async ({ page }) => {
    await login(page);
    // student info step
    await page.getByRole('radio', { name: 'Yes' }).check();
    await page.getByRole('button', { name: 'OSAP Application Start Date *' }).click();
    const osapPicker = openDatePicker(page);
    await osapPicker.getByRole('button', { name: 'Go to the Previous Month' }).first().click();
    await osapPicker.getByRole('button', { name: 'Go to the Previous Month' }).first().click();
    await osapPicker.getByRole('button', { name: 'Go to the Previous Month' }).first().click();
    await osapPicker.getByLabel('Choose the Year').first().selectOption('2024');
    await osapPicker.getByLabel('Choose the Month').first().selectOption('11');
    await osapPicker.getByRole('button', { name: 'Thursday, December 12th,' }).click();
    await page.getByLabel('Student ID *').fill(studentID);
    await page.getByLabel('Ontario Education Number (OEN').fill(OEN);
    await page.getByLabel('First Name *').fill('John');
    await page.getByLabel('Last Name *').fill('Test');
    await page.getByRole('button', { name: 'Date of Birth *' }).click();
    await openDatePicker(page).getByLabel('Choose the Year').first().selectOption('2004');
    await openDatePicker(page).getByLabel('Choose the Month').first().selectOption('7');
    await openDatePicker(page).getByRole('button', { name: 'Friday, August 27th,' }).click();
    await page.getByLabel('Social Insurance Number *').fill(SIN);
    await page.getByLabel('Email Address *').fill(TEST_USER_EMAIL);
    await page.getByLabel('Phone Number').fill('(123) 456-7890');
    await page.getByLabel('Street Address *').fill('123 Main Stree');
    await page.getByLabel('City *').fill('Toronto');
    await page.getByLabel('Province/Territory *').selectOption('BC');
    await page.getByLabel('Postal Code *').fill('B2B 2B2');
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    // program info step
    await page.getByText('Search for OSAP-approved').click();
    await page.getByRole('option', { name: 'McMaster University' }).click();
    await page.getByRole('combobox', { name: 'Institution Type *' }).click();
    await page.getByRole('option', { name: 'Public' }).click();
    await page.getByLabel('Program Cost Code').fill('12345');
    await page.getByLabel('Program of Study').fill('computer science');
    await page.getByRole('combobox', { name: 'Study Type *' }).click();
    await page.getByRole('option', { name: 'Part-Time' }).click();
    await page.getByRole('button', { name: 'Study Start Date *' }).click();
    await page.getByLabel('startDateLabel').selectOption('7');
    await page.getByRole('button', { name: 'Tuesday, August 26th,' }).click();
    await page.getByRole('button', { name: 'Study End Date *' }).click();
    await page.getByLabel('endDateLabel').selectOption('4');
    await page.getByRole('button', { name: 'Wednesday, May 13th,' }).click();
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    // osap info step
    await page.getByText('Student has OSAP restrictions').click();
    await page.getByRole('combobox').nth(2).selectOption('BANKRUPTCY');
    await page.getByRole('spinbutton').nth(1).click();
    await page.getByRole('spinbutton').nth(1).fill('');
    await page.getByRole('spinbutton').nth(1).press('ArrowLeft');
    await page.getByRole('spinbutton').nth(1).press('ArrowRight');
    await page.getByRole('spinbutton').nth(1).fill('');
    await page.getByRole('spinbutton').nth(1).press('ArrowLeft');
    await page.getByRole('spinbutton').nth(1).press('ControlOrMeta+Shift+ArrowRight');
    await page.getByRole('spinbutton').nth(1).fill('10000');
    await page.getByRole('spinbutton').first().click();
    await page.getByRole('spinbutton').first().press('ControlOrMeta+Shift+ArrowLeft');
    await page.getByRole('spinbutton').first().fill('1000');
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    // disability info step
    await page.getByRole('checkbox', { name: 'Student has verified' }).check();
    await page.getByRole('checkbox', { name: 'Student has verified' }).uncheck();
    await page.getByText('Disability Verification Date *Select date').click();
    await page.getByRole('checkbox', { name: 'Student has verified' }).check();
    await page.getByRole('button', { name: 'Disability Verification Date *' }).click();
    await openDatePicker(page).getByLabel('Choose the Year').first().selectOption('2025');
    await openDatePicker(page).getByLabel('Choose the Month').first().selectOption('7');
    await openDatePicker(page).getByRole('button', { name: 'Wednesday, August 27th,' }).click();
    await page.getByText('Persistent or Prolonged').click();
    await page.getByText('Permanent Disability').click();
    await page.getByRole('checkbox', { name: 'Dexterity' }).check();
    await page.getByRole('checkbox', { name: 'Cognitive' }).check();
    await page.getByRole('checkbox', { name: 'Chronic Pain' }).check();
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    // service & equipment step
    await page.getByRole('button', { name: 'Services' }).click();
    await page.getByRole('button', { name: 'Equipment', exact: true }).click();
    await page.getByRole('button', { name: 'Add All Equipment' }).click();
    await page.getByRole('button', { name: 'Services' }).click();
    await page.getByRole('button', { name: 'Add All Services' }).click();
    await page.getByRole('button', { name: 'Equipment', exact: true }).click();
    await page.getByRole('button', { name: 'Services' }).click();
    await page.getByRole('button', { name: 'Added ✓' }).first().click();
    await page.getByRole('button', { name: 'Equipment', exact: true }).click();
    await page.getByRole('button', { name: 'Added ✓' }).nth(2).click();
    // navigation button test
    await page.getByRole('button', { name: 'Previous' }).click();
    await page.getByRole('button', { name: 'Previous' }).click();
    await page.getByRole('button', { name: 'Previous' }).click();
    await page.getByRole('button', { name: 'Previous' }).click();
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await page.getByRole('button', { name: 'Service & Equipment' }).click();
    await page.getByRole('button', { name: 'Program Info' }).click();
    await page.getByRole('combobox', { name: 'Institution Type *' }).click();
    //await page.locator('html').click();
    await page.getByRole('option', { name: 'Public' }).click();
    await page.getByRole('button', { name: 'Study Start Date *' }).click();
    await page.getByRole('button', { name: 'Study Start Date *' }).click();
    await page.getByRole('button', { name: 'Review & Submit' }).click();
    // review & submit step
    await expect(page.locator('#review-oen')).toHaveText(OEN);
    await expect(page.locator('#review-studentID')).toHaveText(studentID);
    await expect(page.locator('#review-first-name')).toHaveText('John');
    await expect(page.locator('#review-last-name')).toHaveText('Test');
    //await expect(page.locator('#review-sin')).toHaveText(SIN);
    await expect(page.locator('#review-dob')).toHaveText('27/08/2004');
    await expect(page.locator('#review-email')).toHaveText(TEST_USER_EMAIL);
    await expect(page.locator('#review-phone')).toHaveText('(123) 456-7890');
    await expect(page.locator('#review-city')).toHaveText('Toronto');
    await expect(page.locator('#review-address')).toHaveText('123 Main Stree');
    await expect(page.locator('#review-province')).toHaveText('BC');
    await expect(page.locator('#review-postal-code')).toHaveText('B2B 2B2');
    await expect(page.locator('#review-country')).toHaveText('Canada');
    await expect(page.locator('#review-has-osap')).toHaveText('Yes');
    await expect(page.locator('#review-osap-start')).toHaveText('12/12/2024');
    await expect(page.locator('#review-institution')).toHaveText('mcmaster');
    await expect(page.locator('#review-program')).toHaveText('computer science');
    await expect(page.locator('#review-study-type')).toHaveText('part-time');
    await expect(page.locator('#review-study-period')).toHaveText('26/08/2025 to 13/05/2026');
    await expect(page.locator('#review-osap-type')).toHaveText('full-time');
    await expect(page.locator('#review-has-restrictions')).toHaveText('Yes');
    await expect(page.locator('#review-federal-need')).toHaveText('$1000');
    await expect(page.locator('#review-provincial-need')).toHaveText('$10000');
    await expect(page.locator('#review-has-disability')).toHaveText('No');
    await expect(page.locator('#review-disability-type')).toHaveText('permanent');
    await expect(page.locator('#review-limitations')).toHaveText('Cognitive, Dexterity, Chronic Pain');
    //await expect(page.locator('#review-requested-item-0')).toHaveText('Computer/Laptop');
    //await expect(page.locator('#review-requested-item-1')).toHaveText('Tablet');
    //await expect(page.locator('#review-requested-item-2')).toHaveText('Tutoring Services');
    //await expect(page.locator('#review-requested-item-3')).toHaveText('ADD/ADHD Coaching');
    await page.getByRole('checkbox', { name: 'I confirm that all the' }).check();
    await page.getByRole('button', { name: 'Submit Application' }).click();
    // thank you page
    await page.waitForSelector('#applicationId');
    await expect(page.locator('#applicationId')).toHaveText(applicationID);
    await expect(page.locator('#submittedByName')).toHaveText('Submitted by: John Test');
  });

  // i18n functionality test
  test('localization', async ({ page }) => {
    await login(page);
    await page.getByRole('combobox').first().selectOption('fr');
    await expect(page.locator('#studentFormHeader')).toContainText('Formulaire de demande BSWD');
    await expect(page.getByRole('list')).toContainText('Info étudiant');
  });

  // student chatbot functionality test
  test('chatbot', async ({ page }) => {
    await login(page);
    await page.getByRole('button', { name: 'Open chat' }).click();
    await page.getByLabel('Type your message...').fill('Can you verify that this chat is functional by responding to this chat with "Yes"');
    await page.getByRole('button', { name: 'Send message' }).click();
    await page.waitForSelector('#chatbotResponse');
    await expect(page.locator('#chatbotResponse').last()).toContainText('Yes');
  });
});