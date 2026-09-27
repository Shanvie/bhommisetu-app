import { NextResponse } from "next/server";
import { loadAppData } from "@/lib/store";

export async function GET() {
  const data = await loadAppData();

  const totalRecords = data.landRecords.length;
  const verified = data.landRecords.filter((record) => record.verificationStatus === "VERIFIED").length;
  const inReview = data.landRecords.filter((record) => record.verificationStatus === "IN_REVIEW").length;
  const pending = data.landRecords.filter((record) => record.verificationStatus === "PENDING").length;
  const rejected = data.landRecords.filter((record) => record.verificationStatus === "REJECTED").length;
  const issues = data.landRecords.filter((record) => record.verificationStatus === "ISSUES" || record.validationResults.length > 0).length;

  const districtCounts: Record<string, number> = {};
  data.landRecords.forEach((r) => {
    districtCounts[r.district] = (districtCounts[r.district] || 0) + 1;
  });

  const recordsByDistrict = Object.entries(districtCounts).map(([district, count]) => ({
    district,
    count,
    percent: totalRecords > 0 ? Math.round((count / totalRecords) * 100) : 0,
  }));

  const docTypeCounts: Record<string, number> = {};
  data.documents.forEach((d) => {
    docTypeCounts[d.documentType] = (docTypeCounts[d.documentType] || 0) + 1;
  });

  const documentTypes = Object.entries(docTypeCounts).map(([type, count]) => ({
    type,
    count,
  }));

  const severityCounts: Record<string, number> = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
  data.landRecords.forEach((r) => {
    r.validationResults.forEach((val) => {
      severityCounts[val.severity] = (severityCounts[val.severity] || 0) + 1;
    });
  });

  const issuesBySeverity = Object.entries(severityCounts).map(([severity, count]) => ({
    severity,
    count,
  }));

  const verifiedPercent = totalRecords > 0 ? Math.round((verified / totalRecords) * 100) : 0;
  const ocrSuccessRate = 94;

  return NextResponse.json({
    totalRecords,
    documentsUploaded: data.documents.length,
    documentsProcessed: data.documents.filter((d) => d.status !== "PROCESSING").length,
    verifiedRecords: verified,
    inReviewRecords: inReview,
    pendingVerification: pending,
    rejectedRecords: rejected,
    recordsWithIssues: issues,
    ocrSuccessRate,
    verifiedPercent,
    recordsByDistrict,
    documentTypes,
    issuesBySeverity,
    recentAuditLogs: data.auditLogs.slice(0, 5),
    recentNotifications: data.notifications.slice(0, 5),
  });
}
