import type { NextApiRequest, NextApiResponse } from "next";

const RESEND_API_KEY = process.env.RESEND_API_KEY;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!RESEND_API_KEY) {
    console.error("Missing RESEND_API_KEY env var");
    return res
      .status(500)
      .json({ error: "Missing RESEND_API_KEY server configuration" });
  }

  const { email, studentName, studentId } = req.body as {
    email?: string;
    studentName?: string;
    studentId?: string;
  };

  if (!email || !email.trim()) {
    return res.status(400).json({ error: "Email address is required" });
  }

  try {
    console.log(`Sending OSAP email to: ${email}`);

    const emailSubject = "OSAP Application Required for BSWD/CSG-DSE Application";

    const emailBodyText = `
Dear ${studentName || "Student"},

Our records indicate that you do not currently have an OSAP application on file.

To continue with your BSWD/CSG-DSE application, you must first have an active and approved OSAP application.

You can apply for OSAP at:
https://osap.gov.on.ca/

Student Information (if provided):
- Name: ${studentName || "N/A"}
- Student ID: ${studentId || "N/A"}

Once your OSAP application is approved, please return to the BSWD portal to continue your application.

Best regards,
BSWD Services Team
    `.trim();

    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "BSWD Services <onboarding@resend.dev>",
        to: [email],
        subject: emailSubject,
        text: emailBodyText,
      }),
    });

    const resendData = await resendRes.json();

    if (!resendRes.ok) {
      console.error(`✗ Failed to send OSAP email to ${email}:`, resendData);
      return res.status(500).json({
        success: false,
        error: "Failed to send email",
        details: resendData,
      });
    }

    console.log(`✓ OSAP email sent successfully to ${email}`, resendData);

    return res.status(200).json({
      success: true,
      message: "OSAP email sent successfully",
      resendId: resendData.id,
    });
  } catch (error) {
    console.error("no-osap handler error:", error);
    return res.status(500).json({
      error: "Internal server error",
      details: String(error),
    });
  }
}
