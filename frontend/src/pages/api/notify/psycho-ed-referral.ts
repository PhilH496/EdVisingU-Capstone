import type { NextApiRequest, NextApiResponse } from "next";

type ResponseData = {
  success: boolean;
  message: string;
};

/**
 * API endpoint for sending psycho-educational assessment referral emails
 * 
 * This endpoint handles sending referral information to students who require
 * psycho-educational assessments for learning disability verification.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed. Use POST.",
    });
  }

  try {
    const { email, studentName, studentId, template } = req.body;

    // Validate required fields
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email address is required",
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email address format",
      });
    }

    // TODO: Integrate with actual email service (e.g., SendGrid, AWS SES, Resend, etc.)
    // For now, we'll log the email details and simulate success
    
    console.log("=== Psycho-Educational Assessment Referral ===");
    console.log(`To: ${email}`);
    console.log(`Student Name: ${studentName || "N/A"}`);
    console.log(`Student ID: ${studentId || "N/A"}`);
    console.log(`Template: ${template}`);
    console.log("\nEmail Content:");
    console.log("Subject: Psycho-Educational Assessment Referral - Next Steps");
    console.log(`
Dear ${studentName || "Student"},

Thank you for submitting your BSWD/CSG-DSE application. We have received your request for a psycho-educational assessment referral.

NEXT STEPS:
────────────

1. Provider Connection
   You will be automatically connected with a qualified assessment provider in your geographical area who has a referral contract with us, or with a provider at your institution at a discounted rate.

2. Assessment Fee
   The assessment fee will be reviewed for approval and submitted to your institution's finance office for direct payment via EFT.

3. Timeline
   You can expect to hear from us within 3-5 business days with provider information and next steps.

WHAT TO EXPECT:
────────────────

• A qualified psycho-educational assessor will contact you directly
• The assessment typically takes 2-3 hours over one or two sessions
• Results will be provided to you and forwarded to our office for OSAP verification
• The assessment fee is covered through BSWD funding (subject to approval)

NEED HELP?
──────────

If you have any questions or concerns, please don't hesitate to contact our office:
• Email: disability.services@institution.edu
• Phone: (XXX) XXX-XXXX

We're here to support you through this process.

Best regards,
Disability Services Office
    `);
    console.log("=============================================\n");

    // Simulate email sending delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Return success response
    return res.status(200).json({
      success: true,
      message: `Referral email sent successfully to ${email}`,
    });

  } catch (error) {
    console.error("Error sending psycho-ed referral email:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error. Failed to send referral email.",
    });
  }
}
