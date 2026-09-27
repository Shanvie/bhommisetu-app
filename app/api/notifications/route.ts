import { NextResponse } from "next/server";
import { loadAppData, updateNotification, markAllNotificationsRead, clearAllNotifications, appendAuditLog } from "@/lib/store";
import { getAuthenticatedUser } from "@/lib/auth";

export async function GET() {
  const data = await loadAppData();
  return NextResponse.json({ notifications: data.notifications });
}

export async function PATCH(request: Request) {
  const body = await request.json().catch(() => ({}));
  const user = await getAuthenticatedUser();

  if (body.action === "markAllRead") {
    const updated = await markAllNotificationsRead();
    return NextResponse.json({ ok: true, notifications: updated.notifications });
  }

  if (body.id) {
    const updated = await updateNotification(body.id, { read: Boolean(body.read ?? true) });
    return NextResponse.json({ ok: true, notifications: updated.notifications });
  }

  return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
}

export async function DELETE() {
  const updated = await clearAllNotifications();
  return NextResponse.json({ ok: true, notifications: updated.notifications });
}
