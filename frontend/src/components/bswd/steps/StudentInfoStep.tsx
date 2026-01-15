/**
 * Step 1: StudentInfoStep Component
 *
 * First step of the BSWD application form that collects student information.
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
import { ChangeEvent, useState } from "react";
import { sendNoOsapEmail } from "@/lib/notify";
import { useTranslation } from "@/lib/i18n"; // translation import


interface StudentInfoStepProps {
  formData: FormData;
  setFormData: (data: FormData | ((prev: FormData) => FormData)) => void;
}

export function StudentInfoStep({ formData, setFormData }: StudentInfoStepProps) {
  // Lock all fields on this page when OSAP application = "No"
  const isLocked = formData.hasOsapApplication === false;
  const lockCls = (base: string) => base + " " + (isLocked ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200" : "focus:outline-none focus:ring-2 focus:ring-brand-dark-blue");
  const dob = useDateRange();
  const osapStartDate = useDateRange();
  const [emailSending, setEmailSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [notificationEmail, setNotificationEmail] = useState("");
  const { t, isLoaded } = useTranslation(); // translation hook
  if (!isLoaded) return null; // wait until translations load

  // Function to send No OSAP email using Edge Function
  const handleSendNoOsapEmail = async (emailToSend: string) => {
    if (!emailToSend || emailSent) return;

    setEmailSending(true);
    try {
      const result = await sendNoOsapEmail(
        emailToSend,
        `${formData.firstName} ${formData.lastName}`.trim(),
        formData.studentId,
        formData.firstName,
        formData.lastName
      );

      if (result.success) {
        setEmailSent(true);
      } else {
        console.error('Failed to send No OSAP email:', result.message);
      }
    } catch (error) {
      console.error('Error sending No OSAP email:', error);
    } finally {
      setEmailSending(false);
    }
  };

  const handleOsapSelection = (hasOsap: boolean) => {
    setFormData(prev => ({
      ...prev,
      hasOsapApplication: hasOsap,
    }));
    
    if (hasOsap === false) {
      setShowEmailInput(true);
      setEmailSent(false);
    } else {
      setShowEmailInput(false);
      setEmailSent(false);
    }
  };

  const handleSendEmail = () => {
    if (notificationEmail) {
      handleSendNoOsapEmail(notificationEmail);
    }
  };

  return (
    <div className="space-y-4">
      {/* OSAP application question with buttons */}
      <div>
        <label className="block text-sm font-medium mb-3 text-brand-text-gray">
          {t("studentInfo.osapQuestion")}
          <span className="text-sm text-brand-light-red mt-1">*</span>
        </label>
        <div className="flex gap-4">
          <label className="inline-flex items-center gap-2 text-brand-text-gray">
            <input
              type="radio"
              name="hasOsapApplication"
              checked={formData.hasOsapApplication === true}
              onChange={() => handleOsapSelection(true)}
            />
            {t("common.yes")}
          </label>
          <label className="inline-flex items-center gap-2 text-brand-text-gray">
            <input
              type="radio"
              name="hasOsapApplication"
              checked={formData.hasOsapApplication === false}
              onChange={() => handleOsapSelection(false)}
            />
            {t("common.no")}
          </label>
        </div>
      </div>

      {/* Email input box when "No" is selected */}
      {showEmailInput && formData.hasOsapApplication === false && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm font-medium text-green-800 mb-3">
            <i className="fa-solid fa-exclamation-triangle mr-2"></i>
            {t("studentInfo.noOsapPanel.title")}
          </p>
          <p className="text-sm text-gray-700 mb-3">
            {t("studentInfo.noOsapPanel.description")}
          </p>
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder={t("studentInfo.noOsapPanel.emailPlaceholder")} // translation
              value={notificationEmail}
              onChange={(e) => setNotificationEmail(e.target.value)}
              className="flex-1"
              disabled={emailSending || emailSent}
            />
            <Button
              onClick={handleSendEmail}
              disabled={!notificationEmail || emailSending || emailSent}
              className="bg-brand-dark-blue hover:bg-blue-700 text-white"
            >
              {emailSending ? (
                <span><i className="fa-solid fa-spinner fa-spin mr-2"></i>
                  {t("studentInfo.noOsapPanel.button.sending")}
                </span>
              ) : emailSent ? (
                <span><i className="fa-solid fa-check mr-2"></i>
                  {t("studentInfo.noOsapPanel.button.sent")}
                </span>
              ) : (
                <span><i className="fa-solid fa-paper-plane mr-2"></i>
                  {t("studentInfo.noOsapPanel.button.send")}
                </span>
              )}
            </Button>
          </div>
          {emailSent && (
            <p className="text-sm text-green-600 mt-2">
              {t("studentInfo.noOsapPanel.button.sentMessage")} {notificationEmail}
            </p>
          )}
        </div>
      )}

      {/* OSAP Application Start Date */}
      {formData.hasOsapApplication === true && (
        <div>
          <Label htmlFor="osapApplicationStartDate" className="block text-sm font-medium mb-1 text-brand-text-gray">
            {t("studentInfo.labels.osapApplicationStartDate")}{" "}
            <span className="text-sm text-brand-light-red mt-1">*</span>
          </Label>
          <Popover open={osapStartDate.open} onOpenChange={osapStartDate.setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                id="osapApplicationStartDate"
                className="w-full justify-between font-normal"
              >
                {osapStartDate.date // translation
                  ? osapStartDate.date.toLocaleDateString()
                  : t("studentInfo.placeholders.osapStartDate")} 
                <ChevronDownIcon />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto overflow-hidden p-0" align="start">
              <Calendar
                mode="single"
                selected={osapStartDate.date}
                captionLayout="dropdown"
                onSelect={(date) => {
                  osapStartDate.setDate(date)
                  osapStartDate.setOpen(false)
                  if (date) {
                    setFormData((prev) => ({
                      ...prev,
                      osapApplicationStartDate: format(date, "dd/MM/yyyy")
                    }))
                  }
                }}
              />
            </PopoverContent>
          </Popover>
        </div>
      )}

      <h2 className="text-xl font-semibold mb-4">
        {t("studentInfo.sectionHeader")}
      </h2>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="studentId"
            className="block text-sm font-medium mb-1 text-brand-text-gray"
          >
            {t("studentInfo.labels.studentId")} {" "}
            <span className="text-sm text-brand-light-red mt-1">*</span>
          </label>
          <Input
            id="studentId"
            type="text"
            value={formData.studentId}
            disabled={isLocked}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              const value = e.target.value.replace(/\D/g, "");
              if (value.length <= 8) {
                setFormData((prev) => ({ ...prev, studentId: value }));
              }
            }}
            className={lockCls("w-full px-3 py-2 border rounded-md")}
            placeholder={t("studentInfo.placeholders.studentId")} // translation 
            maxLength={8}
          />
          {formData.studentId && formData.studentId.length < 7 && (
            <p className="text-sm text-brand-light-red mt-1">
              {t("studentInfo.validation.studentIdMinDigits")}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="oen"
            className="block text-sm font-medium mb-1 text-brand-text-gray"
          >
            {t("studentInfo.labels.oen")} {" "}
            <span className="text-sm text-brand-light-red mt-1">*</span>
          </label>
          <Input
            id="oen"
            type="text"
            value={formData.oen}
            disabled={isLocked}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              const value = e.target.value.replace(/\D/g, "");
              if (value.length <= 9) {
                setFormData((prev) => ({ ...prev, oen: value }));
              }
            }}
            className={lockCls("w-full px-3 py-2 border rounded-md")}
            placeholder={t("studentInfo.placeholders.oen")} // translation
            maxLength={9}
          />
          {formData.oen && formData.oen.length !== 9 && (
            <p className="text-sm text-brand-light-red mt-1">
              {t("studentInfo.validation.oenExactDigits")}
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
            {t("studentInfo.labels.firstName")}{" "}
            <span className="text-sm text-brand-light-red mt-1">*</span>
          </label>
          <Input
            id="firstName"
            type="text"
            value={formData.firstName}
            disabled={isLocked}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              const value = e.target.value;
              if (/^[A-Za-z\s'-]*$/.test(value)) {
                setFormData((prev) => ({ ...prev, firstName: value }));
              }
            }}
            className={lockCls("w-full px-3 py-2 border rounded-md")}
            placeholder={t("studentInfo.placeholders.firstName")} // translation
          />
        </div>

        <div>
          <label
            htmlFor="lastName"
            className="block text-sm font-medium mb-1 text-brand-text-gray"
          >
            {t("studentInfo.labels.lastName")}{" "}
            <span className="text-sm text-brand-light-red mt-1">*</span>
          </label>
          <Input
            id="lastName"
            type="text"
            value={formData.lastName}
            disabled={isLocked}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              const value = e.target.value;
              if (/^[A-Za-z\s'-]*$/.test(value)) {
                setFormData((prev) => ({ ...prev, lastName: value }));
              }
            }}
            className={lockCls("w-full px-3 py-2 border rounded-md")}
            placeholder={t("studentInfo.placeholders.lastName")} // translation
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="dob" className="block text-base font-medium mb-1 text-brand-text-gray">
            {t("studentInfo.labels.dob")}{" "}
            <span className="text-sm text-brand-light-red mt-1">*</span>
          </Label>
          <Popover open={dob.open} onOpenChange={dob.setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                id="dob"
                disabled={isLocked}
                className={lockCls("w-full justify-between font-normal")}
              >
                {dob.date // translation
                  ? dob.date.toLocaleDateString()
                  : t("studentInfo.placeholders.dob")}
                <ChevronDownIcon />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto overflow-hidden p-0" align="start">
              <Calendar
                mode="single"
                selected={dob.date}
                captionLayout="dropdown"
                onSelect={(date) => {
                  dob.setDate(date)
                  dob.setOpen(false)
                  if (date) {
                    setFormData((prev) => ({
                      ...prev,
                      dateOfBirth: format(date, "dd/MM/yyyy")
                    }))
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
            {t("studentInfo.labels.sin")}{" "}
            <span className="text-sm text-brand-light-red mt-1">*</span>
          </label>
          <Input
            id="sin"
            type="text"
            value={formData.sin}
            disabled={isLocked}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              let value = e.target.value.replace(/\D/g, "");
              if (value.length <= 9) {
                if (value.length > 6) {
                  value = `${value.slice(0, 3)}-${value.slice(
                    3,
                    6
                  )}-${value.slice(6)}`;
                } else if (value.length > 3) {
                  value = `${value.slice(0, 3)}-${value.slice(3)}`;
                }
                setFormData((prev) => ({ ...prev, sin: value }));
              }
            }}
            className={lockCls("w-full px-3 py-2 border rounded-md")}
            placeholder={t("studentInfo.placeholders.sin")} // translations
            maxLength={11}
          />
          {formData.sin &&
            formData.sin.replace(/\D/g, "").length !== 9 && (
              <p className="text-sm text-brand-light-red mt-1">
                {t("studentInfo.validation.sinExactDigits")}
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
            {t("studentInfo.labels.email")}{" "}
            <span className="text-sm text-brand-light-red mt-1">*</span>
          </label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            disabled={isLocked}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setFormData((prev) => ({ ...prev, email: e.target.value }))
            }
            className={lockCls("w-full px-3 py-2 border rounded-md")}
            placeholder={t("studentInfo.placeholders.email")} // translations
          />
        </div>

        <div>
          <label
            htmlFor="phone"
            className="block text-sm font-medium mb-1 text-brand-text-gray"
          >
            {t("studentInfo.labels.phone")}
          </label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            disabled={isLocked}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
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
            placeholder={t("studentInfo.placeholders.phone")} // translations
            maxLength={14}
          />
        </div>
      </div>

      {/* Mailing Address */}
      <div>
        <h3 className="text-lg font-semibold mb-3 text-brand-text-gray">
          {t("studentInfo.mailingAddressHeader")}
        </h3>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="address"
              className="block text-sm font-medium mb-1 text-brand-text-gray"
            >
              {t("studentInfo.labels.streetAddress")}{" "}
              <span className="text-sm text-brand-light-red mt-1">*</span>
            </label>
            <Input
              id="address"
              type="text"
              value={formData.address || ""}
              disabled={isLocked}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setFormData((prev) => ({ ...prev, address: e.target.value }))
              }
              className={lockCls("w-full px-3 py-2 border rounded-md")}
              placeholder={t("studentInfo.placeholders.streetAddress")} // translations
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="city"
                className="block text-sm font-medium mb-1 text-brand-text-gray"
              >
                {t("studentInfo.labels.city")}{" "}
                <span className="text-sm text-brand-light-red mt-1">*</span>
              </label>
              <Input
                id="city"
                type="text"
                value={formData.city || ""}
                disabled={isLocked}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setFormData((prev) => ({ ...prev, city: e.target.value }))
                }
                className={lockCls("w-full px-3 py-2 border rounded-md")}
                placeholder={t("studentInfo.placeholders.city")} // translations
              />
            </div>

            <div>
              <label
                htmlFor="province"
                className="block text-sm font-medium mb-1 text-brand-text-gray"
              >
                {t("studentInfo.labels.province")}{" "}
                <span className="text-sm text-brand-light-red mt-1">*</span>
              </label>
              <select
                id="province"
                value={formData.province || ""}
                disabled={isLocked}
                onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                  setFormData((prev) => ({ ...prev, province: e.target.value }))
                }
                className={lockCls("w-full px-3 py-2 border rounded-md")}
              >
                <option value="">
                  {t("studentInfo.placeholders.province")} 
                </option>
                <option value="ON">{t("studentInfo.provinces.ON")}</option>
                <option value="AB">{t("studentInfo.provinces.AB")}</option>
                <option value="BC">{t("studentInfo.provinces.BC")}</option>
                <option value="MB">{t("studentInfo.provinces.MB")}</option>
                <option value="NB">{t("studentInfo.provinces.NB")}</option>
                <option value="NL">{t("studentInfo.provinces.NL")}</option>
                <option value="NS">{t("studentInfo.provinces.NS")}</option>
                <option value="PE">{t("studentInfo.provinces.PE")}</option>
                <option value="QC">{t("studentInfo.provinces.QC")}</option>
                <option value="SK">{t("studentInfo.provinces.SK")}</option>
              </select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="postalCode"
                className="block text-sm font-medium mb-1 text-brand-text-gray"
              >
                {t("studentInfo.labels.postalCode")}{" "}
                <span className="text-sm text-brand-light-red mt-1">*</span>
              </label>
              <Input
                id="postalCode"
                type="text"
                value={formData.postalCode || ""}
                disabled={isLocked}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
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
                placeholder={t("studentInfo.placeholders.postalCode")} // translation
                maxLength={7}
              />
              {formData.postalCode && formData.postalCode.replace(/\s/g, "").length !== 6 && (
                <p className="text-sm text-brand-light-red mt-1">
                  {t("studentInfo.validation.postalCodeFormat")}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="country"
                className="block text-sm font-medium mb-1 text-brand-text-gray"
              >
                {t("studentInfo.labels.country")}{" "}
                <span className="text-sm text-brand-light-red mt-1">*</span>
              </label>
              <Input
                id="country"
                type="text"
                value={formData.country || "Canada"}
                disabled={isLocked}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setFormData((prev) => ({ ...prev, country: e.target.value }))
                }
                className={lockCls("w-full px-3 py-2 border rounded-md")}
                placeholder={t("studentInfo.placeholders.country")} // translation
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
