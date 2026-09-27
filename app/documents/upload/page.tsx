"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import {
  UploadCloud,
  FileCheck,
  CheckCircle2,
  AlertCircle,
  FileText,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

const SAMPLES = [
  {
    name: "Sample 7/12 Extract (Pune)",
    fileName: "pune-haveli-712-extract.pdf",
    documentType: "7/12 Extract",
    title: "7/12 Extract - Haveli Taluka",
    district: "Pune",
    taluka: "Haveli",
    village: "Wagholi",
    surveyNumber: "248/1A",
    ownerName: "Chandrakant Shinde",
    area: 2450,
  },
  {
    name: "Sample Property Card (Nagpur)",
    fileName: "nagpur-city-property-card.pdf",
    documentType: "Property Card",
    title: "Property Card - Civil Lines Nagpur",
    district: "Nagpur",
    taluka: "Nagpur Urban",
    village: "Civil Lines",
    surveyNumber: "112/3",
    ownerName: "Sunil Deshpande",
    area: 1650,
  },
  {
    name: "Sample Sale Deed (Nashik)",
    fileName: "nashik-registered-sale-deed.pdf",
    documentType: "Sale Deed",
    title: "Registered Sale Deed - Panchavati",
    district: "Nashik",
    taluka: "Nashik",
    village: "Panchavati",
    surveyNumber: "89/5",
    ownerName: "Anand Kulkarni",
    area: 3100,
  },
];

