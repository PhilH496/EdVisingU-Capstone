/**
 * Application Detail
 *
 * Focused, readable view of the submitted student application.
 */

import { useRouter } from "next/router";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  Dispatch,
  SetStateAction,
} from "react";
import Head from "next/head";
import Link from "next/link";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ApplicationAnalysisCard } from "@/components/admin/ApplicationAnalysisCard";
import ApplicationChatbot from "@/components/admin/AdminChatbot";
import ProtectedRoute from "@/components/ProtectedRoute";

// using app's existing types/steps
import { FormData } from "@/types/bswd";
import { StudentInfoSchema } from "@/schemas/StudentInfoSchema";

// central store I/O (Supabase + local)
import {
  AppSummary as StoreSummary,
  Snapshot as StoreSnapshot,
  loadSnapshot as storeLoadSnapshot,
  saveSnapshotMerge as storeSaveSnapshotMerge,
  saveApplicationsList as storeSaveApplicationsList,
} from "@/lib/adminStore";
import { supabase } from "@/lib/supabase";

import {
  RequestedItem,
  DeterministicCheckResult,
  FinancialAnalysis,
  AIAnalysisResult,
  ApplicationAnalysis,
  ApplicationData,
  FormDataSetter,
} from "@/lib/admin/types";

import {
  prettyDate,
  toChips,
  formatMoney,
  normalizeFunctionalLimitations,
} from "@/lib/admin/adminUtils";

import {
  StudentInfoStepShim,
  ProgramInfoStepShim,
  OsapInfoStepShim,
  DisabilityInfoStepShim,
  ServiceAndEquipShim,
  ReviewAndSubmitShim,
} from "@/components/admin/FormShims";

import {
  Section,
  Grid,
  Field,
} from "@/components/admin/FormDisplay";

// Local UI types mirroring store
type Summary = StoreSummary;
type Snapshot = StoreSnapshot;

