/**
 * notifyNoOsap
 * 
 * Sends a templated notification to a student when no OSAP application is on file.
 * Currently logs a message locally (mock API); can later integrate with real email service.
 */

export async function notifyNoOsap(email: string | undefined | null) {
    try {
      await fetch("/api/notify/no-osap", {
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
 * Sends a psycho-educational assessment referral email to the student.
 * Includes information about connecting with qualified assessment providers.
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
    const response = await fetch("/api/notify/psycho-ed-referral", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: email ?? "",
        studentName: studentName ?? "Student",
        studentId: studentId ?? "",
        template: "psycho-ed-referral",
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to send referral email");
    }

    const data = await response.json();
    return { success: true, message: data.message || "Referral email sent successfully" };
  } catch (e) {
    console.warn("sendPsychoEdReferral failed", e);
    return { success: false, message: "Failed to send referral email. Please try again." };
  }
}
  