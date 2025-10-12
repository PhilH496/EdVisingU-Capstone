// Step 2: Institution and program information
// ProgramInfoStep Component Goes Here
// 
// HELPFUL INFO:
// - formData: Object containing all form data (see @/types/bswd.ts for available fields)
// - setFormData: Updates form data using: setFormData(prev => ({ ...prev, fieldName: value }))
// - Reference StudentInfoStep.tsx for examples
// - Add validation in index.tsx > isStepComplete() function
// - Use brand colors located in tailwind.config.js; reference StudentInfoStep.tsx

import { FormData } from "@/types/bswd";
import { Input } from "@/components/ui/input"
import * as React from "react"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { CheckIcon, ChevronsUpDownIcon } from "lucide-react"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
const institutions = [
  {
    value: "test1",
    label: "test1",
  },
  {
    value: "test2",
    label: "test2",
  },
]

interface ProgramInfoStepProps {
  formData: FormData;
  setFormData: (data: FormData | ((prev: FormData) => FormData)) => void;
}

export function ProgramInfoStep( { formData, setFormData }: ProgramInfoStepProps) {
  const [value, setValue] = React.useState("")
  const [open, setOpen] = React.useState(false)
  const [startDate, setStartDate] = React.useState<Date | null>(null)
  const [endDate, setEndDate] = React.useState<Date | null>(null)
  const startRef = React.useRef<HTMLInputElement>(null)
  const endRef = React.useRef<HTMLInputElement>(null)

  const handleSelectStart = (selected: Date | undefined) => {
    if (!selected) return
    setStartDate(selected)
    if (startRef.current)
      startRef.current.value = format(selected, "yyyy-MM-dd")
  }

  const handleSelectEnd = (selected: Date | undefined) => {
    if (!selected) return
    setEndDate(selected)
    if (endRef.current)
      endRef.current.value = format(selected, "yyyy-MM-dd")
  }

  return (
    <div className="space-y-4">

      <h2 className="text-xl font-semibold mb-4">Step 2: Program Information</h2>
      <div className="grid md:grid-cols-2 gap-4 text-brand-text-gray">

        {/* Institution Name div */}
        <div>
          <label htmlFor="institutionName" className="fontSize block text-md font-medium mb-1 text-brand-text-gray">
            Institution Name
          </label>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="mx-auto justify-between"
              >
                {value
                  ? institutions.find((institution) => institution.value === value)?.label
                  : "Search for OSAP-approved institutions in Ontario"}
                <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
              <Command>
                <CommandInput placeholder="Search institution..." />
                <CommandList>
                  <CommandEmpty>No institution found.</CommandEmpty>
                  <CommandGroup>
                    {institutions.map((institution) => (
                      <CommandItem
                        key={institution.value}
                        value={institution.value}
                        onSelect={(currentValue) => {
                          setValue(currentValue === value ? "" : currentValue)
                          setOpen(false)
                        }}
                      >
                        <CheckIcon
                          className={cn(
                            "mr-2 h-4 w-4",
                            value === institution.value ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {institution.label}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* Institution Type div */}
        <div>
          <label htmlFor="institutionType" className="block text-base font-medium mb-1 text-brand-text-gray">
            Institution Type *
            <Select>
              <SelectTrigger className="mx-auto">
                <SelectValue placeholder="Public" />
              </SelectTrigger>
              <SelectContent id="institutionType">
                <SelectItem value="public-ontario">Public</SelectItem>
                <SelectItem value="private-ontario">Private</SelectItem>
              </SelectContent>
            </Select>
          </label>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">

        {/* Program Cost Code div */}
        <div>
          <label htmlFor="code" className="block text-base font-medium mb-1 text-brand-text-gray">
            Program Cost Code
          </label>
          <Input
            id="code"
            type="text"
            placeholder="Enter cost code"
          />
        </div>

        {/* Program of Study div*/}
        <div>
          <label htmlFor="program" className="block text-base font-medium mb-1 text-brand-text-gray">
            Program of Study
          </label>
          <Input
            id="program"
            type="text"
            placeholder="Enter program name" 
            />
        </div>

        {/* Study Type div*/}
        <div>
          <label className="block text-base font-medium mb-1 text-brand-text-gray">
            Study Type
          </label>
          <Select>
            <SelectTrigger className="mx-auto">
              <SelectValue placeholder="Full-Time" />
            </SelectTrigger>
            <SelectContent id="studyType">
              <SelectItem value="full-time">Full-Time</SelectItem>
              <SelectItem value="part-time">Part-Time</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">

        {/* Study Start Date div */}
        <div>
          <label htmlFor="studyPeriodStart" className="block text-base font-medium mb-1 text-brand-text-gray">
            Study Start Date *
          </label>
          <Popover>
            <div className="relative w-[280px]">
              <input
                id="studyPeriodStart"
                ref={startRef}
                type="date"
                defaultValue={startDate ? format(startDate, "yyyy-MM-dd") : ""}
                className="w-full rounded-md border border-input bg-background px-3 py-2 pr-10 text-sm"
                onChange={(e) => {
                  const value = e.target.value
                  if (value) {
                    const parsed = new Date(value)
                    if (!isNaN(parsed.getTime())) {
                      setStartDate(parsed)
                    }
                  } else {
                    setStartDate(null)
                  }
                }}
              />
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <CalendarIcon className="h-4 w-4" />
                </button>
              </PopoverTrigger>
              <PopoverContent side="bottom" align="end" className="w-auto p-0 z-50">
                <Calendar mode="single" selected={startDate ?? undefined} onSelect={handleSelectStart} />
              </PopoverContent>
            </div>
          </Popover>
        </div>

        {/* Study End Date div */}
        <div>
          <label htmlFor="studyPeriodEnd" className="block text-base font-medium mb-1 text-brand-text-gray">
            Study End Date *
          </label>
          <Popover>
            <div className="relative w-[280px]">
              <input
                id="studyPeriodEnd"
                ref={endRef}
                type="date"
                defaultValue={endDate ? format(endDate, "yyyy-MM-dd") : ""}
                className="w-full rounded-md border border-input bg-background px-3 py-2 pr-10 text-sm"
              />
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <CalendarIcon className="h-4 w-4" />
                </button>
              </PopoverTrigger>
              <PopoverContent side="bottom" align="end" className="w-auto p-0 z-50">
                <Calendar mode="single" selected={endDate ?? undefined} onSelect={handleSelectEnd} />
              </PopoverContent>
            </div>
          </Popover>
        </div>
      </div>

    </div>
  );
}