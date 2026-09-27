import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { loadAppData } from "@/lib/store";
import {
  Landmark,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  Filter,
  Plus,
  ShieldCheck,
} from "lucide-react";

export default async function LandRecordsPage({
  searchParams,
}: {
  searchParams: Promise<{ district?: string; status?: string; type?: string; q?: string }>;
}) {
  const params = await searchParams;
  const data = await loadAppData();

  const districtFilter = params.district || "ALL";
  const statusFilter = params.status || "ALL";
  const typeFilter = params.type || "ALL";
  const query = (params.q || "").toLowerCase().trim();

  const filteredRecords = data.landRecords.filter((record) => {
    const matchesDistrict = districtFilter === "ALL" || record.district.toLowerCase() === districtFilter.toLowerCase();
    const matchesStatus = statusFilter === "ALL" || record.verificationStatus === statusFilter;
    const matchesType = typeFilter === "ALL" || record.landType.toLowerCase() === typeFilter.toLowerCase();
    const matchesQuery =
      !query ||
      record.ownerName.toLowerCase().includes(query) ||
      record.propertyId.toLowerCase().includes(query) ||
      record.surveyNumber.toLowerCase().includes(query) ||
      record.village.toLowerCase().includes(query) ||
      record.district.toLowerCase().includes(query);

    return matchesDistrict && matchesStatus && matchesType && matchesQuery;
  });

  return (
    <AppShell
      title="Land Record Registry"
      subtitle="Comprehensive cadastral repository of verified parcel holdings and titles"
    >
      {/* Header with Stats & Actions */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Registered Land Parcels</h2>
          <p className="text-xs text-slate-500">
            Showing {filteredRecords.length} of {data.landRecords.length} records in state registry
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/map"
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            <MapPin className="h-4 w-4 text-cyan-600" />
            <span>View on GIS Map</span>
          </Link>
          <Link
            href="/documents/upload"
            className="flex items-center gap-2 rounded-xl bg-cyan-600 px-3.5 py-2 text-xs font-bold text-white shadow hover:bg-cyan-500 transition"
          >
            <Plus className="h-4 w-4" />
            <span>Ingest Document</span>
          </Link>
        </div>
      </div>

      {/* Filter Chips Bar */}
      <div className="mb-6 flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3 text-xs">
        <Link
          href="/land-records"
          className={`rounded-lg px-3 py-1.5 font-medium transition ${
            statusFilter === "ALL" ? "bg-slate-900 text-white" : "bg-white text-slate-600 hover:bg-slate-50"
          }`}
        >
          All Statuses ({data.landRecords.length})
        </Link>
        {["VERIFIED", "IN_REVIEW", "PENDING", "ISSUES"].map((st) => {
          const count = data.landRecords.filter((r) => r.verificationStatus === st).length;
          return (
            <Link
              key={st}
              href={`/land-records?status=${st}`}
              className={`rounded-lg px-3 py-1.5 font-medium transition ${
                statusFilter === st ? "bg-slate-900 text-white" : "bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {st} ({count})
            </Link>
          );
        })}
      </div>

      {/* Grid of Land Records */}
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {filteredRecords.length === 0 ? (
          <div className="col-span-full rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-500">
            No land records found matching your filter criteria.
          </div>
        ) : (
          filteredRecords.map((record) => {
            const hasIssues = record.validationResults.length > 0;
            const acres = (record.area * 0.000247105).toFixed(2);

            return (
              <div
                key={record.id}
                className="group relative flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-cyan-300 hover:shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-cyan-700">
                      {record.propertyId}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                        record.verificationStatus === "VERIFIED"
                          ? "bg-emerald-100 text-emerald-800"
                          : record.verificationStatus === "PENDING"
                            ? "bg-amber-100 text-amber-800"
                            : record.verificationStatus === "IN_REVIEW"
                              ? "bg-cyan-100 text-cyan-800"
                              : "bg-red-100 text-red-800"
                      }`}
                    >
                      {record.verificationStatus}
                    </span>
                  </div>

                  <h3 className="mt-3 text-base font-bold text-slate-900 group-hover:text-cyan-600 transition">
                    {record.ownerName}
                  </h3>
                  {record.fatherName && (
                    <p className="text-[11px] text-slate-400">c/o {record.fatherName}</p>
                  )}

                  <div className="mt-4 space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-3">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Survey No:</span>
                      <span className="font-semibold text-slate-800">{record.surveyNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Gat Number:</span>
                      <span className="font-semibold text-slate-800">{record.gatNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Location:</span>
                      <span className="font-medium text-slate-700">
                        {record.village}, {record.district}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Area:</span>
                      <span className="font-semibold text-slate-800">
                        {record.area} sq m ({acres} Acres)
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Land Type:</span>
                      <span className="font-medium text-slate-700">{record.landType}</span>
                    </div>
                  </div>

                  {hasIssues && (
                    <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-2 text-[11px] text-amber-800 flex items-center gap-1.5">
                      <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-600" />
                      <span>{record.validationResults.length} validation alert(s)</span>
                    </div>
                  )}
                </div>

                <div className="mt-5 border-t border-slate-100 pt-3 flex items-center justify-between text-xs">
                  <Link
                    href={`/land-records/${record.id}`}
                    className="font-bold text-cyan-600 hover:text-cyan-700 inline-flex items-center gap-1"
                  >
                    <span>View Record</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                  <Link
                    href={`/verification?recordId=${record.id}`}
                    className="rounded-lg bg-slate-100 px-2.5 py-1 font-semibold text-slate-700 hover:bg-slate-200 transition"
                  >
                    Verify
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>
    </AppShell>
  );
}
