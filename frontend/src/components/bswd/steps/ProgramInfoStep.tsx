// Step 2: Institution and program information
// ProgramInfoStep Component Goes Here
//
// HELPFUL INFO:
// - formData: Object containing all form data (see @/types/bswd.ts for available fields)
// - setFormData: Updates form data using: setFormData(prev => ({ ...prev, fieldName: value }))
// - Reference StudentInfoStep.tsx for examples
// - Add validation in index.tsx > isStepComplete() function
// - Use brand colors located in tailwind.config.js; reference StudentInfoStep.tsx

// Base React imports
import { useState, useRef } from "react";
// shadcn UI components
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
// Icons
import { CheckIcon, ChevronsUpDownIcon, ChevronDownIcon } from "lucide-react";
// Utilities, types and hooks
import { format, set } from "date-fns";
import { cn } from "@/lib/utils";
import { FormData } from "@/types/bswd";
import { useDateRange } from "@/hooks/UseDateRange";

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
];

interface ProgramInfoStepProps {
  formData: FormData;
  setFormData: (data: FormData | ((prev: FormData) => FormData)) => void;
}

export function ProgramInfoStep({
  formData,
  setFormData,
}: ProgramInfoStepProps) {
  const [value, setValue] = useState("");
  const [institutionOpen, setInstitutionOpen] = useState(false);
  const start = useDateRange();
  const end = useDateRange();

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">
        Section B: Information about your school and program
      </h2>
      <div className="grid md:grid-cols-2 gap-4 text-brand-text-gray">
        {/* Institution Name div */}
        <div>
          <label
            htmlFor="institutionName"
            className="block text-base font-medium mb-1 text-brand-text-gray"
          >
            Institution Name <span className="text-sm text-brand-light-red mt-1">*</span>
          </label>
          <Popover open={institutionOpen} onOpenChange={setInstitutionOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={institutionOpen}
                className="w-full justify-start text-left"
              >
                {formData.institution
                  ? institutions.find(
                    (institution) =>
                      institution.value === formData.institution
                  )?.label
                  : "Search for OSAP-approved institutions"}
                <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="mx-auto p-0">
              <Command>
                <CommandInput
                  placeholder="Search institution..."
                  className="h-9"
                />
                <CommandList>
                  <CommandEmpty>No institution found.</CommandEmpty>
                  <CommandGroup>
                    {institutions.map((institution) => (
                      <CommandItem
                        key={institution.value}
                        value={institution.value}
                        onSelect={(currentValue) => {
                          const newValue =
                            currentValue === value ? "" : currentValue;
                          setValue(currentValue === value ? "" : currentValue);
                          setFormData((prev) => ({
                            ...prev,
                            institution: newValue,
                          }));
                          setInstitutionOpen(false);
                        }}
                      >
                        {institution.label}
                        <CheckIcon
                          className={cn(
                            "ml-auto",
                            value === institution.value
                              ? "opacity-100"
                              : "opacity-0"
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
          <label
            htmlFor="institutionType"
            className="block text-base font-medium mb-1 text-brand-text-gray"
          >
            Institution Type <span className="text-sm text-brand-light-red mt-1">*</span>
          </label>
          <Select
            value={formData.institutionType}
            onValueChange={(value) =>
              setFormData((prev) => ({
                ...prev,
                institutionType: value as "public-ontario" | "private-ontario",
              }))
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

      <div className="border-t pt-4 grid md:grid-cols-3 gap-4">
        {/* Program Cost Code div */}
        <div>
          <label
            htmlFor="code"
            className="block text-base font-medium mb-1 text-brand-text-gray"
          >
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
              if (/^[\d\s]*$/.test(value)) {
                // user input can be numbers, spaces
                setFormData((prev) => ({ ...prev, code: value }));
              }
            }}
            className="w-full"
          />
        </div>
        {/* Program of Study div*/}
        <div>
          <label
            htmlFor="program"
            className="block text-base font-medium mb-1 text-brand-text-gray"
          >
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
                // user input can be alphabetic, spaces
                setFormData((prev) => ({ ...prev, program: value }));
              }
            }}
            pattern="^[A-Za-z\s]+$"
            className="w-full"
          />
        </div>

        {/* Study Type div*/}
        <div>
          <label
            htmlFor="studyType"
            className="block text-base font-medium mb-1 text-brand-text-gray"
          >
            Study Type <span className="text-sm text-brand-light-red mt-1">*</span>
          </label>
          <Select
            value={formData.studyType}
            onValueChange={(value) =>
              setFormData((prev) => ({
                ...prev,
                studyType: value as "full-time" | "part-time",
              }))
            }
          >
            <SelectTrigger id="studyType" className="w-full">
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="full-time">Full-Time</SelectItem>
              <SelectItem value="part-time">Part-Time</SelectItem>
              <SelectItem value="part-time">
                Institution-funded Special Bursary
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="border-t pt-4 grid md:grid-cols-2 gap-4 ">
        {/* Study Start Date div */}
        <div className="flex flex-col gap-3">
          <Label
            htmlFor="startDate"
            className="block text-base font-medium mb-1 text-brand-text-gray">
            Study Start Date <span className="text-sm text-brand-light-red mt-1">*</span>
          </Label>
          <Popover open={start.open} onOpenChange={start.setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                id="startDate"
                className="w-full justify-between font-normal"
              >
                {start.date ? start.date.toLocaleDateString() : "Select date"}
                <ChevronDownIcon />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto overflow-hidden p-0" align="start">
              <Calendar
                mode="single"
                selected={start.date}
                captionLayout="dropdown"
                onSelect={(date) => {
                  start.setDate(date)
                  start.setOpen(false)
                  if (date) {
                    setFormData((prev) => ({
                      ...prev,
                      studyPeriodStart: format(date, "dd/MM/yyyy")
                    }))
                  }
                }}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Study End Date div */}
        <div className="flex flex-col gap-3">
          <Label htmlFor="endDate" className="block text-base font-medium mb-1 text-brand-text-gray">
            Study End Date <span className="text-sm text-brand-light-red mt-1">*</span>
          </Label>
          <Popover open={end.open} onOpenChange={end.setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                id="endDate"
                className="w-full justify-between font-normal"
              >
                {end.date ? end.date.toLocaleDateString() : "Select date"}
                <ChevronDownIcon />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto overflow-hidden p-0" align="start">
              <Calendar
                mode="single"
                selected={end.date}
                captionLayout="dropdown"
                onSelect={(date) => {
                  end.setDate(date)
                  end.setOpen(false)
                  if (date) {
                    setFormData((prev) => ({
                      ...prev,
                      studyPeriodEnd: format(date, "dd/MM/yyyy")
                    }))
                  }
                }}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="mt-4">
        {/* Previous institution disability documentation div */}
        <label className="block text-base font-medium mb-2 text-left text-brand-text-gray">
          Has the student submitted a completed OSAP Disability Verification
          Form or other disability documentation while attending another
          institution? <span className="text-sm text-brand-light-red mt-1">*</span>
        </label>
        <RadioGroup
          value={formData.submittedDisabilityElsewhere ? "yes" : "no"}
          onValueChange={(value) =>
            setFormData((prev) => ({
              ...prev,
              submittedDisabilityElsewhere: value === "yes",
            }))
          }
          className="flex items-center justify-left space-x-6 mb-3"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="yes" id="submitted-yes" />
            <Label htmlFor="submitted-yes">Yes</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="no" id="submitted-no" />
            <Label htmlFor="submitted-no">No</Label>
          </div>
        </RadioGroup>

        {/* Previous institution combobox (used when "Yes") */}
        {formData.submittedDisabilityElsewhere === true && (
          <div className="mb-3 text-left">
            <label className="block text-sm font-medium mb-1 text-brand-text-gray">
              Previous institution <span className="text-sm text-brand-light-red mt-1">*</span>
            </label>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={false}
                  className="md:w-1/2 justify-start text-left"
                >
                  {formData.previousInstitution
                    ? institutions.find(
                      (inst) => inst.value === formData.previousInstitution
                    )?.label
                    : "Search previous institution..."}
                  <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>

              <PopoverContent className="mx-auto p-0">
                <Command>
                  <CommandInput
                    placeholder="Search institution..."
                    className="h-9"
                  />
                  <CommandList>
                    <CommandEmpty>No institution found.</CommandEmpty>
                    <CommandGroup>
                      {institutions.map((inst) => (
                        <CommandItem
                          key={inst.value}
                          value={inst.value}
                          onSelect={(currentValue) =>
                            setFormData((prev) => ({
                              ...prev,
                              previousInstitution: currentValue,
                            }))
                          }
                        >
                          {inst.label}
                          <CheckIcon
                            className={cn(
                              "ml-auto",
                              formData.previousInstitution === inst.value
                                ? "opacity-100"
                                : "opacity-0"
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
        )}
      </div>
    </div>
  );
}
