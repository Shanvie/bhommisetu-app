import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { loadAppData } from "@/lib/store";
import {
  FileText,
  UploadCloud,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  Filter,
} from "lucide-react";

export default async function DocumentsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; status?: string; q?: string }>;
}) {
  const params = await searchParams;
  const data = await loadAppData();

  const typeFilter = params.type || "ALL";
  const statusFilter = params.status || "ALL";
  const query = (params.q || "").toLowerCase().trim();

  const filteredDocs = data.documents.filter((doc) => {
    const matchesType = typeFilter === "ALL" || doc.documentType === typeFilter;
    const matchesStatus = statusFilter === "ALL" || doc.verificationStatus === statusFilter;
    const matchesQuery =
      !query ||
      doc.title.toLowerCase().includes(query) ||
      doc.fileName.toLowerCase().includes(query) ||
      String(doc.metadata?.village || "").toLowerCase().includes(query) ||
      String(doc.metadata?.district || "").toLowerCase().includes(query);

    return matchesType && matchesStatus && matchesQuery;
  });

  return (
    <AppShell title="Document Registry" subtitle="Digital repository of uploaded and OCR-processed land records">
      {/* Header Controls */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Digitized Record Documents</h2>
          <p className="text-xs text-slate-500">
            {filteredDocs.length} of {data.documents.length} documents displayed
          </p>
        </div>

        <Link
          href="/documents/upload"
          className="flex items-center gap-2 rounded-xl bg-cyan-600 px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-cyan-500 transition"
        >
          <UploadCloud className="h-4 w-4" />
          <span>Upload Document</span>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6 flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3 text-xs">
        <Link
          href="/documents"
          className={`rounded-lg px-3 py-1.5 font-medium transition ${
            typeFilter === "ALL" ? "bg-slate-900 text-white" : "bg-white text-slate-600 hover:bg-slate-50"
          }`}
        >
          All Types ({data.documents.length})
        </Link>
        {["7/12 Extract", "Property Card", "Sale Deed"].map((t) => {
          const count = data.documents.filter((d) => d.documentType === t).length;
          return (
            <Link
              key={t}
              href={`/documents?type=${encodeURIComponent(t)}`}
              className={`rounded-lg px-3 py-1.5 font-medium transition ${
                typeFilter === t ? "bg-slate-900 text-white" : "bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {t} ({count})
            </Link>
          );
        })}
      </div>

      {/* Documents Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
          <thead className="bg-slate-50 font-semibold text-slate-600">
            <tr>
              <th className="px-5 py-3.5">Document Title</th>
              <th className="px-5 py-3.5">Category</th>
              <th className="px-5 py-3.5">Location</th>
              <th className="px-5 py-3.5">Verification Status</th>
              <th className="px-5 py-3.5">OCR Confidence</th>
              <th className="px-5 py-3.5">File Size</th>
              <th className="px-5 py-3.5">Uploaded</th>
              <th className="px-5 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {filteredDocs.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-slate-500">
                  No documents found matching the filter criteria.
                </td>
              </tr>
            ) : (
              filteredDocs.map((document) => (
                <tr key={document.id} className="hover:bg-slate-50/70 transition">
                  <td className="px-5 py-3.5 font-semibold text-slate-900">
                    <Link href={`/documents/${document.id}`} className="hover:text-cyan-600">
                      {document.title}
                    </Link>
                    <div className="text-[11px] text-slate-400 font-normal">{document.fileName}</div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 font-medium text-slate-700">
                      {document.documentType}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    {String(document.metadata?.village || "Shivajinagar")},{" "}
                    {String(document.metadata?.district || "Pune")}
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        document.verificationStatus === "VERIFIED"
                          ? "bg-emerald-100 text-emerald-800"
                          : document.verificationStatus === "PENDING"
                            ? "bg-amber-100 text-amber-800"
                            : document.verificationStatus === "IN_REVIEW"
                              ? "bg-cyan-100 text-cyan-800"
                              : "bg-red-100 text-red-800"
                      }`}
                    >
                      {document.verificationStatus}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 font-semibold text-slate-800">
                    {document.confidence ? `${Math.round(document.confidence * 100)}%` : "N/A"}
                  </td>
                  <td className="px-5 py-3.5 text-slate-500">
                    {(document.size / 1024 / 1024).toFixed(2)} MB
                  </td>
                  <td className="px-5 py-3.5 text-slate-500">
                    {new Date(document.uploadedAt).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/documents/${document.id}`}
                        className="rounded-lg border border-slate-200 px-2.5 py-1 font-semibold text-slate-700 hover:bg-slate-50 transition"
                      >
                        Inspect
                      </Link>
                      {document.recordId && (
                        <Link
                          href={`/verification?recordId=${document.recordId}`}
                          className="rounded-lg bg-cyan-600 px-2.5 py-1 font-semibold text-white hover:bg-cyan-500 transition"
                        >
                          Verify
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
