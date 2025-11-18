/**
 * Application Detail 
 *
 * Focused, readable view of the submitted student application.
 * Renders:
 *  - Summary card
 *  - Student Info
 *  - Program Info
 *  - OSAP Info
 *  - Disability Info (chips for functional limitations)
 *  - Services & Equipment (table for requested items)
 *
 * Edit Mode uses the same step components then persists via adminStore.
 */

import { useRouter } from "next/router";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AdminLayout } from "@/components/bswd/AdminLayout";

// using app’s existing types/steps
import { FormData } from "@/types/bswd";
import { StudentInfoStep } from "@/components/bswd/steps/StudentInfoStep";
import { ProgramInfoStep } from "@/components/bswd/steps/ProgramInfoStep";
import { OsapInfoStep } from "@/components/bswd/steps/OsapInfoStep";
import { DisabilityInfoStep } from "@/components/bswd/steps/DisabilityInfoStep";
import { ServiceAndEquip } from "@/components/bswd/steps/ServiceAndEquip";
import { ReviewAndSubmit } from "@/components/bswd/steps/Submit";
import { StudentInfoSchema } from "@/schemas/StudentInfoSchema";

// central store I/O (Supabase + local) 
import {
  AppSummary as StoreSummary,
  Snapshot as StoreSnapshot,
  loadSnapshot as storeLoadSnapshot,
  saveSnapshotMerge as storeSaveSnapshotMerge,
  saveApplicationsList as storeSaveApplicationsList,
} from "@/lib/adminStore";

// pass through readOnly while keeping step prop types unchanged 
const StudentInfoStepShim = ({
  formData,
  setFormData,
  readOnly, // ignored
}: {
  formData: FormData;
  setFormData: any;
  readOnly?: any;
}) => <StudentInfoStep formData={formData} setFormData={setFormData} />;

const ProgramInfoStepShim = ({
  formData,
  setFormData,
  readOnly,
}: {
  formData: FormData;
  setFormData: any;
  readOnly?: any;
}) => <ProgramInfoStep formData={formData} setFormData={setFormData} />;

const OsapInfoStepShim = ({
  formData,
  setFormData,
  readOnly,
}: {
  formData: FormData;
  setFormData: any;
  readOnly?: any;
}) => <OsapInfoStep formData={formData} setFormData={setFormData} />;

const DisabilityInfoStepShim = ({
  formData,
  setFormData,
  readOnly,
}: {
  formData: FormData;
  setFormData: any;
  readOnly?: any;
}) => <DisabilityInfoStep formData={formData} setFormData={setFormData} />;

const ServiceAndEquipShim = ({
  formData,
  setFormData,
  readOnly,
}: {
  formData: FormData;
  setFormData: any;
  readOnly?: any;
}) => <ServiceAndEquip formData={formData} setFormData={setFormData} />;

const ReviewAndSubmitShim = ({
  formData,
  setFormData,
  isConfirmed,
  setIsConfirmed,
  readOnly,
}: {
  formData: FormData;
  setFormData: any;
  isConfirmed: boolean;
  setIsConfirmed: React.Dispatch<React.SetStateAction<boolean>>;
  readOnly?: any;
}) => (
  <ReviewAndSubmit
    formData={formData}
    setFormData={setFormData}
    isConfirmed={isConfirmed}
    setIsConfirmed={setIsConfirmed}
  />
);

// Local UI types mirroring store
type Summary = StoreSummary;
type Snapshot = StoreSnapshot;

