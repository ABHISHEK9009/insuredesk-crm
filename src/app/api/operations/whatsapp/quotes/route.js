import { NextResponse } from "next/server";
import { verifyJWT } from "@/lib/auth";
import { readRenewalQuoteEntries, filterRenewalQuoteEntries } from "@/lib/whatsapp/renewal-quote-capture";

export const runtime = "nodejs";

export async function GET(request) {
  try {
    const token = request.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const user = await verifyJWT(token);
    if (!user) return NextResponse.json({ error: "Invalid session" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const vehicleNumber = searchParams.get("vehicleNumber") || "";
    const entries = await readRenewalQuoteEntries();
    const filtered = filterRenewalQuoteEntries(entries, vehicleNumber).slice(0, 20);

    return NextResponse.json({ success: true, quotes: filtered });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed to load renewal quotes" }, { status: 500 });
  }
}
