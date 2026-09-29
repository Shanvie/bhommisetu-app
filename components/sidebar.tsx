"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  FileText,
  Map,
  Search,
  ShieldCheck,
  Users,
  Bell,
  Settings,
  ClipboardCheck,
  Landmark,
  LogOut,
  X,
  Sparkles,
} from "lucide-react";
import type { User } from "@/lib/types";

const items = [
  { href: "/dashboard", label: "Dashboard", icon: Activity },
  { href: "/documents", label: "Documents", icon: FileText },
  { href: "/verification", label: "Verification", icon: ClipboardCheck },
  { href: "/land-records", label: "Land Records", icon: Landmark },
  { href: "/map", label: "Map", icon: Map },
  { href: "/search", label: "Search", icon: Search },
  { href: "/reports", label: "Reports", icon: ShieldCheck },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/users", label: "Users", icon: Users },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/audit-logs", label: "Audit Logs", icon: ClipboardCheck },
];

interface SidebarProps {
  onClose?: () => void;
  currentUser?: User | null;
  unreadCount?: number;
}

export function Sidebar({ onClose, currentUser: initialUser, unreadCount = 0 }: SidebarProps) {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(initialUser ?? null);

  useEffect(() => {
    if (!user) {
      fetch("/api/auth/me")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.user) setUser(data.user);
        })
        .catch(() => {});
    }
  }, [user]);

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {}
    window.location.href = "/login";
  }

  const roleLabels: Record<string, string> = {
    SUPER_ADMIN: "Super Administrator",
    GOVERNMENT_OFFICER: "Government Officer",
    VERIFICATION_OFFICER: "Verification Officer",
    DATA_ENTRY_OPERATOR: "Data Entry Operator",
    CITIZEN: "Citizen Portal",
  };

  return (
    <aside className="flex h-full min-h-screen w-72 flex-col border-r border-slate-800 bg-slate-950 p-6 text-slate-100">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Image src="/bhoomisetu-mark.svg" alt="" width={28} height={28} />
            <span className="text-base font-bold tracking-[0.18em] text-white">BHOOMISETU</span>
            <span className="rounded bg-cyan-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-cyan-300 ring-1 ring-cyan-500/40">
              AI
            </span>
          </div>
          <div className="mt-1.5 text-xs text-slate-400">Independent prototype</div>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white md:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <div className="mb-4 rounded-xl border border-slate-800 bg-slate-900/70 p-3 text-xs text-slate-300">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-cyan-400">
          <Sparkles className="h-3 w-3" /> SIH Smart India Hackathon
        </div>
        <div className="mt-1 text-slate-400">Land Record Digitization & Verification Engine</div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto pr-1">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          const isNotification = href === "/notifications";

          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                active
                  ? "bg-cyan-500/20 text-white ring-1 ring-cyan-500/40 shadow-sm"
                  : "text-slate-300 hover:bg-slate-900 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`h-4 w-4 ${active ? "text-cyan-400" : "text-slate-400"}`} />
                <span>{label}</span>
              </div>
              {isNotification && unreadCount > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-cyan-500 text-[10px] font-bold text-slate-950">
                  {unreadCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-3.5 text-xs text-slate-300">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-cyan-600 to-blue-500 text-xs font-bold text-white shadow-inner">
              {user ? user.name.charAt(0) : "V"}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate font-semibold text-white">{user?.name || "Aniket Kulkarni"}</div>
              <div className="truncate text-[11px] text-cyan-300">
                {user ? roleLabels[user.role] || user.role : "Verification Officer"}
              </div>
            </div>
          </div>
          <div className="mt-2.5 flex items-center justify-between border-t border-slate-800/80 pt-2 text-[11px] text-slate-400">
            <span>{user?.department || "Revenue Cell"}</span>
            <button
              type="button"
              className="inline-flex items-center gap-1 font-medium text-red-400 transition hover:text-red-300"
              onClick={handleLogout}
            >
              <LogOut className="h-3 w-3" />
              Sign out
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
