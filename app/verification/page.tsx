"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import {
  ClipboardCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Eye,
  Check,
  X,
  Save,
  MessageSquare,
  FileText,
} from "lucide-react";
import type { LandRecord, VerificationStatus } from "@/lib/types";

function VerificationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryRecordId = searchParams.get("recordId");

  const [records, setRecords] = useState<LandRecord[]>([]);
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(queryRecordId);
  const [currentRecord, setCurrentRecord] = useState<LandRecord | null>(null);

  // Editable fields state
  const [ownerName, setOwnerName] = useState("");
  const [surveyNumber, setSurveyNumber] = useState("");
  const [gatNumber, setGatNumber] = useState("");
  const [village, setVillage] = useState("");
  const [district, setDistrict] = useState("");
  const [area, setArea] = useState("");
  const [commentText, setCommentText] = useState("");

  // Field acceptance state (key -> "accepted" | "flagged" | "neutral")
  const [fieldDecisions, setFieldDecisions] = useState<Record<string, "accepted" | "flagged">>({});

  // View state
  const [contrastMode, setContrastMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Fetch all land records
  useEffect(() => {
    fetch("/api/land-records")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.items) {
          setRecords(data.items);
          const initialId = queryRecordId || data.items[0]?.id;
          setSelectedRecordId(initialId);
          const found = data.items.find((r: LandRecord) => r.id === initialId) || data.items[0];
          if (found) populateRecord(found);
        }
      })
      .catch(() => {});
  }, [queryRecordId]);

  function populateRecord(record: LandRecord) {
    setCurrentRecord(record);
    setSelectedRecordId(record.id);
    setOwnerName(record.ownerName || "");
    setSurveyNumber(record.surveyNumber || "");
    setGatNumber(record.gatNumber || "");
    setVillage(record.village || "");
    setDistrict(record.district || "");
    setArea(String(record.area || ""));
    setCommentText("");
    setFieldDecisions({});
    setNotification(null);
  }

  function handleSelectChange(id: string) {
    const found = records.find((r) => r.id === id);
    if (found) {
      populateRecord(found);
    }
  }

  function toggleFieldDecision(fieldKey: string, decision: "accepted" | "flagged") {
    setFieldDecisions((prev) => ({
      ...prev,
      [fieldKey]: prev[fieldKey] === decision ? ("neutral" as any) : decision,
    }));
  }

  async function handleVerificationDecision(status: VerificationStatus) {
    if (!currentRecord) return;
    setIsSaving(true);
    setNotification(null);

    const updatedExtractedFields = currentRecord.extractedFields.map((f) => {
      let val = f.value;
      if (f.field === "Owner Name") val = ownerName;
      if (f.field === "Survey Number") val = surveyNumber;
      if (f.field === "Village") val = village;
      if (f.field === "District") val = district;
      if (f.field === "Area") val = area;

      const decision = fieldDecisions[f.field];
      return {
        ...f,
        value: val,
        status: decision === "accepted" ? ("verified" as const) : decision === "flagged" ? ("review" as const) : f.status,
      };
    });

    const payload = {
      ownerName,
      surveyNumber,
      gatNumber,
      village,
      district,
      area: Number(area),
      verificationStatus: status,
      extractedFields: updatedExtractedFields,
      comment: commentText || `Decision: ${status} by Verification Officer`,
    };

    try {
      const res = await fetch(`/api/land-records/${currentRecord.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Failed to save verification decision");
      }

      const resData = await res.json();
      const updated = resData.record;

      // Update local lists
      setCurrentRecord(updated);
      setRecords((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));

      setNotification({
        type: "success",
        message: `Land Record ${updated.propertyId} successfully marked as ${status}!`,
      });
    } catch (err: any) {
      setNotification({
        type: "error",
        message: err.message || "An error occurred while saving.",
      });
    } finally {
      setIsSaving(false);
    }
  }

  function handleNextRecord() {
    const currentIndex = records.findIndex((r) => r.id === currentRecord?.id);
    if (currentIndex >= 0 && currentIndex < records.length - 1) {
      populateRecord(records[currentIndex + 1]);
    } else if (records.length > 0) {
      populateRecord(records[0]);
    }
  }

  const pendingCount = records.filter(
    (r) => r.verificationStatus === "PENDING" || r.verificationStatus === "IN_REVIEW" || r.verificationStatus === "ISSUES",
  ).length;

  return (
    <>
      {/* Top Banner: Queue Selector and Status Summary */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-xs font-bold text-slate-700">Select Queue Record:</label>
          <select
            value={selectedRecordId || ""}
            onChange={(e) => handleSelectChange(e.target.value)}
            className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-cyan-600 focus:bg-white"
          >
            {records.map((r) => (
              <option key={r.id} value={r.id}>
                {r.propertyId} — {r.ownerName} ({r.verificationStatus})
              </option>
            ))}
          </select>

          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
            {pendingCount} in queue
          </span>
        </div>

        <div className="flex items-center gap-2">
          {currentRecord && (
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                currentRecord.verificationStatus === "VERIFIED"
                  ? "bg-emerald-100 text-emerald-800"
                  : currentRecord.verificationStatus === "PENDING"
                    ? "bg-amber-100 text-amber-800"
                    : currentRecord.verificationStatus === "IN_REVIEW"
                      ? "bg-cyan-100 text-cyan-800"
                      : "bg-red-100 text-red-800"
              }`}
            >
              Current Status: {currentRecord.verificationStatus}
            </span>
          )}

          <button
            type="button"
            onClick={handleNextRecord}
            className="flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            <span>Next in Queue</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {notification && (
        <div
          className={`mb-6 rounded-2xl border p-4 text-xs font-semibold flex items-center justify-between shadow-sm ${
            notification.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-900"
              : "border-red-200 bg-red-50 text-red-900"
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === "success" ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            ) : (
              <XCircle className="h-5 w-5 text-red-600" />
            )}
            <span>{notification.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="text-xs opacity-60 hover:opacity-100"
          >
            Dismiss
          </button>
        </div>
      )}

      {currentRecord ? (
        <div className="grid gap-6 xl:grid-cols-[1.1fr_1.3fr_0.9fr]">
          {/* Column 1: Scanned Document Visual Preview */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900">Original Document Scan</h3>
                <p className="text-[11px] text-slate-400">{currentRecord.documentType}</p>
              </div>

              <button
                type="button"
                onClick={() => setContrastMode(!contrastMode)}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold border transition ${
                  contrastMode
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                {contrastMode ? "Normal View" : "High Contrast OCR"}
              </button>
            </div>

            {/* Document Card */}
            <div
              className={`rounded-xl border p-5 font-serif text-xs transition-colors duration-200 ${
                contrastMode
                  ? "bg-black text-white border-slate-700"
                  : "bg-amber-50/60 text-slate-800 border-slate-300"
              }`}
            >
              <div className="border-b-2 border-slate-600 pb-2 text-center">
                <div className="text-[10px] tracking-wider uppercase font-sans font-bold opacity-75">
                  REVENUE DEPARTMENT • GOVT OF MAHARASHTRA
                </div>
                <div className="text-sm font-bold mt-1">
                  {currentRecord.documentType} (गाव नमुना)
                </div>
                <div className="text-[10px] font-sans opacity-80">
                  {currentRecord.village}, {currentRecord.taluka}, {currentRecord.district}
                </div>
              </div>

              <div className="my-4 space-y-2.5">
                <div className="flex justify-between border-b border-dashed border-slate-400/50 pb-1">
                  <span className="font-sans font-semibold">Survey / Gat No:</span>
                  <span className={`font-mono font-bold px-1 rounded ${contrastMode ? "bg-cyan-900 text-cyan-200" : "bg-cyan-100 text-cyan-950"}`}>
                    {currentRecord.surveyNumber}
                  </span>
                </div>
                <div className="flex justify-between border-b border-dashed border-slate-400/50 pb-1">
                  <span className="font-sans font-semibold">Registered Holder:</span>
                  <span className={`font-sans font-bold px-1 rounded ${contrastMode ? "bg-cyan-900 text-cyan-200" : "bg-cyan-100 text-cyan-950"}`}>
                    {currentRecord.ownerName}
                  </span>
                </div>
                <div className="flex justify-between border-b border-dashed border-slate-400/50 pb-1">
                  <span className="font-sans font-semibold">Father / Husband:</span>
                  <span>{currentRecord.fatherName || "Ramesh Sharma"}</span>
                </div>
                <div className="flex justify-between border-b border-dashed border-slate-400/50 pb-1">
                  <span className="font-sans font-semibold">Plot Area:</span>
                  <span className="font-bold">{currentRecord.area} sq. m.</span>
                </div>
                <div className="flex justify-between border-b border-dashed border-slate-400/50 pb-1">
                  <span className="font-sans font-semibold">Mutation No:</span>
                  <span>{currentRecord.mutationNumber}</span>
                </div>
                <div className="flex justify-between border-b border-dashed border-slate-400/50 pb-1">
                  <span className="font-sans font-semibold">Document No:</span>
                  <span>{currentRecord.documentNumber}</span>
                </div>
              </div>

              <div className="mt-4 pt-2 border-t border-slate-400/40 text-[10px] flex justify-between items-center font-sans">
                <span className="opacity-75">BhoomiSetu AI Scan Token: {currentRecord.id}</span>
                <span className="font-bold text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded">
                  Status: {currentRecord.verificationStatus}
                </span>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
              <strong className="text-slate-800">Officer Tip:</strong> Compare the extracted values in the middle column against this scan. You may edit any field directly if the OCR misread characters.
            </div>
          </div>

          {/* Column 2: Editable Extracted Fields */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900">Extracted Fields (Editable)</h3>
                <p className="text-[11px] text-slate-400">Review, correct, and accept/flag individual entries</p>
              </div>
              <Sparkles className="h-4 w-4 text-cyan-600" />
            </div>

            <div className="space-y-4">
              {/* Owner Name */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <label className="font-bold text-slate-800">Owner Name</label>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                      95% conf.
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleFieldDecision("Owner Name", "accepted")}
                      className={`p-1 rounded ${fieldDecisions["Owner Name"] === "accepted" ? "bg-emerald-600 text-white" : "bg-white text-slate-600 hover:bg-emerald-50 border border-slate-200"}`}
                      title="Accept field"
                    >
                      <Check className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleFieldDecision("Owner Name", "flagged")}
                      className={`p-1 rounded ${fieldDecisions["Owner Name"] === "flagged" ? "bg-red-600 text-white" : "bg-white text-slate-600 hover:bg-red-50 border border-slate-200"}`}
                      title="Flag field"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <input
                  type="text"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-900 outline-none focus:border-cyan-600"
                />
              </div>

              {/* Survey Number */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <label className="font-bold text-slate-800">Survey Number</label>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                      91% conf.
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleFieldDecision("Survey Number", "accepted")}
                      className={`p-1 rounded ${fieldDecisions["Survey Number"] === "accepted" ? "bg-emerald-600 text-white" : "bg-white text-slate-600 hover:bg-emerald-50 border border-slate-200"}`}
                      title="Accept field"
                    >
                      <Check className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleFieldDecision("Survey Number", "flagged")}
                      className={`p-1 rounded ${fieldDecisions["Survey Number"] === "flagged" ? "bg-red-600 text-white" : "bg-white text-slate-600 hover:bg-red-50 border border-slate-200"}`}
                      title="Flag field"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <input
                  type="text"
                  value={surveyNumber}
                  onChange={(e) => setSurveyNumber(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-900 outline-none focus:border-cyan-600"
                />
              </div>

              {/* Gat Number & Area */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <label className="block text-xs font-bold text-slate-800 mb-1">Gat Number</label>
                  <input
                    type="text"
                    value={gatNumber}
                    onChange={(e) => setGatNumber(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 outline-none focus:border-cyan-600"
                  />
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <label className="block text-xs font-bold text-slate-800 mb-1">Area (Sq. Meters)</label>
                  <input
                    type="number"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 outline-none focus:border-cyan-600"
                  />
                </div>
              </div>

              {/* Village & District */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <label className="block text-xs font-bold text-slate-800 mb-1">Village</label>
                  <input
                    type="text"
                    value={village}
                    onChange={(e) => setVillage(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 outline-none focus:border-cyan-600"
                  />
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <label className="block text-xs font-bold text-slate-800 mb-1">District</label>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 outline-none focus:border-cyan-600"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Column 3: Validation Alerts & Decision Console */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-3">Rule Validation Alerts</h3>

              {currentRecord.validationResults && currentRecord.validationResults.length > 0 ? (
                <div className="space-y-3">
                  {currentRecord.validationResults.map((result) => (
                    <div
                      key={result.ruleId}
                      className={`rounded-xl border p-3 text-xs ${
                        result.severity === "HIGH" || result.severity === "CRITICAL"
                          ? "border-red-200 bg-red-50 text-red-900"
                          : "border-amber-200 bg-amber-50 text-amber-900"
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold">
                        <span>{result.ruleId}</span>
                        <span className="rounded bg-white/80 px-1.5 py-0.5 text-[9px] uppercase">
                          {result.severity}
                        </span>
                      </div>
                      <div className="mt-1">{result.description}</div>
                      <div className="mt-1 text-[10px] opacity-75">Detected: {result.detectedValue}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-900 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>No automated rule flags. Document is compliant.</span>
                </div>
              )}
            </div>

            {/* Officer Decision Box */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-2">Officer Decision & Actions</h3>
              <p className="text-xs text-slate-500 mb-3">
                Select final determination to commit to the state land registry.
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Verification Comments / Audit Note
                </label>
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  rows={3}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-800 outline-none focus:border-cyan-600 mb-4"
                  placeholder="Enter remarks, e.g., 'Checked against cadastral survey sheet 4B; verified owner name spelling.'"
                />
              </div>

              <div className="space-y-2">
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => handleVerificationDecision("VERIFIED")}
                  className="w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-emerald-500 transition flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Approve & Mark Verified</span>
                </button>

                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => handleVerificationDecision("ISSUES")}
                  className="w-full rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-amber-400 transition flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  <AlertTriangle className="h-4 w-4" />
                  <span>Flag Inconsistency (Request Review)</span>
                </button>

                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => handleVerificationDecision("REJECTED")}
                  className="w-full rounded-xl bg-red-600 px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-red-500 transition flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  <XCircle className="h-4 w-4" />
                  <span>Reject Record</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-500">
          No records currently pending verification in the workspace queue.
        </div>
      )}
    </>
  );
}

export default function VerificationPage() {
  return (
    <AppShell
      title="Human-in-the-Loop Verification Workspace"
      subtitle="Officer review station for extracted OCR fields and anomaly reconciliation"
    >
      <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500">Loading Verification Workbench...</div>}>
        <VerificationContent />
      </Suspense>
    </AppShell>
  );
}
