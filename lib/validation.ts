import type { ValidationResult } from "@/lib/types";

export function validateLandRecord(payload: Record<string, unknown>): ValidationResult[] {
  const rules: ValidationResult[] = [];

  if (!payload.ownerName) {
    rules.push({
      ruleId: "RULE-REQUIRED-OWNER",
      field: "Owner Name",
      severity: "HIGH",
      description: "Owner name is required.",
      expectedValue: "Present",
      detectedValue: "Missing",
      status: "FAIL",
    });
  }

  if (payload.surveyNumber === null || payload.surveyNumber === undefined || payload.surveyNumber === "") {
    rules.push({
      ruleId: "RULE-MISSING-FIELD",
      field: "Survey Number",
      severity: "HIGH",
      description: "Required field missing from extraction output.",
      expectedValue: "Survey number must be present.",
      detectedValue: "null",
      status: "FAIL",
    });
  } else if (typeof payload.surveyNumber === "string" && !/^\d+\/\d+[A-Z]?$/.test(payload.surveyNumber)) {
    rules.push({
      ruleId: "RULE-SURVEY-FORMAT",
      field: "Survey Number",
      severity: "MEDIUM",
      description: "Survey number format does not match expected pattern.",
      expectedValue: "123/4A or 331/9",
      detectedValue: String(payload.surveyNumber),
      status: "WARN",
    });
  }

  if (payload.area !== undefined && payload.area !== null) {
    const areaNum = Number(payload.area);
    if (areaNum > 100000) {
      rules.push({
        ruleId: "RULE-AREA-EXCESS",
        field: "Area",
        severity: "HIGH",
        description: "Area exceeds realistic local range.",
        expectedValue: "Less than 100000 sq m",
        detectedValue: String(payload.area),
        status: "WARN",
      });
    }
  }

  if (payload.latitude && payload.longitude) {
    const lat = Number(payload.latitude);
    const lng = Number(payload.longitude);
    if (lat < 8 || lat > 37 || lng < 68 || lng > 97) {
      rules.push({
        ruleId: "RULE-GEO-BOUNDS",
        field: "Geo-Coordinates",
        severity: "HIGH",
        description: "Geographic coordinates lie outside the national territorial bounds.",
        expectedValue: "Lat: 8°-37°N, Lng: 68°-97°E",
        detectedValue: `${lat}, ${lng}`,
        status: "WARN",
      });
    }
  }

  return rules;
}
