import { supabase } from "./supabase";
import { FormData } from "@/types/bswd";
import { Database } from "@/types/supabase";

type StudentInsert = Database["public"]["Tables"]["student"]["Insert"];
type OsapInfoInsert = Database["public"]["Tables"]["osap_info"]["Insert"];
type DisabilityInfoInsert =
  Database["public"]["Tables"]["disability_info"]["Insert"];
type ProgramInfoInsert = Database["public"]["Tables"]["program_info"]["Insert"];
// Insert: {
//           code?: number | null
//           institution_name: string
//           institution_type: string
//           previous_institution?: string | null
//           program?: string | null
//           program_info_id?: number
//           student_id?: number | null
//           study_end: string
//           study_start: string
//           study_type: string
//           submitted_disability_elsewhere: boolean
//         }
// Helper to conditionally add optional fields
const addIfPresent = <
  T extends ProgramInfoInsert | OsapInfoInsert | DisabilityInfoInsert,
  K extends keyof T
>(
  obj: T,
  key: K,
  value: T[K]
): void => {
  if (value != null && value !== "") {
    obj[key] = value;
  }
};

/**
 * Calculate initial application status based on confidence score to store into supabase
 */
const calculateInitialStatus = async (formData: FormData): Promise<{ status: string; score: number }> => {
  try {
    // Create AbortController with 30 second timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const response = await fetch(
      `${
        process.env.NEXT_PUBLIC_API_URL
      }/api/analysis/score`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          disability_type: formData.disabilityType,
          study_type: formData.studyType,
          has_osap_restrictions: formData.hasOSAPRestrictions,
          osap_application: formData.osapApplication,
          provincial_need: formData.provincialNeed,
          federal_need: formData.federalNeed,
          requested_items: formData.requestedItems,
        }),
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      const score = data.confidence_score;

      // Convert score to status, similar to admin dashboard
      let status: string;
      if (score >= 90) {status = "Approved";}
      else if (score >= 75) { status = "In Review";}
      else {status = "Rejected";}

      return { status, score };
    }
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.warn('Score calculation timed out or was cancelled');
    } else {
      console.error('Error calculating status:', error);
    }
  }

  // Fallback to 'In Review' if API call fails (safer than 'Failed')
  return { status: "In Review", score: 50 };
};

/**
 * Saves complete form submission to multiple Supabase tables
 * @param formData - Complete form data object
 * @returns Object containing inserted student_id and application_id
 * @throws Error if any insert operation fails
 */
