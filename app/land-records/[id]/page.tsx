import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { loadAppData } from "@/lib/store";
import {
  Landmark,
  ArrowLeft,
  MapPin,
  ClipboardCheck,
  Printer,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  FileText,
  User,
} from "lucide-react";

export default async function LandRecordDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await loadAppData();
  const record = data.landRecords.find((r) => r.id === id);

  if (!record) {
    notFound();
  }

  const linkedDoc = data.documents.find((d) => d.recordId === id);
  const acres = (record.area * 0.000247105).toFixed(3);

  return (
    <AppShell
      title={`Land Record: ${record.propertyId}`}
      subtitle={`Owner: ${record.ownerName} • Survey: ${record.surveyNumber}`}
    >
      {/* Top Action Bar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/land-records"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Land Records Registry</span>
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/map?select=${record.id}`}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
          >
            <MapPin className="h-4 w-4 text-cyan-600" />
            <span>View on GIS Map</span>
          </Link>

          <Link
            href={`/verification?recordId=${record.id}`}
            className="flex items-center gap-1.5 rounded-xl bg-cyan-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-cyan-500 transition"
          >
            <ClipboardCheck className="h-4 w-4" />
            <span>Verify / Edit Record</span>
          </Link>
        </div>
      </div>

      {/* Sample record summary */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
        {/* Certificate Government Header */}
        <div className="border-b-2 border-slate-900 pb-6 text-center">
          <div className="text-xs uppercase font-extrabold tracking-widest text-slate-500">
            SAMPLE RECORD • NOT A GOVERNMENT CERTIFICATE
          </div>
          <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold text-slate-900">
            Prototype Land Record Summary
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Illustrative data only • Not an official Record of Rights
          </p>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            <span className="rounded-lg bg-slate-900 px-3 py-1 font-mono text-xs font-bold text-white">
              Property ID: {record.propertyId}
            </span>
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                record.verificationStatus === "VERIFIED"
                  ? "bg-emerald-100 text-emerald-800"
                  : record.verificationStatus === "PENDING"
                    ? "bg-amber-100 text-amber-800"
                    : record.verificationStatus === "IN_REVIEW"
                      ? "bg-cyan-100 text-cyan-800"
                      : "bg-red-100 text-red-800"
              }`}
            >
              Status: {record.verificationStatus}
            </span>
          </div>
        </div>

        {/* Certificate Body Grid */}
        <div className="mt-8 grid gap-8 md:grid-cols-2">
          {/* Ownership & Title Section */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-2 flex items-center gap-2">
              <User className="h-4 w-4 text-cyan-600" />
              <span>Section 1: Ownership & Title Details</span>
            </h2>

            <div className="space-y-2 text-xs text-slate-700">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="font-semibold text-slate-500">Primary Registered Holder:</span>
                <span className="font-bold text-slate-900">{record.ownerName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="font-semibold text-slate-500">Father / Husband Name:</span>
                <span>{record.fatherName || "Ramesh Sharma"}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="font-semibold text-slate-500">Co-Holders / Joint Owners:</span>
                <span>
                  {record.coOwnerNames && record.coOwnerNames.length > 0
                    ? record.coOwnerNames.join(", ")
                    : "None recorded (Sole Ownership)"}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="font-semibold text-slate-500">Ownership Type:</span>
                <span>{record.ownershipType || "Individual"}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="font-semibold text-slate-500">Mutation Number (फेरफार क्र.):</span>
                <span className="font-mono font-bold text-slate-800">{record.mutationNumber}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="font-semibold text-slate-500">Registered Document No:</span>
                <span className="font-mono font-bold text-slate-800">{record.documentNumber}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="font-semibold text-slate-500">Registration Date:</span>
                <span>{record.registrationDate}</span>
              </div>
            </div>
          </div>

          {/* Cadastral Parcel & Location Section */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-2 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-cyan-600" />
              <span>Section 2: Cadastral Land Parcel Details</span>
            </h2>

            <div className="space-y-2 text-xs text-slate-700">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="font-semibold text-slate-500">Survey Number:</span>
                <span className="font-mono font-bold text-slate-900 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200">
                  {record.surveyNumber}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="font-semibold text-slate-500">Gat / Hissa Number:</span>
                <span className="font-mono font-bold text-slate-900">{record.gatNumber}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="font-semibold text-slate-500">Total Parcel Area:</span>
                <span className="font-bold text-slate-900">
                  {record.area} Sq. Meters ({acres} Acres)
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="font-semibold text-slate-500">Classification / Land Type:</span>
                <span>{record.landType} ({record.landUse || "Cultivable"})</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="font-semibold text-slate-500">Village / Mauje:</span>
                <span>{record.village}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="font-semibold text-slate-500">Taluka & District:</span>
                <span>{record.taluka}, {record.district}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="font-semibold text-slate-500">GIS Coordinates:</span>
                <span className="font-mono text-cyan-700">
                  {record.latitude}° N, {record.longitude}° E
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Validation Engine Findings */}
        <div className="mt-8 border-t border-slate-200 pt-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-4 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-cyan-600" />
            <span>AI Automated Validation Engine Audit</span>
          </h2>

          {record.validationResults.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {record.validationResults.map((val) => (
                <div
                  key={val.ruleId}
                  className={`rounded-2xl border p-4 text-xs ${
                    val.severity === "HIGH" || val.severity === "CRITICAL"
                      ? "border-red-200 bg-red-50 text-red-900"
                      : "border-amber-200 bg-amber-50 text-amber-900"
                  }`}
                >
                  <div className="flex items-center justify-between font-bold">
                    <span>{val.ruleId} ({val.field})</span>
                    <span className="rounded bg-white/80 px-2 py-0.5 text-[9px] uppercase">
                      {val.severity}
                    </span>
                  </div>
                  <div className="mt-1 font-medium">{val.description}</div>
                  <div className="mt-2 text-[10px] opacity-80">
                    Detected: <strong>{val.detectedValue}</strong> | Expected: {val.expectedValue}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              <span>Zero discrepancies detected. Cadastral records, survey geometry, and owner title are fully consistent.</span>
            </div>
          )}
        </div>

        {/* Officer Comments Trail */}
        {record.comments && record.comments.length > 0 && (
          <div className="mt-6 border-t border-slate-200 pt-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Verification Officer Remarks & Audit Trail
            </h3>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2 text-xs text-slate-700">
              {record.comments.map((comment, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="text-cyan-600 font-bold">•</span>
                  <span>{comment}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Linked Document Card */}
        {linkedDoc && (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-cyan-600" />
              <span>
                Source Document: <strong>{linkedDoc.title}</strong> ({linkedDoc.fileName})
              </span>
            </div>
            <Link
              href={`/documents/${linkedDoc.id}`}
              className="font-bold text-cyan-600 hover:text-cyan-700 inline-flex items-center gap-1"
            >
              <span>Inspect Source Document</span>
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        )}
      </div>
    </AppShell>
  );
}
