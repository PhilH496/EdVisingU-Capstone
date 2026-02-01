import { randomInt } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { supabase as supabaseClient } from '@/lib/supabase';
import { Page } from '@playwright/test';

// test credentials which change every test run to prevent race conditions
export const TEST_USER_EMAIL = 'test@playwright' + generateNumericId(8) + '.test';
export const TEST_USER_PASSWORD = 'TestPass123!';
// helper function to open the last date picker dialog
export const openDatePicker = (page: Page) => page.getByRole('dialog').last();
/**
 * Returns a string of cryptographically random numeric digits.
 * @param num Length of the string (number of digits 0–9).
 */
export function generateNumericId(num: number): string {
  let id = '';
  for (let i = 0; i < num; i++) {
    id += randomInt(0, 10);
  }
  return id;
}

/**
  * Signs up a test user with a randomly generated email
  */
export async function signUpTestUser() {
  const { data, error } = await supabaseClient.auth.signUp({
    email: TEST_USER_EMAIL,
    password: TEST_USER_PASSWORD
  });
  if (error) { console.error("Test user sign up failed: ", error) }
  return data.user ? data.user.id : ""
}

/**
  * Deletes test user
  * @param userID Specifies test user to delete 
  */
export async function deleteTestUser(userID: string) {
  if (userID) {
    const adminClient = createClient( // creating an admin client is the best i could come up 
      process.env.SUPABASE_URL!,      // i hope this isn't bad for security lol
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
    const { error } = await adminClient.auth.admin.deleteUser(userID)
    if (error) { console.error("Test user could not be deleted: ", error) }
  } else {
    console.error("Test user ID is null")
  }
}

/**
  * Deletes test data from applications and student tables
  * @param testApplicationId Specifies application ID to delete
  * @param testStudentId Specifies student ID to delete 
  */
export async function deleteTestData(testApplicationId: string, testStudentId: string) {
  if (supabaseClient) {
    const appResult = await supabaseClient
      .from("applications")
      .delete()
      .eq("id", testApplicationId);
    
    const studentResult = await supabaseClient
      .from("student")
      .delete()
      .eq("student_id", testStudentId);

    if (appResult.error) {
      console.error("Error deleting test application data: ", appResult.error);
    } else if (studentResult.error) {
      console.error("Error deleting test student data: ", studentResult.error);
    }
  }
}