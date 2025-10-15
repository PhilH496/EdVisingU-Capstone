/**
 * Step 1: StudentInfoStep Component
 * 
 * First step of the BSWD application form that collects basic student information.
 * Includes validation for OEN (Ontario Education Number) format.
 * 
 * @param formData - Current state of all form data
 * @param setFormData - Function to update form data state
 */
import { FormData } from "@/types/bswd";
import * as React from "react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface StudentInfoStepProps {
  formData: FormData;
  setFormData: (data: FormData | ((prev: FormData) => FormData)) => void;
}

export function StudentInfoStep({ formData, setFormData }: StudentInfoStepProps) {
  const [dateOfBirth, setDateOfBirth] = React.useState<Date | null>(null);
  const dobRef = React.useRef<HTMLInputElement>(null);

  const handleSelectDOB = (selected: Date | undefined) => {
    if (!selected) return;
    setDateOfBirth(selected);
    const formattedDate = format(selected, "yyyy-MM-dd");
    if (dobRef.current) {
      dobRef.current.value = formattedDate;
    }
    setFormData(prev => ({ ...prev, dateOfBirth: formattedDate }));
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">Student Information</h2>
      
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="studentId" className="block text-sm font-medium mb-1 text-brand-text-gray">
            Student ID *
          </label>
          <input
            id="studentId"
            type="text"
            value={formData.studentId}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
              setFormData(prev => ({ ...prev, studentId: e.target.value }))
            }
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-dark-blue"
            placeholder="Enter student ID"
          />
        </div>

        <div>
          <label htmlFor="oen" className="block text-sm font-medium mb-1 text-brand-text-gray">
            Ontario Education Number (OEN) *
          </label>
          <input
            id="oen"
            type="text"
            value={formData.oen}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const value = e.target.value.replace(/\D/g, '');
              if (value.length <= 9) {
                setFormData(prev => ({ ...prev, oen: value }));
              }
            }}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-dark-blue"
            placeholder="9-digit OEN"
            maxLength={9}
          />
          {formData.oen && formData.oen.length !== 9 && (
            <p className="text-sm text-red-600 mt-1">OEN must be exactly 9 digits</p>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium mb-1 text-brand-text-gray">
            First Name *
          </label>
          <input
            id="firstName"
            type="text"
            value={formData.firstName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
              setFormData(prev => ({ ...prev, firstName: e.target.value }))
            }
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-dark-blue"
            placeholder="Enter first name"
          />
        </div>

        <div>
          <label htmlFor="lastName" className="block text-sm font-medium mb-1 text-brand-text-gray">
            Last Name *
          </label>
          <input
            id="lastName"
            type="text"
            value={formData.lastName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
              setFormData(prev => ({ ...prev, lastName: e.target.value }))
            }
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-dark-blue"
            placeholder="Enter last name"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="dateOfBirth" className="block text-sm font-medium mb-1 text-brand-text-gray">
            Date of Birth *
          </label>
          <Popover>
            <div className="relative w-full">
              <input
                id="dateOfBirth"
                ref={dobRef}
                type="date"
                defaultValue={dateOfBirth ? format(dateOfBirth, "yyyy-MM-dd") : ""}
                className="w-full rounded-md border border-input bg-background px-3 py-2 pr-10 text-sm"
                onChange={(e) => {
                  const value = e.target.value;
                  if (value) {
                    const parsed = new Date(value);
                    if (!isNaN(parsed.getTime())) {
                      setDateOfBirth(parsed);
                      setFormData(prev => ({ ...prev, dateOfBirth: value }));
                    }
                  } else {
                    setDateOfBirth(null);
                    setFormData(prev => ({ ...prev, dateOfBirth: '' }));
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
                <Calendar 
                  mode="single" 
                  selected={dateOfBirth ?? undefined} 
                  onSelect={handleSelectDOB}
                  initialFocus
                />
              </PopoverContent>
            </div>
          </Popover>
        </div>

        <div>
          <label htmlFor="sin" className="block text-sm font-medium mb-1 text-brand-text-gray">
            Social Insurance Number *
          </label>
          <input
            id="sin"
            type="text"
            value={formData.sin}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const value = e.target.value.replace(/\D/g, ''); 
              if (value.length <= 9) {
                setFormData(prev => ({ ...prev, sin: value }));
              }
            }}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-dark-blue"
            placeholder="XXX-XXX-XXX"
            maxLength={11}
          />
          {formData.sin && formData.sin.length !== 9 && (
            <p className="text-sm text-red-600 mt-1">SIN must be exactly 9 digits</p>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1 text-brand-text-gray">
            Email Address *
          </label>
          <input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
              setFormData(prev => ({ ...prev, email: e.target.value }))
            }
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-dark-blue"
            placeholder="student@institution.edu"
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium mb-1 text-brand-text-gray">
            Phone Number
          </label>
          <input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
              setFormData(prev => ({ ...prev, phone: e.target.value }))
            }
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-dark-blue"
            placeholder="(xxx) xxx-xxxx"
          />
        </div>
      </div>

      <div>
        <label htmlFor="address" className="block text-sm font-medium mb-1 text-brand-text-gray">
          Mailing Address
        </label>
        <textarea
          id="address"
          value={formData.address}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => 
            setFormData(prev => ({ ...prev, address: e.target.value }))
          }
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-dark-blue"
          rows={3}
          placeholder="Enter complete mailing address"
        />
      </div>
    </div>
  );
}