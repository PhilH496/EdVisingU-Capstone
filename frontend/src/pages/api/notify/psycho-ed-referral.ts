import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/lib/supabase";

type ResponseData = {
  success: boolean;
  message: string;
};

/**
 * API endpoint for sending psycho-educational assessment referral emails
 * 
 * This endpoint handles sending referral information to students who require
 * psycho-educational assessments for learning disability verification.
 * Uses Supabase for email delivery.
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

    // Create email content
    const emailSubject = "Psycho-Educational Assessment Referral - Next Steps";
    const emailBody = `
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

---
Student ID: ${studentId || "N/A"}
Reference: ${template || "psycho-ed-referral"}
`;

    // Store email request in Supabase database
    // This allows for email queue processing and tracking
    const { data: emailRecord, error: dbError } = await supabase
      .from('email_queue')
      .insert({
        to_email: email,
        subject: emailSubject,
        body: emailBody,
        email_type: 'psycho_ed_referral',
        student_name: studentName,
        student_id: studentId,
        status: 'pending',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (dbError) {
      console.error("Database error:", dbError);
      
      // If table doesn't exist, fall back to console logging
      if (dbError.code === '42P01') {
        console.log("\n⚠️  Note: email_queue table doesn't exist yet in Supabase.");
        console.log("To enable email sending, create the table using the SQL below:\n");
        console.log("=== Supabase SQL Migration ===");
        console.log(`
CREATE TABLE IF NOT EXISTS email_queue (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  to_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  email_type TEXT NOT NULL,
  student_name TEXT,
  student_id TEXT,
  status TEXT DEFAULT 'pending',
  sent_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_email_queue_status ON email_queue(status);
CREATE INDEX IF NOT EXISTS idx_email_queue_created_at ON email_queue(created_at);

-- Enable Row Level Security
ALTER TABLE email_queue ENABLE ROW LEVEL SECURITY;

-- Create policy (adjust as needed for your security requirements)
CREATE POLICY "Allow service role full access" ON email_queue
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
        `);
        console.log("================================\n");
        
        // Log email details for now
        console.log("=== Psycho-Educational Assessment Referral ===");
        console.log(`To: ${email}`);
        console.log(`Student Name: ${studentName || "N/A"}`);
        console.log(`Student ID: ${studentId || "N/A"}`);
        console.log(`\nEmail Content:`);
        console.log(`Subject: ${emailSubject}`);
        console.log(emailBody);
        console.log("=============================================\n");
        
        return res.status(200).json({
          success: true,
          message: `Email logged successfully. Note: Database table needs to be created for actual email sending.`,
        });
      }
      
      throw dbError;
    }

    console.log(`✓ Email queued successfully for ${email} (ID: ${emailRecord?.id})`);

    // Return success response
    return res.status(200).json({
      success: true,
      message: `Referral email queued successfully. You will receive it at ${email} shortly.`,
    });

  } catch (error) {
    console.error("Error sending psycho-ed referral email:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error. Failed to send referral email.",
    });
  }
}

