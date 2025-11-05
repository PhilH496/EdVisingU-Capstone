import * as z from "zod";

export const StudentInfoSchema = z.object({
  studentId: z
    .string()
    .min(7, "Student ID must be at least 7 digits")
    .max(15, "Student ID must be 15 digits or less")
    .regex(/^\d+$/, "Student ID must contain only numbers"),
  oen: z
    .string()
    .regex(/^\d+$/, { message: "Must contain only numbers" })
    .length(9, "Student ID must be exactly 9 digits long"),
  firstName: z
    .string()
    .min(2, { message: "First name is too short" })
    .max(50, { message: "First name is too long" }),
  lastName: z
    .string()
    .min(2, { message: "Last name is too short" })
    .max(30, { message: "Last name is too long" }),
  dateOfBirth: z
    .date()
    .min(new Date("1900-01-01"), { message: "Too old" })
    .max(new Date(), { message: "Born in the future???" }),
  sin: z.string().length(9, { message: "Sin must be 9 digits" }),
});
