import { describe, expect, it } from "vitest";
import { loadAppData, upsertLandRecord, appendNotification } from "@/lib/store";

describe("Store Operations", () => {
  it("loads app data with default records", async () => {
    const data = await loadAppData();
    expect(data.users.length).toBeGreaterThan(0);
    expect(data.landRecords.length).toBeGreaterThan(0);
    expect(data.documents.length).toBeGreaterThan(0);
    expect(data.settings).toBeDefined();
  });

  it("can upsert and retrieve a land record", async () => {
    const testRecord = {
      id: "land-test-999",
      propertyId: "MH-TEST-999",
      surveyNumber: "99/1",
      gatNumber: "GAT-99",
      ownerName: "Test Owner",
      coOwnerNames: [],
      fatherName: "Test Father",
      village: "Test Village",
      taluka: "Test Taluka",
      district: "Pune",
      state: "Maharashtra",
      area: 1200,
      landType: "Agricultural",
      landUse: "Cultivable",
      ownershipType: "Individual",
      mutationNumber: "MUT-999",
      documentNumber: "DOC-999",
      registrationDate: "2026-01-01",
      lastUpdated: new Date().toISOString(),
      address: "Test Address",
      latitude: 18.5,
      longitude: 73.8,
      verificationStatus: "VERIFIED" as const,
      documentType: "7/12 Extract",
      extractedFields: [],
      validationResults: [],
    };

    await upsertLandRecord(testRecord);
    const data = await loadAppData();
    const found = data.landRecords.find((r) => r.id === "land-test-999");
    expect(found).toBeDefined();
    expect(found?.ownerName).toBe("Test Owner");
  });

  it("can append and retrieve a notification", async () => {
    const testNotification = {
      id: "ntf-test-999",
      title: "Test Alert",
      message: "This is a test notification",
      type: "INFO" as const,
      read: false,
      createdAt: new Date().toISOString(),
    };

    await appendNotification(testNotification);
    await appendNotification(testNotification);
    const data = await loadAppData();
    const found = data.notifications.find((n) => n.id === "ntf-test-999");
    expect(found).toBeDefined();
    expect(found?.title).toBe("Test Alert");
    expect(data.notifications.filter((n) => n.id === "ntf-test-999")).toHaveLength(1);
  });
});
