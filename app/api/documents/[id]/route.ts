import { NextResponse } from "next/server";
import { loadAppData, deleteDocument, appendAuditLog } from "@/lib/store";
import { getAuthenticatedUser } from "@/lib/auth";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await loadAppData();
  const document = data.documents.find((item) => item.id === id);

  if (!document) {
    return NextResponse.json({ error: "Document not found." }, { status: 404 });
  }

  const linkedRecord = document.recordId
    ? data.landRecords.find((r) => r.id === document.recordId)
    : null;

  return NextResponse.json({ document, linkedRecord });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const currentUser = await getAuthenticatedUser();
  const data = await loadAppData();

  const document = data.documents.find((item) => item.id === id);
  if (!document) {
    return NextResponse.json({ error: "Document not found." }, { status: 404 });
  }

  await deleteDocument(id);

  await appendAuditLog({
    id: `audit-${Date.now()}`,
    userId: currentUser?.id || "admin",
    userName: currentUser?.name || "System Administrator",
    action: "DOCUMENT_DELETED",
    recordId: id,
    timestamp: new Date().toISOString(),
    ipAddress: "127.0.0.1",
    device: "Web Browser",
    oldValue: `Deleted document ${document.title} (${document.fileName})`,
  });

  return NextResponse.json({ ok: true, message: "Document deleted" });
}
