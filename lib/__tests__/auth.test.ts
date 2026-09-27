import { describe, expect, it } from "vitest";
import { findUserByEmail, hasRole, hasPermission } from "@/lib/auth";
import { defaultUsers } from "@/lib/demo-data";

describe("authentication and RBAC", () => {
  it("finds a user by email", () => {
    expect(findUserByEmail("verification.officer@bhoomisetu.gov.in")?.role).toBe("VERIFICATION_OFFICER");
  });

  it("grants role checks", () => {
    const user = defaultUsers[2];
    expect(hasRole(user, "VERIFICATION_OFFICER")).toBe(true);
  });

  it("checks permissions", () => {
    const user = defaultUsers[1];
    expect(hasPermission(user, "VIEW_ANALYTICS")).toBe(true);
  });
});
