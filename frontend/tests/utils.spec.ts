import { test, expect } from '@playwright/test';
import { supabase as supabaseClient} from '@/lib/supabase';

const testApplicationId = 'APP-1234567';
const testStudentId = '1234567';

async function resetTestData() {
  if (supabaseClient) {
    const appResult = await supabaseClient
      .from('applications')
      .delete()
      .eq('id', testApplicationId);
    
    const studentResult = await supabaseClient
      .from('student')
      .delete()
      .eq('student_id', testStudentId);  

    if (appResult.error || studentResult.error) {
      console.error('Error deleting test data:', appResult.error || studentResult.error);
    }
  }
}

test.afterEach(async () => {
  await resetTestData();
});

// end-to-end test for student submission process
test('submission', async ({ page }) => {
  // student info step
  await page.goto('http://localhost:3000/');
  await page.getByRole('radio', { name: 'Yes' }).check();
  await page.getByRole('button', { name: 'OSAP Application Start Date *' }).click();
  await page.getByRole('button', { name: 'Go to the Previous Month' }).click();
  await page.getByRole('button', { name: 'Go to the Previous Month' }).click();
  await page.getByRole('button', { name: 'Go to the Previous Month' }).click();
  await page.getByLabel('Choose the Year').selectOption('2024');
  await page.getByLabel('Choose the Month').selectOption('11');
  await page.getByRole('button', { name: 'Thursday, December 12th,' }).click();
  await page.getByRole('textbox', { name: 'Student ID *' }).click();
  await page.getByRole('textbox', { name: 'Student ID *' }).fill('1234567');
  await page.getByRole('textbox', { name: 'Ontario Education Number (OEN' }).click();
  await page.getByRole('textbox', { name: 'Ontario Education Number (OEN' }).fill('123456789');
  await page.getByRole('textbox', { name: 'First Name *' }).click();
  await page.getByRole('textbox', { name: 'First Name *' }).fill('Phillip');
  await page.getByRole('textbox', { name: 'Last Name *' }).click();
  await page.getByRole('textbox', { name: 'Last Name *' }).fill('Hernandez');
  await page.getByRole('button', { name: 'Date of Birth *' }).click();
  await page.getByLabel('Choose the Year').selectOption('2004');
  await page.getByLabel('Choose the Month').selectOption('7');
  await page.getByRole('button', { name: 'Friday, August 27th,' }).click();
  await page.getByRole('textbox', { name: 'Social Insurance Number *' }).click();
  await page.getByRole('textbox', { name: 'Social Insurance Number *' }).fill('123-456-789');
  await page.getByRole('textbox', { name: 'Email Address *' }).click();
  await page.getByRole('textbox', { name: 'Email Address *' }).fill('phiillyh@gmail.com');
  await page.getByRole('textbox', { name: 'Phone Number' }).click();
  await page.getByRole('textbox', { name: 'Phone Number' }).fill('(123) 456-7890');
  await page.getByRole('textbox', { name: 'Street Address *' }).click();
  await page.getByRole('textbox', { name: 'Street Address *' }).fill('123 Main Stree');
  await page.getByRole('textbox', { name: 'City *' }).click();
  await page.getByRole('textbox', { name: 'City *' }).fill('Toronto');
  await page.getByLabel('Province/Territory *').selectOption('BC');
  await page.getByRole('textbox', { name: 'Country *' }).click();
  await page.getByRole('textbox', { name: 'Postal Code *' }).click();
  await page.getByRole('textbox', { name: 'Postal Code *' }).fill('B2B 2B2');
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  // program info step
  await page.getByText('Search for OSAP-approved').click();
  await page.getByRole('option', { name: 'McMaster University' }).click();
  await page.getByRole('combobox', { name: 'Institution Type *' }).click();
  await page.getByRole('option', { name: 'Public' }).click();
  await page.getByRole('textbox', { name: 'Program Cost Code' }).click();
  await page.getByRole('textbox', { name: 'Program Cost Code' }).fill('12345');
  await page.getByRole('textbox', { name: 'Program of Study' }).click();
  await page.getByRole('textbox', { name: 'Program of Study' }).fill('computer science');
  await page.getByRole('combobox', { name: 'Study Type *' }).click();
  await page.getByRole('option', { name: 'Part-Time' }).click();
  await page.getByRole('button', { name: 'Study Start Date *' }).click();
  await page.getByLabel('startDateLabel').selectOption('7');
  await page.getByRole('button', { name: 'Tuesday, August 26th,' }).click();
  await page.getByRole('button', { name: 'Study End Date *' }).click();
  // TODO MAYBE UNCOMMENT THIS AND CHECK IF IT WORKS
  //await page.getByLabel('Choose the Year').selectOption('2025');
  //await page.getByLabel('Choose the Month').selectOption('7');
  //await page.getByRole('gridcell', { name: 'Wednesday, August 20th,' }).click();
  //await page.getByRole('gridcell', { name: 'Wednesday, August 20th,' }).click();
  //await page.getByRole('gridcell', { name: 'Thursday, August 21st,' }).click();
  //await page.getByRole('button', { name: 'Go to the Next Month' }).click();
  //await page.getByLabel('Choose the Year').selectOption('2026');
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
  await page.getByRole('button', { name: 'Wednesday, January 21st,' }).click();
  await page.getByRole('button', { name: 'Disability Verification Date *' }).click();
  await page.getByLabel('Choose the Year').selectOption('2025');
  await page.getByLabel('Choose the Month').selectOption('7');
  await page.getByRole('button', { name: 'Wednesday, August 27th,' }).click();
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
  await expect(page.locator('[id="__next"]')).toContainText('123456789');
  await page.getByText('1234567', { exact: true }).click();
  await page.getByText('Phillip').click();
  await page.getByText('Hernandez').click();
  await page.getByText('-456-789').click();
  await page.getByText('27/08/').click();
  await page.getByText('phiillyh@gmail.com').click();
  await page.getByText('(123) 456-').click();
  await page.getByText('Toronto').click();
  await page.getByText('Main Stree').click();
  await page.getByText('BC').click();
  await page.getByText('B2B 2B2').click();
  await page.getByText('Canada').click();
  await page.getByText('Yes').first().click();
  await page.getByText('12/12/').click();
  await page.getByText('mcmaster').click();
  await page.getByText('computer science').click();
  await page.getByText('part-time').click();
  await page.getByText('/08/2025 to 13/05/2026').click();
  await page.getByText('full-time').click();
  await page.getByText('Yes').nth(1).click();
  await page.getByText('$1000', { exact: true }).click();
  await page.getByText('$10000').click();
  await page.getByText('No', { exact: true }).click();
  await page.getByText('permanent').click();
  await page.getByText('Cognitive, Dexterity, Chronic').click();
  await page.getByText('Computer/LaptopEquipment$').click();
  await page.getByText('TabletEquipment$800both').click();
  await page.getByText('Tutoring ServicesService$0both').click();
  await page.getByText('ADD/ADHD CoachingService$0bswd').click();
  await page.getByRole('checkbox', { name: 'I confirm that all the' }).check();
  await page.getByRole('button', { name: 'Submit Application' }).click();
  // thank you page
  await expect(page.locator('#applicationId')).toHaveText('APP-1234567');
  await expect(page.locator('#submittedByName')).toHaveText('Submitted by: Phillip Hernandez');
});

// i18n functionality test
test('localization', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await page.getByRole('combobox').first().selectOption('fr');
  await expect(page.locator('#studentFormHeader')).toContainText('Formulaire de demande BSWD');
  await expect(page.getByRole('list')).toContainText('Info étudiant');
});

// student chatbot functionality test
test('chatbot', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await page.getByRole('button', { name: 'Open chat' }).click();
  await page.getByRole('textbox', { name: 'Type your message...' }).click();
  await page.getByRole('textbox', { name: 'Type your message...' }).fill('Can you verify that this chat is functional by responding to this chat with "Yes"');
  await page.getByRole('button', { name: 'Send message' }).click();
  await page.waitForSelector('#chatbotResponse');
  await expect(page.locator('#chatbotResponse')).toContainText('Yes');
});