/**
 * Admin Dashboard
 * - Edit Mode toggle restores bulk "Select All + Status" controls
 * - Per-row Status dropdown only visible in Edit Mode (badge always visible)
 * - Institution names rendered in Title Case for consistency
 * - Persists assignee, violations, details, attachments, status per application
 * - Integrate ApplicationChatbot for analysis viewing
 */

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AdminLayout } from "@/components/bswd/AdminLayout";
import StatusBadge from "@/components/bswd/StatusBadge";
import { ApplicationAnalysisCard } from "@/components/admin/ApplicationAnalysisCard";
import { Play, MessageCircle } from "lucide-react";
import ApplicationChatbot from '@/components/admin/ApplicationChatbot';

import {
  AppSummary,
  Row,
  Attachment,
  VIOLATION_LIBRARY,
  loadSummaries as storeLoadSummaries,
  loadSnapshot as storeLoadSnapshot,
  saveApplicationsList as storeSaveApplicationsList,
  saveSnapshotMerge as storeSaveSnapshotMerge,
  attachFiles as storeAttachFiles,
  downloadAttachmentFromStorage,
  resetLocalApplications,
} from "@/lib/adminStore";

const STATUS_OPTIONS = ["Submitted", "In Review", "Approved", "Rejected", "Pending"];

const titleCase = (s: string | undefined) => {
  if (!s) return "—";
  return s
    .toLowerCase()
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
};

