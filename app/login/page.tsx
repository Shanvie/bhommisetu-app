"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, ArrowRight, Sparkles, UserCheck, Lock, Mail } from "lucide-react";

const DEMO_PERSONAS = [
  {
    role: "Verification Officer",
    email: "verification.officer@example.com",
    department: "Land Verification Cell",
    badge: "Recommended for Demo",
  },
  {
    role: "Government Officer",
    email: "government.officer@example.com",
    department: "Revenue Department",
    badge: "Approvals & Reports",
  },
  {
    role: "Super Admin",
    email: "super.admin@example.com",
    department: "State IT Cell",
    badge: "Full Control",
  },
  {
    role: "Data Entry Operator",
    email: "data.entry@example.com",
    department: "District Record Desk",
    badge: "Uploads",
  },
  {
    role: "Citizen",
    email: "citizen@example.com",
    department: "Public Access",
    badge: "View Only",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("verification.officer@example.com");
  const [password, setPassword] = useState("Password@123");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function performLogin(targetEmail: string, targetPass: string) {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: targetEmail, password: targetPass }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({ error: "Login failed." }));
        setError(data.error || "Invalid credentials.");
        setIsLoading(false);
        return;
      }

      router.push("/dashboard");
    } catch {
      setError("Network error. Please try again.");
      setIsLoading(false);
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    await performLogin(email, password);
  }

  function handleSelectPersona(personaEmail: string) {
    setEmail(personaEmail);
    setPassword("Password@123");
    performLogin(personaEmail, "Password@123");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 shadow-2xl">
        <div className="grid lg:grid-cols-[1.1fr_1.3fr]">
          {/* Left Hero Panel */}
          <div className="relative bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950 p-8 sm:p-10 text-white flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-cyan-600 to-emerald-400 text-xs font-bold text-slate-950">
                  BS
                </div>
                <span className="text-sm font-bold tracking-[0.2em] text-cyan-300">BHOOMISETU AI</span>
              </div>

              <div className="mt-8">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-300">
                  <Sparkles className="h-3 w-3" /> Smart India Hackathon 2026
                </span>
                <h1 className="mt-4 text-3xl sm:text-4xl font-extrabold leading-tight text-white">
                  Intelligent Land Records. <br />
                  <span className="text-cyan-400">Verified Data.</span>
                </h1>
                <p className="mt-4 text-sm text-slate-300 leading-relaxed">
                  Independent prototype for sample document processing, record validation, and review workflows.
                </p>
              </div>

              {/* 1-Click Persona Selector */}
              <div className="mt-8">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center justify-between">
                  <span>1-Click Demo Login</span>
                  <span className="text-[10px] text-cyan-400 font-normal">Click to sign in instantly</span>
                </div>
                <div className="space-y-2">
                  {DEMO_PERSONAS.map((persona) => (
                    <button
                      key={persona.email}
                      type="button"
                      onClick={() => handleSelectPersona(persona.email)}
                      className={`w-full text-left rounded-xl border p-2.5 transition flex items-center justify-between group ${
                        email === persona.email
                          ? "border-cyan-500 bg-cyan-950/40 text-white ring-1 ring-cyan-500"
                          : "border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700 hover:bg-slate-800/80"
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <div className="text-xs font-semibold text-white group-hover:text-cyan-300 transition">
                          {persona.role}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate">{persona.department}</div>
                      </div>
                      <span className="shrink-0 text-[10px] font-medium bg-slate-800 px-2 py-0.5 rounded text-slate-300 group-hover:bg-cyan-900/60 group-hover:text-cyan-200">
                        {persona.badge}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-800/80 text-[11px] text-slate-500 flex justify-between">
              <span>Sample workspace • Not a government service</span>
              <Link href="/" className="text-cyan-400 hover:underline">
                Portal Home
              </Link>
            </div>
          </div>

          {/* Right Form Panel */}
          <div className="bg-slate-900/40 p-8 sm:p-10 flex flex-col justify-center">
            <div className="mb-6">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">Security Credentials</div>
              <h2 className="mt-1 text-2xl font-bold text-white">Sign in to officer workstation</h2>
              <p className="mt-1 text-xs text-slate-400">
                Use any of the demo accounts above, or enter credentials manually.
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-300">Authorized Email</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-10 pr-3 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-300">Password</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-10 pr-3 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
                    placeholder="••••••••"
                  />
                </div>
                <div className="mt-1.5 text-[11px] text-slate-400">Default demo password for all accounts is: <code className="text-cyan-300">Password@123</code></div>
              </div>

              {error && (
                <div className="rounded-xl border border-red-500/30 bg-red-950/40 px-3.5 py-2.5 text-xs text-red-300 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-red-400 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-xl bg-cyan-600 px-4 py-3 text-sm font-semibold text-white shadow-lg hover:bg-cyan-500 transition flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isLoading ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>Enter Workstation</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 rounded-xl border border-slate-800 bg-slate-950 p-3.5 text-xs text-slate-400">
              <div className="font-semibold text-slate-200">Role-Based Access Simulation</div>
              <p className="mt-1 text-[11px]">
                Features like Human-in-the-Loop review, system settings, user management, and document uploads dynamically reflect the selected officer profile.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
