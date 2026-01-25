/**
 * Admin Store (Dual Mode: Supabase + Local)
 * --------------------------------------------------------------------
 * Centralizes all Admin UI data I/O.
 * Comments mark where we connect to Supabase; localStorage is used as
 * a seamless fallback when Supabase is not configured or errors occur.
 */

import { supabase, isSupabaseReady } from "@/lib/supabaseClient";
import { FormData } from "@/types/bswd";
/* ==================== Types ==================== */

export type AppSummary = {
  id: string;
  studentName: string;
  studentId: string;
  submittedDate: string;
  status: string;
  program: string;
  institution: string;
  studyPeriod: string;
  statusUpdatedDate: string;
  confidenceScore?: number;
};

export type Attachment = {
  id: string;
  name: string;
  mime: string;
  size: number;
  dataB64: string;
  supabasePath?: string; // storage key when uploaded to Supabase
};

export type Snapshot = {
  summary: AppSummary;
  formData: FormData;
  assignee?: string;
  violationTags?: string[];
  violationDetails?: string;
  attachments?: Attachment[];
};

export type Row = AppSummary & {
  assignee?: string;
  violationTags?: string[];
  violationDetails?: string;
  attachments?: Attachment[];
  _saveMsg?: string;
  _selected?: boolean;
};

export const VIOLATION_LIBRARY: string[] = [
  // Documentation & Evidence Issues
  "Insufficient medical evidence",
  "Incomplete/incorrect forms (Schedule 4 / Disability Verification)",
  "Lack of proof linking item/service to functional limitation",
  "Outdated or inconsistent medical records",
  "Purchased item/service before approval",

  // Eligibility & Financial Need Problems
  "No demonstrated provincial need (OSAP)",
  "Exceeds income threshold for provincial aid",
  "Insufficient course load",

  // Procedural & Communication Errors
  "Failed to respond / cooperate with requests",
  "Missed deadlines (application/appeal)",
  "Not working with Accessibility Services",
];

/* ==================== Helpers ==================== */

const SNAP_KEY = (id: string) => `applicationDetail:${id}`;

const uuid = () =>
  "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (crypto.getRandomValues(new Uint8Array(1))[0] & 0xf) >> 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });

const b64FromFile = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read file."));
    reader.onload = () => {
      const result = reader.result as string;
      const i = result.indexOf("base64,");
      resolve(i >= 0 ? result.substring(i + 7) : result);
    };
    reader.readAsDataURL(file);
  });

/* ==================== Public API ==================== */

/** Load ordered application summaries (excludes soft-deleted) */
export async function loadSummaries(): Promise<AppSummary[]> {
  if (isSupabaseReady() && supabase) {
    // — This is where we connect to Supabase to fetch summaries —
    type AppRow = {
      id: string;
      student_name: string;
      student_id: string;
      submitted_date: string;
      status: string;
      program: string;
      institution: string;
      study_period: string;
      status_updated_date: string;
      confidence_score?: number;
    };

    const { data, error } = await supabase
      .from("applications")
      .select(
        "id, student_name, student_id, submitted_date, status, program, institution, study_period, status_updated_date, confidence_score"
      )
      .is("deleted_at", null)
      .order("submitted_date", { ascending: false });

    if (!error && data) {
      return (data as AppRow[]).map((r) => ({
        id: r.id,
        studentName: r.student_name,
        studentId: r.student_id,
        submittedDate: r.submitted_date,
        status: r.status,
        program: r.program,
        institution: r.institution,
        studyPeriod: r.study_period,
        statusUpdatedDate: r.status_updated_date,
        confidenceScore: r.confidence_score,
      }));
    }
    // fall through on error to local below
  }

  // — Local fallback —
  if (typeof window === "undefined") return [];
  const out: AppSummary[] = [];

  try {
    const raw = localStorage.getItem("currentApplication");
    if (raw) {
      const a = JSON.parse(raw) as AppSummary;
      if (a?.id) out.push(a);
    }
  } catch {}

  try {
    const raw = localStorage.getItem("applications");
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) {
        for (const a of arr) if (a?.id) out.push(a as AppSummary);
      }
    }
  } catch {}

  const seen = new Set<string>();
  const deduped: AppSummary[] = [];
  for (const a of out) {
    if (seen.has(a.id)) continue;
    seen.add(a.id);
    deduped.push(a);
  }

  deduped.sort(
    (a, b) =>
      new Date(b.submittedDate).getTime() - new Date(a.submittedDate).getTime()
  );
  return deduped;
}

