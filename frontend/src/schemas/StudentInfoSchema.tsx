import * as z from "zod";

export const StudentInfoSchema = z.object({
  studentId: z
    .number()
    .int("Must be an interger")
    .refine((val) => val >= 10000000 && val < 99999999, {
      message: "Must contain 8 numbers",
    }),
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
  phone: z
    .string()
    .regex(/^\d+$/, { message: "Phone number must contain only number" })
    .min(4, { message: "Too short" })
    .max(17, { message: "Too long" }),
});
