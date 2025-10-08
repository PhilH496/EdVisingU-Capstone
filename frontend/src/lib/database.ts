import { supabase } from './supabase';
import { FormData } from '@/types/bswd';

//StepOne
export const saveStudentInfo = async (formData: FormData) => {
  const { data, error } = await supabase
    .from('student')
    .insert({
      oen: parseInt(formData.oen),
      name: formData.fullName,
      dob: formData.dateOfBirth,
      sin: formData.sin || null,
      phone_number: formData.phone || null
    })
    .select()
    .single();

  if (error) throw error;
  return data.student_id;
};

//StepOne + part of StepTwo
export const saveProgramInfo = async (studentId: number, formData: FormData) => {
  const { error } = await supabase
    .from('program_info')
    .insert({
      student_id: studentId,
      institution_name: formData.institution,
      institution_type: formData.institutionType,
      program: formData.program,
      study_type: formData.studyType,
      study_start: formData.studyPeriodStart,
      study_end: formData.studyPeriodEnd
    });

  if (error) throw error;
};