export const saveSubmission = async (formData: FormData) => {
  // Check if student already exists (by Student ID or OEN)
  const { data: existingByStudentId } = await supabase
    .from("student")
    .select("student_id, first_name, last_name")
    .eq("student_id", +formData.studentId)
    .single();

  if (existingByStudentId) {
    throw new Error(
      `A student with Student ID ${formData.studentId} already exists in the system. ` +
      `Name: ${existingByStudentId.first_name} ${existingByStudentId.last_name}. ` +
      `If this is you, please check if you already have an application.`
    );
  }

  const { data: existingByOEN } = await supabase
    .from("student")
    .select("student_id, oen, first_name, last_name")
    .eq("oen", parseInt(formData.oen))
    .single();

  if (existingByOEN) {
    throw new Error(
      `A student with OEN ${formData.oen} already exists in the system. ` +
      `(Student ID: ${existingByOEN.student_id}, Name: ${existingByOEN.first_name} ${existingByOEN.last_name}). ` +
      `Each OEN can only be used once. Please verify your information.`
    );
  }

  // Check if application already exists
  const applicationId = `APP-${formData.studentId}`;
  const { data: existingApp } = await supabase
    .from("applications")
    .select("id, student_name, submitted_date")
    .eq("id", applicationId)
    .single();

  if (existingApp) {
    throw new Error(
      `An application with ID ${applicationId} already exists. ` +
      `Submitted by: ${existingApp.student_name} on ${new Date(existingApp.submitted_date).toLocaleDateString()}. ` +
      `You cannot submit multiple applications with the same Student ID.`
    );
  }

  // 1. Insert into student table
  const studentPayload: StudentInsert = {
    has_osap_application: formData.hasOsapApplication ?? false,
    student_id: +formData.studentId,
    oen: parseInt(formData.oen),
    first_name: formData.firstName,
    last_name: formData.lastName,
    dob: formData.dateOfBirth,
    sin: formData.sin,
    email: formData.email,
    address: formData.address,
    city: formData.city,
    province: formData.province,
    postal_code: formData.postalCode,
    country: formData.country,
  };

  const { data: studentData, error: studentError } = await supabase
    .from("student")
    .insert(studentPayload)
    .select()
    .single();

  if (studentError) {
    console.error("Student insert error:", studentError);
    
    // Provide specific error messages for common issues
    if (studentError.message.includes('student_id_key')) {
      throw new Error(`Student ID ${formData.studentId} is already in use.`);
    } else if (studentError.message.includes('student_oen_key')) {
      throw new Error(`OEN ${formData.oen} is already in use.`);
    } else {
      throw new Error(`Failed to save student information: ${studentError.message}`);
    }
  }
  const studentId = studentData.student_id;

  // 2. Insert into program_info table
  const programPayload: ProgramInfoInsert = {
    student_id: studentId,
    institution_name: formData.institution,
    institution_type: formData.institutionType,
    study_type: formData.studyType,
    study_start: formData.studyPeriodStart,
    study_end: formData.studyPeriodEnd,
    submitted_disability_elsewhere: formData.submittedDisabilityElsewhere,
  };
  addIfPresent(programPayload, "program", formData.program);
  addIfPresent(programPayload, "code", formData.code);
  addIfPresent(
    programPayload,
    "previous_institution",
    formData.previousInstitution
  );

  const { error: programError } = await supabase
    .from("program_info")
    .insert(programPayload);

  if (programError) {
    console.error("Program info insert error:", programError);
    throw new Error(`Failed to save program information: ${programError.message}`);
  }

  // 3. Insert into osap_info table
  const osapPayload: OsapInfoInsert = {
    student_id: studentId,
    application_type: formData.osapApplication,
    federal_need: formData.federalNeed,
    provincial_need: formData.provincialNeed,
    has_restrictions: formData.hasOSAPRestrictions,
  };
  addIfPresent(osapPayload, "restriction_type", formData.restrictionType);

  const { error: osapError } = await supabase
    .from("osap_info")
    .insert(osapPayload);

  if (osapError) {
    console.error("OSAP info insert error:", osapError);
    throw new Error(`Failed to save OSAP information: ${osapError.message}`);
  }

  // 4. Insert into disability_info table
  const disabilityPayload: DisabilityInfoInsert = {
    student_id: studentId,
    disability_type: formData.disabilityType,
    needs_psycho_ed_assessment: formData.needsPsychoEdAssessment,
  };
  addIfPresent(
    disabilityPayload,
    "disability_verification_date",
    formData.disabilityVerificationDate
  );

  // Handle functional limitations - convert object to array or use array directly
  if (formData.functionalLimitations) {
    if (Array.isArray(formData.functionalLimitations)) {
      const selected = formData.functionalLimitations
        .filter((lim) => lim.checked)
        .map((lim) => lim.label);

      if (selected.length > 0) {
        disabilityPayload.functional_limitations = selected.join(", ");
      }
    }
  }

  const { error: disabilityError } = await supabase
    .from("disability_info")
    .insert(disabilityPayload);

  if (disabilityError) {
    console.error("Disability info insert error:", disabilityError);
    throw new Error(`Failed to save disability information: ${disabilityError.message}`);
  }

  // 5. Insert requested items (if any)
  if (formData.requestedItems && formData.requestedItems.length > 0) {
    const requestedItemsPayload = formData.requestedItems.map((item) => ({
      student_id: studentId,
      category: item.category,
      item: item.item,
      cost: item.cost,
      funding_source: item.fundingSource,
    }));

    const { error: itemsError } = await supabase
      .from("requested_items")
      .insert(requestedItemsPayload);

    if (itemsError) {
      console.error("Requested items insert error:", itemsError);
      throw new Error(`Failed to save requested items: ${itemsError.message}`);
    }
  }

  // 6. Calculate initial status based on deterministic checks
  const { status: initialStatus, score: initialScore } = await calculateInitialStatus(formData);

  // 7. Create application record for admin dashboard (applicationId already declared above)
  const applicationPayload = {
    id: applicationId,
    student_name: `${formData.firstName} ${formData.lastName}`,
    student_id: formData.studentId,
    submitted_date: new Date().toISOString(),
    status: initialStatus,
    confidence_score: initialScore,
    program: formData.program,
    institution: formData.institution,
    study_period: `${formData.studyPeriodStart} - ${formData.studyPeriodEnd}`,
    status_updated_date: new Date().toISOString(),
  };

  const { error: appError } = await supabase
    .from("applications")
    .insert(applicationPayload);

  if (appError) {
    console.error("Application record insert error:", appError);
    throw new Error(`Failed to create application record: ${appError.message}`);
  }

  // 8. Create snapshot record with full form data
  const snapshotPayload = {
    id: applicationId,
    form_data: formData,
    form_data_history: [],
    last_modified_at: new Date().toISOString(),
    last_modified_by: "student",
  };

  const { error: snapError } = await supabase
    .from("snapshots")
    .insert(snapshotPayload);

  if (snapError) {
    console.error("Snapshot insert error:", snapError);
    throw new Error(`Failed to create application snapshot: ${snapError.message}`);
  }

  return { student_id: studentId, application_id: applicationId };
};
