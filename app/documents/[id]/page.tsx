import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { loadAppData } from "@/lib/store";
import {
  FileText,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  ExternalLink,
  ClipboardCheck,
  Download,
  Eye,
  Sparkles,
} from "lucide-react";

export default async function DocumentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await loadAppData();
  const document = data.documents.find((d) => d.id === id);

  if (!document) {
    notFound();
  }

  const linkedRecord = document.recordId
    ? data.landRecords.find((r) => r.id === document.recordId)
    : data.landRecords[0];

  return (
    <AppShell
      title={`Document: ${document.title}`}
      subtitle={`File: ${document.fileName} • ID: ${document.id}`}
    >
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/documents"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Document Registry</span>
        </Link>

        <div className="flex items-center gap-2">
          {linkedRecord && (
            <Link
              href={`/verification?recordId=${linkedRecord.id}`}
              className="flex items-center gap-2 rounded-xl bg-cyan-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-cyan-500 transition"
            >
              <ClipboardCheck className="h-4 w-4" />
              <span>Open in Verification Workspace</span>
            </Link>
          )}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_1.2fr_0.9fr]">
        {/* Left: Scanned Document Viewer Simulation */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900">Original Scanned Document</h3>
              <p className="text-[11px] text-slate-400">
                {document.mimeType} • {(document.size / 1024 / 1024).toFixed(2)} MB • {document.pageCount || 2} Pages
              </p>
            </div>
            <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
              {document.documentType}
            </span>
          </div>

          {/* High-Fidelity Scanned Document Canvas */}
          <div className="relative rounded-xl border border-slate-300 bg-gradient-to-b from-amber-50/70 via-slate-50 to-amber-50/40 p-5 font-serif text-slate-800 shadow-inner">
            <div className="border-b-2 border-slate-700 pb-3 text-center">
              <div className="text-[10px] tracking-widest uppercase font-bold text-slate-600">
                SAMPLE DOCUMENT • NOT AN OFFICIAL GOVERNMENT RECORD
              </div>
              <div className="text-base font-bold text-slate-900 mt-1">
                {document.documentType.toUpperCase()} (गाव नमुना ७/१२)
              </div>
              <div className="text-[11px] text-slate-600">
                District: {String(document.metadata?.district || "Pune")} | Taluka:{" "}
                {String(document.metadata?.taluka || "Pune City")} | Village:{" "}
                {String(document.metadata?.village || "Shivajinagar")}
              </div>
            </div>

            <div className="my-4 space-y-2 text-xs">
              <div className="flex justify-between border-b border-dashed border-slate-300 pb-1">
                <span className="font-sans font-semibold text-slate-600">Survey No / Gat No:</span>
                <span className="font-bold text-slate-900 bg-cyan-100 px-1.5 rounded">
                  {linkedRecord?.surveyNumber || "123/4A"}
                </span>
              </div>
              <div className="flex justify-between border-b border-dashed border-slate-300 pb-1">
                <span className="font-sans font-semibold text-slate-600">Primary Holder / Owner:</span>
                <span className="font-bold text-slate-900 bg-cyan-100 px-1.5 rounded">
                  {linkedRecord?.ownerName || "Rahul Sharma"}
                </span>
              </div>
              <div className="flex justify-between border-b border-dashed border-slate-300 pb-1">
                <span className="font-sans font-semibold text-slate-600">Total Land Area:</span>
                <span className="font-bold text-slate-900">
                  {linkedRecord?.area || 1450} Sq. Meters
                </span>
              </div>
              <div className="flex justify-between border-b border-dashed border-slate-300 pb-1">
                <span className="font-sans font-semibold text-slate-600">Assessment / Land Class:</span>
                <span>Agricultural (Bagayat / Cultivable)</span>
              </div>
              <div className="flex justify-between border-b border-dashed border-slate-300 pb-1">
                <span className="font-sans font-semibold text-slate-600">Mutation Number:</span>
                <span>{linkedRecord?.mutationNumber || "MUT-1402"}</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-300 text-[10px] text-slate-500 flex items-center justify-between">
              <span>Digitized via BhoomiSetu OCR Engine</span>
              <span className="font-sans font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                Confidence: {document.confidence ? `${Math.round(document.confidence * 100)}%` : "94%"}
              </span>
            </div>
          </div>

          <div className="mt-4">
            <h4 className="text-xs font-bold text-slate-700 mb-2">Raw Extracted Text Stream</h4>
            <pre className="max-h-36 overflow-y-auto rounded-xl bg-slate-950 p-3 text-[11px] text-emerald-400 font-mono">
              {document.rawText || "OCR text extraction stream verified."}
            </pre>
          </div>
        </div>

        {/* Middle: Extracted Structured Fields */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900">AI Extracted Structured Fields</h3>
              <p className="text-[11px] text-slate-400">Parsed key-value entities with confidence ratings</p>
            </div>
            <Sparkles className="h-4 w-4 text-cyan-600" />
          </div>

          <div className="space-y-3">
            {linkedRecord?.extractedFields.map((field) => (
              <div
                key={field.field}
                className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 transition hover:bg-slate-100/70"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700">{field.field}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-slate-600">
                      {Math.round(field.confidence * 100)}% confidence
                    </span>
                    <span
                      className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase ${
                        field.status === "verified"
                          ? "bg-emerald-100 text-emerald-800"
                          : field.status === "review"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-red-100 text-red-800"
                      }`}
                    >
                      {field.status}
                    </span>
                  </div>
                </div>
                <div className="mt-1.5 text-sm font-bold text-slate-900">
                  {field.value ?? <span className="italic text-red-500">Not detected</span>}
                </div>
                <div className="mt-1 text-[10px] text-slate-400">Source: Page {field.source_page}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Validation Alerts & Linked Cadastral Record */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-3">Validation Engine Diagnostics</h3>

            {linkedRecord?.validationResults && linkedRecord.validationResults.length > 0 ? (
              <div className="space-y-3">
                {linkedRecord.validationResults.map((result) => (
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
                    <div className="mt-2 text-[10px] opacity-80">
                      Expected: {result.expectedValue} | Detected: {result.detectedValue}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                <span>All state rule checks passed. No inconsistencies detected.</span>
              </div>
            )}
          </div>

          {/* Linked Record Card */}
          {linkedRecord && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-3">Associated Land Record</h3>
              <div className="rounded-xl border border-cyan-100 bg-cyan-50/50 p-4 text-xs">
                <div className="font-bold text-cyan-900 text-sm">{linkedRecord.propertyId}</div>
                <div className="mt-2 space-y-1 text-slate-700">
                  <p><strong>Owner:</strong> {linkedRecord.ownerName}</p>
                  <p><strong>Survey:</strong> {linkedRecord.surveyNumber}</p>
                  <p><strong>Village:</strong> {linkedRecord.village}, {linkedRecord.district}</p>
                  <p><strong>Status:</strong> {linkedRecord.verificationStatus}</p>
                </div>
                <Link
                  href={`/land-records/${linkedRecord.id}`}
                  className="mt-4 inline-flex items-center gap-1.5 font-bold text-cyan-700 hover:text-cyan-800"
                >
                  <span>View Full Land Record Certificate</span>
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
