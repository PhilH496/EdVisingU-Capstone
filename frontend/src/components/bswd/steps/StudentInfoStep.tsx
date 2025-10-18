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
    const formattedDate = format(selected, "dd/MM/yyyy");
    if (dobRef.current) {
      dobRef.current.value = formattedDate;
    }
    setFormData(prev => ({ ...prev, dateOfBirth: formattedDate }));
  };

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="hasOsapApplication" className="block text-sm font-medium mb-1 text-brand-text-gray">
          Do you have an OSAP application? *
        </label>
        <select
          id="hasOsapApplication"
          value={formData.hasOsapApplication === null ? '' : (formData.hasOsapApplication ? 'yes' : 'no')}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => 
            setFormData(prev => ({ 
              ...prev, 
              hasOsapApplication: e.target.value === 'yes',
              osapApplication: e.target.value === 'yes' ? prev.osapApplication : 'none'
            }))
          }
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-dark-blue"
        >
          <option value="">Select an option</option>
          <option value="yes">Yes</option>
          <option value="no">No</option>
        </select>
      </div>    
      <h2 className="text-xl font-semibold mb-4">Section A: Student Information</h2>
      
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
            Date of Birth (DD/MM/YYYY) *
          </label>
          <Popover>
            <div className="relative w-full">
              <input
                id="dateOfBirth"
                ref={dobRef}
                type="text"
                placeholder="DD/MM/YYYY"
                value={formData.dateOfBirth}
                className="w-full rounded-md border border-input bg-background px-3 py-2 pr-10 text-sm"
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData(prev => ({ ...prev, dateOfBirth: value }));
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
              let value = e.target.value.replace(/\D/g, '');
              if (value.length <= 9) {
                // Format as XXX-XXX-XXX
                if (value.length > 6) {
                  value = `${value.slice(0, 3)}-${value.slice(3, 6)}-${value.slice(6)}`;
                } else if (value.length > 3) {
                  value = `${value.slice(0, 3)}-${value.slice(3)}`;
                }
                setFormData(prev => ({ ...prev, sin: value }));
              }
            }}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-dark-blue"
            placeholder="XXX-XXX-XXX"
            maxLength={11}
          />
          {formData.sin && formData.sin.replace(/\D/g, '').length !== 9 && (
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
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              let value = e.target.value.replace(/\D/g, '');
              if (value.length <= 10) {
                if (value.length > 6) {
                  value = `(${value.slice(0, 3)}) ${value.slice(3, 6)}-${value.slice(6)}`;
                } else if (value.length > 3) {
                  value = `(${value.slice(0, 3)}) ${value.slice(3)}`;
                } else if (value.length > 0) {
                  value = `(${value}`;
                }
                setFormData(prev => ({ ...prev, phone: value }));
              }
            }}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-dark-blue"
            placeholder="(XXX) XXX-XXXX"
            maxLength={14}
          />
        </div>
      </div>

      {/* Mailing Address */}
      <div>
        <h3 className="text-lg font-semibold mb-3 text-brand-text-gray">Mailing Address</h3>
        
        <div className="space-y-4">
        <div>
          <label htmlFor="address" className="block text-sm font-medium mb-1 text-brand-text-gray">
            Street Address *
          </label>
          <input
            id="address"
            type="text"
            value={formData.address || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
              setFormData(prev => ({ ...prev, address: e.target.value }))
            }
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-dark-blue"
            placeholder="123 Main Street"
          />
        </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="city" className="block text-sm font-medium mb-1 text-brand-text-gray">
                City *
              </label>
              <input
                id="city"
                type="text"
                value={formData.city || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  setFormData(prev => ({ ...prev, city: e.target.value }))
                }
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-dark-blue"
                placeholder="Toronto"
              />
            </div>

            <div>
              <label htmlFor="province" className="block text-sm font-medium mb-1 text-brand-text-gray">
                Province *
              </label>
              <select
                id="province"
                value={formData.province || ''}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => 
                  setFormData(prev => ({ ...prev, province: e.target.value }))
                }
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-dark-blue"
              >
                <option value="">Select Province</option>
                <option value="ON">Ontario</option>
                <option value="AB">Alberta</option>
                <option value="BC">British Columbia</option>
                <option value="MB">Manitoba</option>
                <option value="NB">New Brunswick</option>
                <option value="NL">Newfoundland and Labrador</option>
                <option value="NS">Nova Scotia</option>
                <option value="PE">Prince Edward Island</option>
                <option value="QC">Quebec</option>
                <option value="SK">Saskatchewan</option>
              </select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="postalCode" className="block text-sm font-medium mb-1 text-brand-text-gray">
                Postal Code *
              </label>
              <input
                id="postalCode"
                type="text"
                value={formData.postalCode || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
                  if (value.length <= 6) {
                    const formatted = value.length > 3 
                      ? `${value.slice(0, 3)} ${value.slice(3)}` 
                      : value;
                    setFormData(prev => ({ ...prev, postalCode: formatted }));
                  }
                }}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-dark-blue"
                placeholder="A1A 1A1"
                maxLength={7}
              />
            </div>

            <div>
              <label htmlFor="country" className="block text-sm font-medium mb-1 text-brand-text-gray">
                Country *
              </label>
              <input
                id="country"
                type="text"
                value={formData.country || 'Canada'}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  setFormData(prev => ({ ...prev, country: e.target.value }))
                }
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-dark-blue"
                placeholder="Canada"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}