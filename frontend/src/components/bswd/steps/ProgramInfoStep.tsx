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
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger, } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select"
const institutions = [
  {
    value: "algoma",
    label: "Algoma University",
  },
  {
    value: "nipissing",
    label: "Nipissing University",
  },
  {
    value: "metro",
    label: "Toronto Metropolitan University",
  },
  {
    value: "brock",
    label: "Brock University",
  },
  {
    value: "ocad",
    label: "OCAD University",
  },
  {
    value: "trent",
    label: "Trent University",
  },
  {
    value: "carleton",
    label: "Carleton University",
  },
  {
    value: "français",
    label: "Université de l'Ontario français",
  },
  {
    value: "guelph",
    label: "University of Guelph",
  },
  {
    value: "tech",
    label: "Ontario Tech University",
  },
  {
    value: "waterloo",
    label: "University of Waterloo",
  },
  {
    value: "hearst",
    label: " Université de Hearst",
  },
  {
    value: "ottawa",
    label: "University of Ottawa",
  },
  {
    value: "western",
    label: "Western University",
  },
  {
    value: "lakehead",
    label: "Lakehead University",
  },
  {
    value: "queens",
    label: "Queen's University",
  },
  {
    value: "willfrid",
    label: "Willfrid Laurier University",
  },
  {
    value: "military",
    label: " Royal Military College of Canada",
  },
  {
    value: "laurentian",
    label: "Laurentian University",
  },
  {
    value: "mcmaster",
    label: "McMaster University",
  },
  {
    value: "toronto",
    label: "University of Toronto",
  },
  {
    value: "york",
    label: "York University",
  },
  {
    value: "windsor",
    label: "University of Windsor",
  },
]

interface ProgramInfoStepProps {
  formData: FormData;
  setFormData: (data: FormData | ((prev: FormData) => FormData)) => void;
}

export function ProgramInfoStep({ formData, setFormData }: ProgramInfoStepProps) {
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
          <label htmlFor="institutionName" className="block text-base font-medium mb-1 text-brand-text-gray">
            Institution Name *
          </label>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-start text-left"
              >
                {value
                  ? institutions.find((institution) => institution.value === value)?.label
                  : "Search for OSAP-approved institutions"}
                <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="mx-auto p-0">
              <Command>
                <CommandInput placeholder="Search institution..." className="h-9" />
                <CommandList>
                  <CommandEmpty>No institution found.</CommandEmpty>
                  <CommandGroup>
                    {institutions.map((institution) => (
                      <CommandItem
                        key={institution.value}
                        value={institution.value}
                        onSelect={(currentValue) => {
                          const newValue = currentValue === value ? "" : currentValue;
                          setValue(currentValue === value ? "" : currentValue)
                          setFormData(prev => ({ ...prev, institution: newValue }));
                          setOpen(false)
                        }}
                      >
                        {institution.label}
                        <CheckIcon
                          className={cn(
                            "ml-auto",
                            value === institution.value ? "opacity-100" : "opacity-0"
                          )}
                        />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* Institution Type div */}
        <div className="flex flex-col justify-end">
          <label htmlFor="institutionType" className="block text-base font-medium mb-1 text-brand-text-gray">
            Institution Type *
          </label>
          <Select
            value={formData.institutionType}
            onValueChange={(value) =>
              setFormData(prev => ({ ...prev, institutionType: value as "public-ontario" | "private-ontario" }))
            }
          >
            <SelectTrigger id="institutionType" className="w-full">
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="public-ontario">Public</SelectItem>
              <SelectItem value="private-ontario">Private</SelectItem>
            </SelectContent>
          </Select>

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
            required
            value={formData.code}
            onChange={(e) => {
              const value = e.target.value;
              if (/^[\d\s]*$/.test(value)) { // needs to match this regex pattern to be inputted
                setFormData(prev => ({ ...prev, code: value }));
              }
            }}
            className="w-full"
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
            required
            value={formData.program}
            onChange={(e) => {
              const value = e.target.value;
              if (/^[A-Za-z\s]*$/.test(value)) {
                setFormData(prev => ({ ...prev, program: value }));
              }
            }}
            pattern="^[A-Za-z\s]+$"
            className="w-full"
          />
        </div>

        {/* Study Type div*/}
        <div>
          <label htmlFor="studyType" className="block text-base font-medium mb-1 text-brand-text-gray">
            Study Type *
          </label>
          <Select
            value={formData.studyType}
            onValueChange={(value) =>
              setFormData(prev => ({ ...prev, studyType: value as "full-time" | "part-time" }))
            }>
            <SelectTrigger id="studyType" className="w-full">
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent>
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
            <div className="w-full relative">
              <input
                id="studyPeriodStart"
                ref={startRef}
                type="date"
                defaultValue={startDate ? format(startDate, "yyyy-MM-dd") : ""}
                className="w-full rounded-md border border-input bg-background px-3 py-2 pr-10 text-sm"
                onChange={(e) => {
                  const value = e.target.value;
                  if (value) {
                    const parsed = new Date(value);
                    if (!isNaN(parsed.getTime())) {
                      setStartDate(parsed);
                      setFormData(prev => ({ ...prev, studyPeriodStart: value }));
                    }
                  } else {
                    setStartDate(null);
                    setFormData(prev => ({ ...prev, studyPeriodStart: "" }));
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
            <div className="w-full relative">
              <input
                id="studyPeriodEnd"
                ref={endRef}
                type="date"
                defaultValue={endDate ? format(endDate, "yyyy-MM-dd") : ""}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value) {
                    const parsed = new Date(value);
                    if (!isNaN(parsed.getTime())) {
                      setEndDate(parsed);
                      setFormData(prev => ({ ...prev, studyPeriodEnd: value }));
                    }
                  } else {
                    setEndDate(null);
                    setFormData(prev => ({ ...prev, studyPeriodEnd: "" }));
                  }
                }}
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