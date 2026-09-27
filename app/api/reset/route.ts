import { NextResponse } from "next/server";
import { resetAppData, appendAuditLog } from "@/lib/store";
import { getAuthenticatedUser } from "@/lib/auth";

export async function POST() {
  const user = await getAuthenticatedUser();
  const resetData = await resetAppData();

  await appendAuditLog({
    id: `audit-${Date.now()}`,
    userId: user?.id || "admin",
    userName: user?.name || "System Administrator",
    action: "SYSTEM_RESET",
    timestamp: new Date().toISOString(),
    ipAddress: "127.0.0.1",
    device: "Web Browser",
    newValue: "Demo data reset to initial baseline",
  });

  return NextResponse.json({ ok: true, message: "System data reset to initial demo state", data: resetData });
}
