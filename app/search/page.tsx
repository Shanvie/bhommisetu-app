"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import {
  Search,
  Download,
  Filter,
  RotateCcw,
  ArrowRight,
  Landmark,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import type { LandRecord } from "@/lib/types";

export default function SearchPage() {
  const [records, setRecords] = useState<LandRecord[]>([]);
  const [ownerQuery, setOwnerQuery] = useState("");
  const [surveyQuery, setSurveyQuery] = useState("");
  const [villageQuery, setVillageQuery] = useState("");
  const [districtQuery, setDistrictQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [landTypeFilter, setLandTypeFilter] = useState("ALL");

  useEffect(() => {
    fetch("/api/land-records")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.items) setRecords(data.items);
      })
      .catch(() => {});
  }, []);

  const filtered = records.filter((r) => {
    const matchesOwner = !ownerQuery || r.ownerName.toLowerCase().includes(ownerQuery.toLowerCase().trim());
    const matchesSurvey =
      !surveyQuery ||
      r.surveyNumber.toLowerCase().includes(surveyQuery.toLowerCase().trim()) ||
      r.gatNumber.toLowerCase().includes(surveyQuery.toLowerCase().trim());
    const matchesVillage = !villageQuery || r.village.toLowerCase().includes(villageQuery.toLowerCase().trim());
    const matchesDistrict = !districtQuery || r.district.toLowerCase().includes(districtQuery.toLowerCase().trim());
    const matchesStatus = statusFilter === "ALL" || r.verificationStatus === statusFilter;
    const matchesType = landTypeFilter === "ALL" || r.landType.toLowerCase() === landTypeFilter.toLowerCase();

    return matchesOwner && matchesSurvey && matchesVillage && matchesDistrict && matchesStatus && matchesType;
  });

  function resetFilters() {
    setOwnerQuery("");
    setSurveyQuery("");
    setVillageQuery("");
    setDistrictQuery("");
    setStatusFilter("ALL");
    setLandTypeFilter("ALL");
  }

  function exportCSV() {
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
      "Land Type",
      "Status",
      "Mutation No",
    ];

    const rows = filtered.map((r) => [
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
      `"${r.landType}"`,
      `"${r.verificationStatus}"`,
      `"${r.mutationNumber}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `bhoomisetu_land_records_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <AppShell
      title="Global Cadastral Search Engine"
      subtitle="Multi-parameter querying across state land registries and ownership rosters"
    >
      {/* Search Filter Controls Box */}
      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Search className="h-4 w-4 text-cyan-600" />
            <span>Search Parameters</span>
          </h2>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={resetFilters}
              className="flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset</span>
            </button>
            <button
              type="button"
              onClick={exportCSV}
              className="flex items-center gap-1.5 rounded-xl bg-cyan-600 px-3.5 py-1.5 text-xs font-bold text-white shadow hover:bg-cyan-500 transition"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export CSV ({filtered.length})</span>
            </button>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Owner Name</label>
            <input
              type="text"
              value={ownerQuery}
              onChange={(e) => setOwnerQuery(e.target.value)}
              placeholder="e.g. Rahul Sharma"
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 outline-none focus:border-cyan-600"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Survey / Gat No</label>
            <input
              type="text"
              value={surveyQuery}
              onChange={(e) => setSurveyQuery(e.target.value)}
              placeholder="e.g. 123/4A"
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 outline-none focus:border-cyan-600"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Village</label>
            <input
              type="text"
              value={villageQuery}
              onChange={(e) => setVillageQuery(e.target.value)}
              placeholder="e.g. Shivajinagar"
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 outline-none focus:border-cyan-600"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">District</label>
            <input
              type="text"
              value={districtQuery}
              onChange={(e) => setDistrictQuery(e.target.value)}
              placeholder="e.g. Pune, Nashik"
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 outline-none focus:border-cyan-600"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 outline-none focus:border-cyan-600"
            >
              <option value="ALL">All Statuses</option>
              <option value="VERIFIED">Verified</option>
              <option value="IN_REVIEW">In Review</option>
              <option value="PENDING">Pending</option>
              <option value="ISSUES">Issues</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Land Type</label>
            <select
              value={landTypeFilter}
              onChange={(e) => setLandTypeFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 outline-none focus:border-cyan-600"
            >
              <option value="ALL">All Types</option>
              <option value="Agricultural">Agricultural</option>
              <option value="Residential">Residential</option>
              <option value="Commercial">Commercial</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 p-4">
          <div className="text-xs font-bold text-slate-700">
            {filtered.length} matching parcel records found
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100 text-left text-xs">
            <thead className="bg-slate-50 font-semibold text-slate-600">
              <tr>
                <th className="px-5 py-3">Property ID</th>
                <th className="px-5 py-3">Registered Owner</th>
                <th className="px-5 py-3">Survey / Gat</th>
                <th className="px-5 py-3">Location</th>
                <th className="px-5 py-3">Area</th>
                <th className="px-5 py-3">Type</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500">
                    No records found matching query criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-5 py-3.5 font-bold text-cyan-700">
                      <Link href={`/land-records/${record.id}`}>{record.propertyId}</Link>
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-slate-900">{record.ownerName}</td>
                    <td className="px-5 py-3.5 font-mono text-slate-800">
                      {record.surveyNumber} ({record.gatNumber})
                    </td>
                    <td className="px-5 py-3.5">
                      {record.village}, {record.district}
                    </td>
                    <td className="px-5 py-3.5">
                      {record.area} sq m ({((record.area * 0.000247105)).toFixed(2)} Ac)
                    </td>
                    <td className="px-5 py-3.5">{record.landType}</td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
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
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/land-records/${record.id}`}
                          className="rounded-lg border border-slate-200 px-2.5 py-1 font-semibold text-slate-700 hover:bg-slate-50 transition"
                        >
                          View
                        </Link>
                        <Link
                          href={`/verification?recordId=${record.id}`}
                          className="rounded-lg bg-cyan-600 px-2.5 py-1 font-semibold text-white hover:bg-cyan-500 transition"
                        >
                          Verify
                        </Link>
                      </div>
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
