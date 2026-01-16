import { supabase } from './supabase';

/**
 * sendPsychoEdReferral
 * 
 * Sends a psycho-educational assessment referral email to the student immediately.
 * Calls Edge Function directly via Supabase client.
 * 
 * @param email - Student's email address
 * @param studentName - Student's full name
 * @param studentId - Student's ID number
 * @returns Promise that resolves when email is sent
 */
export async function sendPsychoEdReferral(
  email: string,
  studentName?: string,
  studentId?: string
): Promise<{ success: boolean; message: string }> {
  try {
    // Call Edge Function via Supabase client to send email immediately
    const { error } = await supabase.functions.invoke('send-psycho-ed-email', {
      body: {
        email: email,
        studentName: studentName ?? "Student",
        studentId: studentId ?? "",
      },
    });

    if (error) {
      console.error('Error sending email via Edge Function:', error);
      return {
        success: false,
        message: error.message,
      };
    }

    return {
      success: true,
      message: 'Referral email sent successfully!',
    };
  } catch (e) {
    console.error("sendPsychoEdReferral failed", e);
    return {
      success: false, 
      message: "Failed to send referral email. Please try again."
    };
  }
}

/**
 * sendNoOsapEmail
 * 
 * Sends a No OSAP notification email to the student immediately.
 * Calls Edge Function directly via Supabase client.
 * 
 * @param email - Student's email address
 * @param studentName - Student's full name
 * @param studentId - Student's ID number
 * @param firstName - Student's first name
 * @param lastName - Student's last name
 * @returns Promise that resolves when email is sent
 */
export async function sendNoOsapEmail(
  email: string | undefined | null,
  studentName?: string,
  studentId?: string,
  firstName?: string,
  lastName?: string
): Promise<{ success: boolean; message: string }> {
  try {
    // Call Edge Function via Supabase client to send email immediately
    const { error } = await supabase.functions.invoke('send-no-osap-email', {
      body: {
        email: email ?? "",
        studentName: studentName ?? "Student",
        studentId: studentId ?? "",
        firstName: firstName ?? "",
        lastName: lastName ?? "",
      },
    });

    if (error) {
      console.error('Edge Function error:', error);
      return {
        success: false,
        message: error.message || 'Failed to send No OSAP notification',
      };
    }

    return {
      success: true,
      message: 'No OSAP notification sent successfully!',
    };
  } catch (e) {
    console.error("sendNoOsapEmail failed", e);
    return { success: false, message: "Failed to send notification. Please try again." };
  }
}
  
