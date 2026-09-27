"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import {
  FileText,
  Download,
  Printer,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  BarChart3,
  Calendar,
} from "lucide-react";
import type { LandRecord, DocumentRecord, AuditLog } from "@/lib/types";

export default function ReportsPage() {
  const [landRecords, setLandRecords] = useState<LandRecord[]>([]);
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  useEffect(() => {
    fetch("/api/land-records")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.items) setLandRecords(data.items);
      })
      .catch(() => {});

    fetch("/api/documents")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.documents) setDocuments(data.documents);
      })
      .catch(() => {});

    fetch("/api/audit-logs")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data)) setAuditLogs(data);
      })
      .catch(() => {});
  }, []);

  function triggerDownload(filename: string, content: string) {
    const encodedUri = encodeURI("data:text/csv;charset=utf-8," + content);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function exportVerificationReport() {
    const headers = ["Property ID", "Owner Name", "Survey Number", "District", "Status", "Last Updated", "Comments"];
    const rows = landRecords.map((r) => [
      `"${r.propertyId}"`,
      `"${r.ownerName}"`,
      `"${r.surveyNumber}"`,
      `"${r.district}"`,
      `"${r.verificationStatus}"`,
      `"${r.lastUpdated}"`,
      `"${(r.comments || []).join("; ")}"`,
    ]);
    triggerDownload(`verification_report_${Date.now()}.csv`, [headers.join(","), ...rows.map((e) => e.join(","))].join("\n"));
  }

  function exportMasterRegistry() {
    const headers = [
      "Property ID",
      "Owner Name",
      "Father Name",
      "Survey Number",
      "Gat Number",
      "Village",
      "Taluka",
      "District",
      "State",
      "Area (sq m)",
      "Area (Acres)",
      "Land Type",
      "Latitude",
      "Longitude",
      "Status",
    ];
    const rows = landRecords.map((r) => [
      `"${r.propertyId}"`,
      `"${r.ownerName}"`,
      `"${r.fatherName || ""}"`,
      `"${r.surveyNumber}"`,
      `"${r.gatNumber}"`,
      `"${r.village}"`,
      `"${r.taluka}"`,
      `"${r.district}"`,
      `"${r.state}"`,
      r.area,
      (r.area * 0.000247105).toFixed(2),
      `"${r.landType}"`,
      r.latitude,
      r.longitude,
      `"${r.verificationStatus}"`,
    ]);
    triggerDownload(`master_land_registry_${Date.now()}.csv`, [headers.join(","), ...rows.map((e) => e.join(","))].join("\n"));
  }

  function exportDiscrepanciesReport() {
    const flagged = landRecords.filter((r) => r.validationResults.length > 0 || r.verificationStatus === "ISSUES");
    const headers = ["Property ID", "Owner Name", "Survey Number", "District", "Rule ID", "Severity", "Description", "Detected", "Expected"];
    const rows: string[][] = [];

    flagged.forEach((r) => {
      if (r.validationResults.length === 0) {
        rows.push([
          `"${r.propertyId}"`,
          `"${r.ownerName}"`,
          `"${r.surveyNumber}"`,
          `"${r.district}"`,
          `"FLAGGED-OFFICER"`,
          `"MEDIUM"`,
          `"Officer flagged inconsistency"`,
          `"N/A"`,
          `"N/A"`,
        ]);
      } else {
        r.validationResults.forEach((val) => {
          rows.push([
            `"${r.propertyId}"`,
            `"${r.ownerName}"`,
            `"${r.surveyNumber}"`,
            `"${r.district}"`,
            `"${val.ruleId}"`,
            `"${val.severity}"`,
            `"${val.description}"`,
            `"${val.detectedValue}"`,
            `"${val.expectedValue}"`,
          ]);
        });
      }
    });

    triggerDownload(`validation_discrepancies_${Date.now()}.csv`, [headers.join(","), ...rows.map((e) => e.join(","))].join("\n"));
  }

  function exportDistrictStats() {
    const stats: Record<string, { total: number; verified: number; area: number }> = {};
    landRecords.forEach((r) => {
      if (!stats[r.district]) stats[r.district] = { total: 0, verified: 0, area: 0 };
      stats[r.district].total += 1;
      if (r.verificationStatus === "VERIFIED") stats[r.district].verified += 1;
      stats[r.district].area += r.area;
    });

    const headers = ["District", "Total Parcels", "Verified Parcels", "Verification Rate (%)", "Total Area (sq m)", "Total Area (Acres)"];
    const rows = Object.entries(stats).map(([dist, st]) => [
      `"${dist}"`,
      st.total,
      st.verified,
      Math.round((st.verified / st.total) * 100),
      st.area,
      (st.area * 0.000247105).toFixed(2),
    ]);

    triggerDownload(`district_statistics_${Date.now()}.csv`, [headers.join(","), ...rows.map((e) => e.join(","))].join("\n"));
  }

  const reports = [
    {
      title: "Officer Verification Compliance Report",
      desc: "Auditable log of all verified, flagged, and rejected cadastral parcels with reviewer comments.",
      icon: ShieldCheck,
      action: exportVerificationReport,
      count: landRecords.length,
    },
    {
      title: "Master Land Records Register (RoR)",
      desc: "Comprehensive export of registered parcel titles, areas in sq m & acres, and spatial coordinates.",
      icon: FileText,
      action: exportMasterRegistry,
      count: landRecords.length,
    },
    {
      title: "Validation Inconsistencies & Flags",
      desc: "Detailed audit of automated rule checks: duplicate IDs, survey format mismatches, and area anomalies.",
      icon: AlertTriangle,
      action: exportDiscrepanciesReport,
      count: landRecords.filter((r) => r.validationResults.length > 0 || r.verificationStatus === "ISSUES").length,
    },
    {
      title: "District Revenue Analytics Summary",
      desc: "Aggregated digitization metrics broken down by district, parcel count, and verified coverage.",
      icon: BarChart3,
      action: exportDistrictStats,
      count: Object.keys(
        landRecords.reduce((acc, r) => ({ ...acc, [r.district]: true }), {}),
      ).length,
    },
  ];

  return (
    <AppShell
      title="Reports & Compliance Data Center"
      subtitle="Export official government registers, audit trails, and revenue statistics"
    >
      {/* Overview Metric Bar */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="text-xs text-slate-500 font-medium">Total Registered Parcels</span>
          <div className="mt-1 text-2xl font-bold text-slate-900">{landRecords.length}</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="text-xs text-slate-500 font-medium">Source Documents Digitized</span>
          <div className="mt-1 text-2xl font-bold text-cyan-600">{documents.length}</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="text-xs text-slate-500 font-medium">Compliance Audit Events</span>
          <div className="mt-1 text-2xl font-bold text-emerald-600">{auditLogs.length}</div>
        </div>
      </div>

      {/* Reports Action Cards Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {reports.map((report) => {
          const Icon = report.icon;

          return (
            <div
              key={report.title}
              className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-100 text-cyan-700">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
                    {report.count} records
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900">{report.title}</h3>
                <p className="mt-2 text-xs text-slate-500 leading-relaxed">{report.desc}</p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={report.action}
                  className="flex items-center gap-1.5 rounded-xl bg-cyan-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-cyan-500 transition"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download CSV</span>
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span>Print View</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </AppShell>
  );
}
