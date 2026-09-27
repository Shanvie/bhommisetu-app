import { NextResponse } from "next/server";
import { loadAppData, updateSettings, appendAuditLog } from "@/lib/store";
import { getAuthenticatedUser } from "@/lib/auth";

export async function GET() {
  const data = await loadAppData();
  return NextResponse.json({ settings: data.settings });
}

export async function PATCH(request: Request) {
  const body = await request.json().catch(() => ({}));
  const currentUser = await getAuthenticatedUser();

  const updated = await updateSettings(body);

  await appendAuditLog({
    id: `audit-${Date.now()}`,
    userId: currentUser?.id || "admin",
    userName: currentUser?.name || "System Administrator",
    action: "SETTINGS_UPDATED",
    timestamp: new Date().toISOString(),
    ipAddress: "127.0.0.1",
    device: "Web Browser",
    newValue: JSON.stringify(body),
  });

  return NextResponse.json({ ok: true, settings: updated.settings });
}
