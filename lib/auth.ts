import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import type { User } from "@/lib/types";
import { defaultUsers } from "@/lib/demo-data";

const JWT_SECRET = process.env.JWT_SECRET || "dev-bhoomisetu-secret";
const cookieName = "bhoomisetu_session";

export const roles: Record<string, string[]> = {
  SUPER_ADMIN: ["MANAGE_USERS", "VIEW_ANALYTICS", "VIEW_AUDIT_LOGS"],
  GOVERNMENT_OFFICER: ["VIEW_ASSIGNED_RECORDS", "APPROVE_RECORDS", "VIEW_ANALYTICS"],
  VERIFICATION_OFFICER: ["REVIEW_EXTRACTIONS", "APPROVE_VERIFICATION", "FLAG_INCONSISTENCIES"],
  DATA_ENTRY_OPERATOR: ["UPLOAD_DOCUMENTS", "ENTER_METADATA", "SUBMIT_RECORDS"],
  CITIZEN: ["VIEW_PUBLIC_RECORDS", "VIEW_APPLICATION_STATUS"],
};

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function findUserByEmail(email: string) {
  return defaultUsers.find((user) => user.email.toLowerCase() === email.toLowerCase());
}

export function signToken(user: User) {
  return jwt.sign({ sub: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string) {
  return jwt.verify(token, JWT_SECRET) as { sub: string; email: string; role: string };
}

export async function getAuthenticatedUser() {
  const cookieStore = await cookies();
  const session = cookieStore.get(cookieName)?.value;
  if (!session) return null;

  try {
    const payload = verifyToken(session);
    const user = defaultUsers.find((entry) => entry.id === payload.sub || entry.email === payload.email);
    return user ?? null;
  } catch {
    return null;
  }
}

export async function requireAuth() {
  const user = await getAuthenticatedUser();
  if (!user) return null;
  return user;
}

export function hasRole(user: User | null, expectedRole: string) {
  return Boolean(user && user.role === expectedRole);
}

export function hasPermission(user: User | null, permission: string) {
  if (!user) return false;
  const rolePermissions = roles[user.role as keyof typeof roles] ?? [];
  return user.permissions.includes(permission) || rolePermissions.includes(permission);
}

export function setSessionCookie(response: Response, token: string) {
  if (!response.headers.has("Set-Cookie")) {
    response.headers.set(
      "Set-Cookie",
      `${cookieName}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}; Secure=${process.env.NODE_ENV === "production" ? "; Secure" : ""}`,
    );
  }
}

export function clearSessionCookie(response: Response) {
  response.headers.set(
    "Set-Cookie",
    `${cookieName}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT`,
  );
}
