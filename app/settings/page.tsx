"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import {
  Settings,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Save,
  Sliders,
  FileText,
  AlertTriangle,
} from "lucide-react";
import type { SystemSettings } from "@/lib/types";

export default function SettingsPage() {
  const [settings, setSettings] = useState<SystemSettings>({
    autoOcrEnabled: true,
    strictValidation: true,
    maxAreaThreshold: 100000,
    allowedDocumentTypes: ["7/12 Extract", "Property Card", "Sale Deed", "Mutation Record", "8A Khatauni"],
    departmentName: "Revenue & Land Records Department",
    stateName: "Maharashtra",
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.settings) setSettings(data.settings);
      })
      .catch(() => {});
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    setNotification(null);

    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        setNotification({ type: "success", message: "System configuration saved successfully!" });
      } else {
        throw new Error("Failed to save settings");
      }
    } catch (err: any) {
      setNotification({ type: "error", message: err.message });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleResetData() {
    if (!window.confirm("Are you sure you want to reset all land records, documents, and notifications back to the SIH demonstration baseline?")) return;
    setIsResetting(true);

    try {
      const res = await fetch("/api/reset", { method: "POST" });
      if (res.ok) {
        setNotification({ type: "success", message: "Demonstration baseline data restored successfully!" });
        setTimeout(() => window.location.reload(), 1200);
      }
    } catch {
      setNotification({ type: "error", message: "Failed to reset data." });
    } finally {
      setIsResetting(false);
    }
  }

  function toggleDocType(type: string) {
    setSettings((prev) => {
      const exists = prev.allowedDocumentTypes.includes(type);
      const next = exists
        ? prev.allowedDocumentTypes.filter((t) => t !== type)
        : [...prev.allowedDocumentTypes, type];
      return { ...prev, allowedDocumentTypes: next };
    });
  }

  return (
    <AppShell
      title="System Configuration & Validation Rules"
      subtitle="Configure ingestion pipeline, cadastral rule thresholds, and demo environment"
    >
      {notification && (
        <div
          className={`mb-6 rounded-2xl border p-4 text-xs font-semibold flex items-center justify-between ${
            notification.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-900"
              : "border-red-200 bg-red-50 text-red-900"
          }`}
        >
          <span>{notification.message}</span>
          <button type="button" onClick={() => setNotification(null)} className="opacity-70 hover:opacity-100">
            Dismiss
          </button>
        </div>
      )}

      <form onSubmit={handleSave} className="grid gap-6 lg:grid-cols-2">
        {/* Validation Engine Rules Config */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
            <Sliders className="h-4 w-4 text-cyan-600" />
            <h3 className="font-bold text-slate-900 text-sm">Validation Engine Rules & Thresholds</h3>
          </div>

          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between rounded-xl border border-slate-200 p-3">
              <div>
                <div className="font-bold text-slate-800">Automated OCR Preprocessing</div>
                <div className="text-slate-500">Apply adaptive binarization and contrast enhancement</div>
              </div>
              <input
                type="checkbox"
                checked={settings.autoOcrEnabled}
                onChange={(e) => setSettings({ ...settings, autoOcrEnabled: e.target.checked })}
                className="h-4 w-4 rounded text-cyan-600 focus:ring-cyan-500"
              />
            </div>

            <div className="flex items-center justify-between rounded-xl border border-slate-200 p-3">
              <div>
                <div className="font-bold text-slate-800">Strict Cadastral Bounds Verification</div>
                <div className="text-slate-500">Enforce territorial coordinates within state boundary</div>
              </div>
              <input
                type="checkbox"
                checked={settings.strictValidation}
                onChange={(e) => setSettings({ ...settings, strictValidation: e.target.checked })}
                className="h-4 w-4 rounded text-cyan-600 focus:ring-cyan-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Max Allowed Plot Area Warning Threshold (Sq. Meters)
              </label>
              <input
                type="number"
                value={settings.maxAreaThreshold}
                onChange={(e) => setSettings({ ...settings, maxAreaThreshold: Number(e.target.value) })}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 outline-none focus:border-cyan-600"
              />
              <p className="mt-1 text-[11px] text-slate-400">
                Parcels exceeding this area will be automatically flagged for high-level officer verification.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Department Header</label>
                <input
                  type="text"
                  value={settings.departmentName}
                  onChange={(e) => setSettings({ ...settings, departmentName: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 outline-none focus:border-cyan-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">State Jurisdiction</label>
                <input
                  type="text"
                  value={settings.stateName}
                  onChange={(e) => setSettings({ ...settings, stateName: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 outline-none focus:border-cyan-600"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Supported Document Types & Demo Controls */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
              <FileText className="h-4 w-4 text-cyan-600" />
              <h3 className="font-bold text-slate-900 text-sm">Supported Cadastral Document Types</h3>
            </div>

            <div className="space-y-2.5 text-xs">
              {["7/12 Extract", "Property Card", "Sale Deed", "Mutation Record", "8A Khatauni"].map((type) => {
                const isChecked = settings.allowedDocumentTypes.includes(type);

                return (
                  <label
                    key={type}
                    className="flex items-center justify-between rounded-xl border border-slate-200 p-3 cursor-pointer hover:bg-slate-50 transition"
                  >
                    <span className="font-semibold text-slate-800">{type}</span>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleDocType(type)}
                      className="h-4 w-4 rounded text-cyan-600 focus:ring-cyan-500"
                    />
                  </label>
                );
              })}
            </div>
          </div>

          {/* Reset Environment Card */}
          <div className="rounded-2xl border border-red-200 bg-red-50/40 p-6 shadow-sm">
            <h3 className="font-bold text-red-900 text-sm mb-1">Demonstration Data Management</h3>
            <p className="text-xs text-red-700 mb-4">
              Reset all uploaded documents, processed parcel records, and audit logs back to the default SIH Hackathon presentation baseline.
            </p>

            <button
              type="button"
              disabled={isResetting}
              onClick={handleResetData}
              className="flex items-center gap-2 rounded-xl border border-red-300 bg-white px-4 py-2 text-xs font-bold text-red-700 shadow-sm hover:bg-red-50 transition disabled:opacity-60"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isResetting ? "animate-spin" : ""}`} />
              <span>{isResetting ? "Resetting Environment..." : "Reset All Data to Baseline"}</span>
            </button>
          </div>
        </div>

        <div className="col-span-full flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 rounded-xl bg-cyan-600 px-6 py-2.5 text-xs font-bold text-white shadow hover:bg-cyan-500 transition disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            <span>{isSaving ? "Saving Settings..." : "Save System Configuration"}</span>
          </button>
        </div>
      </form>
    </AppShell>
  );
}
