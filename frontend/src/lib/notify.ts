import { supabase } from './supabase';

/**
 * notifyNoOsap
 * 
 * Sends a templated notification to a student when no OSAP application is on file.
 * Uses the Next.js API route /api/no-osap to send the real email.
 */

export async function notifyNoOsap(email: string | undefined | null) {
  try {
    await fetch("/api/no-osap", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: email ?? "",
        template: "no-osap-on-file",
      }),
    });
  } catch (e) {
    console.warn("notifyNoOsap failed", e);
  }
}

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
  email: string | undefined | null,
  studentName?: string,
  studentId?: string
): Promise<{ success: boolean; message: string }> {
  try {
    // Call Edge Function directly via Supabase client to send email immediately
    const { data, error } = await supabase.functions.invoke('send-psycho-ed-email', {
      body: {
        email: email ?? "",
        studentName: studentName ?? "Student",
        studentId: studentId ?? "",
      },
    });

    if (error) {
      console.error('Edge Function error:', error);
      return {
        success: false,
        message: error.message || 'Failed to send referral email',
      };
    }

    console.log('Email sent via Edge Function:', data);
    return {
      success: true,
      message: 'Referral email sent successfully!',
    };
  } catch (e) {
    console.error("sendPsychoEdReferral failed", e);
    return { success: false, message: "Failed to send referral email. Please try again." };
  }
}
