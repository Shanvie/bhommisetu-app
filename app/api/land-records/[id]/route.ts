import { NextResponse } from "next/server";
import { loadAppData, upsertLandRecord, upsertDocument, deleteLandRecord, appendAuditLog, appendNotification } from "@/lib/store";
import { getAuthenticatedUser } from "@/lib/auth";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await loadAppData();
  const record = data.landRecords.find((item) => item.id === id);

  if (!record) {
    return NextResponse.json({ error: "Land record not found." }, { status: 404 });
  }

  const linkedDocument = data.documents.find((d) => d.recordId === id);

  return NextResponse.json({ record, linkedDocument });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const currentUser = await getAuthenticatedUser();
  const data = await loadAppData();
  const record = data.landRecords.find((item) => item.id === id);

  if (!record) {
    return NextResponse.json({ error: "Land record not found." }, { status: 404 });
  }

  const previousStatus = record.verificationStatus;
  const newComments = Array.isArray(body.comments)
    ? body.comments
    : body.comment
      ? [...(record.comments || []), `[${currentUser?.name || "Officer"}]: ${body.comment}`]
      : record.comments;

  const updatedRecord = {
    ...record,
    ...body,
    comments: newComments,
    lastUpdated: new Date().toISOString(),
  };

  await upsertLandRecord(updatedRecord);

  // Sync verificationStatus with linked document if present
  const linkedDoc = data.documents.find((d) => d.recordId === id);
  if (linkedDoc && body.verificationStatus) {
    await upsertDocument({
      ...linkedDoc,
      verificationStatus: body.verificationStatus,
      status: body.verificationStatus === "VERIFIED" ? "VERIFIED" : body.verificationStatus === "REJECTED" ? "REJECTED" : "VALIDATED",
    });
  }

  // Audit log
  const action = body.verificationStatus && body.verificationStatus !== previousStatus
    ? body.verificationStatus === "VERIFIED"
      ? "RECORD_VERIFIED"
      : body.verificationStatus === "REJECTED"
        ? "RECORD_REJECTED"
        : "RECORD_FLAGGED"
    : "RECORD_UPDATED";

  await appendAuditLog({
    id: `audit-${Date.now()}`,
    userId: currentUser?.id || "usr-1003",
    userName: currentUser?.name || "Verification Officer",
    action,
    recordId: id,
    timestamp: new Date().toISOString(),
    ipAddress: "127.0.0.1",
    device: "Web Browser",
    newValue: `Status: ${updatedRecord.verificationStatus}, Notes: ${body.comment || "Updated fields"}`,
  });

  if (body.verificationStatus && body.verificationStatus !== previousStatus) {
    await appendNotification({
      id: `ntf-${Date.now()}`,
      title: `Record ${updatedRecord.propertyId} ${updatedRecord.verificationStatus}`,
      message: `Property ${updatedRecord.propertyId} (${updatedRecord.ownerName}) marked ${updatedRecord.verificationStatus} by ${currentUser?.name || "Officer"}.`,
      type: updatedRecord.verificationStatus === "VERIFIED" ? "SUCCESS" : updatedRecord.verificationStatus === "REJECTED" ? "ERROR" : "WARNING",
      read: false,
      createdAt: new Date().toISOString(),
    });
  }

  return NextResponse.json({ ok: true, record: updatedRecord });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const currentUser = await getAuthenticatedUser();
  const data = await loadAppData();

  const record = data.landRecords.find((item) => item.id === id);
  if (!record) {
    return NextResponse.json({ error: "Land record not found." }, { status: 404 });
  }

  await deleteLandRecord(id);

  await appendAuditLog({
    id: `audit-${Date.now()}`,
    userId: currentUser?.id || "admin",
    userName: currentUser?.name || "System Administrator",
    action: "RECORD_DELETED",
    recordId: id,
    timestamp: new Date().toISOString(),
    ipAddress: "127.0.0.1",
    device: "Web Browser",
    oldValue: `Deleted record ${record.propertyId} (${record.ownerName})`,
  });

  return NextResponse.json({ ok: true, message: "Land record deleted" });
}
