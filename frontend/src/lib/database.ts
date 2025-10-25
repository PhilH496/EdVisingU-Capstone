import { supabase } from './supabase';
import { FormData } from '@/types/bswd';

//StepOne
export const saveStudentInfo = async (formData: FormData) => {
  const { data, error } = await supabase
    .from('student')
    .insert({
      oen: parseInt(formData.oen),
      first_name: formData.firstName,
      last_name: formData.lastName, 
      dob: formData.dateOfBirth,
      sin: formData.sin || null,
      phone_number: formData.phone || null
    })
    .select()
    .single();

  if (error) throw error;
  return data.student_id;
};

//StepTwo - (Not used in index.tsx for now, check if format is correct to save into database)
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