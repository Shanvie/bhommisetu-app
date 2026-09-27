"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import {
  ClipboardCheck,
  Search,
  Download,
  Filter,
  Shield,
  Clock,
  User,
} from "lucide-react";
import type { AuditLog } from "@/lib/types";

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState("ALL");

  useEffect(() => {
    fetch("/api/audit-logs")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data)) setLogs(data);
      })
      .catch(() => {});
  }, []);

  const filteredLogs = logs.filter((log) => {
    const matchesAction = actionFilter === "ALL" || log.action === actionFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !q ||
      log.userName.toLowerCase().includes(q) ||
      log.action.toLowerCase().includes(q) ||
      (log.recordId && log.recordId.toLowerCase().includes(q)) ||
      (log.newValue && log.newValue.toLowerCase().includes(q));

    return matchesAction && matchesQuery;
  });

  function exportAuditCSV() {
    const headers = ["Log ID", "Action", "User Name", "User ID", "Target Record", "Timestamp", "IP Address", "Device", "Details"];
    const rows = filteredLogs.map((l) => [
      `"${l.id}"`,
      `"${l.action}"`,
      `"${l.userName}"`,
      `"${l.userId}"`,
      `"${l.recordId || ""}"`,
      `"${l.timestamp}"`,
      `"${l.ipAddress || ""}"`,
      `"${l.device || ""}"`,
      `"${(l.newValue || l.oldValue || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `bhoomisetu_audit_trail_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function getActionBadge(action: string) {
    if (action.includes("VERIFIED")) return "bg-emerald-100 text-emerald-800";
    if (action.includes("REJECTED")) return "bg-red-100 text-red-800";
    if (action.includes("FLAGGED") || action.includes("WARN")) return "bg-amber-100 text-amber-800";
    if (action.includes("UPLOADED") || action.includes("CREATED")) return "bg-cyan-100 text-cyan-800";
    return "bg-slate-100 text-slate-800";
  }

  return (
    <AppShell
      title="Compliance & Immutable Audit Logs"
      subtitle="Complete chronological audit trail of all ingestion, verification, and administrative actions"
    >
      {/* Controls Bar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[240px]">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search user, record ID, or details..."
              className="w-full rounded-xl border border-slate-300 bg-slate-50 pl-9 pr-3 py-2 text-xs text-slate-800 outline-none focus:border-cyan-600 focus:bg-white"
            />
          </div>

          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 outline-none focus:border-cyan-600"
          >
            <option value="ALL">All Actions</option>
            <option value="DOCUMENT_UPLOADED">Document Uploaded</option>
            <option value="RECORD_VERIFIED">Record Verified</option>
            <option value="RECORD_UPDATED">Record Updated</option>
            <option value="RECORD_FLAGGED">Record Flagged</option>
            <option value="USER_CREATED">User Created</option>
            <option value="LOGIN">User Login</option>
            <option value="SETTINGS_UPDATED">Settings Updated</option>
            <option value="SYSTEM_RESET">System Reset</option>
          </select>
        </div>

        <button
          type="button"
          onClick={exportAuditCSV}
          className="flex items-center gap-1.5 rounded-xl bg-cyan-600 px-3.5 py-2 text-xs font-bold text-white shadow hover:bg-cyan-500 transition"
        >
          <Download className="h-3.5 w-3.5" />
          <span>Export Audit Log ({filteredLogs.length})</span>
        </button>
      </div>

      {/* Audit Log Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100 text-left text-xs">
            <thead className="bg-slate-50 font-semibold text-slate-600">
              <tr>
                <th className="px-5 py-3.5">Action</th>
                <th className="px-5 py-3.5">Officer / User</th>
                <th className="px-5 py-3.5">Target Record</th>
                <th className="px-5 py-3.5">Timestamp</th>
                <th className="px-5 py-3.5">Device & IP</th>
                <th className="px-5 py-3.5">Change Summary</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    No audit records found matching your filter.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold ${getActionBadge(
                          log.action,
                        )}`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-bold text-slate-900">{log.userName}</td>
                    <td className="px-5 py-3.5 font-mono text-cyan-700 font-semibold">
                      {log.recordId || "—"}
                    </td>
                    <td className="px-5 py-3.5 text-slate-500">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-5 py-3.5 text-slate-500">
                      <div>{log.ipAddress || "127.0.0.1"}</div>
                      <div className="text-[10px] text-slate-400">{log.device || "Browser"}</div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 max-w-xs truncate">
                      {log.newValue || log.oldValue || "Audit event captured"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
