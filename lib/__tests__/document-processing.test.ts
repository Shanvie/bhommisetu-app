import { describe, expect, it } from "vitest";
import {
  OCRService,
  AIExtractionService,
  AnomalyDetectionService,
  DocumentClassificationService,
} from "@/lib/document-processing";

describe("Document Processing & OCR Services", () => {
  it("preprocesses documents correctly", () => {
    const result = OCRService.preprocessDocument("sample-712.pdf");
    expect(result.processed).toBe(true);
    expect(result.pageCount).toBe(2);
    expect(result.fileType).toBe("pdf");
  });

  it("extracts simulated text with context", () => {
    const textResult = OCRService.extractText("", {
      ownerName: "Chandrakant Shinde",
      surveyNumber: "248/1A",
      village: "Wagholi",
      district: "Pune",
    });

    expect(textResult.rawText).toContain("Chandrakant Shinde");
    expect(textResult.rawText).toContain("248/1A");
    expect(textResult.confidence).toBeGreaterThan(0.9);
  });

  it("detects structured fields accurately", () => {
    const fields = OCRService.detectFields("", {
      ownerName: "Sunil Deshpande",
      surveyNumber: "112/3",
      village: "Civil Lines",
      district: "Nagpur",
      area: 1650,
    });

    const ownerField = fields.find((f) => f.field === "Owner Name");
    const surveyField = fields.find((f) => f.field === "Survey Number");
    const areaField = fields.find((f) => f.field === "Area");

    expect(ownerField?.value).toBe("Sunil Deshpande");
    expect(surveyField?.value).toBe("112/3");
    expect(areaField?.value).toBe("1650");
  });

  it("classifies document types based on filenames and text", () => {
    expect(DocumentClassificationService.classify("pune-712-extract.pdf")).toBe("7/12 Extract");
    expect(DocumentClassificationService.classify("nagpur-property-card.jpg")).toBe("Property Card");
    expect(DocumentClassificationService.classify("registered-sale-deed.pdf")).toBe("Sale Deed");
    expect(DocumentClassificationService.classify("ferfar-mutation-entry.png")).toBe("Mutation Record");
  });

  it("detects anomalies and suspicious data", () => {
    const anomalies = AnomalyDetectionService.detect({
      ownerName: "Rahil Sharma",
      area: 150000,
      surveyNumber: "null",
    });

    expect(anomalies.length).toBeGreaterThan(1);
    expect(anomalies.some((a) => a.type.includes("spelling"))).toBe(true);
    expect(anomalies.some((a) => a.type.includes("Area"))).toBe(true);
    expect(anomalies.some((a) => a.type.includes("Survey"))).toBe(true);
  });
});
