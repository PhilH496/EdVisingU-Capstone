/**
 * Admin Dashboard
 * - Edit Mode toggle restores bulk "Select All + Status" controls
 * - Per-row Status dropdown only visible in Edit Mode (badge always visible)
 * - Institution names rendered in Title Case for consistency
 * - Persists assignee, violations, details, attachments, status per application
 * - Deterministic scoring bubble using consolidated logic
 * - Bi-directional Sorting (Asc/Desc)
 * - Pagination (50 items per page)
 */

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import { AdminLayout } from "@/components/admin/AdminLayout";
import StatusBadge from "@/components/admin/StatusBadge";
import ProtectedRoute from "@/components/ProtectedRoute";
import { PaginationControls } from "@/components/admin/PaginationControls";
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
  deleteApplication,
} from "@/lib/adminStore";
import {
  STATUS_OPTIONS,
  ITEMS_PER_PAGE,
  SORT_MENU,
  SortKey,
  SortDirection,
} from "@/lib/admin/constants";
import {
  titleCase,
  openAttachment,
  getScoreBadgeClasses,
} from "@/lib/admin/adminUtils";

function AdminDashboardPage() {
  const router = useRouter()
  const [rows, setRows] = useState<Row[]>([]);
  const [bulkStatus, setBulkStatus] = useState<string>("Submitted");
  const [allChecked, setAllChecked] = useState<boolean>(false);
  const [toolbarMsg, setToolbarMsg] = useState<string>("");
  const [editMode, setEditMode] = useState<boolean>(false);
  const [expandedApps, setExpandedApps] = useState<Set<string>>(new Set());
  const [detScores, setDetScores] = useState<Record<string, number>>({});
  const [currentPage, setCurrentPage] = useState(1);

  //Sorting State
  const [sortConfig, setSortConfig] = useState<{
    key: SortKey;
    direction: SortDirection;
  }>({
    key: "Recent",
    direction: "desc",
  });
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);

    // storage I/O
    const loadApplications = async () => {
      const summaries = await storeLoadSummaries();

      const hydrated: Row[] = await Promise.all(
        summaries.map(async (s: AppSummary): Promise<Row> => {
          const snap = await storeLoadSnapshot(s.id);

          return {
            ...s,
            assignee: snap?.assignee ?? "",
            violationTags: Array.isArray(snap?.violationTags)
              ? snap!.violationTags
              : [],
            violationDetails: snap?.violationDetails ?? "",
            attachments: Array.isArray(snap?.attachments)
              ? snap!.attachments
              : [],
            _selected: false,
          };
        })
      );

      setRows(hydrated);

      // Build score map from single database query
      const scoreMap: Record<string, number> = {};
      summaries.forEach((s) => {
        scoreMap[s.id] = s.confidenceScore ?? 0;
      });
      setDetScores(scoreMap);
    };

    // Initial load
    useEffect(() => {
      loadApplications();
    }, []);

    // Refetch when navigating back (catches router navigation)
    useEffect(() => {
      const handleRouteChange = () => {
        // Refetch whenever route changes to within admin
        if (router.pathname === '/admin') {
          loadApplications();
        }
      };

      router.events.on('routeChangeComplete', handleRouteChange);
      return () => router.events.off('routeChangeComplete', handleRouteChange);
    }, [router.events, router.pathname]);

    // Refetch when window gains focus (catches browser back button to dashboard)
    useEffect(() => {
      const handleFocus = () => {
        loadApplications();
      };

      window.addEventListener('focus', handleFocus);
      return () => window.removeEventListener('focus', handleFocus);
    }, []);

    // Refetch when component becomes visible after being hidden
    useEffect(() => {
      const handleVisibilityChange = () => {
        if (!document.hidden) {
          loadApplications();
        }
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);
      return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, []);

  // Sorting logic
  const handleSortSelect = (key: SortKey) => {
    if (sortConfig.key === key) {
      setSortConfig((prev) => ({
        ...prev,
        direction: prev.direction === "asc" ? "desc" : "asc",
      }));
    } else {
      const defaultDir = key === "Name" || key === "Status" ? "asc" : "desc"; //if Name or Status, default asc. Otherwise desc
      setSortConfig({ key, direction: defaultDir });
    }
    setIsSortMenuOpen(false);
  };

  // Multiplcation modifers for = 1 for ascending, -1 for descending
  const sortedRows = useMemo(() => {
    const data = [...rows];
    const { key, direction } = sortConfig;
    const modifier = direction === "asc" ? 1 : -1;

    switch (key) {
      case "Recent":
        return data.sort((a, b) => {
          const dateA = new Date(a.statusUpdatedDate).getTime();
          const dateB = new Date(b.statusUpdatedDate).getTime();
          return (dateA - dateB) * modifier;
        });

      case "Score":
        return data.sort((a, b) => {
          const scoreA = detScores[a.id];
          const scoreB = detScores[b.id];
          return (scoreA - scoreB) * modifier;
        });

      case "Status":
        return data.sort((a, b) => a.status.localeCompare(b.status) * modifier);

      case "Name":
        return data.sort(
          (a, b) => a.studentName.localeCompare(b.studentName) * modifier
        );

      default:
        return data;
    }
  }, [rows, sortConfig, detScores]);

  // Pagination logic
  const pagination = useMemo(() => {
    const totalItems = sortedRows.length;
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalItems);
    const paginatedRows = sortedRows.slice(startIndex, endIndex);

    return {
      totalPages,
      totalItems,
      startIndex,
      endIndex,
      paginatedRows,
      hasPagination: totalPages > 1,
    };
  }, [sortedRows, currentPage]);

  // Reset to page 1 when sorting changes
  useEffect(() => {
    setCurrentPage(1);
  }, [sortConfig.key, sortConfig.direction]);

  const hasRows = useMemo(() => sortedRows.length > 0, [sortedRows]);

  // ---------- state mutations ----------
  const updateRow = (id: string, patch: Partial<Row>) => {
    setRows((prev: Row[]) =>
      prev.map((r: Row) => (r.id === id ? { ...r, ...patch } : r))
    );
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
        r.id === id
          ? { ...r, attachments: [...(r.attachments || []), ...newAtts] }
          : r
      )
    );
  };

  const removeAttachment = (id: string, attId: string) => {
    setRows((prev: Row[]) =>
      prev.map((r: Row) =>
        r.id === id
          ? {
              ...r,
              attachments: (r.attachments || []).filter(
                (a: Attachment) => a.id !== attId
              ),
            }
          : r
      )
    );
  };

  const toggleExpanded = (id: string) => {
    setExpandedApps((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // per-row save
  const saveRow = async (r: Row) => {
    const now = new Date().toISOString();

    const withUpdated: Row = { ...r, statusUpdatedDate: now };
    await storeSaveSnapshotMerge(withUpdated);

    const summaries: AppSummary[] = rows.map(
      (x: Row): AppSummary => ({
        id: x.id,
        studentName: x.studentName,
        studentId: x.studentId,
        submittedDate: x.submittedDate,
        status: x.status,
        program: x.program,
        institution: x.institution,
        studyPeriod: x.studyPeriod,
        statusUpdatedDate: x.statusUpdatedDate,
      })
    );

    await storeSaveApplicationsList(
      summaries.map((s: AppSummary) =>
        s.id === r.id
          ? { ...s, status: withUpdated.status, statusUpdatedDate: now }
          : s
      )
    );

    updateRow(r.id, { _saveMsg: "Saved", statusUpdatedDate: now });
    setTimeout(() => updateRow(r.id, { _saveMsg: "" }), 1200);
  };

  // bulk selection
  const selectedCount = rows.filter((r: Row) => r._selected).length;

  const toggleSelectAll = (checked: boolean) => {
    setAllChecked(checked);
    setRows((prev: Row[]) =>
      prev.map((r: Row) => ({ ...r, _selected: checked }))
    );
  };

  const clearSelection = () => {
    setAllChecked(false);
    setRows((prev: Row[]) =>
      prev.map((r: Row) => ({ ...r, _selected: false }))
    );
  };

  const applyBulkStatus = async () => {
    if (selectedCount === 0) return;

    const now = new Date().toISOString();
    const updated: Row[] = rows.map((r: Row) =>
      r._selected ? { ...r, status: bulkStatus, statusUpdatedDate: now } : r
    );
    setRows(updated);

    await Promise.all(
      updated.map(async (r: Row) => {
        if (r._selected) await storeSaveSnapshotMerge(r);
      })
    );

    const summaries: AppSummary[] = updated.map(
      (x: Row): AppSummary => ({
        id: x.id,
        studentName: x.studentName,
        studentId: x.studentId,
        submittedDate: x.submittedDate,
        status: x.status,
        program: x.program,
        institution: x.institution,
        studyPeriod: x.studyPeriod,
        statusUpdatedDate: x.statusUpdatedDate,
      })
    );
    await storeSaveApplicationsList(summaries);

    setToolbarMsg(
      `Applied "${bulkStatus}" to ${selectedCount} ${
        selectedCount === 1 ? "application" : "applications"
      }.`
    );
    setTimeout(() => setToolbarMsg(""), 1400);
  };

  // render
  return (
    <div>
      <Head>
        <title>Admin Dashboard</title>
        <meta name="description" content="Manage and review BSWD applications" />
      </Head>
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

        <label htmlFor="select-all-checkbox" className="inline-flex items-center gap-2 text-sm">
          <input
            id="select-all-checkbox"
            type="checkbox"
            checked={allChecked}
            onChange={(e) => toggleSelectAll(e.target.checked)}
            className="h-4 w-4"
            disabled={!editMode}
            aria-label="Select all applications"
          />
          <span className={editMode ? "text-gray-900" : "text-gray-500"}>Select All</span>
        </label>

        <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">
          Set status:
        </span>
          <select
            value={bulkStatus}
            onChange={(e) => setBulkStatus(e.target.value)}
            disabled={!editMode}
            className="px-3 py-2 border rounded-md text-sm disabled:opacity-50"
            aria-label="Choose status to apply"
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
          >
            Apply to Selected
          </button>
          <button
            onClick={clearSelection}
            disabled={!editMode}
            className="px-3 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-100 text-sm disabled:opacity-50"
          >
            Clear Selection
          </button>
          <button
            onClick={async () => {
              const selectedApps = rows.filter((r) => r._selected);
              if (selectedApps.length === 0) {
                alert("No applications selected");
                return;
              }

              let reason = prompt(
                "Reason for deleting these applications? (required)"
              );

              // If user cancels, abort
              if (reason === null) {
                return;
              }

              // Keep prompting until they provide a non-empty reason
              while (!reason.trim()) {
                reason = prompt(
                  "Deletion reason is required. Please provide a reason:"
                );
                if (reason === null) {
                  return; // User cancelled
                }
              }

              if (
                confirm(
                  `Delete ${selectedApps.length} application(s)?\n\nReason: ${reason}\n\nNote: This will hide application instead to preserve audit trail.`
                )
              ) {
                await Promise.all(
                  selectedApps.map((app) =>
                    deleteApplication(app.id, "Admin Name", reason)
                  ) //replace 'Admin Name' with real username when admin and student portal login integrated
                );

                setRows(rows.filter((r) => !r._selected));
                setToolbarMsg(`Deleted ${selectedApps.length} application(s)`);
                setTimeout(() => setToolbarMsg(""), 2000);
              }
            }}
            disabled={!editMode || selectedCount === 0}
            className="px-4 py-2 rounded-lg bg-brand-light-red text-white hover:bg-red-400 text-sm disabled:opacity-50"
          >
            Delete ({selectedCount})
          </button>
        </div>

        {/* Toolbar Msg + Sorting */}
        <div className="ml-auto flex items-center gap-3">
          {/* Feedback Message */}
          {toolbarMsg && (
            <div className="text-sm text-green-700 font-medium animate-pulse mr-2">
              {toolbarMsg}
            </div>
          )}

          {/* Custom Sort Control */}
          <span className="text-sm text-gray-700 font-medium">Sort By</span>

          <div className="relative">
            <button
              onClick={() => setIsSortMenuOpen(!isSortMenuOpen)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-sm text-gray-700 font-medium shadow-sm transition-colors min-w-[160px] justify-between"
            >
              <span className="truncate mr-2">
                {SORT_MENU.find((x) => x.value === sortConfig.key)?.label}
              </span>
              <span className="text-gray-600 text-xs">
                {sortConfig.direction === "asc" ? "▲" : "▼"}
              </span>
            </button>

            {/* Dropdown Menu */}
            {isSortMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-10 cursor-default"
                  onClick={() => setIsSortMenuOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 z-20 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Order By
                  </div>
                  {SORT_MENU.map((opt) => {
                    const isActive = sortConfig.key === opt.value;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => handleSortSelect(opt.value)}
                        className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between group ${
                          isActive
                            ? "bg-cyan-50 text-cyan-900 font-medium"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <span>{opt.label}</span>
                        {isActive && (
                          <span className="text-brand-light-red text-xs font-bold">
                            {sortConfig.direction === "asc"
                              ? "Asc (A-Z)"
                              : "Desc (Z-A)"}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Top Pagination */}
      {pagination.hasPagination && (
        <div className="mb-4">
          <PaginationControls
            currentPage={currentPage}
            totalPages={pagination.totalPages}
            startIndex={pagination.startIndex}
            endIndex={pagination.endIndex}
            totalItems={pagination.totalItems}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {!hasRows ? (
        <div className="px-5 py-10 text-gray-700">No applications found.</div>
      ) : (
        <div className="space-y-6">
          {pagination.paginatedRows.map((r: Row) => {
            const isExpanded = expandedApps.has(r.id);
            const score = detScores[r.id];

            return (
              <div key={r.id} className="flex gap-4 items-stretch">
                <div className="flex-1 border rounded-xl bg-white shadow-sm p-5 space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between flex-wrap gap-3">
                    <div className="flex items-start gap-3">
                      {editMode && (
                        <input
                         id={`select-${r.id}`}
                          type="checkbox"
                          checked={!!r._selected}
                          onChange={(e) =>
                            updateRow(r.id, { _selected: e.target.checked })
                          }
                          className="mt-1 h-4 w-4"
                          aria-label={`Select application for ${r.studentName}`}
                        />
                      )}
                      <div>
                        <h2 className="font-semibold text-gray-900">
                          {r.studentName} ({r.studentId})
                        </h2>
                        <p className="text-sm text-gray-700">
                          {titleCase(r.institution)} — {r.program || "—"}
                        </p>
                        <p className="text-xs text-gray-700">
                          Application ID:{" "}
                          <span className="font-mono">{r.id}</span>
                        </p>
                      </div>
                    </div>

                    {/* Right side — Status + Score + buttons */}
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={r.status} />
                        {typeof score === "number" && (
                          <div
                            className={`px-3 py-1 rounded-full text-xs font-semibold border ${getScoreBadgeClasses(
                              score
                            )}`}
                            aria-label={`AI Confidence Score: ${score} out of 100`}
                          >
                            {score}
                          </div>
                        )}
                      </div>

                      {editMode && (
                        <select
                          id={`status-${r.id}`}
                          value={r.status}
                          onChange={(e) =>
                            updateRow(r.id, { status: e.target.value })
                          }
                          className="px-2 py-1.5 border border-gray-300 rounded-md text-xs"
                          aria-label={`Changed status for ${r.studentName}`}
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      )}

                      <div className="flex items-center gap-2 ml-auto">
                        <Link
                          href={`/admin/${encodeURIComponent(r.id)}`}
                          className="px-3 py-1.5 text-xs rounded-lg border border-gray-300 bg-white hover:bg-gray-50 font-medium"
                        >
                          View
                        </Link>

                        <button
                          type="button"
                          onClick={() => toggleExpanded(r.id)}
                          className="px-3 py-1.5 text-xs rounded-lg border border-gray-300 bg-white hover:bg-gray-50 font-medium"
                        >
                          {isExpanded ? "− Details" : "+ Details"}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Collapsible details */}
                  {isExpanded && (
                    <>
                      {/* Assigned To */}
                      <div>
                        <label 
                        htmlFor={`assignee-${r.id}`} 
                        className="block text-sm text-gray-700 mb-1"
                        >
                          Assigned To
                        </label>
                        <input
                          id={`assignee-${r.id}`}
                          type="text"
                          value={r.assignee || ""}
                          onChange={(e) =>
                            updateRow(r.id, { assignee: e.target.value })
                          }
                          placeholder="e.g., Admin"
                          className="w-full px-3 py-2 border rounded-md text-sm"
                        />
                      </div>

                      {/* Violations (includes 'Other') */}
                      <div>
                        <label className="block text-sm text-gray-700 mb-2">
                          Violations / Issues (select all that apply)
                        </label>

                        <div className="flex flex-wrap gap-2">
                          {VIOLATION_LIBRARY.map((tag: string) => {
                            const active = (r.violationTags || []).includes(
                              tag
                            );
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
                                aria-label={`${active ? 'Remove' : 'Add'} violation: ${tag}`}
                              >
                                {tag}
                              </button>
                            );
                          })}

                          {/* Other chip + inline text; stored as "Other: <text>" */}
                          {(() => {
                            const customTags = (r.violationTags || []).filter(
                              (t: string) => t.startsWith("Other: ")
                            );
                            const hasOtherActive = customTags.length > 0;
                            const latest =
                              customTags[customTags.length - 1] || "Other: ";
                            const latestText = latest.slice(7);

                            return (
                              <>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (!hasOtherActive) {
                                      updateRow(r.id, {
                                        violationTags: [
                                          ...(r.violationTags || []),
                                          "Other: ",
                                        ],
                                      });
                                    } else {
                                      const next = (
                                        r.violationTags || []
                                      ).filter(
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
                                      const base = (
                                        r.violationTags || []
                                      ).filter(
                                        (t: string) => !t.startsWith("Other: ")
                                      );
                                      updateRow(r.id, {
                                        violationTags: [
                                          ...base,
                                          `Other: ${e.target.value}`,
                                        ],
                                      });
                                    }}
                                    onBlur={() => {
                                      const text = (r.violationTags || [])
                                        .find((t: string) =>
                                          t.startsWith("Other: ")
                                        )
                                        ?.slice(7)
                                        .trim();
                                      if (!text) {
                                        updateRow(r.id, {
                                          violationTags: (
                                            r.violationTags || []
                                          ).filter(
                                            (t: string) =>
                                              !t.startsWith("Other: ")
                                          ),
                                        });
                                      } else {
                                        const base = (
                                          r.violationTags || []
                                        ).filter(
                                          (t: string) =>
                                            !t.startsWith("Other: ")
                                        );
                                        updateRow(r.id, {
                                          violationTags: [
                                            ...base,
                                            `Other: ${text}`,
                                          ],
                                        });
                                      }
                                    }}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter")
                                        (e.target as HTMLInputElement).blur();
                                      if (e.key === "Escape") {
                                        const text = (r.violationTags || [])
                                          .find((t: string) =>
                                            t.startsWith("Other: ")
                                          )
                                          ?.slice(7)
                                          .trim();
                                        if (!text) {
                                          updateRow(r.id, {
                                            violationTags: (
                                              r.violationTags || []
                                            ).filter(
                                              (t: string) =>
                                                !t.startsWith("Other: ")
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

                        <p className="text-xs text-gray-700 mt-1">
                          Most Common BSWD form issues (Write in
                          &quot;Other&quot; if issue does not appear).
                        </p>
                      </div>

                      {/* Violation details */}
                      <div>
                        <label
                        htmlFor={`violation-details-${r.id}`}
                        className="block text-sm text-gray-700 mb-1"
                        >
                          Other details (optional)
                        </label>
                        <textarea
                          id={`violation-details-${r.id}`}
                          value={r.violationDetails || ""}
                          onChange={(e) =>
                            updateRow(r.id, {
                              violationDetails: e.target.value,
                            })
                          }
                          rows={3}
                          placeholder="Add context for the selected violations..."
                          className="w-full px-3 py-2 border rounded-md text-sm"
                        />
                      </div>

                      {/* Attachments */}
                      <div>
                        <label className="block text-sm text-gray-700 mb-2">
                          Attachments
                        </label>

                        {r.attachments && r.attachments.length > 0 ? (
                          <ul className="space-y-2 mb-3">
                            {r.attachments.map((att: Attachment) => (
                              <li
                                key={att.id}
                                className="flex items-center justify-between border rounded-md px-3 py-2 text-sm"
                              >
                                <div className="min-w-0">
                                  <div className="font-medium truncate">
                                    {att.name}
                                  </div>
                                  <div className="text-xs text-gray-700">
                                    {att.mime || "application/octet-stream"} •{" "}
                                    {att.size.toLocaleString()} bytes
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
                                    onClick={() =>
                                      removeAttachment(r.id, att.id)
                                    }
                                    className="px-3 py-1 rounded-lg text-xs text-red-600 hover:text-red-700"
                                  >
                                    Remove
                                  </button>
                                </div>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-gray-700 mb-2">
                            No attachments yet.
                          </p>
                        )}

                        <div>
                          <label htmlFor={`file-upload-${r.id}`} className="block text-sm text-gray-700 mb-1">
                            Upload supporting documents
                          </label>
                          <input
                            id={`file-upload-${r.id}`}
                            type="file"
                            multiple
                            onChange={async (e) => {
                              const input = e.currentTarget as HTMLInputElement;
                              const files = input.files;
                              await attachFiles(r.id, files);
                              if (input) input.value = "";
                            }}
                            className="block w-full text-sm text-gray-700 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-gray-100 file:text-gray-800 hover:file:bg-gray-200"
                          />
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
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Bottom Pagination */}
      {pagination.hasPagination && (
        <div className="mt-6">
          <PaginationControls
            currentPage={currentPage}
            totalPages={pagination.totalPages}
            startIndex={pagination.startIndex}
            endIndex={pagination.endIndex}
            totalItems={pagination.totalItems}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </AdminLayout>
    </div>
  );
}

export default function AdminDashboardPageWithAuth() {
  return (
    <ProtectedRoute requireRole="admin">
      <AdminDashboardPage />
    </ProtectedRoute>
  );
}