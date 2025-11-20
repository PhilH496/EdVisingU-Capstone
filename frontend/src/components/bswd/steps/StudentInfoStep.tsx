/**
 * Step 1: StudentInfoStep Component
 *
 * First step of the BSWD application form that collects basic student information.
 * Includes validation for OEN (Ontario Education Number) format.
 */

import { FormData } from "@/types/bswd";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { ChevronDownIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useDateRange } from "@/hooks/UseDateRange";
import { notifyNoOsap } from "@/lib/notify";

interface StudentInfoStepProps {
  formData: FormData;
  setFormData: (data: FormData | ((prev: FormData) => FormData)) => void;
}

export function StudentInfoStep({
  formData,
  setFormData,
}: StudentInfoStepProps) {
  const onFileStatus: "APPROVED" | "NONE" | "" =
    (formData.osapOnFileStatus as "APPROVED" | "NONE" | "") ?? "";
  const queuedForManualReview: boolean = !!formData.queuedForManualReview;

  // Lock all fields on this page when OSAP application effectively = "No"
  const isLocked = formData.hasOsapApplication === false;
  const lockCls = (base: string) =>
    base +
    " " +
    (isLocked
      ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200"
      : "focus:outline-none focus:ring-2 focus:ring-brand-dark-blue");

  const dob = useDateRange();

  const handleOnFileChange = async (status: "APPROVED" | "NONE") => {
    setFormData((prev) => ({ ...prev, osapOnFileStatus: status }));

    if (status === "NONE") {
      if (!queuedForManualReview) {
        try {
          if (formData.email) {
            await notifyNoOsap(formData.email);
          }
        } catch {}
        setFormData((prev) => ({
          ...prev,
          queuedForManualReview: true,
          hasOsapApplication: false,
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          hasOsapApplication: false,
        }));
      }
    } else if (status === "APPROVED") {
      setFormData((prev) => ({
        ...prev,
        hasOsapApplication: true,
      }));
    }
  };

  return (
    <div className="space-y-4">
      {/* OSAP application on-file confirmation (moved from OSAP step) */}
      <div className="space-y-2">
        <label className="block text-sm font-medium mb-1 text-brand-text-gray">
          Do you have an active & approved OSAP application on file?{" "}
          <span className="text-sm text-brand-light-red mt-1">*</span>
        </label>
        <div className="flex gap-4">
          <label className="inline-flex items-center gap-2 text-brand-text-gray">
            <input
              type="radio"
              name="osapOnFileStatus"
              checked={onFileStatus === "APPROVED"}
              onChange={() => handleOnFileChange("APPROVED")}
            />
            Yes — Active & Approved
          </label>
          <label className="inline-flex items-center gap-2 text-brand-text-gray">
            <input
              type="radio"
              name="osapOnFileStatus"
              checked={onFileStatus === "NONE"}
              onChange={() => handleOnFileChange("NONE")}
            />
            No application on file
          </label>
        </div>
        {onFileStatus === "NONE" && (
          <div className="mt-2 rounded-md border border-yellow-300 bg-yellow-50 p-3 text-sm text-yellow-900">
            An email has been sent requesting you to apply for OSAP. Your
            BSWD/CSG-DSE application has been marked{" "}
            <span className="font-semibold">Pending Manual Review</span>.{" "}
            {queuedForManualReview && (
              <div className="mt-1 text-xs text-yellow-800">
                Status: Queued for Manual Review.
              </div>
            )}
          </div>
        )}
      </div>

      <h2 className="text-xl font-semibold mb-4">
        Section A: Student Information
      </h2>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="studentId"
            className="block text-sm font-medium mb-1 text-brand-text-gray"
          >
            Student ID{" "}
            <span className="text-sm text-brand-light-red mt-1">*</span>
          </label>
          <Input
            id="studentId"
            type="text"
            value={formData.studentId}
            disabled={isLocked}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, "");
              if (value.length <= 15) {
                setFormData((prev) => ({ ...prev, studentId: value }));
              }
            }}
            className={lockCls("w-full px-3 py-2 border rounded-md")}
            placeholder="Enter student ID"
            maxLength={15}
          />
          {formData.studentId && formData.studentId.length < 7 && (
            <p className="text-sm text-brand-light-red mt-1">
              Student ID must be at least 7 digits
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="oen"
            className="block text-sm font-medium mb-1 text-brand-text-gray"
          >
            Ontario Education Number (OEN){" "}
            <span className="text-sm text-brand-light-red mt-1">*</span>
          </label>
          <Input
            id="oen"
            type="text"
            value={formData.oen}
            disabled={isLocked}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, "");
              if (value.length <= 9) {
                setFormData((prev) => ({ ...prev, oen: value }));
              }
            }}
            className={lockCls("w-full px-3 py-2 border rounded-md")}
            placeholder="9-digit OEN"
            maxLength={9}
          />
          {formData.oen && formData.oen.length !== 9 && (
            <p className="text-sm text-brand-light-red mt-1">
              OEN must be exactly 9 digits
            </p>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="firstName"
            className="block text-sm font-medium mb-1 text-brand-text-gray"
          >
            First Name{" "}
            <span className="text-sm text-brand-light-red mt-1">*</span>
          </label>
          <Input
            id="firstName"
            type="text"
            value={formData.firstName}
            disabled={isLocked}
            onChange={(e) => {
              const value = e.target.value;
              if (/^[A-Za-z\s'-]*$/.test(value)) {
                setFormData((prev) => ({ ...prev, firstName: value }));
              }
            }}
            className={lockCls("w-full px-3 py-2 border rounded-md")}
            placeholder="Enter first name"
          />
        </div>

        <div>
          <label
            htmlFor="lastName"
            className="block text-sm font-medium mb-1 text-brand-text-gray"
          >
            Last Name{" "}
            <span className="text-sm text-brand-light-red mt-1">*</span>
          </label>
          <Input
            id="lastName"
            type="text"
            value={formData.lastName}
            disabled={isLocked}
            onChange={(e) => {
              const value = e.target.value;
              if (/^[A-Za-z\s'-]*$/.test(value)) {
                setFormData((prev) => ({ ...prev, lastName: value }));
              }
            }}
            className={lockCls("w-full px-3 py-2 border rounded-md")}
            placeholder="Enter last name"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label
            htmlFor="dob"
            className="block text-base font-medium mb-1 text-brand-text-gray"
          >
            Date of Birth{" "}
            <span className="text-sm text-brand-light-red mt-1">*</span>
          </Label>
          <Popover open={dob.open} onOpenChange={dob.setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                id="dob"
                disabled={isLocked}
                className="w-full justify-between font-normal"
              >
                {dob.date ? dob.date.toLocaleDateString() : "Select date"}
                <ChevronDownIcon />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto overflow-hidden p-0"
              align="start"
            >
              <Calendar
                mode="single"
                selected={dob.date}
                captionLayout="dropdown"
                onSelect={(date) => {
                  dob.setDate(date);
                  dob.setOpen(false);
                  if (date) {
                    setFormData((prev) => ({
                      ...prev,
                      dateOfBirth: format(date, "dd/MM/yyyy"),
                    }));
                  }
                }}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div>
          <label
            htmlFor="sin"
            className="block text-sm font-medium mb-1 text-brand-text-gray"
          >
            Social Insurance Number{" "}
            <span className="text-sm text-brand-light-red mt-1">*</span>
          </label>
          <Input
            id="sin"
            type="text"
            value={formData.sin}
            disabled={isLocked}
            onChange={(e) => {
              let value = e.target.value.replace(/\D/g, "");
              if (value.length <= 9) {
                if (value.length > 6) {
                  value = `${value.slice(0, 3)}-${value.slice(
                    3,
                    6
                  )}-${value.slice(6)}`;
                } else if (value.length > 3) {
                  value = `${value.slice(0, 3)}-${value.slice(3)}`;
                } else if (value.length > 0) {
                  value = `(${value.slice(0, 3)}) ${value.slice(3)}`;
                }
                setFormData((prev) => ({ ...prev, sin: value }));
              }
            }}
            className={lockCls("w-full px-3 py-2 border rounded-md")}
            placeholder="XXX-XXX-XXX"
            maxLength={11}
          />
          {formData.sin &&
            formData.sin.replace(/\D/g, "").length !== 9 && (
              <p className="text-sm text-brand-light-red mt-1">
                SIN must be exactly 9 digits
              </p>
            )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium mb-1 text-brand-text-gray"
          >
            Email Address{" "}
            <span className="text-sm text-brand-light-red mt-1">*</span>
          </label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            disabled={isLocked}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, email: e.target.value }))
            }
            className={lockCls("w-full px-3 py-2 border rounded-md")}
            placeholder="YourEmail@example.com"
          />
        </div>

        <div>
          <label
            htmlFor="phone"
            className="block text-sm font-medium mb-1 text-brand-text-gray"
          >
            Phone Number
          </label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            disabled={isLocked}
            onChange={(e) => {
              let value = e.target.value.replace(/\D/g, "");
              if (value.length <= 10) {
                if (value.length > 6) {
                  value = `(${value.slice(0, 3)}) ${value.slice(
                    3,
                    6
                  )}-${value.slice(6)}`;
                } else if (value.length > 3) {
                  value = `(${value.slice(0, 3)}) ${value.slice(3)}`;
                } else if (value.length > 0) {
                  value = `(${value}`;
                }
                setFormData((prev) => ({ ...prev, phone: value }));
              }
            }}
            className={lockCls("w-full px-3 py-2 border rounded-md")}
            placeholder="(XXX) XXX-XXXX"
            maxLength={14}
          />
        </div>
      </div>

      {/* Mailing Address */}
      <div>
        <h3 className="text-lg font-semibold mb-3 text-brand-text-gray">
          Mailing Address
        </h3>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="address"
              className="block text-sm font-medium mb-1 text-brand-text-gray"
            >
              Street Address{" "}
              <span className="text-sm text-brand-light-red mt-1">*</span>
            </label>
            <Input
              id="address"
              type="text"
              value={formData.address || ""}
              disabled={isLocked}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, address: e.target.value }))
              }
              className={lockCls("w-full px-3 py-2 border rounded-md")}
              placeholder="123 Main Street"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="city"
                className="block text-sm font-medium mb-1 text-brand-text-gray"
              >
                City{" "}
                <span className="text-sm text-brand-light-red mt-1">*</span>
              </label>
              <Input
                id="city"
                type="text"
                value={formData.city || ""}
                disabled={isLocked}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, city: e.target.value }))
                }
                className={lockCls("w-full px-3 py-2 border rounded-md")}
                placeholder="Toronto"
              />
            </div>

            <div>
              <label
                htmlFor="province"
                className="block text-sm font-medium mb-1 text-brand-text-gray"
              >
                Province/Territory{" "}
                <span className="text-sm text-brand-light-red mt-1">*</span>
              </label>
              <select
                id="province"
                value={formData.province || ""}
                disabled={isLocked}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    province: e.target.value,
                  }))
                }
                className={lockCls("w-full px-3 py-2 border rounded-md")}
              >
                <option value="">Select Province/Territory</option>
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
              <label
                htmlFor="postalCode"
                className="block text-sm font-medium mb-1 text-brand-text-gray"
              >
                Postal Code{" "}
                <span className="text-sm text-brand-light-red mt-1">*</span>
              </label>
              <Input
                id="postalCode"
                type="text"
                value={formData.postalCode || ""}
                disabled={isLocked}
                onChange={(e) => {
                  const value = e.target.value
                    .toUpperCase()
                    .replace(/[^A-Z0-9]/g, "");
                  if (value.length <= 6) {
                    const formatted =
                      value.length > 3
                        ? `${value.slice(0, 3)} ${value.slice(3)}`
                        : value;
                    setFormData((prev) => ({
                      ...prev,
                      postalCode: formatted,
                    }));
                  }
                }}
                className={lockCls("w-full px-3 py-2 border rounded-md")}
                placeholder="A1A 1A1"
                maxLength={7}
              />
            </div>

            <div>
              <label
                htmlFor="country"
                className="block text-sm font-medium mb-1 text-brand-text-gray"
              >
                Country{" "}
                <span className="text-sm text-brand-light-red mt-1">*</span>
              </label>
              <Input
                id="country"
                type="text"
                value={formData.country || "Canada"}
                disabled={isLocked}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, country: e.target.value }))
                }
                className={lockCls("w-full px-3 py-2 border rounded-md")}
                placeholder="Canada"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
