import { supabase } from "./supabase";
import { FormData } from "@/types/bswd";
import { DeterministicChecksResult } from "./deterministicChecks";
import { Database } from "@/types/supabase";
type StudentInsert = Database["public"]["Tables"]["student"]["Insert"];
type OsapInfoInsert = Database["public"]["Tables"]["osap_info"]["Insert"];
type DisabilityInfoInsert = Database["public"]["Tables"]["disability_info"]["Insert"];
type ProgramInfoInsert = Database["public"]["Tables"]["program_info"]["Insert"];
type RequestedItemsInsert = Database["public"]["Tables"]["requested_items"]["Insert"]
type ManualReviewPayload = StudentInsert & ProgramInfoInsert & OsapInfoInsert & DisabilityInfoInsert & {
  requested_items?: RequestedItemsInsert[]
};

interface AnalysisPayload {
  manualReviewData: Partial<ManualReviewPayload>;
  deterministicChecksData: DeterministicChecksResult;
}

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
  const studentPayload: StudentInsert = {
    has_osap_application: formData.hasOsapApplication,
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
    postal_code: parseInt(formData.postalCode),
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
  addIfPresent(programPayload, "previous_institution", formData.previousInstitution);

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
  addIfPresent(disabilityPayload, "disability_verification_date", formData.disabilityVerificationDate);

  // Handle functional limitations - convert object to array or use array directly
  if (formData.functionalLimitations) {
    if (Array.isArray(formData.functionalLimitations)) {
      const selected = formData.functionalLimitations
        .filter(lim => lim.checked)
        .map(lim => lim.label);

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

/**
 * Builds a clean structured JSON payload for AI model analysis
 * @param formData - Raw form submission data
 * @param ruleResults - Deterministic rule evaluation results
 * @returns Structured JSON object with student data, rule evaluation, and summary context
 */
export const buildAnalysisPayload = (formData: FormData, deterministicChecksData: DeterministicChecksResult): AnalysisPayload => {
  // Helper to convert null/undefined to empty string
  const cleanValue = (value: unknown): string => {
    if (value === null || value === undefined) return "";
    return String(value);
  };

  // Any type that has cleanValue() is an optional type from the form
  const manualReviewData: Partial<ManualReviewPayload> = {
    student_id: parseInt(formData.studentId),
    oen: parseInt(formData.oen),
    first_name: formData.firstName,
    last_name: formData.lastName,
    address: formData.address,
    city: formData.city,
    province: formData.province,
    postal_code: parseInt(formData.postalCode),
    country: formData.country,
    institution_name: formData.institution,
    institution_type: formData.institutionType,
    federal_need: formData.federalNeed,
    provincial_need: formData.provincialNeed,
    restriction_type: cleanValue(formData.restrictionType),
    disability_verification_date: cleanValue(formData.disabilityVerificationDate),
    functional_limitations: formData.functionalLimitations
      ?.filter(x => x.checked)
      ?.map(x => x.label)
      ?.join(", "),
    needs_psycho_ed_assessment: formData.needsPsychoEdAssessment,
    submitted_disability_elsewhere: formData.submittedDisabilityElsewhere,
    requested_items: formData.requestedItems?.map(item => ({
      category: item.category,
      item: item.item,
      cost: item.cost,
      funding_source: item.fundingSource,
    }))
  };

  return {
    manualReviewData,
    deterministicChecksData
  };
};