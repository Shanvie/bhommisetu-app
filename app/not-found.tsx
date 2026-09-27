import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="text-sm uppercase tracking-[0.25em] text-slate-500">404</div>
        <h1 className="mt-3 text-3xl font-bold text-slate-900">Page not found</h1>
        <p className="mt-3 text-slate-600">The requested record or dashboard view does not exist.</p>
        <Link href="/login" className="mt-6 inline-block rounded-lg bg-cyan-600 px-4 py-2.5 text-sm font-semibold text-white">
          Return to login
        </Link>
      </div>
    </div>
  );
}
