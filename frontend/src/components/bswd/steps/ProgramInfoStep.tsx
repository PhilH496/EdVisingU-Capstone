/**
 * Step 2: ProgramInfoStep component
 *
 * Second step of the BSWD application form that collects program information.
 */

// Base React imports
import { useState } from "react"
// shadcn UI components
import { Input } from "@/components/ui/input"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
// Icons
import { CheckIcon, ChevronsUpDownIcon, ChevronDownIcon } from "lucide-react"
// Utilities, types and hooks
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { FormData } from "@/types/bswd"
import { useDateRange } from "@/hooks/UseDateRange"
import { useTranslation } from "@/lib/i18n" // translation

const institutions = [
  { value: "algoma", label: "Algoma University" },
  { value: "nipissing", label: "Nipissing University" },
  { value: "metro", label: "Toronto Metropolitan University" },
  { value: "brock", label: "Brock University" },
  { value: "ocad", label: "OCAD University" },
  { value: "trent", label: "Trent University" },
  { value: "carleton", label: "Carleton University" },
  { value: "français", label: "Université de l'Ontario français" },
  { value: "guelph", label: "University of Guelph" },
  { value: "tech", label: "Ontario Tech University" },
  { value: "waterloo", label: "University of Waterloo" },
  { value: "hearst", label: " Université de Hearst" },
  { value: "ottawa", label: "University of Ottawa" },
  { value: "western", label: "Western University" },
  { value: "lakehead", label: "Lakehead University" },
  { value: "queens", label: "Queen's University" },
  { value: "willfrid", label: "Willfrid Laurier University" },
  { value: "military", label: " Royal Military College of Canada" },
  { value: "laurentian", label: "Laurentian University" },
  { value: "mcmaster", label: "McMaster University" },
  { value: "toronto", label: "University of Toronto" },
  { value: "york", label: "York University" },
  { value: "windsor", label: "University of Windsor" },
]

interface ProgramInfoStepProps {
  formData: FormData
  setFormData: (data: FormData | ((prev: FormData) => FormData)) => void
}

