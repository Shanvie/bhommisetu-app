import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { loadAppData } from "@/lib/store";
import {
  FileText,
  CheckCircle2,
  AlertTriangle,
  Clock,
  UploadCloud,
  MapPin,
  ClipboardCheck,
  TrendingUp,
  ShieldAlert,
  ArrowRight,
} from "lucide-react";

export default async function DashboardPage() {
  const data = await loadAppData();

  const totalRecords = data.landRecords.length;
  const verified = data.landRecords.filter((record) => record.verificationStatus === "VERIFIED").length;
  const inReview = data.landRecords.filter((record) => record.verificationStatus === "IN_REVIEW").length;
  const pending = data.landRecords.filter((record) => record.verificationStatus === "PENDING").length;
  const rejected = data.landRecords.filter((record) => record.verificationStatus === "REJECTED").length;
  const issues = data.landRecords.filter(
    (record) => record.verificationStatus === "ISSUES" || record.validationResults.length > 0,
  ).length;

  const totalDocuments = data.documents.length;
  const verifiedPercent = totalRecords > 0 ? Math.round((verified / totalRecords) * 100) : 0;

  // District distribution
  const districtCounts: Record<string, number> = {};
  data.landRecords.forEach((r) => {
    districtCounts[r.district] = (districtCounts[r.district] || 0) + 1;
  });
  const districtList = Object.entries(districtCounts)
    .map(([district, count]) => ({
      district,
      count,
      percent: totalRecords > 0 ? Math.round((count / totalRecords) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count);

  const kpis = [
    {
      label: "Total Land Parcels",
      value: totalRecords,
      desc: "Registered across state",
      icon: TrendingUp,
      accent: "from-blue-600 to-cyan-500",
      border: "border-blue-200",
    },
    {
      label: "Verified Records",
      value: `${verified} (${verifiedPercent}%)`,
      desc: "Cadastral match confirmed",
      icon: CheckCircle2,
      accent: "from-emerald-600 to-teal-500",
      border: "border-emerald-200",
    },
    {
      label: "Pending Verification",
      value: pending + inReview,
      desc: `${inReview} in review, ${pending} pending`,
      icon: Clock,
      accent: "from-amber-500 to-orange-500",
      border: "border-amber-200",
    },
    {
      label: "Validation Warnings",
      value: issues,
      desc: "Requires officer review",
      icon: AlertTriangle,
      accent: "from-red-500 to-rose-600",
      border: "border-red-200",
    },
  ];

  return (
    <AppShell title="Revenue Analytics Dashboard" subtitle="Real-time digitization metrics and verification queue">
      {/* Quick Action Banner */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Land Record Modernization Workstation</h2>
          <p className="text-xs text-slate-500">
            Automated OCR pipeline active • Connected to State Cadastral GIS Server
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/documents/upload"
            className="flex items-center gap-2 rounded-xl bg-cyan-600 px-3.5 py-2 text-xs font-semibold text-white shadow hover:bg-cyan-500 transition"
          >
            <UploadCloud className="h-4 w-4" />
            Upload Document
          </Link>
          <Link
            href="/verification"
            className="flex items-center gap-2 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white shadow hover:bg-slate-800 transition"
          >
            <ClipboardCheck className="h-4 w-4" />
            Verification Desk
          </Link>
          <Link
            href="/map"
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
          >
            <MapPin className="h-4 w-4 text-cyan-600" />
            GIS Map
          </Link>
        </div>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.label}
              className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">{kpi.label}</span>
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr ${kpi.accent} text-white shadow-sm`}
                >
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-4 text-2xl font-bold text-slate-900">{kpi.value}</div>
              <div className="mt-1 text-xs text-slate-400">{kpi.desc}</div>
            </div>
          );
        })}
      </div>

      {/* Mid-Row: Verification Status & District Distribution */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Verification Status Breakdown */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900">Verification Pipeline Status</h3>
            <Link href="/verification" className="text-xs font-semibold text-cyan-600 hover:underline">
              Open Queue →
            </Link>
          </div>

          <div className="space-y-3">
            {[
              { label: "Verified & Approved", value: verified, color: "bg-emerald-500", text: "text-emerald-700", bg: "bg-emerald-50" },
              { label: "Under Officer Review", value: inReview, color: "bg-cyan-500", text: "text-cyan-700", bg: "bg-cyan-50" },
              { label: "Pending Processing", value: pending, color: "bg-amber-500", text: "text-amber-700", bg: "bg-amber-50" },
              { label: "Validation Discrepancies", value: issues, color: "bg-purple-500", text: "text-purple-700", bg: "bg-purple-50" },
              { label: "Rejected Records", value: rejected, color: "bg-red-500", text: "text-red-700", bg: "bg-red-50" },
            ].map((item) => (
              <div
                key={item.label}
                className={`flex items-center justify-between rounded-xl px-4 py-2.5 ${item.bg}`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={`h-2.5 w-2.5 rounded-full ${item.color}`} />
                  <span className={`text-xs font-semibold ${item.text}`}>{item.label}</span>
                </div>
                <span className="text-sm font-bold text-slate-900">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* District Distribution Bar Graph */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900">Digitized Parcels by District</h3>
            <span className="text-xs text-slate-400">Total: {totalRecords} Records</span>
          </div>

          <div className="space-y-4">
            {districtList.map((item) => (
              <div key={item.district}>
                <div className="mb-1.5 flex items-center justify-between text-xs text-slate-600">
                  <span className="font-semibold text-slate-800">{item.district} District</span>
                  <span>
                    {item.count} records ({item.percent}%)
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-600 to-teal-500 transition-all duration-500"
                    style={{ width: `${Math.max(item.percent, 8)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Documents & Land Records Table */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 p-5">
          <div>
            <h3 className="font-bold text-slate-900">Recent Document Submissions</h3>
            <p className="text-xs text-slate-500">Latest digitized records and extraction statuses</p>
          </div>
          <Link href="/documents" className="text-xs font-semibold text-cyan-600 hover:underline">
            View All Documents ({totalDocuments}) →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100 text-left text-xs">
            <thead className="bg-slate-50 font-semibold text-slate-600">
              <tr>
                <th className="px-5 py-3">Document Title</th>
                <th className="px-5 py-3">Type</th>
                <th className="px-5 py-3">District / Village</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Confidence</th>
                <th className="px-5 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {data.documents.slice(0, 5).map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-50/70 transition">
                  <td className="px-5 py-3 font-medium text-slate-900">
                    <Link href={`/documents/${doc.id}`} className="hover:text-cyan-600">
                      {doc.title}
                    </Link>
                  </td>
                  <td className="px-5 py-3">{doc.documentType}</td>
                  <td className="px-5 py-3">
                    {String(doc.metadata?.district || "Pune")} - {String(doc.metadata?.village || "Shivajinagar")}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        doc.verificationStatus === "VERIFIED"
                          ? "bg-emerald-100 text-emerald-800"
                          : doc.verificationStatus === "PENDING"
                            ? "bg-amber-100 text-amber-800"
                            : doc.verificationStatus === "IN_REVIEW"
                              ? "bg-cyan-100 text-cyan-800"
                              : "bg-red-100 text-red-800"
                      }`}
                    >
                      {doc.verificationStatus}
                    </span>
                  </td>
                  <td className="px-5 py-3 font-semibold text-slate-700">
                    {doc.confidence ? `${Math.round(doc.confidence * 100)}%` : "N/A"}
                  </td>
                  <td className="px-5 py-3">
                    <Link
                      href={`/documents/${doc.id}`}
                      className="inline-flex items-center gap-1 font-semibold text-cyan-600 hover:text-cyan-700"
                    >
                      Inspect <ArrowRight className="h-3 w-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
