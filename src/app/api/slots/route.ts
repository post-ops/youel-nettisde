import { NextResponse } from "next/server";
import { getAvailableSlots } from "@/lib/slots";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const date = url.searchParams.get("date");
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json(
      { error: "Mangler eller ugyldig 'date'-parameter (YYYY-MM-DD)" },
      { status: 400 },
    );
  }

  const slots = await getAvailableSlots(date);
  return NextResponse.json({ date, slots });
}
