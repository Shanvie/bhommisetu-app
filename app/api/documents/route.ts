import { NextResponse } from "next/server";
import { loadAppData, upsertDocument, upsertLandRecord, appendAuditLog, appendNotification } from "@/lib/store";
import { getAuthenticatedUser } from "@/lib/auth";
import { OCRService, AIExtractionService, AnomalyDetectionService, DocumentClassificationService } from "@/lib/document-processing";
import { validateLandRecord } from "@/lib/validation";
import type { DocumentRecord, LandRecord, VerificationStatus } from "@/lib/types";

export async function GET() {
  const data = await loadAppData();
  return NextResponse.json({ documents: data.documents, total: data.documents.length });
}

const DISTRICT_COORDS: Record<string, [number, number]> = {
  Pune: [18.5204, 73.8567],
  Nashik: [19.9975, 73.7898],
  Nagpur: [21.1458, 79.0882],
  Thane: [19.2183, 72.9781],
  Satara: [17.6805, 73.9937],
  Kolhapur: [16.7050, 74.2433],
  Aurangabad: [19.8762, 75.3433],
};

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const currentUser = await getAuthenticatedUser();
  const timestamp = Date.now();

  const fileName = String(body.fileName || "land-record-document.pdf");
  const detectedDocType = body.documentType || DocumentClassificationService.classify(fileName, body.rawText);
  const title = body.title || `${detectedDocType} - ${body.village || "Uploaded Record"}`;

  const district = String(body.district || body.metadata?.district || "Pune");
  const village = String(body.village || body.metadata?.village || "Shivajinagar");
  const taluka = String(body.taluka || body.metadata?.taluka || `${district} City`);
  const state = String(body.state || body.metadata?.state || "Maharashtra");
  const ownerName = String(body.ownerName || "Rahul Sharma");
  const surveyNumber = String(body.surveyNumber || "123/4A");
  const gatNumber = String(body.gatNumber || `GAT-${Math.floor(10 + Math.random() * 80)}/${Math.floor(10 + Math.random() * 80)}`);
  const area = Number(body.area || 1450);

  // 1. OCR Preprocessing and Extraction
  const preprocessed = OCRService.preprocessDocument(fileName);
  const textResult = OCRService.extractText(body.rawText || "", {
    title,
    documentType: detectedDocType,
    fileName,
    ownerName,
    surveyNumber,
    village,
    taluka,
    district,
    state,
    area,
  });

  const extractedFields = AIExtractionService.extractStructuredFields(textResult.rawText, {
    title,
    documentType: detectedDocType,
    fileName,
    ownerName,
    surveyNumber,
    village,
    taluka,
    district,
    state,
    area,
  });

  // 2. Validation Engine
  const validationResults = validateLandRecord({
    ownerName,
    surveyNumber,
    area,
    village,
    district,
  });

  // 3. Anomaly detection
  const anomalies = AnomalyDetectionService.detect({
    ownerName,
    surveyNumber,
    area,
  });

  const comments: string[] = [];
  if (anomalies.length > 0) {
    comments.push(...anomalies.map((a) => `${a.type}: ${a.detail}`));
  }

  const baseCoords = DISTRICT_COORDS[district] || [18.5204, 73.8567];
  const jitterLat = (Math.random() - 0.5) * 0.05;
  const jitterLng = (Math.random() - 0.5) * 0.05;
  const latitude = Number((baseCoords[0] + jitterLat).toFixed(4));
  const longitude = Number((baseCoords[1] + jitterLng).toFixed(4));

  const docId = `doc-${timestamp}`;
  const recordId = `land-${timestamp}`;
  const propertyId = `MH-${district.substring(0, 2).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

  const verificationStatus: VerificationStatus = validationResults.some((r) => r.status === "FAIL")
    ? "ISSUES"
    : "IN_REVIEW";

  // 4. Create LandRecord
  const newLandRecord: LandRecord = {
    id: recordId,
    propertyId,
    surveyNumber,
    gatNumber,
    ownerName,
    coOwnerNames: body.coOwnerNames || [],
    fatherName: body.fatherName || "Ramesh " + ownerName.split(" ").pop(),
    village,
    taluka,
    district,
    state,
    area,
    landType: body.landType || "Agricultural",
    landUse: body.landUse || "Cultivable",
    ownershipType: body.ownershipType || "Individual",
    mutationNumber: `MUT-${Math.floor(1000 + Math.random() * 9000)}`,
    documentNumber: `DOC-${Math.floor(1000 + Math.random() * 9000)}`,
    registrationDate: new Date().toISOString().split("T")[0],
    lastUpdated: new Date().toISOString(),
    address: `${village}, ${taluka}, ${district}`,
    latitude,
    longitude,
    verificationStatus,
    documentType: detectedDocType,
    extractedFields,
    validationResults,
    comments,
  };

  await upsertLandRecord(newLandRecord);

  // 5. Create DocumentRecord
  const newDocument: DocumentRecord = {
    id: docId,
    title,
    documentType: detectedDocType,
    fileName,
    mimeType: String(body.mimeType || "application/pdf"),
    size: Number(body.size || 2150000),
    uploadedBy: currentUser?.id || "usr-1004",
    uploadedAt: new Date().toISOString(),
    status: "VALIDATED",
    verificationStatus,
    metadata: {
      state,
      district,
      taluka,
      village,
      surveyNumber,
      ownerName,
    },
    rawText: textResult.rawText,
    confidence: textResult.confidence,
    pageCount: preprocessed.pageCount,
    recordId,
  };

  await upsertDocument(newDocument);

  // 6. Audit Log & Notifications
  await appendAuditLog({
    id: `audit-${timestamp}`,
    userId: currentUser?.id || "usr-1004",
    userName: currentUser?.name || "Sakshi Sharma",
    action: "DOCUMENT_UPLOADED",
    recordId: docId,
    timestamp: new Date().toISOString(),
    ipAddress: "127.0.0.1",
    device: "Web Browser",
    newValue: `Uploaded ${title} (${detectedDocType}), auto-extracted record ${propertyId}`,
  });

  await appendNotification({
    id: `ntf-${timestamp}`,
    title: "Document processed & queued",
    message: `${title} (Survey: ${surveyNumber}, ${village}) extracted with ${(textResult.confidence * 100).toFixed(0)}% confidence and routed to verification.`,
    type: verificationStatus === "ISSUES" ? "WARNING" : "SUCCESS",
    read: false,
    createdAt: new Date().toISOString(),
  });

  return NextResponse.json(
    {
      ok: true,
      document: newDocument,
      landRecord: newLandRecord,
      id: docId,
      recordId,
    },
    { status: 201 },
  );
}
