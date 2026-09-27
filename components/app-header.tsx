"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, Bell, Search, RefreshCw, UserCheck, ShieldAlert } from "lucide-react";
import type { User, UserRole } from "@/lib/types";

interface AppHeaderProps {
  onMenuToggle?: () => void;
  title?: string;
  subtitle?: string;
}

export function AppHeader({ onMenuToggle, title, subtitle }: AppHeaderProps) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isResetting, setIsResetting] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) setUser(data.user);
      })
      .catch(() => {});

    fetch("/api/notifications")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.notifications) {
          const unread = data.notifications.filter((n: { read: boolean }) => !n.read).length;
          setUnreadCount(unread);
        }
      })
      .catch(() => {});
  }, []);

  async function handleQuickRoleSwitch(roleEmail: string) {
    setShowRoleMenu(false);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: roleEmail, password: "Password@123" }),
      });
      if (res.ok) {
        window.location.reload();
      }
    } catch {}
  }

  async function handleResetDemoData() {
    if (!window.confirm("Reset all land records and documents to initial demonstration data?")) return;
    setIsResetting(true);
    try {
      await fetch("/api/reset", { method: "POST" });
      window.location.reload();
    } catch (err) {
      console.error(err);
      setIsResetting(false);
    }
  }

  const roleLabels: Record<UserRole, string> = {
    SUPER_ADMIN: "Super Admin",
    GOVERNMENT_OFFICER: "Govt Officer",
    VERIFICATION_OFFICER: "Verification Off.",
    DATA_ENTRY_OPERATOR: "Data Entry",
    CITIZEN: "Citizen",
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur-md lg:px-8">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuToggle}
          className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-100 md:hidden"
          aria-label="Toggle navigation"
        >
          <Menu className="h-5 w-5" />
        </button>

        {title ? (
          <div>
            <h1 className="text-lg font-bold text-slate-900 md:text-xl">{title}</h1>
            {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
          </div>
        ) : (
          <div className="hidden sm:block">
            <span className="text-xs font-semibold uppercase tracking-wider text-cyan-700">BhoomiSetu AI</span>
            <div className="text-sm font-medium text-slate-700">Department of Revenue & Land Records</div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Search */}
        <Link
          href="/search"
          className="hidden sm:flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition"
        >
          <Search className="h-3.5 w-3.5" />
          <span>Quick search...</span>
        </Link>

        {/* Notifications Icon with Badge */}
        <Link
          href="/notifications"
          className="relative rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
          title="Notifications"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[9px] font-bold text-white shadow">
              {unreadCount}
            </span>
          )}
        </Link>

        {/* Reset Demo Data Button */}
        <button
          type="button"
          onClick={handleResetDemoData}
          disabled={isResetting}
          title="Reset database to clean demo state"
          className="hidden md:inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isResetting ? "animate-spin" : ""}`} />
          <span>{isResetting ? "Resetting..." : "Reset Data"}</span>
        </button>

        {/* Role Switcher Pill */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowRoleMenu((prev) => !prev)}
            className="flex items-center gap-2 rounded-xl border border-cyan-200 bg-cyan-50/80 px-2.5 py-1.5 text-xs font-medium text-cyan-900 transition hover:bg-cyan-100"
          >
            <UserCheck className="h-3.5 w-3.5 text-cyan-600" />
            <span className="hidden sm:inline">Role:</span>
            <span className="font-semibold text-cyan-800">
              {user?.role ? roleLabels[user.role] : "Officer"}
            </span>
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl z-50">
              <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                Switch Demo Persona
              </div>
              <div className="space-y-1 py-1">
                {[
                  { name: "Super Admin", email: "super.admin@bhoomisetu.gov.in", desc: "Full administrative controls" },
                  { name: "Government Officer", email: "government.officer@bhoomisetu.gov.in", desc: "Revenue & approvals" },
                  { name: "Verification Officer", email: "verification.officer@bhoomisetu.gov.in", desc: "OCR validation desk" },
                  { name: "Data Entry Operator", email: "data.entry@bhoomisetu.gov.in", desc: "Document uploads" },
                  { name: "Citizen User", email: "citizen@example.com", desc: "Public search portal" },
                ].map((item) => (
                  <button
                    key={item.email}
                    type="button"
                    onClick={() => handleQuickRoleSwitch(item.email)}
                    className="w-full text-left rounded-lg px-3 py-2 text-xs hover:bg-slate-100 transition"
                  >
                    <div className="font-semibold text-slate-800">{item.name}</div>
                    <div className="text-[11px] text-slate-400">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
