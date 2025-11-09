/**
 * For use with setting and displaying date picker selections on re-renders
**/
import { useState } from "react";

export function useDateRange() {
    const [open, setOpen] = useState(false);
    const [date, setDate] = useState<Date>();

    return { open, setOpen, date, setDate }
}