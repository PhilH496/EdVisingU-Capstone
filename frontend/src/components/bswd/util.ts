import { parse, format } from "date-fns";

interface DatePickerState {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
}

/**
 * Syncs a date picker state with form data value
 * 
 * @param formDataValue - The date string from form data (format: "dd/MM/yyyy")
 * @param datePickerState - The date picker state object from useDateRange hook
 */
export function syncDatePicker(formDataValue: string | undefined, datePickerState: DatePickerState): void {
  if (!formDataValue) {
    if (datePickerState.date) {
      datePickerState.setDate(undefined);
    }
    return;
  }

  // parse and validate the date
  try {
    const parsedDate = parse(formDataValue, "dd/MM/yyyy", new Date());
    if (!isNaN(parsedDate.getTime())) {
      // only update if dates don't match to avoid unnecessary re renders
      const currentDateStr = datePickerState.date
        ? format(datePickerState.date, "dd/MM/yyyy")
        : "";
      if (currentDateStr !== formDataValue) {
        datePickerState.setDate(parsedDate);
      }
    }
  } catch (error) {
    // invalid date format, ignore
  }
}