"use client";

import { Suspense, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import {
  MapPin,
  Search,
  Filter,
} from "lucide-react";
import type { LandRecord } from "@/lib/types";

const MapView = dynamic(() => import("@/components/map-view"), { ssr: false });

function MapContent() {
  const searchParams = useSearchParams();
  const selectQuery = searchParams.get("select");

  const [records, setRecords] = useState<LandRecord[]>([]);
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(selectQuery);

  const [query, setQuery] = useState("");
  const [districtFilter, setDistrictFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    fetch("/api/land-records")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.items) {
          setRecords(data.items);
          if (selectQuery) setSelectedRecordId(selectQuery);
        }
      })
      .catch(() => {});
  }, [selectQuery]);

  const filteredRecords = records.filter((r) => {
    const matchesDistrict = districtFilter === "ALL" || r.district.toLowerCase() === districtFilter.toLowerCase();
    const matchesStatus = statusFilter === "ALL" || r.verificationStatus === statusFilter;
    const matchesQuery =
      !query ||
      r.ownerName.toLowerCase().includes(query.toLowerCase()) ||
      r.propertyId.toLowerCase().includes(query.toLowerCase()) ||
      r.surveyNumber.toLowerCase().includes(query.toLowerCase()) ||
      r.village.toLowerCase().includes(query.toLowerCase()) ||
      r.district.toLowerCase().includes(query.toLowerCase());

    return matchesDistrict && matchesStatus && matchesQuery;
  });

  const districts = Array.from(new Set(records.map((r) => r.district))).filter(Boolean);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.8fr]">
      {/* Left Control & Parcel List Panel */}
      <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm max-h-[820px]">
        <div className="mb-4">
          <h2 className="text-base font-bold text-slate-900">Spatial Parcel Filter</h2>
          <p className="text-xs text-slate-500">Filter geo-located land holdings</p>
        </div>

        {/* Search Input */}
        <div className="relative mb-3">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search owner, survey, village..."
            className="w-full rounded-xl border border-slate-300 bg-slate-50 pl-9 pr-3 py-2 text-xs text-slate-800 outline-none focus:border-cyan-600 focus:bg-white"
          />
        </div>

        {/* District & Status Filters */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">District</label>
            <select
              value={districtFilter}
              onChange={(e) => setDistrictFilter(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-800 outline-none focus:border-cyan-600"
            >
              <option value="ALL">All Districts</option>
              {districts.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-800 outline-none focus:border-cyan-600"
            >
              <option value="ALL">All Statuses</option>
              <option value="VERIFIED">Verified</option>
              <option value="IN_REVIEW">In Review</option>
              <option value="PENDING">Pending</option>
              <option value="ISSUES">Issues</option>
            </select>
          </div>
        </div>

        {/* Legend */}
        <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-[11px] flex flex-wrap items-center justify-between gap-2">
          <span className="flex items-center gap-1 font-semibold text-emerald-700">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-600" /> Verified
          </span>
          <span className="flex items-center gap-1 font-semibold text-cyan-700">
            <span className="h-2.5 w-2.5 rounded-full bg-cyan-600" /> In Review
          </span>
          <span className="flex items-center gap-1 font-semibold text-amber-700">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> Pending
          </span>
          <span className="flex items-center gap-1 font-semibold text-red-700">
            <span className="h-2.5 w-2.5 rounded-full bg-red-600" /> Issues
          </span>
        </div>

        {/* Parcel List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          <div className="text-xs font-bold text-slate-500 mb-2">
            Found {filteredRecords.length} Geocoded Parcels (Click to center map)
          </div>

          {filteredRecords.map((r) => {
            const isSelected = r.id === selectedRecordId;

            return (
              <div
                key={r.id}
                onClick={() => setSelectedRecordId(r.id)}
                className={`cursor-pointer rounded-xl border p-3 text-xs transition ${
                  isSelected
                    ? "border-cyan-500 bg-cyan-50/80 ring-1 ring-cyan-500"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center justify-between font-bold">
                  <span className="text-slate-900">{r.propertyId}</span>
                  <span
                    className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      r.verificationStatus === "VERIFIED"
                        ? "bg-emerald-100 text-emerald-800"
                        : r.verificationStatus === "PENDING"
                          ? "bg-amber-100 text-amber-800"
                          : r.verificationStatus === "IN_REVIEW"
                            ? "bg-cyan-100 text-cyan-800"
                            : "bg-red-100 text-red-800"
                    }`}
                  >
                    {r.verificationStatus}
                  </span>
                </div>

                <div className="mt-1 font-semibold text-slate-800">{r.ownerName}</div>
                <div className="mt-1 text-[11px] text-slate-500 flex justify-between">
                  <span>Survey: {r.surveyNumber}</span>
                  <span>{r.village}, {r.district}</span>
                </div>
                <div className="mt-1 text-[10px] text-cyan-700 font-mono">
                  Coord: {r.latitude?.toFixed(3)}° N, {r.longitude?.toFixed(3)}° E
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Map Canvas */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-sm min-h-[600px] flex flex-col">
        <MapView
          records={filteredRecords}
          selectedId={selectedRecordId}
          onSelectRecord={(r) => setSelectedRecordId(r.id)}
        />
      </div>
    </div>
  );
}

export default function MapPage() {
  return (
    <AppShell
      title="Cadastral GIS Mapping System"
      subtitle="Spatial parcel visualization, survey geo-coordinates, and verification overlay"
    >
      <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500">Loading GIS Map Engine...</div>}>
        <MapContent />
      </Suspense>
    </AppShell>
  );
}