export default function AdminApplicationDetailPage() {
  const router = useRouter();
  const { id } = router.query as { id?: string };

  const [data, setData] = useState<Snapshot | null>(null);

  // edit mode state
  const [isEditMode, setIsEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<FormData | null>(null);
  const initialSnapshot = useRef<FormData | null>(null);
  const [isConfirmed, setIsConfirmed] = useState(false);

  // Load from centralized store (Supabase + local fallback)
  useEffect(() => {
    if (!id) return;
    (async () => {
      const snap = await storeLoadSnapshot(id);
      if (snap) {
        setData(snap);
        if (snap.formData) {
          setEditForm(snap.formData as FormData);
          initialSnapshot.current = snap.formData as FormData;
        } else {
          setEditForm(null);
          initialSnapshot.current = null;
        }
      }
    })();
  }, [id]);

  const summary = data?.summary;
  const form = data?.formData || {};
  const hasForm = useMemo(() => !!data?.formData, [data]);

  const prettyDate = (iso?: string) => (iso ? new Date(iso).toLocaleString() : "—");

  const toChips = (val: any): string[] => {
    if (!val) return [];
    if (Array.isArray(val)) return val.map(String).filter(Boolean);
    if (typeof val === "object") {
      return Object.entries(val)
        .filter(([_, v]) => !!v)
        .map(([k]) => k);
    }
    if (typeof val === "string") {
      return val
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }
    return [];
  };

  const formatMoney = (n: any) => {
    const num = Number(n);
    if (Number.isNaN(num)) return "—";
    return num.toLocaleString(undefined, { style: "currency", currency: "CAD" });
  };

  const requestedItems: Array<{
    category?: string;
    item?: string;
    cost?: number | string;
    justification?: string;
    fundingSource?: string;
  }> = Array.isArray(form.requestedItems) ? form.requestedItems : [];

  // dirty detection
  const isDirty =
    !!initialSnapshot.current &&
    !!editForm &&
    JSON.stringify(initialSnapshot.current) !== JSON.stringify(editForm);

  // Persist snapshot and  refresh list (centralized store)
  const persistEverywhere = async (fd: FormData) => {
    if (!summary) return;

    // derive a refreshed summary from edited form
    const nowIso = new Date().toISOString();
    const nextSummary: Summary = {
      ...summary,
      studentName: `${fd.firstName} ${fd.lastName}`.trim(),
      program: fd.program,
      institution: fd.institution,
      studyPeriod:
        fd.studyPeriodStart && fd.studyPeriodEnd
          ? `${fd.studyPeriodStart} - ${fd.studyPeriodEnd}`
          : "Not specified",
      statusUpdatedDate: nowIso,
    };

    // save snapshot (formData)
    await storeSaveSnapshotMerge(
      {
        ...nextSummary,
      } as any, // Row shape is compatible with Summary for fields we pass
      fd
    );

    // refresh applications list (only this summary change required)
    await storeSaveApplicationsList([nextSummary]);

    // reflect locally
    const nextSnap: Snapshot = {
      summary: nextSummary,
      formData: fd,
      assignee: data?.assignee ?? "",
      violationTags: data?.violationTags ?? [],
      violationDetails: data?.violationDetails ?? "",
      attachments: data?.attachments ?? [],
    };
    setData(nextSnap);
    initialSnapshot.current = fd;
  };

  // Validate a minimal set from Student block 
  const validateAndSaveStudentBlock = async (fd: FormData) => {
    try {
      const [dayStr, monthStr, yearStr] = (fd.dateOfBirth || "").split("/");
      const day = Number(dayStr),
        month = Number(monthStr),
        year = Number(yearStr);
      if (!day || !month || !year) {
        setError("Invalid date of birth format. Use DD/MM/YYYY.");
        return false;
      }
      const birthDate = new Date(year, month - 1, day);
      const sin = String(fd.sin || "").replace(/\D/g, "");
      const phone = String(fd.phone || "").replace(/\D/g, "");

      const studentInfoData = {
        studentId: String(fd.studentId || "").trim(),
        oen: String(fd.oen || ""),
        firstName: String(fd.firstName || ""),
        lastName: String(fd.lastName || ""),
        dateOfBirth: birthDate,
        sin,
        phone,
      };

      const parsed = StudentInfoSchema.safeParse(studentInfoData);
      if (!parsed.success) {
        setError("Please review Student Info. Some fields are invalid.");
        return false;
      }

      // it may also persist to a dedicated table/service here
      return true;
    } catch (e) {
      console.error(e);
      setError("Unexpected error while validating student info.");
      return false;
    }
  };

  const handleSave = async () => {
    if (!editForm || saving) return;
    setSaving(true);
    setError(null);
    try {
      const ok = await validateAndSaveStudentBlock(editForm);
      if (!ok) return;
      await persistEverywhere(editForm);
      setIsEditMode(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout
      title="Application Details"
      rightSlot={
        <div className="flex gap-2">
          <Link
            href="/admin"
            className="px-4 py-2 text-sm rounded-xl border border-gray-200 bg-white hover:bg-gray-100"
          >
            Back to Dashboard
          </Link>
          <Link
            href="/"
            className="px-4 py-2 text-sm rounded-xl bg-cyan-800 text-white hover:bg-cyan-700"
          >
            Back to Application
          </Link>
        </div>
      }
    >
      {/* top edit controls */}
      {hasForm ? (
        <div className="mb-4 flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsEditMode((v) => !v)}
            className={`px-4 py-2 text-sm rounded-xl border ${
              isEditMode
                ? "bg-amber-50 border-amber-200 text-amber-800"
                : "bg-white border-gray-200 text-gray-700 hover:bg-gray-100"
            }`}
            title={isEditMode ? "Editing enabled" : "Enable Edit Mode to modify fields"}
          >
            {isEditMode ? "Editing Enabled" : "Enable Edit Mode"}
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!isEditMode || !isDirty || saving}
            className={`px-4 py-2 text-sm rounded-xl ${
              !isEditMode || !isDirty || saving
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-cyan-800 text-white hover:bg-cyan-700"
            }`}
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>
          {isDirty && <span className="text-sm text-amber-700">Unsaved changes</span>}
          {error && (
            <span className="ml-auto text-sm text-red-700 bg-red-50 border border-red-200 px-3 py-1 rounded">
              {error}
            </span>
          )}
        </div>
      ) : null}

      {!summary ? (
        <div className="border rounded-xl p-6 bg-white shadow-sm">
          Could not load application <span className="font-mono">{id}</span>.
        </div>
      ) : (
        <>
          {/* Summary */}
          <div className="border rounded-xl p-6 bg-white shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Field label="Application ID" value={summary.id} mono />
              <Field label="Submitted" value={prettyDate(summary.submittedDate)} />
              <Field
                label="Student"
                value={`${summary.studentName} (ID: ${summary.studentId})`}
              />
              <Field label="Status" value={(summary.status || "SUBMITTED").toUpperCase()} />
              <Field label="Institution" value={summary.institution || "—"} />
              <Field label="Program" value={summary.program || "—"} />
              <div className="md:col-span-2">
                <Field label="Study Period" value={summary.studyPeriod || "—"} />
              </div>
            </div>
          </div>

          {/* Submitted Form */}
          <div className="border rounded-xl p-6 bg-white shadow-sm space-y-6">
            <h2 className="text-xl font-semibold">Submitted Form</h2>

            {!hasForm ? (
              <div className="text-sm text-gray-500">Only a summary is available for this application.</div>
            ) : (
              <>
                {/* view mode */}
                {!isEditMode ? (
                  <>
                    <Section title="Student Info">
                      <Grid>
                        <Field label="Student ID" value={form.studentId} />
                        <Field label="OEN" value={form.oen} />
                        <Field label="SIN" value={form.sin} />
                        <Field label="First Name" value={form.firstName} />
                        <Field label="Last Name" value={form.lastName} />
                        <Field label="Date of Birth" value={form.dateOfBirth} />
                        <Field label="Email" value={form.email} />
                        <Field label="Phone" value={form.phone} />
                        <Field label="Address" value={form.address} />
                        <Field label="City" value={form.city} />
                        <Field label="Province" value={form.province} />
                        <Field label="Postal Code" value={form.postalCode} />
                        <Field label="Country" value={form.country} />
                      </Grid>
                    </Section>

                    <Section title="Program Info">
                      <Grid>
                        <Field label="Institution" value={form.institution} />
                        <Field label="Institution Type" value={form.institutionType} />
                        <Field label="Program" value={form.program} />
                        <Field label="Study Period Start" value={form.studyPeriodStart} />
                        <Field label="Study Period End" value={form.studyPeriodEnd} />
                        <Field label="Study Type" value={form.studyType} />
                        <Field label="Submitted Elsewhere" value={form.submittedDisabilityElsewhere} />
                        <Field label="Previous Institution" value={form.previousInstitution} />
                      </Grid>
                    </Section>

                    <Section title="OSAP Info">
                      <Grid>
                        <Field label="OSAP Application" value={form.osapApplication} />
                        <Field label="Federal Need" value={String(form.federalNeed ?? "")} />
                        <Field label="Provincial Need" value={String(form.provincialNeed ?? "")} />
                        <Field label="OSAP Restrictions" value={String(form.hasOSAPRestrictions)} />
                        <Field label="Restriction Details" value={form.restrictionDetails} />
                      </Grid>
                    </Section>

                    <Section title="Disability Info">
                      <Grid>
                        <Field label="Verified Disability" value={String(form.hasVerifiedDisability)} />
                        <Field label="Disability Type" value={form.disabilityType} />
                        <Field label="Verification Date" value={form.disabilityVerificationDate} />
                        <Field
                          label="Needs Psycho-Ed Assessment"
                          value={String(form.needsPsychoEdAssessment)}
                        />
                        <Field label="Email (for Psycho-Ed)" value={form.email} />
                      </Grid>

                      {/* Functional Limitations as chips */}
                      <div className="text-sm">
                        <div className="text-gray-500 mb-1">Functional Limitations</div>
                        {toChips(form.functionalLimitations).length === 0 ? (
                          <div>—</div>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {toChips(form.functionalLimitations).map((chip: string) => (
                              <span
                                key={chip}
                                className="px-2.5 py-1 rounded-full text-xs bg-gray-100 text-gray-700 border border-gray-200"
                              >
                                {chip}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </Section>

                    <Section title="Services & Equipment">
                      {requestedItems.length === 0 ? (
                        <div className="text-sm text-gray-500">No requested items.</div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="text-left text-gray-500">
                                <th className="py-2 pr-4">Category</th>
                                <th className="py-2 pr-4">Item</th>
                                <th className="py-2 pr-4">Cost</th>
                                <th className="py-2 pr-4">Funding</th>
                                <th className="py-2 pr-4">Justification</th>
                              </tr>
                            </thead>
                            <tbody className="align-top">
                              {requestedItems.map((ri, idx) => (
                                <tr key={idx} className="border-t">
                                  <td className="py-2 pr-4">
                                    <span className="px-2 py-1 rounded-md bg-gray-100 border border-gray-200">
                                      {ri.category || "—"}
                                    </span>
                                  </td>
                                  <td className="py-2 pr-4">{ri.item || "—"}</td>
                                  <td className="py-2 pr-4 whitespace-nowrap">{formatMoney(ri.cost)}</td>
                                  <td className="py-2 pr-4">
                                    <span className="px-2 py-1 rounded-md bg-gray-100 border border-gray-200">
                                      {(ri.fundingSource || "").toString()}
                                    </span>
                                  </td>
                                  <td className="py-2 pr-4 max-w-[28rem]">
                                    <div className="text-gray-700">{ri.justification || "—"}</div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </Section>
                  </>
                ) : (
                  // edit mode: use the same step components
                  <div className="space-y-6">
                    {editForm ? (
                      <>
                        <StudentInfoStepShim
                          formData={editForm}
                          setFormData={setEditForm as any}
                          readOnly={false as any}
                        />
                        <ProgramInfoStepShim
                          formData={editForm}
                          setFormData={setEditForm as any}
                          readOnly={false as any}
                        />
                        <OsapInfoStepShim
                          formData={editForm}
                          setFormData={setEditForm as any}
                          readOnly={false as any}
                        />
                        <DisabilityInfoStepShim
                          formData={editForm}
                          setFormData={setEditForm as any}
                          readOnly={false as any}
                        />
                        <ServiceAndEquipShim
                          formData={editForm}
                          setFormData={setEditForm as any}
                          readOnly={false as any}
                        />
                        <ReviewAndSubmitShim
                          formData={editForm}
                          setFormData={setEditForm as any}
                          isConfirmed={isConfirmed}
                          setIsConfirmed={setIsConfirmed}
                          readOnly={false as any}
                        />
                      </>
                    ) : (
                      <div className="text-sm text-gray-500">No form data to edit.</div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </>
      )}
    </AdminLayout>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h3 className="font-medium">{title}</h3>
      {children}
    </section>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">{children}</div>;
}

function Field({ label, value, mono }: { label: string; value: any; mono?: boolean }) {
  return (
    <div>
      <div className="text-gray-500">{label}</div>
      <div className={`${mono ? "font-mono" : "font-medium"} break-words`}>{value ?? "—"}</div>
    </div>
  );
}