const openAttachment = async (att: Attachment) => {
  try {
    if (att.supabasePath) {
      const blob = await downloadAttachmentFromStorage(att.supabasePath);
      if (!blob) throw new Error("Unable to download from storage");
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank", "noopener,noreferrer");
      return;
    }
    if (!att.dataB64) throw new Error("No data to open");
    const bin = atob(att.dataB64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    const blob = new Blob([bytes], { type: att.mime || "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank", "noopener,noreferrer");
  } catch {
    alert("Unable to open file.");
  }
};

export default function AdminDashboardPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [bulkStatus, setBulkStatus] = useState<string>("Submitted");
  const [allChecked, setAllChecked] = useState<boolean>(false);
  const [toolbarMsg, setToolbarMsg] = useState<string>("");
  const [editMode, setEditMode] = useState<boolean>(false);
  const [analyses, setAnalyses] = useState<Record<string, any>>({});
  const [analyzing, setAnalyzing] = useState<string | null>(null);
  const [expandedApps, setExpandedApps] = useState<Set<string>>(new Set());

  //Chatbot
  const [activeChatApplication, setActiveChatApplication] = useState<any>(null);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);


const analyzeApplication = async (row: Row) => {
  setAnalyzing(row.id);
  try {
    const snapshot = await storeLoadSnapshot(row.id);
    
    console.log('=== ANALYSIS DEBUG ===');
    console.log('Application ID:', row.id);
    console.log('Snapshot data:', snapshot);
    
    const formData = snapshot?.formData || {
      studentId: row.studentId,
      firstName: row.studentName.split(' ')[0],
      lastName: row.studentName.split(' ').slice(1).join(' '),
      institution: row.institution,
      program: row.program,
      disabilityType: "permanent",
      studyType: "full-time",
      hasOSAPRestrictions: false,
      federalNeed: 0,
      provincialNeed: 0,
      functionalLimitations: [],
      needsPsychoEdAssessment: false,
      requestedItems: [],
    };

    // Parse financial need - handle string, number, null, undefined
    const parseFederalNeed = () => {
      const value = formData.federalNeed;
      console.log('Federal Need raw:', value, '(type:', typeof value, ')');
      if (value === null || value === undefined || value === '') return 0;
      const parsed = typeof value === 'number' ? value : parseFloat(String(value));
      return isNaN(parsed) ? 0 : parsed;
    };

    const parseProvincialNeed = () => {
      const value = formData.provincialNeed;
      console.log('Provincial Need raw:', value, '(type:', typeof value, ')');
      if (value === null || value === undefined || value === '') return 0;
      const parsed = typeof value === 'number' ? value : parseFloat(String(value));
      return isNaN(parsed) ? 0 : parsed;
    };

    const federalNeed = parseFederalNeed();
    const provincialNeed = parseProvincialNeed();
    
    console.log('Parsed Financial Need:', { 
      federal: federalNeed, 
      provincial: provincialNeed, 
      total: federalNeed + provincialNeed 
    });

    // Process functional limitations - handle both object and string formats
    const functionalLimitations = Array.isArray(formData.functionalLimitations) 
      ? formData.functionalLimitations
          .filter((limit: any) => {
            if (typeof limit === 'string') return true;
            if (typeof limit === 'object' && limit.checked) return true;
            return false;
          })
          .map((limit: any) => {
            if (typeof limit === 'string') return limit;
            return limit.label || '';
          })
          .filter(Boolean)
      : [];

    const payload = {
      application_id: row.id,
      student_id: formData.studentId,
      first_name: formData.firstName || row.studentName.split(' ')[0],
      last_name: formData.lastName || row.studentName.split(' ').slice(1).join(' '),
      disability_type: formData.disabilityType || "permanent",
      study_type: formData.studyType,
      has_osap_restrictions: formData.hasOSAPRestrictions || false,
      federal_need: federalNeed,
      provincial_need: provincialNeed,
      disability_verification_date: formData.disabilityVerificationDate || "",
      functional_limitations: functionalLimitations,
      needs_psycho_ed_assessment: formData.needsPsychoEdAssessment || false,
      requested_items: Array.isArray(formData.requestedItems)
        ? formData.requestedItems.map((item: any) => ({
            category: item.category || "",
            item: item.item || "",
            cost: typeof item.cost === 'number' ? item.cost : parseFloat(String(item.cost)) || 0,
            funding_source: String(item.fundingSource || "bswd")
          }))
        : [],
      institution: formData.institution || row.institution,
      program: formData.program || row.program,
    };

    console.log('Sending payload to API:', JSON.stringify(payload, null, 2));

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/analysis/application`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      const analysis = await response.json();
      console.log('Analysis result:', analysis);
      setAnalyses((prev) => ({ ...prev, [row.id]: analysis }));
      setExpandedApps((prev) => new Set(prev).add(row.id));
      
      const appDataWithAnalysis = {
        ...payload,
        analysis: analysis,
      };
      setActiveChatApplication(appDataWithAnalysis);
    } else {
      const errorText = await response.text();
      console.error("Analysis failed:", errorText);
      alert(`Analysis failed: ${response.statusText}\n\nCheck browser console for details.`);
    }
  } catch (error) {
    console.error("Analysis error:", error);
    alert(`Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  } finally {
    setAnalyzing(null);
  }
};

  // storage I/O 
  useEffect(() => {
    (async () => {
      const summaries = await storeLoadSummaries();
      const hydrated: Row[] = await Promise.all(
        summaries.map(async (s: AppSummary): Promise<Row> => {
          const snap = await storeLoadSnapshot(s.id);
          return {
            ...s,
            assignee: snap?.assignee ?? "",
            violationTags: Array.isArray(snap?.violationTags) ? snap!.violationTags : [],
            violationDetails: snap?.violationDetails ?? "",
            attachments: Array.isArray(snap?.attachments) ? snap!.attachments : [],
            _selected: false,
          };
        })
      );
      setRows(hydrated);
    })();
  }, []);

  const hasRows = useMemo(() => rows.length > 0, [rows]);

  // ---------- state mutations ----------
  const updateRow = (id: string, patch: Partial<Row>) => {
    setRows((prev: Row[]) => prev.map((r: Row) => (r.id === id ? { ...r, ...patch } : r)));
  };

  const toggleViolation = (id: string, tag: string) => {
    setRows((prev: Row[]) =>
      prev.map((r: Row) => {
        if (r.id !== id) return r;
        const set = new Set(r.violationTags || []);
        set.has(tag) ? set.delete(tag) : set.add(tag);
        return { ...r, violationTags: Array.from(set) };
      })
    );
  };

  const attachFiles = async (id: string, fileList: FileList | null) => {
    const newAtts = await storeAttachFiles(id, fileList);
    setRows((prev: Row[]) =>
      prev.map((r: Row) =>
        r.id === id ? { ...r, attachments: [...(r.attachments || []), ...newAtts] } : r
      )
    );
  };

  const removeAttachment = (id: string, attId: string) => {
    setRows((prev: Row[]) =>
      prev.map((r: Row) =>
        r.id === id
          ? {
              ...r,
              attachments: (r.attachments || []).filter((a: Attachment) => a.id !== attId),
            }
          : r
      )
    );
  };

  // per-row save
  const saveRow = async (r: Row) => {
    const now = new Date().toISOString();

    const withUpdated: Row = { ...r, statusUpdatedDate: now };
    await storeSaveSnapshotMerge(withUpdated);

    const summaries: AppSummary[] = rows.map((x: Row): AppSummary => ({
      id: x.id,
      studentName: x.studentName,
      studentId: x.studentId,
      submittedDate: x.submittedDate,
      status: x.status,
      program: x.program,
      institution: x.institution,
      studyPeriod: x.studyPeriod,
      statusUpdatedDate: x.statusUpdatedDate,
    }));

    await storeSaveApplicationsList(
      summaries.map((s: AppSummary) =>
        s.id === r.id ? { ...s, status: withUpdated.status, statusUpdatedDate: now } : s
      )
    );

    updateRow(r.id, { _saveMsg: "Saved", statusUpdatedDate: now });
    setTimeout(() => updateRow(r.id, { _saveMsg: "" }), 1200);
  };

  // bulk selection 
  const selectedCount = rows.filter((r: Row) => r._selected).length;

  const toggleSelectAll = (checked: boolean) => {
    setAllChecked(checked);
    setRows((prev: Row[]) => prev.map((r: Row) => ({ ...r, _selected: checked })));
  };

  const clearSelection = () => {
    setAllChecked(false);
    setRows((prev: Row[]) => prev.map((r: Row) => ({ ...r, _selected: false })));
  };

  const applyBulkStatus = async () => {
    if (selectedCount === 0) return;

    const now = new Date().toISOString();
    const updated: Row[] = rows.map((r: Row) =>
      r._selected ? { ...r, status: bulkStatus, statusUpdatedDate: now } : r
    );
    setRows(updated);

// persist each selected snapshot change
    await Promise.all(
      updated.map(async (r: Row) => {
        if (r._selected) await storeSaveSnapshotMerge(r);
      })
    );

    const summaries: AppSummary[] = updated.map((x: Row): AppSummary => ({
      id: x.id,
      studentName: x.studentName,
      studentId: x.studentId,
      submittedDate: x.submittedDate,
      status: x.status,
      program: x.program,
      institution: x.institution,
      studyPeriod: x.studyPeriod,
      statusUpdatedDate: x.statusUpdatedDate,
    }));
    await storeSaveApplicationsList(summaries);

    setToolbarMsg(
      `Applied "${bulkStatus}" to ${selectedCount} ${selectedCount === 1 ? "application" : "applications"}.`
    );
    setTimeout(() => setToolbarMsg(""), 1400);
  };

  // render 
  return (
    <AdminLayout
      title="BSWD Admin Dashboard"
      description="Hello Admin! Manage assignments, violations, status, and attachments."
      rightSlot={
        <div className="flex gap-2">
          <Link
            href="/"
            className="px-4 py-2 text-sm rounded-xl border border-gray-200 bg-white hover:bg-gray-100"
          >
            Back to Application
          </Link>
          {process.env.NODE_ENV !== "production" && (
            <button
              onClick={() => {
                if (confirm("Delete ALL local applications and snapshots?")) {
                  resetLocalApplications();
                  setRows([]);
                  setToolbarMsg("All local application data cleared.");
                  setTimeout(() => setToolbarMsg(""), 1500);
                }
              }}
              className="px-4 py-2 text-sm rounded-xl border border-red-300 bg-red-50 text-red-700 hover:bg-red-100"
              title="Clears all locally stored applications (does not touch Supabase)"
            >
              Reset Applications
            </button>
          )}
        </div>
      }
    >
      {/* Toolbar */}
      <div className="mb-4 flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
        <button
          onClick={() => setEditMode((v) => !v)}
          className="px-4 py-2 rounded-lg text-sm border border-gray-200 bg-white hover:bg-gray-100"
          title="Toggle edit mode for bulk and inline status editing"
        >
          {editMode ? "Exit Edit Mode" : "Edit"}
        </button>

        <label className="inline-flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={allChecked}
            onChange={(e) => toggleSelectAll(e.target.checked)}
            className="h-4 w-4"
            disabled={!editMode}
            title={editMode ? "Select all applications" : "Enable Edit Mode first"}
          />
          <span className={editMode ? "" : "opacity-50"}>Select All</span>
        </label>

        <div className="flex items-center gap-2">
          <span className={`text-sm ${editMode ? "text-gray-600" : "text-gray-400"}`}>Set status:</span>
          <select
            value={bulkStatus}
            onChange={(e) => setBulkStatus(e.target.value)}
            disabled={!editMode}
            className="px-3 py-2 border rounded-md text-sm disabled:opacity-50"
            title={editMode ? "Choose status to apply to selected" : "Enable Edit Mode first"}
          >
            {STATUS_OPTIONS.map((s: string) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <button
            onClick={applyBulkStatus}
            disabled={!editMode}
            className="px-4 py-2 rounded-lg bg-cyan-800 text-white hover:bg-cyan-700 text-sm disabled:opacity-50"
            title={editMode ? "Apply to selected applications" : "Enable Edit Mode first"}
          >
            Apply to Selected
          </button>
          <button
            onClick={clearSelection}
            disabled={!editMode}
            className="px-3 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-100 text-sm disabled:opacity-50"
            title={editMode ? "Clear selection" : "Enable Edit Mode first"}
          >
            Clear Selection
          </button>
        </div>

        <div className="ml-auto text-sm text-green-700">{toolbarMsg}</div>
      </div>

      {!hasRows ? (
        <div className="px-5 py-10 text-gray-500">No applications found.</div>
      ) : (
        <div className="space-y-6">
          {rows.map((r: Row) => (
            <div key={r.id} className="flex gap-4">
              <div className="flex-1 border rounded-xl bg-white shadow-sm p-5 space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between flex-wrap gap-3">
                  <div className="flex items-start gap-3">
                    {editMode && (
                      <input
                        type="checkbox"
                        checked={!!r._selected}
                        onChange={(e) => updateRow(r.id, { _selected: e.target.checked })}
                        className="mt-1 h-4 w-4"
                        title="Select for bulk actions"
                      />
                    )}
                    <div>
                      <h2 className="font-semibold text-gray-900">
                        {r.studentName} ({r.studentId})
                      </h2>
                      <p className="text-sm text-gray-600">
                        {titleCase(r.institution)} — {r.program || "—"}
                      </p>
                      <p className="text-xs text-gray-500">
                        Application ID: <span className="font-mono">{r.id}</span>
                      </p>
                    </div>
                  </div>

                  {/* Right side — Status + Buttons */}
                  <div className="flex items-center gap-3">
                    <StatusBadge status={r.status} />
                    {editMode && (
                      <select
                        value={r.status}
                        onChange={(e) => updateRow(r.id, { status: e.target.value })}
                        className="px-2 py-1.5 border rounded-md text-xs"
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    )}
                    <button
                      onClick={() => analyzeApplication(r)}
                      disabled={analyzing === r.id}
                      className="px-3 py-1.5 text-sm rounded-xl border border-cyan-200 bg-cyan-50 hover:bg-cyan-100 flex items-center gap-1"
                    >
                      <Play className="w-3 h-3" />
                      {analyzing === r.id ? "Analyzing..." : "Analyze"}
                    </button>

                    <Link
                      href={`/admin/${encodeURIComponent(r.id)}`}
                      className="px-3 py-1.5 text-sm rounded-xl border border-gray-200 bg-white hover:bg-gray-100"
                    >
                      View Submission
                    </Link>
                  </div>
                </div>

              {/* Assigned To */}
              <div>
                <label className="block text-sm text-gray-500 mb-1">Assigned To</label>
                <input
                  type="text"
                  value={r.assignee || ""}
                  onChange={(e) => updateRow(r.id, { assignee: e.target.value })}
                  placeholder="e.g., Admin"
                  className="w-full px-3 py-2 border rounded-md text-sm"
                />
              </div>

              {/* Violations (includes 'Other') */}
              <div>
                <label className="block text-sm text-gray-500 mb-2">
                  Violations / Issues (select all that apply)
                </label>

                <div className="flex flex-wrap gap-2">
                  {VIOLATION_LIBRARY.map((tag: string) => {
                    const active = (r.violationTags || []).includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleViolation(r.id, tag)}
                        className={`px-3 py-1.5 rounded-full text-xs border ${
                          active
                            ? "bg-red-100 text-red-800 border-red-200"
                            : "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200"
                        }`}
                        title={tag}
                      >
                        {tag}
                      </button>
                    );
                  })}

                  {/* Other chip + inline text; stored as "Other: <text>" */}
                  {(() => {
                    const customTags = (r.violationTags || []).filter((t: string) =>
                      t.startsWith("Other: ")
                    );
                    const hasOtherActive = customTags.length > 0;
                    const latest = customTags[customTags.length - 1] || "Other: ";
                    const latestText = latest.slice(7);

                    return (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            if (!hasOtherActive) {
                              updateRow(r.id, { violationTags: [...(r.violationTags || []), "Other: "] });
                            } else {
                              const next = (r.violationTags || []).filter(
                                (t: string) => !t.startsWith("Other: ")
                              );
                              updateRow(r.id, { violationTags: next });
                            }
                          }}
                          className={`px-3 py-1.5 rounded-full text-xs border ${
                            hasOtherActive
                              ? "bg-red-100 text-red-800 border-red-200"
                              : "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200"
                          }`}
                          title="Add a custom violation"
                        >
                          Other
                        </button>

                        {hasOtherActive && (
                          <input
                            type="text"
                            autoFocus
                            placeholder="Describe other issue…"
                            value={latestText}
                            onChange={(e) => {
                              const base = (r.violationTags || []).filter(
                                (t: string) => !t.startsWith("Other: ")
                              );
                              updateRow(r.id, { violationTags: [...base, `Other: ${e.target.value}`] });
                            }}
                            onBlur={() => {
                              const text = (r.violationTags || [])
                                .find((t: string) => t.startsWith("Other: "))
                                ?.slice(7)
                                .trim();
                              if (!text) {
                                updateRow(r.id, {
                                  violationTags: (r.violationTags || []).filter(
                                    (t: string) => !t.startsWith("Other: ")
                                  ),
                                });
                              } else {
                                const base = (r.violationTags || []).filter(
                                  (t: string) => !t.startsWith("Other: ")
                                );
                                updateRow(r.id, { violationTags: [...base, `Other: ${text}`] });
                              }
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                              if (e.key === "Escape") {
                                const text = (r.violationTags || [])
                                  .find((t: string) => t.startsWith("Other: "))
                                  ?.slice(7)
                                  .trim();
                                if (!text) {
                                  updateRow(r.id, {
                                    violationTags: (r.violationTags || []).filter(
                                      (t: string) => !t.startsWith("Other: ")
                                    ),
                                  });
                                } else {
                                  (e.target as HTMLInputElement).blur();
                                }
                              }
                            }}
                            className="px-3 py-1.5 rounded-md border text-xs"
                          />
                        )}

                        {/* Render existing custom tags as red chips */}
                        {customTags.map((tag: string) => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => toggleViolation(r.id, tag)}
                            className="px-3 py-1.5 rounded-full text-xs border bg-red-100 text-red-800 border-red-200"
                            title={tag}
                          >
                            {tag}
                          </button>
                        ))}
                      </>
                    );
                  })()}
                </div>

                <p className="text-xs text-gray-500 mt-1">
                  Most Common BSWD form issues (Write in "Other" if issue does not appear).
                </p>
              </div>

              {/* Violation details */}
              <div>
                <label className="block text-sm text-gray-500 mb-1">Other details (optional)</label>
                <textarea
                  value={r.violationDetails || ""}
                  onChange={(e) => updateRow(r.id, { violationDetails: e.target.value })}
                  rows={3}
                  placeholder="Add context for the selected violations..."
                  className="w-full px-3 py-2 border rounded-md text-sm"
                />
              </div>

              {/* Attachments */}
              <div>
                <label className="block text-sm text-gray-500 mb-2">Attachments</label>

                {r.attachments && r.attachments.length > 0 ? (
                  <ul className="space-y-2 mb-3">
                    {r.attachments.map((att: Attachment) => (
                      <li
                        key={att.id}
                        className="flex items-center justify-between border rounded-md px-3 py-2 text-sm"
                      >
                        <div className="min-w-0">
                          <div className="font-medium truncate">{att.name}</div>
                          <div className="text-xs text-gray-500">
                            {att.mime || "application/octet-stream"} • {att.size.toLocaleString()} bytes
                          </div>
                        </div>
                        <div className="shrink-0 flex items-center gap-2">
                          <button
                            onClick={() => openAttachment(att)}
                            className="px-3 py-1 rounded-lg border border-gray-200 bg-white hover:bg-gray-100 text-xs"
                          >
                            Open
                          </button>
                          <button
                            onClick={() => removeAttachment(r.id, att.id)}
                            className="px-3 py-1 rounded-lg text-xs text-red-600 hover:text-red-700"
                          >
                            Remove
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500 mb-2">No attachments yet.</p>
                )}

                <div>
                  <input
                    type="file"
                    multiple
                    onChange={async (e) => {
                      const input = e.currentTarget as HTMLInputElement; // capture before await
                      const files = input.files; // snapshot files
                      await attachFiles(r.id, files);
                      if (input) input.value = ""; // clear safely to allow re-upload same file name
                    }}
                    className="block w-full text-sm text-gray-700 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-gray-100 file:text-gray-800 hover:file:bg-gray-200"
                  />
                  <p className="text-xs text-gray-500 mt-1">Upload supporting documents</p>
                </div>
              </div>

              {/* Per-application save */}
              <div className="flex items-center justify-end gap-3 pt-2">
                {r._saveMsg ? (
                  <span className="text-sm text-green-700 bg-green-50 border border-green-200 px-3 py-1 rounded">
                    {r._saveMsg}
                  </span>
                ) : null}
                <button
                  onClick={() => saveRow(r)}
                  className="px-5 py-2 rounded-lg bg-cyan-800 text-white hover:bg-cyan-700 text-sm"
                >
                  Save Changes
                </button>
              </div>
            </div>
            {/* Analysis Card - OUTSIDE and to the RIGHT */}
            {analyses[r.id] && (
              <div className="w-96 flex-shrink-0">
                <div className="sticky top-4">
                  <ApplicationAnalysisCard analysis={analyses[r.id]} />
                </div>
              </div>
            )}
          </div>
          ))}
        </div>
      )}

      {/* Admin Chatbot + button */}
      {activeChatApplication && (
        <>
          {!isChatOpen && (
            <button
              onClick={() => setIsChatOpen(true)}
              className="fixed bottom-6 right-6 w-16 h-16 bg-red-800 hover:bg-red-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 z-40"
            >
              <MessageCircle className="w-7 h-7" />
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
  );
}