function AdminApplicationDetailPage() {
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

  // Analysis
  const [analysis, setAnalysis] = useState<ApplicationAnalysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  // Chatbot
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeChatApplication, setActiveChatApplication] =
    useState<ApplicationData | null>(null);

  const setFormDataForSteps: FormDataSetter = (update) => {
    setEditForm((prev) => {
      if (!prev) {
        const base = {} as FormData;
        return typeof update === "function"
          ? (update as (f: FormData) => FormData)(base)
          : update;
      }
      return typeof update === "function"
        ? (update as (f: FormData) => FormData)(prev)
        : update;
    });
  };

  const analyzeApplication = async () => {
    if (!editForm || !summary) return;
    setAnalyzing(true);
    try {
      // Process functional limitations
      const functionalLimitations = toChips(editForm.functionalLimitations);

      const payload = {
        application_id: summary.id,
        student_id: editForm.studentId,
        first_name: editForm.firstName,
        last_name: editForm.lastName,
        disability_type: editForm.disabilityType,
        study_type: editForm.studyType,
        osap_application: editForm.osapApplication,
        has_osap_restrictions: editForm.hasOSAPRestrictions,
        federal_need: editForm.federalNeed,
        provincial_need: editForm.provincialNeed,
        disability_verification_date: editForm.disabilityVerificationDate,
        functional_limitations: functionalLimitations,
        needs_psycho_ed_assessment: editForm.needsPsychoEdAssessment,
        requested_items: requestedItems.map((item) => ({
          category: item.category,
          item: item.item,
          cost: item.cost,
          funding_source: item.fundingSource,
        })),
        institution: editForm.institution,
        program: editForm.program,
      };

      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL
        }/api/analysis/application`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (response.ok) {
        const analysisResult = await response.json();
        setAnalysis(analysisResult);

        // Structure properly for chatbot
        const appDataWithAnalysis: ApplicationData = {
          application_id: summary.id,
          student_id: editForm.studentId,
          first_name: editForm.firstName,
          last_name: editForm.lastName,
          disability_type: editForm.disabilityType,
          study_type: editForm.studyType,
          osap_application: editForm.osapApplication,
          has_osap_restrictions: editForm.hasOSAPRestrictions,
          federal_need: editForm.federalNeed,
          provincial_need: editForm.provincialNeed,
          disability_verification_date:
            editForm.disabilityVerificationDate ?? "",
          functional_limitations: functionalLimitations,
          needs_psycho_ed_assessment: editForm.needsPsychoEdAssessment,
          requested_items: requestedItems.map((item) => ({
            category: item.category ?? "",
            item: item.item ?? "",
            cost:
              typeof item.cost === "number"
                ? item.cost
                : Number(item.cost ?? 0),
            funding_source: item.fundingSource ?? "",
          })),
          institution: editForm.institution,
          program: editForm.program,
          analysis: {
            decision: analysisResult.ai_analysis.recommended_status,
            confidence: Math.round(
              analysisResult.ai_analysis.confidence_score * 100
            ),
            reasoning: analysisResult.ai_analysis.reasoning,
            risk_factors: analysisResult.ai_analysis.risk_factors,
            recommended_funding:
              analysisResult.ai_analysis.funding_recommendation,
          },
        };
        setActiveChatApplication(appDataWithAnalysis);
      }
    } catch (error) {
      console.error("Analysis failed:", error);
      alert("Analysis failed. Make sure backend is running.");
    } finally {
      setAnalyzing(false);
    }
  };

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
  const form = (data?.formData as FormData) || ({} as FormData);
  const hasForm = useMemo(() => !!data?.formData, [data]);

  const requestedItems: RequestedItem[] = Array.isArray(form.requestedItems)
    ? (form.requestedItems as RequestedItem[])
    : [];

  const adminFunctionalLimits = normalizeFunctionalLimitations(
    form.functionalLimitations
  );

  // dirty detection
  const isDirty =
    !!initialSnapshot.current &&
    !!editForm &&
    JSON.stringify(initialSnapshot.current) !== JSON.stringify(editForm);

  // Persist snapshot and refresh list (centralized store)
  const persistEverywhere = async (fd: FormData) => {
    if (!summary) return;

    const nowIso = new Date().toISOString();

    const updatedRow = {
      id: summary.id,
      studentName: `${fd.firstName} ${fd.lastName}`.trim(),
      studentId: summary.studentId,
      submittedDate: summary.submittedDate,
      status: summary.status,
      confidenceScore: summary.confidenceScore,
      program: fd.program,
      institution: fd.institution,
      studyPeriod: `${fd.studyPeriodStart} - ${fd.studyPeriodEnd}`,
      statusUpdatedDate: nowIso,

      // Admin workflow fields
      assignee: data?.assignee ?? "",
      violationTags: data?.violationTags ?? [],
      violationDetails: data?.violationDetails ?? "",
      attachments: data?.attachments ?? [],
    };

    // Triggers status and score recalculation and saves to Supabase
    await storeSaveSnapshotMerge(updatedRow, fd);

    // Fetch the recalculated status and score from Supabase
    const { data: updatedApp } = await supabase
      .from("applications")
      .select("status, status_updated_date, confidence_score")
      .eq("id", summary.id)
      .single();

    // Create updated summary
    const nextSummary: Summary = {
      id: updatedRow.id,
      studentName: updatedRow.studentName,
      studentId: updatedRow.studentId,
      submittedDate: updatedRow.submittedDate,
      status: updatedApp?.status || updatedRow.status,
      program: updatedRow.program,
      institution: updatedRow.institution,
      studyPeriod: updatedRow.studyPeriod,
      statusUpdatedDate: updatedApp?.status_updated_date || nowIso,
      confidenceScore: updatedApp?.confidence_score,
    };

    await storeSaveApplicationsList([nextSummary]);

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
    <div>
      <Head>
        <title>
          {summary?.studentName || "Application Details"}
        </title>
        <meta name="description" content="BSWD application review" />
      </Head>
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
            className="px-4 py-2 text-sm rounded-xl bg-brand-dark-blue text-white hover:bg-opacity-90"
          >
            Back to Application
          </Link>
        </div>
      }
    >
      <div className="flex gap-4">
        <div className="flex-1">
          {hasForm && (
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditMode((v) => !v)}
                  className={`px-4 py-2 text-sm rounded-xl border transition-colors ${
                    isEditMode
                      ? "bg-yellow-50 border-yellow-200 text-yellow-800"
                      : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                  }`}
                  title={
                    isEditMode
                      ? "Editing enabled"
                      : "Enable Edit Mode to modify fields"
                  }
                >
                  {isEditMode ? "Editing Enabled" : "Enable Edit Mode"}
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={!isEditMode || !isDirty || saving}
                  className={`px-4 py-2 text-sm rounded-xl transition-colors ${
                    !isEditMode || !isDirty || saving
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-brand-dark-blue text-white hover:bg-opacity-90"
                  }`}
                >
                  {saving ? "Saving…" : "Save Changes"}
                </button>
                {isDirty && (
                  <span className="text-sm text-yellow-700 font-medium">
                    Unsaved changes
                  </span>
                )}

                {error && (
                  <span className="text-sm text-red-700 bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg">
                    {error}
                  </span>
                )}
              </div>
              <button
                onClick={analyzeApplication}
                disabled={analyzing}
                className="px-4 py-2 text-sm rounded-xl bg-brand-dark-blue text-white hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
              >
                <i className="fa-solid fa-play"></i>
                {analyzing ? "Analyzing..." : "Run AI Analysis"}
              </button>
            </div>
          )}

          {!summary ? (
            <div className="border rounded-xl p-6 bg-white shadow-sm">
              Could not load application <span className="font-mono">{id}</span>
              .
            </div>
          ) : (
            <>
              {/* Summary */}
              <div className="border rounded-xl p-6 bg-white shadow-sm mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Field label="Application ID" value={summary.id} mono />
                  <Field
                    label="Submitted"
                    value={prettyDate(summary.submittedDate)}
                  />
                  <Field
                    label="Student"
                    value={`${summary.studentName} (ID: ${summary.studentId})`}
                  />
                  <Field
                    label="Status"
                    value={(summary.status || "SUBMITTED").toUpperCase()}
                  />
                  <Field
                    label="Institution"
                    value={summary.institution || "—"}
                  />
                  <Field label="Program" value={summary.program || "—"} />
                  <div className="md:col-span-2">
                    <Field
                      label="Study Period"
                      value={summary.studyPeriod || "—"}
                    />
                  </div>
                </div>
              </div>

              {/* Submitted Form */}
              <div className="border rounded-xl p-6 bg-white shadow-sm space-y-6">
                <h2 className="text-xl font-semibold">Submitted Form</h2>

                {!hasForm ? (
                  <div className="text-sm text-gray-500">
                    Only a summary is available for this application.
                  </div>
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
                            <Field
                              label="Date of Birth"
                              value={form.dateOfBirth}
                            />
                            <Field label="Email" value={form.email} />
                            <Field label="Phone" value={form.phone} />
                            <Field label="Address" value={form.address} />
                            <Field label="City" value={form.city} />
                            <Field label="Province" value={form.province} />
                            <Field
                              label="Postal Code"
                              value={form.postalCode}
                            />
                            <Field label="Country" value={form.country} />
                          </Grid>
                        </Section>

                        <Section title="Program Info">
                          <Grid>
                            <Field
                              label="Institution"
                              value={form.institution}
                            />
                            <Field
                              label="Institution Type"
                              value={form.institutionType}
                            />
                            <Field label="Program" value={form.program} />
                            <Field
                              label="Study Period Start"
                              value={form.studyPeriodStart}
                            />
                            <Field
                              label="Study Period End"
                              value={form.studyPeriodEnd}
                            />
                            <Field label="Study Type" value={form.studyType} />
                            <Field
                              label="Submitted Elsewhere"
                              value={form.submittedDisabilityElsewhere}
                            />
                            <Field
                              label="Previous Institution"
                              value={form.previousInstitution}
                            />
                          </Grid>
                        </Section>

                        <Section title="OSAP Info">
                          <Grid>
                            <Field
                              label="OSAP Application"
                              value={form.osapApplication}
                            />
                            <Field
                              label="Federal Need"
                              value={String(form.federalNeed)}
                            />
                            <Field
                              label="Provincial Need"
                              value={String(form.provincialNeed)}
                            />
                            <Field
                              label="OSAP Restrictions"
                              value={String(form.hasOSAPRestrictions)}
                            />
                            <Field
                              label="Restriction Details"
                              value={form.restrictionDetails}
                            />
                          </Grid>
                        </Section>

                        <Section title="Disability Info">
                          <Grid>
                            <Field
                              label="Verified Disability"
                              value={String(form.hasVerifiedDisability)}
                            />
                            <Field
                              label="Disability Type"
                              value={form.disabilityType}
                            />
                            <Field
                              label="Verification Date"
                              value={form.disabilityVerificationDate}
                            />
                            <Field
                              label="Needs Psycho-Ed Assessment"
                              value={String(form.needsPsychoEdAssessment)}
                            />
                            <Field
                              label="Email (for Psycho-Ed)"
                              value={form.email}
                            />
                          </Grid>

                          {/* Functional Limitations as chips */}
                          <div className="text-sm">
                            <div className="text-gray-500 mb-1">
                              Functional Limitations
                            </div>
                            {adminFunctionalLimits.length === 0 ? (
                              <div>—</div>
                            ) : (
                              <div className="flex flex-wrap gap-2">
                                {adminFunctionalLimits.map((chip, idx) => (
                                  <span
                                    key={idx}
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
                            <div className="text-sm text-gray-500">
                              No requested items.
                            </div>
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
                                      <td className="py-2 pr-4">
                                        {ri.item || "—"}
                                      </td>
                                      <td className="py-2 pr-4 whitespace-nowrap">
                                        {formatMoney(ri.cost)}
                                      </td>
                                      <td className="py-2 pr-4">
                                        <span className="px-2 py-1 rounded-md bg-gray-100 border border-gray-200">
                                          {(ri.fundingSource || "").toString()}
                                        </span>
                                      </td>
                                      <td className="py-2 pr-4 max-w-[28rem]">
                                        <div className="text-gray-700">
                                          {ri.justification || "—"}
                                        </div>
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
                      <div className="space-y-6">
                        {editForm ? (
                          <>
                            <StudentInfoStepShim
                              formData={editForm}
                              setFormData={setFormDataForSteps}
                            />
                            <ProgramInfoStepShim
                              formData={editForm}
                              setFormData={setFormDataForSteps}
                            />
                            <OsapInfoStepShim
                              formData={editForm}
                              setFormData={setFormDataForSteps}
                            />
                            <DisabilityInfoStepShim
                              formData={editForm}
                              setFormData={setFormDataForSteps}
                            />
                            <ServiceAndEquipShim
                              formData={editForm}
                              setFormData={setFormDataForSteps}
                            />
                            <ReviewAndSubmitShim
                              formData={editForm}
                              setFormData={setFormDataForSteps}
                              isConfirmed={isConfirmed}
                              setIsConfirmed={setIsConfirmed}
                            />
                          </>
                        ) : (
                          <div className="text-sm text-gray-500">
                            No form data to edit.
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            </>
          )}
        </div>
        {analysis && (
          <div className="w-96 flex-shrink-0">
            <div className="sticky top-4">
              <ApplicationAnalysisCard analysis={analysis} />
            </div>
          </div>
        )}
      </div>

      {/* Floating chatbot + button */}
      {activeChatApplication && (
        <>
          {!isChatOpen && (
            <button
              onClick={() => setIsChatOpen(true)}
              className="fixed bottom-6 right-6 w-16 h-16 bg-red-800 hover:bg-red-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 z-40"
              title="Open Admin Assistant"
            >
              <i className="fa-solid fa-comment text-white text-3xl"></i>
            </button>
          )}

          <ApplicationChatbot
            mode="floating"
            isOpen={isChatOpen}
            onClose={() => setIsChatOpen(false)}
            applicationData={activeChatApplication}
          />
        </>
      )}
    </AdminLayout>
    </div>
  );
}

export default function AdminApplicationDetailPageWithAuth() {
  return (
    <ProtectedRoute requireRole="admin">
      <AdminApplicationDetailPage />
    </ProtectedRoute>
  );
}