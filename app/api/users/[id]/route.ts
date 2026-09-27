import { NextResponse } from "next/server";
import { loadAppData, updateUser, appendAuditLog } from "@/lib/store";
import { getAuthenticatedUser } from "@/lib/auth";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const currentUser = await getAuthenticatedUser();
  const data = await loadAppData();

  const user = data.users.find((u) => u.id === id);
  if (!user) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  const updates: Record<string, unknown> = {};
  if (typeof body.isActive === "boolean") updates.isActive = body.isActive;
  if (body.role) updates.role = body.role;
  if (body.department) updates.department = body.department;
  if (body.name) updates.name = body.name;

  await updateUser(id, updates);

  await appendAuditLog({
    id: `audit-${Date.now()}`,
    userId: currentUser?.id || "admin",
    userName: currentUser?.name || "System Administrator",
    action: "USER_UPDATED",
    recordId: id,
    timestamp: new Date().toISOString(),
    ipAddress: "127.0.0.1",
    device: "Web Browser",
    newValue: JSON.stringify(updates),
  });

  return NextResponse.json({ ok: true, user: { ...user, ...updates } });
}
