"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Info,
  XCircle,
  Check,
  Trash2,
  Filter,
} from "lucide-react";
import type { NotificationItem } from "@/lib/types";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [filter, setFilter] = useState<"ALL" | "UNREAD" | "WARNING" | "ERROR">("ALL");

  useEffect(() => {
    fetchNotifications();
  }, []);

  function fetchNotifications() {
    fetch("/api/notifications")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.notifications) setNotifications(data.notifications);
      })
      .catch(() => {});
  }

  async function markAsRead(id: string) {
    try {
      const res = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, read: true }),
      });
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
      }
    } catch {}
  }

  async function markAllAsRead() {
    try {
      const res = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "markAllRead" }),
      });
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      }
    } catch {}
  }

  async function clearAll() {
    if (!window.confirm("Clear all notifications?")) return;
    try {
      const res = await fetch("/api/notifications", { method: "DELETE" });
      if (res.ok) setNotifications([]);
    } catch {}
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filtered = notifications.filter((n) => {
    if (filter === "UNREAD") return !n.read;
    if (filter === "WARNING") return n.type === "WARNING";
    if (filter === "ERROR") return n.type === "ERROR";
    return true;
  });

  return (
    <AppShell
      title="Notification & Alerts Hub"
      subtitle="System status alerts, ingestion updates, and verification queue reminders"
    >
      {/* Top Header Actions */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-800">
            {notifications.length} Notifications
          </span>
          {unreadCount > 0 && (
            <span className="rounded-full bg-cyan-100 px-2.5 py-0.5 text-xs font-bold text-cyan-800">
              {unreadCount} unread
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllAsRead}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              <Check className="h-3.5 w-3.5 text-cyan-600" />
              <span>Mark all as read</span>
            </button>
          )}

          {notifications.length > 0 && (
            <button
              type="button"
              onClick={clearAll}
              className="flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50/50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100 transition"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Clear all</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6 flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3 text-xs">
        <button
          type="button"
          onClick={() => setFilter("ALL")}
          className={`rounded-lg px-3 py-1.5 font-semibold transition ${
            filter === "ALL" ? "bg-slate-900 text-white" : "bg-white text-slate-600 hover:bg-slate-50"
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          type="button"
          onClick={() => setFilter("UNREAD")}
          className={`rounded-lg px-3 py-1.5 font-semibold transition ${
            filter === "UNREAD" ? "bg-slate-900 text-white" : "bg-white text-slate-600 hover:bg-slate-50"
          }`}
        >
          Unread ({unreadCount})
        </button>
        <button
          type="button"
          onClick={() => setFilter("WARNING")}
          className={`rounded-lg px-3 py-1.5 font-semibold transition ${
            filter === "WARNING" ? "bg-slate-900 text-white" : "bg-white text-slate-600 hover:bg-slate-50"
          }`}
        >
          Warnings
        </button>
        <button
          type="button"
          onClick={() => setFilter("ERROR")}
          className={`rounded-lg px-3 py-1.5 font-semibold transition ${
            filter === "ERROR" ? "bg-slate-900 text-white" : "bg-white text-slate-600 hover:bg-slate-50"
          }`}
        >
          Errors
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-500 text-xs">
            No notifications found in this view.
          </div>
        ) : (
          filtered.map((item) => {
            const isUnread = !item.read;

            return (
              <div
                key={item.id}
                className={`relative flex items-start justify-between rounded-2xl border p-4 text-xs transition ${
                  isUnread
                    ? "border-cyan-200 bg-cyan-50/40 shadow-sm"
                    : "border-slate-200 bg-white opacity-80 hover:opacity-100"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {item.type === "SUCCESS" ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    ) : item.type === "WARNING" ? (
                      <AlertTriangle className="h-5 w-5 text-amber-500" />
                    ) : item.type === "ERROR" ? (
                      <XCircle className="h-5 w-5 text-red-600" />
                    ) : (
                      <Info className="h-5 w-5 text-blue-500" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{item.title}</span>
                      {isUnread && (
                        <span className="h-2 w-2 rounded-full bg-cyan-600 animate-pulse" />
                      )}
                    </div>
                    <p className="mt-1 text-slate-600 leading-relaxed">{item.message}</p>
                    <div className="mt-2 text-[10px] text-slate-400">
                      {new Date(item.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>

                {isUnread && (
                  <button
                    type="button"
                    onClick={() => markAsRead(item.id)}
                    className="shrink-0 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 shadow-sm transition"
                  >
                    Mark read
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </AppShell>
  );
}
