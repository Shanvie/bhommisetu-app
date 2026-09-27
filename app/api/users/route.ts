import { NextResponse } from "next/server";
import { loadAppData, upsertUser, appendAuditLog } from "@/lib/store";
import { getAuthenticatedUser } from "@/lib/auth";
import type { UserRole } from "@/lib/types";

export async function GET() {
  const data = await loadAppData();
  return NextResponse.json({ users: data.users });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const currentUser = await getAuthenticatedUser();

  if (!body.name || !body.email || !body.role) {
    return NextResponse.json({ error: "Name, email, and role are required." }, { status: 400 });
  }

  const data = await loadAppData();
  if (data.users.some((u) => u.email.toLowerCase() === String(body.email).toLowerCase())) {
    return NextResponse.json({ error: "A user with this email already exists." }, { status: 400 });
  }

  const newUser = {
    id: `usr-${Date.now()}`,
    name: String(body.name).trim(),
    email: String(body.email).trim().toLowerCase(),
    role: body.role as UserRole,
    department: String(body.department || "Revenue Department").trim(),
    isActive: true,
    permissions: Array.isArray(body.permissions) ? body.permissions : ["VIEW_ASSIGNED_RECORDS"],
    lastLogin: new Date().toISOString(),
  };

  await upsertUser(newUser);

  await appendAuditLog({
    id: `audit-${Date.now()}`,
    userId: currentUser?.id || "admin",
    userName: currentUser?.name || "System Administrator",
    action: "USER_CREATED",
    recordId: newUser.id,
    timestamp: new Date().toISOString(),
    ipAddress: "127.0.0.1",
    device: "Web Browser",
    newValue: `Created user ${newUser.name} (${newUser.role})`,
  });

  return NextResponse.json({ user: newUser }, { status: 201 });
}
