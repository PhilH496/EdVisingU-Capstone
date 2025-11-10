import { supabase } from "./supabase";
import { FormData } from "@/types/bswd";

// Helper to conditionally add optional fields
const addIfPresent = (obj: Record<string, any>, key: string, value: any): void => {
  if (value != null && value !== "" && value !== false) {
    obj[key] = value;
  }
};

/**
 * Saves complete form submission to multiple Supabase tables
 * @param formData - Complete form data object
 * @returns Object containing inserted student_id
 * @throws Error if any insert operation fails
 */
export const saveSubmission = async (formData: FormData) => {
  // 1. Insert into student table
  const studentPayload: any = {
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
    has_osap_application: formData.hasOsapApplication,
  };
  addIfPresent(studentPayload, "phone", formData.phone);

  const { data: studentData, error: studentError } = await supabase
    .from("student")
    .insert(studentPayload)
    .select()
    .single();

  if (studentError) throw studentError;
  const studentId = studentData.student_id;

  // 2. Insert into program_info table
  const programPayload: any = {
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
  addIfPresent(programPayload, "previous_institution", formData.previousInstitution);

  const { error: programError } = await supabase
    .from("program_info")
    .insert(programPayload);

  if (programError) throw programError;

  // 3. Insert into osap_info table
  const osapPayload: any = {
    student_id: studentId,
    application_type: formData.osapApplication,
    federal_need: formData.federalNeed,
    provincial_need: formData.provincialNeed,
    has_restrictions: formData.hasOSAPRestrictions,
    osap_on_file_status: formData.osapOnFileStatus || null,
  };
  addIfPresent(osapPayload, "restriction_type", formData.restrictionType);
  addIfPresent(osapPayload, "queued_for_manual_review", formData.queuedForManualReview);

  const { error: osapError } = await supabase
    .from("osap_info")
    .insert(osapPayload);

  if (osapError) throw osapError;

  // 4. Insert into disability_info table
  const disabilityPayload: any = {
    student_id: studentId,
    disability_type: formData.disabilityType,
    needs_psycho_ed_assessment: formData.needsPsychoEdAssessment,
  };
  addIfPresent(disabilityPayload, "disability_verification_date", formData.disabilityVerificationDate);

  // Handle functional limitations - convert object to array or use array directly
  if (formData.functionalLimitations) {
    if (Array.isArray(formData.functionalLimitations) && formData.functionalLimitations.length > 0) {
      disabilityPayload.functional_limitations = formData.functionalLimitations;
    } else if (typeof formData.functionalLimitations === 'object') {
      // Convert object to array of keys where value is true
      const limitations = Object.keys(formData.functionalLimitations).filter(
        key => (formData.functionalLimitations as any)[key] === true
      );
      if (limitations.length > 0) {
        disabilityPayload.functional_limitations = limitations;
      }
    }
  }

  const { error: disabilityError } = await supabase
    .from("disability_info")
    .insert(disabilityPayload);

  if (disabilityError) throw disabilityError;

  // 5. Insert requested items (if any)
  if (formData.requestedItems && formData.requestedItems.length > 0) {
    const requestedItemsPayload = formData.requestedItems.map(item => ({
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

  return { student_id: studentId };
};