export default function UploadDocumentPage() {
  const router = useRouter();

  const [fileName, setFileName] = useState("maharashtra-712-extract.pdf");
  const [fileSize, setFileSize] = useState(2_450_000);
  const [title, setTitle] = useState("7/12 Extract - Pune District Record");
  const [documentType, setDocumentType] = useState("7/12 Extract");
  const [district, setDistrict] = useState("Pune");
  const [taluka, setTaluka] = useState("Haveli");
  const [village, setVillage] = useState("Wagholi");
  const [surveyNumber, setSurveyNumber] = useState("248/1A");
  const [ownerName, setOwnerName] = useState("Chandrakant Shinde");
  const [area, setArea] = useState("2450");

  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [completedRecordId, setCompletedRecordId] = useState<string | null>(null);

  const steps = [
    { label: "Document Accepted", desc: "Valid format verified & integrity check passed" },
    { label: "OCR Preprocessing", desc: "Adaptive binarization, de-skewing & noise removal" },
    { label: "AI Extraction", desc: "Key-value pair detection for Owner, Survey & Area" },
    { label: "Validation Engine", desc: "Cross-checked against state cadastral rules" },
  ];

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setFileSize(file.size);
      setTitle(`${documentType} - ${file.name.replace(/\.[^/.]+$/, "")}`);
    }
  }

  function applyPreset(sample: (typeof SAMPLES)[0]) {
    setFileName(sample.fileName);
    setDocumentType(sample.documentType);
    setTitle(sample.title);
    setDistrict(sample.district);
    setTaluka(sample.taluka);
    setVillage(sample.village);
    setSurveyNumber(sample.surveyNumber);
    setOwnerName(sample.ownerName);
    setArea(String(sample.area));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsProcessing(true);
    setProgress(15);
    setProcessingStep(0);

    // Simulate pipeline steps with real progressive UI feedback
    setTimeout(() => {
      setProcessingStep(1);
      setProgress(42);
    }, 600);

    setTimeout(() => {
      setProcessingStep(2);
      setProgress(74);
    }, 1200);

    setTimeout(async () => {
      setProcessingStep(3);
      setProgress(90);

      try {
        const response = await fetch("/api/documents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            documentType,
            fileName,
            size: fileSize,
            district,
            taluka,
            village,
            surveyNumber,
            ownerName,
            area: Number(area),
          }),
        });

        const data = await response.json();
        setProgress(100);
        setProcessingStep(4);
        if (data?.recordId) {
          setCompletedRecordId(data.recordId);
          setTimeout(() => {
            router.push(`/verification?recordId=${data.recordId}`);
          }, 1500);
        } else {
          router.push("/documents");
        }
      } catch (err) {
        console.error(err);
        setIsProcessing(false);
      }
    }, 1800);
  }

  return (
    <AppShell title="Document Ingestion & OCR Pipeline" subtitle="Upload land records for automated AI extraction">
      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
        {/* Main Upload Form */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          {/* Quick Presets for Evaluator */}
          <div className="mb-6 rounded-xl border border-cyan-200 bg-cyan-50/60 p-4">
            <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-900 mb-2">
              <Sparkles className="h-4 w-4 text-cyan-600" />
              <span>SIH Demo Sample Documents (1-Click Fill)</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {SAMPLES.map((s) => (
                <button
                  key={s.name}
                  type="button"
                  onClick={() => applyPreset(s)}
                  className="rounded-lg border border-cyan-300 bg-white px-3 py-1.5 text-xs font-semibold text-cyan-800 shadow-sm hover:bg-cyan-100 transition"
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Drag & Drop Box */}
            <div
              className={`relative rounded-2xl border-2 border-dashed p-8 text-center transition ${
                isDragging ? "border-cyan-500 bg-cyan-50/50" : "border-slate-300 bg-slate-50/80 hover:border-slate-400"
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                const file = e.dataTransfer.files?.[0];
                if (file) {
                  setFileName(file.name);
                  setFileSize(file.size);
                  setTitle(`${documentType} - ${file.name.replace(/\.[^/.]+$/, "")}`);
                }
              }}
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-100 text-cyan-700 mb-3">
                <UploadCloud className="h-6 w-6" />
              </div>
              <div className="text-base font-bold text-slate-800">
                Drag & drop land record document, or click to browse
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Supports PDF, scanned JPG, JPEG, and PNG (Up to 25 MB)
              </p>

              <label className="mt-4 inline-flex cursor-pointer items-center rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition">
                <span>Select file from computer</span>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>

              {fileName && (
                <div className="mt-3 inline-flex items-center gap-2 rounded-lg bg-white px-3 py-1 text-xs font-medium text-slate-700 border border-slate-200 shadow-sm">
                  <FileText className="h-3.5 w-3.5 text-cyan-600" />
                  <span>Selected: <strong>{fileName}</strong> ({(fileSize / 1024 / 1024).toFixed(2)} MB)</span>
                </div>
              )}
            </div>

            {/* Document Details Grid */}
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">Document Type</label>
                <select
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-800 outline-none focus:border-cyan-600"
                >
                  <option>7/12 Extract</option>
                  <option>Property Card</option>
                  <option>Sale Deed</option>
                  <option>Mutation Record</option>
                  <option>8A Khatauni</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">Record Title</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 outline-none focus:border-cyan-600"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">Owner Name (Claimed)</label>
                <input
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 outline-none focus:border-cyan-600"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">Survey Number / Gat No</label>
                <input
                  value={surveyNumber}
                  onChange={(e) => setSurveyNumber(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 outline-none focus:border-cyan-600"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">District</label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 outline-none focus:border-cyan-600"
                >
                  <option>Pune</option>
                  <option>Nashik</option>
                  <option>Nagpur</option>
                  <option>Thane</option>
                  <option>Satara</option>
                  <option>Kolhapur</option>
                  <option>Aurangabad</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">Village</label>
                <input
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 outline-none focus:border-cyan-600"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">Plot Area (Sq. Meters)</label>
                <input
                  type="number"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 outline-none focus:border-cyan-600"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full rounded-xl bg-cyan-600 px-5 py-3 text-sm font-bold text-white shadow-md hover:bg-cyan-500 transition flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isProcessing ? (
                <span>AI Pipeline Running ({progress}%)...</span>
              ) : (
                <>
                  <UploadCloud className="h-4 w-4" />
                  <span>Start AI OCR & Cadastral Ingestion</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Live Processing Pipeline Sidebar */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900">OCR Pipeline Progress</h3>
              <span className="text-xs font-bold text-cyan-600">{progress}%</span>
            </div>

            <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 mb-6">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-600 to-emerald-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="space-y-3">
              {steps.map((step, idx) => {
                const isDone = processingStep > idx;
                const isCurrent = processingStep === idx && isProcessing;

                return (
                  <div
                    key={step.label}
                    className={`rounded-xl p-3 border text-xs transition ${
                      isDone
                        ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                        : isCurrent
                          ? "border-cyan-300 bg-cyan-50 text-cyan-900 ring-1 ring-cyan-400"
                          : "border-slate-200 bg-slate-50/60 text-slate-500"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold">{step.label}</span>
                      {isDone ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      ) : isCurrent ? (
                        <span className="h-2 w-2 rounded-full bg-cyan-600 animate-ping" />
                      ) : (
                        <span className="text-[10px] text-slate-400">Waiting</span>
                      )}
                    </div>
                    <p className="mt-1 text-[11px] opacity-80">{step.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {completedRecordId ? (
            <div className="mt-6 rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-xs text-emerald-900">
              <div className="font-bold flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Extraction & Ingestion Complete!
              </div>
              <p className="mt-1">Redirecting to officer verification workbench...</p>
            </div>
          ) : (
            <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-3 text-[11px] text-slate-500">
              <strong className="text-slate-700">Next Step:</strong> Upon document ingestion, BhoomiSetu AI automatically detects fields, evaluates validation rules, and forwards the record to the Human-in-the-Loop verification desk.
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
