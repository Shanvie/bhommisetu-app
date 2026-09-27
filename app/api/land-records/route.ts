import { NextResponse } from "next/server";
import { loadAppData, upsertLandRecord, appendAuditLog, appendNotification } from "@/lib/store";
import { getAuthenticatedUser } from "@/lib/auth";
import { validateLandRecord } from "@/lib/validation";
import type { LandRecord, VerificationStatus } from "@/lib/types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = (searchParams.get("q") || "").trim().toLowerCase();
  const district = searchParams.get("district") || "";
  const status = searchParams.get("verificationStatus") || "";
  const landType = searchParams.get("landType") || "";
  const data = await loadAppData();

  const results = data.landRecords.filter((record) => {
    const matchesQuery =
      !query ||
      [
        record.ownerName,
        record.propertyId,
        record.surveyNumber,
        record.gatNumber,
        record.village,
        record.district,
        record.taluka,
        record.mutationNumber,
        record.documentNumber,
      ].some((value) => value && value.toLowerCase().includes(query));

    const matchesDistrict = !district || record.district.toLowerCase() === district.toLowerCase();
    const matchesStatus = !status || record.verificationStatus === status;
    const matchesLandType = !landType || record.landType.toLowerCase() === landType.toLowerCase();

    return matchesQuery && matchesDistrict && matchesStatus && matchesLandType;
  });

  return NextResponse.json({ items: results, total: results.length });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const currentUser = await getAuthenticatedUser();
  const timestamp = Date.now();

  if (!body.ownerName || !body.surveyNumber) {
    return NextResponse.json({ error: "Owner name and survey number are required." }, { status: 400 });
  }

  const district = body.district || "Pune";
  const propertyId = body.propertyId || `MH-${district.substring(0, 2).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

  const validationResults = validateLandRecord({
    ownerName: body.ownerName,
    surveyNumber: body.surveyNumber,
    area: Number(body.area || 1000),
    village: body.village,
    district: body.district,
  });

  const record: LandRecord = {
    id: `land-${timestamp}`,
    propertyId,
    surveyNumber: body.surveyNumber,
    gatNumber: body.gatNumber || `GAT-${Math.floor(10 + Math.random() * 80)}`,
    ownerName: body.ownerName,
    coOwnerNames: body.coOwnerNames || [],
    fatherName: body.fatherName || "",
    village: body.village || "Pune",
    taluka: body.taluka || "Haveli",
    district,
    state: body.state || "Maharashtra",
    area: Number(body.area || 1000),
    landType: body.landType || "Agricultural",
    landUse: body.landUse || "Cultivable",
    ownershipType: body.ownershipType || "Individual",
    mutationNumber: body.mutationNumber || `MUT-${Math.floor(1000 + Math.random() * 9000)}`,
    documentNumber: body.documentNumber || `DOC-${Math.floor(1000 + Math.random() * 9000)}`,
    registrationDate: body.registrationDate || new Date().toISOString().split("T")[0],
    lastUpdated: new Date().toISOString(),
    address: body.address || `${body.village || "Pune"}, ${district}`,
    latitude: Number(body.latitude || 18.5204),
    longitude: Number(body.longitude || 73.8567),
    verificationStatus: (body.verificationStatus as VerificationStatus) || (validationResults.length > 0 ? "IN_REVIEW" : "VERIFIED"),
    documentType: body.documentType || "7/12 Extract",
    extractedFields: body.extractedFields || [
      { field: "Owner Name", value: body.ownerName, confidence: 0.98, source_page: 1, status: "verified" },
      { field: "Survey Number", value: body.surveyNumber, confidence: 0.95, source_page: 1, status: "verified" },
      { field: "District", value: district, confidence: 0.99, source_page: 1, status: "verified" },
      { field: "Area", value: String(body.area || 1000), confidence: 0.92, source_page: 1, status: "verified" },
    ],
    validationResults,
    comments: body.comments || ["Record entered via registry management desk."],
  };

  await upsertLandRecord(record);

  await appendAuditLog({
    id: `audit-${timestamp}`,
    userId: currentUser?.id || "usr-1004",
    userName: currentUser?.name || "Data Entry Operator",
    action: "RECORD_CREATED",
    recordId: record.id,
    timestamp: new Date().toISOString(),
    ipAddress: "127.0.0.1",
    device: "Web Browser",
    newValue: `Created land record ${record.propertyId} for ${record.ownerName}`,
  });

  await appendNotification({
    id: `ntf-${timestamp}`,
    title: "New Land Record Created",
    message: `Record ${record.propertyId} (${record.ownerName}, ${record.village}) added to registry.`,
    type: "SUCCESS",
    read: false,
    createdAt: new Date().toISOString(),
  });

  return NextResponse.json({ ok: true, record }, { status: 201 });
}
