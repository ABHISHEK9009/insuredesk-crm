import { NextResponse } from "next/server";
import { verifyJWT } from "@/lib/auth";
import { readRenewalQuoteEntries, filterRenewalQuoteEntries, buildRenewalQuoteEntry, storeRenewalQuoteEntry } from "@/lib/whatsapp/renewal-quote-capture";

export const runtime = "nodejs";

export async function GET(request) {
  try {
    const token = request.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const user = await verifyJWT(token);
    if (!user) return NextResponse.json({ error: "Invalid session" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const vehicleNumber = searchParams.get("vehicleNumber") || "";
    const fetchAll = searchParams.get("all") === "true";
    const entries = await readRenewalQuoteEntries();

    if (fetchAll || !vehicleNumber) {
      return NextResponse.json({ success: true, quotes: entries.slice(0, 50) });
    }

    const filtered = filterRenewalQuoteEntries(entries, vehicleNumber).slice(0, 20);

    return NextResponse.json({ success: true, quotes: filtered });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed to load renewal quotes" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const token = request.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const user = await verifyJWT(token);
    if (!user) return NextResponse.json({ error: "Invalid session" }, { status: 401 });

    const payload = await request.json();
    const { vehicleNumber, groupName, messageBody, mediaBase64 } = payload || {};

    const entry = await buildRenewalQuoteEntry({
      groupName: groupName || "Renewal Quote New",
      senderName: user.name || "Agent",
      body: messageBody || vehicleNumber,
      caption: messageBody,
      mediaBase64,
      timestamp: new Date(),
    });

    if (!entry && vehicleNumber) {
      const manualEntry = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        groupName: groupName || "Renewal Quote New",
        senderName: user.name || "Agent",
        messageBody: messageBody || `Quote for ${vehicleNumber}`,
        vehicleNumber: String(vehicleNumber).replace(/[\s-]/g, "").toUpperCase(),
        mediaBase64: mediaBase64 || "",
        receivedAt: new Date(),
      };
      await storeRenewalQuoteEntry(manualEntry);
      return NextResponse.json({ success: true, quote: manualEntry });
    }

    if (entry) {
      await storeRenewalQuoteEntry(entry);
      return NextResponse.json({ success: true, quote: entry });
    }

    return NextResponse.json({ error: "Could not detect vehicle number from provided quote" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed to store quote" }, { status: 500 });
  }
}