export function ProgramInfoStep({
  formData,
  setFormData,
}: ProgramInfoStepProps) {
  const [value, setValue] = useState("")
  const [institutionOpen, setInstitutionOpen] = useState(false)
  const start = useDateRange()
  const end = useDateRange()
  const { t, isLoaded } = useTranslation()

  const [startMonth, setStartMonth] = useState<Date>(new Date(2025, 0, 1))
  const [endMonth, setEndMonth] = useState<Date>(new Date(2026, 11, 1))

  if (!isLoaded) return null

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">
        {t("programInfo.sectionHeader")}
      </h2>

      <div className="grid md:grid-cols-2 gap-4 text-brand-text-gray">
        <div>
          <label
            htmlFor="institutionName"
            className="block text-base font-medium mb-1 text-brand-text-gray"
          >
            {t("programInfo.labels.institutionName")}
            <span className="text-sm text-brand-light-red mt-1">*</span>
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
                  ? institutions.find((i) => i.value === formData.institution)
                      ?.label
                  : t("programInfo.placeholders.institutionSearch")}
                <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="mx-auto p-0">
              <Command>
                <CommandInput
                  placeholder={t("programInfo.placeholders.institutionInput")}
                  className="h-9"
                />
                <CommandList>
                  <CommandEmpty>
                    {t("programInfo.messages.noInstitutionFound")}
                  </CommandEmpty>
                  <CommandGroup>
                    {institutions.map((institution) => (
                      <CommandItem
                        key={institution.value}
                        value={institution.value}
                        onSelect={(currentValue) => {
                          const newValue =
                            currentValue === value ? "" : currentValue
                          setValue(currentValue === value ? "" : currentValue)
                          setFormData((prev) => ({
                            ...prev,
                            institution: newValue,
                          }))
                          setInstitutionOpen(false)
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

        <div className="flex flex-col justify-end">
          <label
            htmlFor="institutionType"
            className="block text-base font-medium mb-1 text-brand-text-gray"
          >
            {t("programInfo.labels.institutionType")}{" "}
            <span className="text-sm text-brand-light-red mt-1">*</span>
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
              <SelectValue placeholder={t("programInfo.placeholders.select")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="public-ontario">
                {t("programInfo.options.institutionType.public")}
              </SelectItem>
              <SelectItem value="private-ontario">
                {t("programInfo.options.institutionType.private")}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="border-t pt-4 grid md:grid-cols-3 gap-4">
        <div>
          <label
            htmlFor="code"
            className="block text-base font-medium mb-1 text-brand-text-gray"
          >
            {t("programInfo.labels.programCostCode")}
          </label>
          <Input
            id="code"
            type="text"
            placeholder={t("programInfo.placeholders.programCostCode")}
            required
            value={formData.code}
            onChange={(e) => {
              const value = e.target.value
              if (/^[\d\s]*$/.test(value)) {
                setFormData((prev) => ({ ...prev, code: value }))
              }
            }}
            className="w-full"
          />
        </div>

        <div>
          <label
            htmlFor="program"
            className="block text-base font-medium mb-1 text-brand-text-gray"
          >
            {t("programInfo.labels.programOfStudy")}
          </label>
          <Input
            id="program"
            type="text"
            placeholder={t("programInfo.placeholders.programOfStudy")}
            required
            value={formData.program}
            onChange={(e) => {
              const value = e.target.value
              if (/^[A-Za-z\s]*$/.test(value)) {
                setFormData((prev) => ({ ...prev, program: value }))
              }
            }}
            pattern="^[A-Za-z\s]+$"
            className="w-full"
          />
        </div>

        <div>
          <label
            htmlFor="studyType"
            className="block text-base font-medium mb-1 text-brand-text-gray"
          >
            {t("programInfo.labels.studyType")}{" "}
            <span className="text-sm text-brand-light-red mt-1">*</span>
          </label>
          <Select
            value={formData.studyType}
            onValueChange={(value) =>
              setFormData((prev) => ({
                ...prev,
                studyType: value as
                  | "full-time"
                  | "part-time"
                  | "institution-funded-SB",
              }))
            }
          >
            <SelectTrigger id="studyType" className="w-full">
              <SelectValue placeholder={t("programInfo.placeholders.select")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="full-time">
                {t("programInfo.options.studyType.fullTime")}
              </SelectItem>
              <SelectItem value="part-time">
                {t("programInfo.options.studyType.partTime")}
              </SelectItem>
              <SelectItem value="institution-funded-SB">
                {t("programInfo.options.studyType.institutionFunded")}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="border-t pt-4 grid md:grid-cols-2 gap-4 ">
        <div className="flex flex-col gap-3">
          <Label
            htmlFor="startDate"
            className="block text-base font-medium mb-1 text-brand-text-gray"
          >
            {t("programInfo.labels.studyStartDate")}{" "}
            <span className="text-sm text-brand-light-red mt-1">*</span>
          </Label>
          <Popover open={start.open} onOpenChange={start.setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                id="startDate"
                className="w-full justify-between font-normal"
              >
                {start.date
                  ? start.date.toLocaleDateString()
                  : t("programInfo.placeholders.date")}
                <ChevronDownIcon />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto overflow-hidden p-0" align="start">
              <div className="p-2">
                <label className="sr-only" htmlFor="startDateMonthSelect">
                  startDateLabel
                </label>
                <select
                  id="startDateMonthSelect"
                  aria-label="startDateLabel"
                  value={startMonth.getMonth().toString()}
                  onChange={(e) => {
                    const m = Number(e.target.value)
                    const y = startMonth.getFullYear()
                    setStartMonth(new Date(y, m, 1))
                  }}
                >
                  <option value="0">Jan</option>
                  <option value="1">Feb</option>
                  <option value="2">Mar</option>
                  <option value="3">Apr</option>
                  <option value="4">May</option>
                  <option value="5">Jun</option>
                  <option value="6">Jul</option>
                  <option value="7">Aug</option>
                  <option value="8">Sep</option>
                  <option value="9">Oct</option>
                  <option value="10">Nov</option>
                  <option value="11">Dec</option>
                </select>
              </div>

              <Calendar
                month={startMonth}
                onMonthChange={(m) => setStartMonth(m)}
                defaultMonth={start.date || new Date(2025, 0)}
                startMonth={new Date(2025, 0)}
                endMonth={new Date(2026, 11)}
                mode="single"
                selected={start.date}
                captionLayout="dropdown"
                disabled={(date) => {
                  if (end.date) return date > end.date
                  return false
                }}
                onSelect={(date) => {
                  start.setDate(date)
                  start.setOpen(false)
                  if (date) {
                    setFormData((prev) => ({
                      ...prev,
                      studyPeriodStart: format(date, "dd/MM/yyyy"),
                    }))
                  }
                }}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex flex-col gap-3">
          <Label
            htmlFor="endDate"
            className="block text-base font-medium mb-1 text-brand-text-gray"
          >
            {t("programInfo.labels.studyEndDate")}{" "}
            <span className="text-sm text-brand-light-red mt-1">*</span>
          </Label>
          <Popover open={end.open} onOpenChange={end.setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                id="endDate"
                className="w-full justify-between font-normal"
              >
                {end.date
                  ? end.date.toLocaleDateString()
                  : t("programInfo.placeholders.date")}
                <ChevronDownIcon />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto overflow-hidden p-0" align="start">
              <div className="p-2">
                <label className="sr-only" htmlFor="endDateMonthSelect">
                  endDateLabel
                </label>
                <select
                  id="endDateMonthSelect"
                  aria-label="endDateLabel"
                  value={endMonth.getMonth().toString()}
                  onChange={(e) => {
                    const m = Number(e.target.value)
                    const y = endMonth.getFullYear()
                    setEndMonth(new Date(y, m, 1))
                  }}
                >
                  <option value="0">Jan</option>
                  <option value="1">Feb</option>
                  <option value="2">Mar</option>
                  <option value="3">Apr</option>
                  <option value="4">May</option>
                  <option value="5">Jun</option>
                  <option value="6">Jul</option>
                  <option value="7">Aug</option>
                  <option value="8">Sep</option>
                  <option value="9">Oct</option>
                  <option value="10">Nov</option>
                  <option value="11">Dec</option>
                </select>
              </div>

              <Calendar
                month={endMonth}
                onMonthChange={(m) => setEndMonth(m)}
                defaultMonth={end.date || new Date(2026, 11)}
                startMonth={new Date(2025, 0)}
                endMonth={new Date(2026, 11)}
                mode="single"
                selected={end.date}
                captionLayout="dropdown"
                disabled={(date) => {
                  if (start.date) return date < start.date
                  return false
                }}
                onSelect={(date) => {
                  end.setDate(date)
                  end.setOpen(false)
                  if (date) {
                    setFormData((prev) => ({
                      ...prev,
                      studyPeriodEnd: format(date, "dd/MM/yyyy"),
                    }))
                  }
                }}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="mt-4">
        <label className="block text-base font-medium mb-2 text-left text-brand-text-gray">
          {t("programInfo.submittedElsewhere.question")}{" "}
          <span className="text-sm text-brand-light-red mt-1">*</span>
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

        {formData.submittedDisabilityElsewhere === true && (
          <div className="mb-3 text-left">
            <label className="block text-sm font-medium mb-1 text-brand-text-gray">
              {t("programInfo.submittedElsewhere.previousInstitutionLabel")}{" "}
              <span className="text-sm text-brand-light-red mt-1">*</span>
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
                    : t("programInfo.placeholders.previousInstitutionSearch")}
                  <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>

              <PopoverContent className="mx-auto p-0">
                <Command>
                  <CommandInput
                    placeholder={t("programInfo.placeholders.institutionInput")}
                    className="h-9"
                  />
                  <CommandList>
                    <CommandEmpty>
                      {t("programInfo.messages.noInstitutionFound")}
                    </CommandEmpty>
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
  )
}
