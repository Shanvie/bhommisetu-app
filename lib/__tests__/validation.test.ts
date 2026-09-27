import { describe, expect, it } from "vitest";
import { validateLandRecord } from "@/lib/validation";

describe("validation engine", () => {
  it("flags missing owner name", () => {
    const result = validateLandRecord({ surveyNumber: "123/4A" });
    expect(result.some((item) => item.field === "Owner Name" && item.status === "FAIL")).toBe(true);
  });

  it("accepts valid survey format", () => {
    const result = validateLandRecord({ ownerName: "Rahul Sharma", surveyNumber: "123/4A" });
    expect(result.some((item) => item.ruleId === "RULE-SURVEY-FORMAT")).toBe(false);
  });

  it("flags suspiciously large area", () => {
    const result = validateLandRecord({ ownerName: "Rahul Sharma", area: 200000 });
    expect(result.some((item) => item.ruleId === "RULE-AREA-EXCESS")).toBe(true);
  });
});