/** Load a full snapshot for a given application id */
export async function loadSnapshot(id: string): Promise<Snapshot | null> {
  if (!id) return null;

  if (isSupabaseReady() && supabase) {
    // — This is where we connect to Supabase to fetch a snapshot —
    type AppRow = {
      id: string;
      student_name: string;
      student_id: string;
      submitted_date: string;
      status: string;
      program: string;
      institution: string;
      study_period: string;
      status_updated_date: string;
      confidence_score: number;
    };
    const [{ data: app, error: e1 }, { data: snap }] = await Promise.all([
      supabase
        .from("applications")
        .select(
          "id, student_name, student_id, submitted_date, status, program, institution, study_period, status_updated_date"
        )
        .eq("id", id)
        .maybeSingle(),
      supabase
        .from("snapshots")
        .select("*") // Gets form_data, form_data_history, and admin fields
        .eq("id", id)
        .maybeSingle(),
    ]);

    if (!e1 && app) {
      const a = app as AppRow;
      const s = snap || {};

      const summary: AppSummary = {
        id: a.id,
        studentName: a.student_name,
        studentId: a.student_id,
        submittedDate: a.submitted_date,
        status: a.status,
        program: a.program,
        institution: a.institution,
        studyPeriod: a.study_period,
        statusUpdatedDate: a.status_updated_date,
      };
      const snapOut: Snapshot = {
        summary,
        formData: s.form_data ?? null,
        assignee: s.assigned_admin ?? "",
        violationTags: Array.isArray(s.violation_tags) ? s.violation_tags : [],
        violationDetails: s.violation_details ?? "",
        attachments: Array.isArray(s.attachments) ? s.attachments : [],
      };
      return snapOut;
    }
    // fall through on error to local below
  }

  // — Local fallback —
  try {
    const raw = localStorage.getItem(SNAP_KEY(id));
    return raw ? (JSON.parse(raw) as Snapshot) : null;
  } catch {
    return null;
  }
}

