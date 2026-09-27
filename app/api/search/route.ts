import { NextResponse } from "next/server";
import { loadAppData } from "@/lib/store";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = (searchParams.get("q") || "").trim().toLowerCase();
  const state = searchParams.get("state") || "";
  const district = searchParams.get("district") || "";
  const data = await loadAppData();

  const results = data.landRecords.filter((record) => {
    const matchesQuery =
      !query ||
      [
        record.ownerName,
        record.surveyNumber,
        record.gatNumber,
        record.propertyId,
        record.village,
        record.taluka,
        record.district,
        record.documentNumber,
        record.mutationNumber,
      ].some((value) => value?.toLowerCase().includes(query));

    const matchesState = !state || record.state === state;
    const matchesDistrict = !district || record.district === district;

    return matchesQuery && matchesState && matchesDistrict;
  });

  return NextResponse.json({ results, total: results.length });
}
