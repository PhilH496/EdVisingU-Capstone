import { supabase } from "./supabase";

export const saveStudentInfo = async (formData: {
  studentId: string;
  oen: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string | Date;
  sin?: string | null;
  phone?: string | null;
  email: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
}) => {
  let dobIso: string;

  if (formData.dateOfBirth instanceof Date) {
    dobIso = formData.dateOfBirth.toISOString().slice(0, 10);
  } else {
    const raw = String(formData.dateOfBirth || "").trim();

    if (!raw) {
      throw new Error("Invalid date of birth format. Expected DD/MM/YYYY.");
    }

    if (raw.includes("/")) {
      const [dayStr, monthStr, yearStr] = raw.split("/");
      const day = Number(dayStr);
      const month = Number(monthStr);
      const year = Number(yearStr);

      if (!day || !month || !year) {
        throw new Error("Invalid date of birth format. Expected DD/MM/YYYY.");
      }

      dobIso = new Date(year, month - 1, day).toISOString().slice(0, 10);
    } else {
      dobIso = raw;
    }
  }

  if (!formData.email?.trim()) throw new Error("Email is required.");
  if (!formData.address?.trim()) throw new Error("Address is required.");
  if (!formData.city?.trim()) throw new Error("City is required.");
  if (!formData.province?.trim()) throw new Error("Province is required.");
  if (!formData.postalCode?.trim()) throw new Error("Postal code is required.");
  if (!formData.country?.trim()) throw new Error("Country is required.");

  const studentIdNum = Number(formData.studentId);
  const oenNum = Number(formData.oen);

  if (Number.isNaN(studentIdNum)) {
    throw new Error("Student ID must be numeric.");
  }
  if (Number.isNaN(oenNum)) {
    throw new Error("OEN must be numeric.");
  }

  const payload = {
    student_id: studentIdNum,
    oen: oenNum,
    first_name: formData.firstName.trim(),
    last_name: formData.lastName.trim(),
    dob: dobIso,
    sin: formData.sin ?? null,
    phone_number: formData.phone ?? null,
    email: formData.email.trim(),
    address: formData.address.trim(),
    city: formData.city.trim(),
    province: formData.province.trim(),
    postal_code: formData.postalCode.trim(),
    country: formData.country.trim(),
  };

  const { data, error } = await supabase
    .from("student")
    .upsert(payload, { onConflict: "student_id" })
    .select()
    .single();

  if (error) throw error;
  return data.student_id;
};
