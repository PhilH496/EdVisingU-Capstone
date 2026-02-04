/**
 * Admin Utilities
 * Shared utility functions for admin dashboard and detail pages
 */

import { Attachment } from "@/lib/adminStore";
import { downloadAttachmentFromStorage } from "@/lib/adminStore";

export const titleCase = (s: string | undefined) => {
  if (!s) return "—";
  return s
    .toLowerCase()
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
};

export const openAttachment = async (att: Attachment) => {
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
    const blob = new Blob([bytes], {
      type: att.mime || "application/octet-stream",
    });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank", "noopener,noreferrer");
  } catch {
    alert("Unable to open file.");
  }
};

export function getScoreBadgeClasses(score: number) {
  if (score >= 90) {
    return "bg-green-100 text-green-800 border-green-200";
  }
  if (score >= 75) {
    return "bg-blue-100 text-blue-800 border-blue-200";
  }
  return "bg-red-100 text-red-800 border-red-200";
}

export const prettyDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleString() : "—";

export const toChips = (val: unknown): string[] => {
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

export const formatMoney = (n: unknown) => {
  const num = Number(n);
  if (Number.isNaN(num)) return "—";
  return num.toLocaleString(undefined, {
    style: "currency",
    currency: "CAD",
  });
};

// Normalize functionalLimitations for Admin View
export const normalizeFunctionalLimitations = (raw: unknown): string[] => {
  if (!raw) return [];

  if (Array.isArray(raw)) {
    return raw
      .map((lim) => {
        if (typeof lim === "string") return lim;

        if (lim && typeof lim === "object") {
          if (lim.label && lim.checked) return lim.label;
          if (lim.name && lim.checked) return lim.name;
        }
        return null;
      })
      .filter(Boolean) as string[];
  }

  if (typeof raw === "object") {
    return Object.entries(raw)
      .filter(([_, val]) => Boolean(val))
      .map(([key]) => key);
  }

  return [];
};