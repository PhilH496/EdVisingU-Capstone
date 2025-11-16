import { supabase } from "./supabase";
import { FormData } from "@/types/bswd";

// StepOne
// Accepts either the full FormData or a normalized payload.
// We upsert on student_id so resubmits don't crash with duplicates.
export const saveStudentInfo = async (formData: Partial<FormData> & {
  studentId: string;
  oen: string;
  firstName: string;
  lastName: string;
  // Expect normalized date string YYYY-MM-DD (safer for DB) or Date
  dateOfBirth: string | Date;
  sin?: string | null;
  phone?: string | null;
}) => {
  const dob =
    (formData.dateOfBirth as any) instanceof Date
      ? (formData.dateOfBirth as Date).toISOString().slice(0, 10)
      : String(formData.dateOfBirth);

  const { data, error } = await supabase
    .from("student")
    .upsert(
      {
        student_id: Number(formData.studentId),
        oen: Number(formData.oen),
        first_name: formData.firstName,
        last_name: formData.lastName,
        dob,
        sin: formData.sin ?? null,
        phone_number: formData.phone ?? null,
      },
      { onConflict: "student_id" } // ← key fix: prevent duplicate errors
    )
    .select()
    .single();

  if (error) throw error;
  return data.student_id;
};

// StepTwo - (Not used in index.tsx for now, check if format is correct to save into database)
export const saveProgramInfo = async (studentId: number, formData: FormData) => {
  const { error } = await supabase
    .from("program_info")
    .insert({
      student_id: studentId,
      institution_name: formData.institution,
      institution_type: formData.institutionType,
      program: formData.program,
      study_type: formData.studyType,
      study_start: formData.studyPeriodStart,
      study_end: formData.studyPeriodEnd,
    });

  if (error) throw error;
};
