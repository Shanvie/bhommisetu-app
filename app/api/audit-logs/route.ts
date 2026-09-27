import { NextResponse } from "next/server";
import { loadAppData } from "@/lib/store";

export async function GET() {
  const data = await loadAppData();
  return NextResponse.json(data.auditLogs);
}
