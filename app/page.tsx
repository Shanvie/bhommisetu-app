import Link from "next/link";
import {
  FileText,
  ShieldCheck,
  MapPin,
  Search,
  ArrowRight,
  Sparkles,
  Building2,
  CheckCircle2,
  Cpu,
  Layers,
} from "lucide-react";
import { loadAppData } from "@/lib/store";

export default async function HomePage() {
  const data = await loadAppData();
  const totalRecords = data.landRecords.length;
  const verifiedRecords = data.landRecords.filter((r) => r.verificationStatus === "VERIFIED").length;
  const documentsProcessed = data.documents.length;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      {/* Top Government Banner */}
      <div className="border-b border-slate-800 bg-slate-950 px-4 py-2 text-xs text-slate-400">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
            <span>Government of Maharashtra • Department of Revenue & Land Records</span>
          </div>
          <div className="hidden sm:flex items-center gap-3">
            <span className="text-cyan-400 font-semibold">Smart India Hackathon 2026</span>
            <span>•</span>
            <span>BhoomiSetu AI v1.0</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <header className="border-b border-slate-800/80 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-600 to-emerald-400 text-base font-bold text-slate-950 shadow-lg">
              BS
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-wider text-white">BHOOMISETU</span>
                <span className="rounded bg-cyan-500/20 px-1.5 py-0.5 text-xs font-semibold text-cyan-300 ring-1 ring-cyan-500/40">
                  AI
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Intelligent Land Record Digitization & Verification</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/search"
              className="hidden sm:flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2 text-xs font-medium text-slate-200 hover:bg-slate-800 hover:text-white transition"
            >
              <Search className="h-3.5 w-3.5" />
              Public Search
            </Link>
            <Link
              href="/login"
              className="flex items-center gap-2 rounded-xl bg-cyan-600 px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-cyan-500 transition"
            >
              <span>Officer Portal</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/25 via-slate-900 to-slate-900" />
        
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3.5 py-1 text-xs font-medium text-cyan-300 mb-6">
              <Sparkles className="h-3.5 w-3.5" />
              National Land Record Modernization & AI Verification
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Intelligent Land Records. <br />
              <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
                Verified Data. Better Governance.
              </span>
            </h1>
            <p className="mt-6 text-lg text-slate-300">
              Government-grade end-to-end platform for automated OCR extraction, multi-rule cadastral validation,
              GIS parcel visualization, and human-in-the-loop officer verification.
            </p>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/login"
                className="flex items-center gap-2 rounded-xl bg-cyan-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg hover:bg-cyan-500 transition"
              >
                Access Verification Workspace
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/map"
                className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/90 px-6 py-3.5 text-sm font-semibold text-slate-200 hover:bg-slate-800 hover:text-white transition"
              >
                <MapPin className="h-4 w-4 text-cyan-400" />
                Explore GIS Cadastral Map
              </Link>
            </div>
          </div>

          {/* Key Metrics Strip */}
          <div className="mt-16 grid grid-cols-2 gap-4 md:grid-cols-4 max-w-4xl mx-auto">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5 text-center">
              <div className="text-3xl font-bold text-white">{totalRecords}</div>
              <div className="mt-1 text-xs text-slate-400">Total Land Parcels</div>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5 text-center">
              <div className="text-3xl font-bold text-emerald-400">{verifiedRecords}</div>
              <div className="mt-1 text-xs text-slate-400">Fully Verified Records</div>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5 text-center">
              <div className="text-3xl font-bold text-cyan-400">{documentsProcessed}</div>
              <div className="mt-1 text-xs text-slate-400">Documents Processed</div>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5 text-center">
              <div className="text-3xl font-bold text-amber-400">94.2%</div>
              <div className="mt-1 text-xs text-slate-400">OCR Confidence Score</div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Capabilities Grid */}
      <section className="border-t border-slate-800 bg-slate-950 py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-cyan-400">Core Architecture</h2>
            <p className="mt-2 text-3xl font-bold text-white">Full Lifecycle Land Digitization</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 mb-4">
                <Cpu className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-white">OCR & AI Extraction</h3>
              <p className="mt-2 text-sm text-slate-400">
                Automated multi-page text extraction for 7/12 extracts, property cards, and sale deeds with per-field confidence scoring.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 mb-4">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-white">Validation Engine</h3>
              <p className="mt-2 text-sm text-slate-400">
                Detects duplicate IDs, format non-compliance, area discrepancies, and cross-checks spelling against historical rosters.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 mb-4">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-white">Human-in-the-Loop</h3>
              <p className="mt-2 text-sm text-slate-400">
                Interactive officer verification desk with side-by-side scanned document view, inline corrections, and immutable audit logs.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 mb-4">
                <MapPin className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-white">GIS Map Integration</h3>
              <p className="mt-2 text-sm text-slate-400">
                Cadastral parcel mapping using OpenStreetMap and Leaflet with interactive pins, district filtering, and property lookup.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-8 text-center text-xs text-slate-500">
        <p>BhoomiSetu AI • Developed for Smart India Hackathon (SIH 2026)</p>
        <p className="mt-1">Government-Grade Prototype for Intelligent Land Record Governance</p>
      </footer>
    </div>
  );
}
