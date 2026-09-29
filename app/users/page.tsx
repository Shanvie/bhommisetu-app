"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import {
  Users,
  Plus,
  Shield,
  UserCheck,
  UserX,
  X,
  Mail,
  Building,
  CheckCircle2,
} from "lucide-react";
import type { User, UserRole } from "@/lib/types";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New user form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>("VERIFICATION_OFFICER");
  const [department, setDepartment] = useState("Land Verification Cell");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  function fetchUsers() {
    fetch("/api/users")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.users) setUsers(data.users);
      })
      .catch(() => {});
  }

  async function toggleUserStatus(id: string, currentActive: boolean) {
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentActive }),
      });

      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === id ? { ...u, isActive: !currentActive } : u)),
        );
        setNotification(`User status updated to ${!currentActive ? "Active" : "Inactive"}.`);
        setTimeout(() => setNotification(null), 3000);
      }
    } catch {}
  }

  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, role, department }),
      });

      if (res.ok) {
        const data = await res.json();
        setUsers((prev) => [data.user, ...prev]);
        setIsAddModalOpen(false);
        setName("");
        setEmail("");
        setNotification(`User ${data.user.name} created successfully!`);
        setTimeout(() => setNotification(null), 3000);
      } else {
        const err = await res.json();
        alert(err.error || "Failed to create user");
      }
    } catch (err: any) {
      alert("Error creating user: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  const roleLabels: Record<UserRole, string> = {
    SUPER_ADMIN: "Super Admin",
    GOVERNMENT_OFFICER: "Government Officer",
    VERIFICATION_OFFICER: "Verification Officer",
    DATA_ENTRY_OPERATOR: "Data Entry Operator",
    CITIZEN: "Citizen",
  };

  return (
    <AppShell
      title="User Management & RBAC"
      subtitle="Role-based access configuration and authorized government personnel directory"
    >
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Authorized Personnel</h2>
          <p className="text-xs text-slate-500">
            {users.length} registered officers and operators in the system
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 rounded-xl bg-cyan-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-cyan-500 transition"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Officer / User</span>
        </button>
      </div>

      {notification && (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-semibold text-emerald-900 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span>{notification}</span>
        </div>
      )}

      {/* Users Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-100 text-left text-xs">
          <thead className="bg-slate-50 font-semibold text-slate-600">
            <tr>
              <th className="px-5 py-3.5">Officer Name</th>
              <th className="px-5 py-3.5">Role</th>
              <th className="px-5 py-3.5">Department</th>
              <th className="px-5 py-3.5">Permissions</th>
              <th className="px-5 py-3.5">Status</th>
              <th className="px-5 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50/70 transition">
                <td className="px-5 py-3.5">
                  <div className="font-bold text-slate-900">{user.name}</div>
                  <div className="text-[11px] text-slate-400">{user.email}</div>
                </td>
                <td className="px-5 py-3.5">
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 font-semibold text-slate-700">
                    {roleLabels[user.role] || user.role}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-slate-600">{user.department}</td>
                <td className="px-5 py-3.5 text-slate-500">
                  <span className="truncate max-w-[200px] inline-block">
                    {user.permissions ? user.permissions.join(", ") : "Standard"}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <span
                    className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                      user.isActive ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
                    }`}
                  >
                    {user.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-right">
                  <button
                    type="button"
                    onClick={() => toggleUserStatus(user.id, user.isActive)}
                    className={`rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition ${
                      user.isActive
                        ? "border-red-200 text-red-600 hover:bg-red-50"
                        : "border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                    }`}
                  >
                    {user.isActive ? "Deactivate" : "Activate"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add User Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-base font-bold text-slate-900">Add New User Account</h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="e.g. Ramesh Deshmukh"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-slate-800 outline-none focus:border-cyan-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Work Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name@example.com"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-slate-800 outline-none focus:border-cyan-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Assigned Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-800 outline-none focus:border-cyan-600"
                  >
                    <option value="SUPER_ADMIN">Super Admin</option>
                    <option value="GOVERNMENT_OFFICER">Government Officer</option>
                    <option value="VERIFICATION_OFFICER">Verification Officer</option>
                    <option value="DATA_ENTRY_OPERATOR">Data Entry Operator</option>
                    <option value="CITIZEN">Citizen</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Department</label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    required
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-slate-800 outline-none focus:border-cyan-600"
                  />
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-cyan-600 px-4 py-2 font-bold text-white shadow hover:bg-cyan-500 disabled:opacity-60"
                >
                  {isSubmitting ? "Creating..." : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
