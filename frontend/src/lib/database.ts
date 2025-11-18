import { supabase } from "./supabase";

type SaveStudentInfoPayload = {
  studentId: string;
  oen: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  sin: string;
  email: string;
  phone?: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
  hasOsapApplication: boolean | null;
};

export const saveStudentInfo = async (formData: SaveStudentInfoPayload) => {
  const dobIso = formData.dateOfBirth.toISOString().slice(0, 10);
  const sinDigits = formData.sin.replace(/\D/g, "");
  const phoneDigits = formData.phone ? formData.phone.replace(/\D/g, "") : null;

  const { data, error } = await supabase
    .from("student")
    .upsert(
      {
        student_id: Number(formData.studentId),
        oen: formData.oen,
        first_name: formData.firstName,
        last_name: formData.lastName,
        dob: dobIso,
        sin: sinDigits,
        email: formData.email.trim(),
        phone: phoneDigits,
        address: formData.address,
        city: formData.city,
        province: formData.province,
        postal_code: formData.postalCode,
        country: formData.country,
        has_osap_application: formData.hasOsapApplication ?? false,
      },
      { onConflict: "student_id" }
    )
    .select()
    .single();

  if (error) throw error;
  return data.student_id as number;
};

export const saveProgramInfo = async (studentId: number, formData: any) => {
  const { error } = await supabase.from("program_info").insert({
    student_id: studentId,
    institution_name: formData.institution,
    institution_type: formData.institutionType,
    program: formData.program,
    study_type: formData.studyType,
    study_start: formData.studyPeriodStart,
    study_end: formData.studyPeriodEnd,
    code: formData.code ? Number(formData.code) : null,
    previous_institution: formData.previousInstitution || null,
    submitted_disability_elsewhere:
      formData.submittedDisabilityElsewhere === "yes",
  });

  if (error) throw error;
};
