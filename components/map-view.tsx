"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { LandRecord } from "@/lib/types";

interface MapViewProps {
  records?: LandRecord[];
  selectedId?: string | null;
  onSelectRecord?: (record: LandRecord) => void;
  center?: [number, number];
  zoom?: number;
}

function getMarkerIcon(status: string, isSelected: boolean) {
  let bg = "bg-emerald-600";
  let ring = "ring-emerald-400";
  let label = "✓";

  if (status === "PENDING") {
    bg = "bg-amber-500";
    ring = "ring-amber-300";
    label = "⏱";
  } else if (status === "IN_REVIEW") {
    bg = "bg-cyan-600";
    ring = "ring-cyan-300";
    label = "🔍";
  } else if (status === "ISSUES" || status === "REJECTED") {
    bg = "bg-red-600";
    ring = "ring-red-400";
    label = "⚠";
  }

  const selectedClasses = isSelected ? "scale-125 ring-4 ring-white shadow-2xl z-50" : "shadow-md hover:scale-110";

  return L.divIcon({
    className: "custom-div-icon",
    html: `
      <div class="flex items-center justify-center w-8 h-8 rounded-full ${bg} text-white font-bold text-xs ring-2 ${ring} ${selectedClasses} transition-transform">
        ${label}
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
}

function MapController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom, { animate: true });
  }, [center, zoom, map]);
  return null;
}

export default function MapView({
  records = [],
  selectedId,
  onSelectRecord,
  center = [19.2, 74.8],
  zoom = 7,
}: MapViewProps) {
  const [activeCenter, setActiveCenter] = useState<[number, number]>(center);
  const [activeZoom, setActiveZoom] = useState<number>(zoom);

  useEffect(() => {
    if (selectedId && records.length > 0) {
      const match = records.find((r) => r.id === selectedId);
      if (match && match.latitude && match.longitude) {
        setActiveCenter([match.latitude, match.longitude]);
        setActiveZoom(13);
      }
    }
  }, [selectedId, records]);

  return (
    <div className="relative h-full w-full min-h-[480px]">
      <MapContainer
        center={activeCenter}
        zoom={activeZoom}
        scrollWheelZoom
        className="h-full w-full min-h-[480px] rounded-xl z-0"
      >
        <MapController center={activeCenter} zoom={activeZoom} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {records.map((record) => {
          if (!record.latitude || !record.longitude) return null;
          const isSelected = record.id === selectedId;

          return (
            <Marker
              key={record.id}
              position={[record.latitude, record.longitude]}
              icon={getMarkerIcon(record.verificationStatus, isSelected)}
              eventHandlers={{
                click: () => {
                  if (onSelectRecord) onSelectRecord(record);
                },
              }}
            >
              <Popup className="custom-leaflet-popup">
                <div className="p-1 min-w-[200px] text-slate-900">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-1.5 mb-2">
                    <span className="font-bold text-sm text-cyan-700">{record.propertyId}</span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
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

                  <div className="space-y-1 text-xs text-slate-600">
                    <p>
                      <strong className="text-slate-800">Owner:</strong> {record.ownerName}
                    </p>
                    <p>
                      <strong className="text-slate-800">Survey No:</strong> {record.surveyNumber}
                    </p>
                    <p>
                      <strong className="text-slate-800">Location:</strong> {record.village}, {record.district}
                    </p>
                    <p>
                      <strong className="text-slate-800">Area:</strong> {record.area} sq m ({((record.area * 0.000247105)).toFixed(2)} Acres)
                    </p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-100 flex gap-2">
                    <Link
                      href={`/land-records/${record.id}`}
                      className="inline-block flex-1 text-center rounded-lg bg-cyan-600 px-2 py-1.5 text-xs font-semibold text-white hover:bg-cyan-500 transition"
                    >
                      View Record
                    </Link>
                    <Link
                      href={`/verification?recordId=${record.id}`}
                      className="inline-block text-center rounded-lg border border-slate-200 px-2 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                    >
                      Verify
                    </Link>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