//Helper Func: Recalculate status based on form data changes for supabase
async function recalculateStatus(formData: FormData): Promise<{ status: string; score: number } | null> {
  if (!formData) {
    return null;
  }

  try {
    const payload = {
      disability_type: formData.disabilityType,
      study_type: formData.studyType,
      has_osap_restrictions: formData.hasOSAPRestrictions,
      osap_application: formData.osapApplication,
      provincial_need: formData.provincialNeed,
      federal_need: formData.federalNeed,
      requested_items: formData.requestedItems || [],
    };

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/analysis/score`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    if (response.ok) {
      const data = await response.json();
      const score = data.confidence_score;

      // Convert score to status from deterministic func calculations
      let newStatus: string;
      if (score >= 90) {
        newStatus = "Approved";
      } else if (score >= 75) {
        newStatus = "In Review";
      } else {
        newStatus = "Rejected";
      }

      return { status: newStatus, score };
    }
  } catch (error) {
    console.error(error);
  }

  return null; // Return null if calculation fails (for canceled state)
}
/** Save/merge snapshot & summary (optionally pass fresh formData) */
export async function saveSnapshotMerge(
  r: Row,
  formData?: FormData
): Promise<void> {
  const now = new Date().toISOString();

  if (isSupabaseReady() && supabase) {
    // — This is where we connect to Supabase to upsert —
    let updatedStatus = r.status;
    let updatedScore = r.confidenceScore;
    
    if (formData) {
      const result = await recalculateStatus(formData);
      if (result) {
        updatedStatus = result.status;
        updatedScore = result.score;
      }
    }
    const summaryPayload = {
      id: r.id,
      student_name: r.studentName,
      student_id: r.studentId,
      submitted_date: r.submittedDate,
      status: updatedStatus,
      confidence_score: updatedScore,
      program: r.program,
      institution: r.institution,
      study_period: r.studyPeriod,
      status_updated_date: now,
    };

    // Update snapshots (form data + admin workflow)
    if (formData) {
      const { data: currentSnap } = await supabase
        .from("snapshots")
        .select("form_data, form_data_history")
        .eq("id", r.id)
        .single();

      if (currentSnap) {
        const snapPayload = {
          id: r.id,
          form_data: formData,
          form_data_history: [
            ...(currentSnap.form_data_history || []),
            {
              data: currentSnap.form_data,
              timestamp: now,
              modified_by: "admin",
            },
          ],
          last_modified_at: now,
          last_modified_by: "admin",

          // Admin workflow fields
          assigned_admin: r.assignee ?? null,
          violation_tags: r.violationTags ?? [],
          violation_details: r.violationDetails ?? "",
          attachments: r.attachments ?? [],
        };

        await supabase.from("snapshots").upsert(snapPayload);
      }
    } else {
      const snapPayload = {
        id: r.id,
        assigned_admin: r.assignee ?? null,
        violation_tags: r.violationTags ?? [],
        violation_details: r.violationDetails ?? "",
        attachments: r.attachments ?? [],
      };

      await supabase.from("snapshots").update(snapPayload).eq("id", r.id);
    }

    await supabase.from("applications").upsert(summaryPayload);
    return;
  }

  // — Local fallback —
  const existingRaw = localStorage.getItem(SNAP_KEY(r.id));
  const existing = existingRaw
    ? (JSON.parse(existingRaw) as Snapshot)
    : ({} as Snapshot);

  const next: Snapshot = {
    summary: {
      id: r.id,
      studentName: r.studentName,
      studentId: r.studentId,
      submittedDate: r.submittedDate,
      status: r.status,
      program: r.program,
      institution: r.institution,
      studyPeriod: r.studyPeriod,
      statusUpdatedDate: now,
    },
    formData: formData ?? existing.formData ?? null,
    assignee: r.assignee ?? existing.assignee ?? "",
    violationTags: Array.isArray(r.violationTags)
      ? r.violationTags
      : existing.violationTags ?? [],
    violationDetails: r.violationDetails ?? existing.violationDetails ?? "",
    attachments: Array.isArray(r.attachments)
      ? r.attachments
      : Array.isArray(existing.attachments)
      ? existing.attachments
      : [],
  };
  localStorage.setItem(SNAP_KEY(r.id), JSON.stringify(next));
}

/** Save refreshed applications list */
export async function saveApplicationsList(
  summaries: AppSummary[]
): Promise<void> {
  if (isSupabaseReady() && supabase) {
    // — This is where we connect to Supabase to upsert the list —
    const payload = summaries.map((s) => ({
      id: s.id,
      student_name: s.studentName,
      student_id: s.studentId,
      submitted_date: s.submittedDate,
      status: s.status,
      program: s.program,
      institution: s.institution,
      study_period: s.studyPeriod,
      status_updated_date: s.statusUpdatedDate,
    }));
    const { error } = await supabase.from("applications").upsert(payload);
    if (!error) return;
    // fall through to local on error
  }

  // — Local fallback —
  localStorage.setItem("applications", JSON.stringify(summaries));
  if (summaries[0]) {
    localStorage.setItem("currentApplication", JSON.stringify(summaries[0]));
  }
}

/** Soft delete (Doesn't actually delete but marks it as 'deleted' for legal issues (must keep records for X years))*/
export async function deleteApplication(
  appId: string,
  adminName: string = "admin",
  reason?: string
): Promise<void> {
  if (isSupabaseReady() && supabase) {
    const { error } = await supabase
      .from("applications")
      .update({
        deleted_at: new Date().toISOString(),
        deleted_by: adminName,
        deletion_reason: reason,
        status: "deleted",
      })
      .eq("id", appId);

    if (!error) return;
  }

  // Local fallback
  try {
    const raw = localStorage.getItem("applications");
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) {
        const filtered = arr.filter((a: AppSummary) => a.id !== appId);
        localStorage.setItem("applications", JSON.stringify(filtered));
      }
    }
    localStorage.removeItem(SNAP_KEY(appId));
    const currentRaw = localStorage.getItem("currentApplication");
    if (currentRaw) {
      const current = JSON.parse(currentRaw);
      if (current?.id === appId) {
        localStorage.removeItem("currentApplication");
      }
    }
  } catch (e) {
    console.error("Error deleting application:", e);
  }
}

/** Attach files to a given application id */
export async function attachFiles(
  appId: string,
  fileList: FileList | null
): Promise<Attachment[]> {
  if (!fileList || fileList.length === 0) return [];
  const files = Array.from(fileList);

  if (isSupabaseReady() && supabase) {
    // Connect to Supabase Storage —
    const out: Attachment[] = [];
    for (const f of files) {
      const uid = uuid();
      const path = `${appId}/${uid}-${f.name}`;
      const { error: upErr } = await supabase.storage
        .from("attachments")
        .upload(path, f, {
          upsert: false,
          contentType: f.type || "application/octet-stream",
        });
      if (upErr) {
        // Fallback to b64 for this file only
        const b64 = await b64FromFile(f);
        out.push({
          id: uid,
          name: f.name,
          mime: f.type || "application/octet-stream",
          size: f.size,
          dataB64: b64,
        });
      } else {
        out.push({
          id: uid,
          name: f.name,
          mime: f.type || "application/octet-stream",
          size: f.size,
          dataB64: "",
          supabasePath: path,
        });
      }
    }
    return out;
  }

  // — Local fallback —
  const b64Atts: Attachment[] = [];
  for (const f of files) {
    const b64 = await b64FromFile(f);
    b64Atts.push({
      id: uuid(),
      name: f.name,
      mime: f.type || "application/octet-stream",
      size: f.size,
      dataB64: b64,
    });
  }
  return b64Atts;
}

/** Download a Supabase storage object as a Blob (used by Open) */
export async function downloadAttachmentFromStorage(
  path: string
): Promise<Blob | null> {
  if (!(isSupabaseReady() && supabase)) return null;
  // connect to Supabase Storage to create a signed URL
  const { data: signed, error } = await supabase.storage
    .from("attachments")
    .createSignedUrl(path, 60);
  if (error || !signed?.signedUrl) return null;
  const resp = await fetch(signed.signedUrl);
  if (!resp.ok) return null;
  return await resp.blob();
}

/** Dev-only: clear all local application data */
export function resetLocalApplications(): void {
  if (typeof window === "undefined") return;
  const keys = Object.keys(localStorage);
  for (const k of keys) {
    if (
      k.startsWith("applicationDetail:") ||
      k === "applications" ||
      k === "currentApplication"
    ) {
      localStorage.removeItem(k);
    }
  }
}
