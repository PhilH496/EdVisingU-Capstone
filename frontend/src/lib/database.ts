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
const calculateInitialStatus = async (formData: FormData): Promise<string> => {
  try {
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
      }
    );

    if (response.ok) {
      const data = await response.json();
      const score = data.confidence_score;

      // Same thresholds as admin dashboard
      if (score >= 90) return "Approved";
      if (score >= 75) return "In Review";
      return "Rejected";
    }
  } catch (error) {
    console.error(error);
  }

  // Fallback to 'Failed' if API call fails
  return "Failed";
};

/**
 * Saves complete form submission to multiple Supabase tables
 * @param formData - Complete form data object
 * @returns Object containing inserted student_id and application_id
 * @throws Error if any insert operation fails
 */
export const saveSubmission = async (formData: FormData) => {
  // 1. Insert into student table
  const studentPayload: StudentInsert = {
    has_osap_application: formData.hasOsapApplication ?? false,
    student_id: +formData.studentId,
    oen: parseInt(formData.oen),
    first_name: formData.firstName,
    last_name: formData.lastName,
    dob: formData.dateOfBirth,
    sin: parseInt(formData.sin),
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

  if (studentError) throw studentError;
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

  if (programError) throw programError;

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

  if (osapError) throw osapError;

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

  if (disabilityError) throw disabilityError;

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

    if (itemsError) throw itemsError;
  }

  // 6. Calculate initial status based on deterministic checks
  const initialStatus = await calculateInitialStatus(formData);

  // 7. Create application record for admin dashboard
  const applicationId = `APP-${studentId}`;

  const applicationPayload = {
    id: applicationId,
    student_name: `${formData.firstName} ${formData.lastName}`,
    student_id: formData.studentId,
    submitted_date: new Date().toISOString(),
    status: initialStatus,
    program: formData.program,
    institution: formData.institution,
    study_period: `${formData.studyPeriodStart} - ${formData.studyPeriodEnd}`,
    status_updated_date: new Date().toISOString(),
  };

  const { error: appError } = await supabase
    .from("applications")
    .insert(applicationPayload);

  if (appError) throw appError;

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

  if (snapError) throw snapError;

  return { student_id: studentId, application_id: applicationId };
};
