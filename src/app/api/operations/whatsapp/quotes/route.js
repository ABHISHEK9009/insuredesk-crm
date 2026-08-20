import { NextResponse } from "next/server";
import { verifyJWT } from "@/lib/auth";
import { readRenewalQuoteEntries, filterRenewalQuoteEntries, buildRenewalQuoteEntry, storeRenewalQuoteEntry } from "@/lib/whatsapp/renewal-quote-capture";
import { searchGroupMessages, downloadWhatsAppMedia } from "@/lib/whatsapp/whatsapp-client";

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
    let entries = await readRenewalQuoteEntries();

    if (fetchAll || !vehicleNumber) {
      if (entries.length === 0) {
        try {
          const remoteMsgs = await searchGroupMessages("Renwal Quote New", "");
          if (Array.isArray(remoteMsgs) && remoteMsgs.length > 0) {
            for (const msg of remoteMsgs) {
              const msgId = msg.id || msg.key?.id || "";
              let mediaBase64 = "";
              if (msgId) {
                mediaBase64 = await downloadWhatsAppMedia(msgId);
              }
              const entry = await buildRenewalQuoteEntry({
                groupName: msg.groupName || "Renwal Quote New",
                senderName: msg.senderName || msg.pushName || "Agent",
                messageBody: msg.body || msg.caption || "Renwal Quote Image",
                mediaBase64,
                sourceMessageId: msgId,
              });
              await storeRenewalQuoteEntry(entry);
            }
            entries = await readRenewalQuoteEntries();
          }
        } catch {
          // Fallback gracefully
        }
      }
      return NextResponse.json({ success: true, quotes: entries.slice(0, 50) });
    }

    let filtered = filterRenewalQuoteEntries(entries, vehicleNumber);

    if (filtered.length === 0 && vehicleNumber.length >= 4) {
      try {
        const remoteMsgs = await searchGroupMessages("Renwal Quote New", vehicleNumber);
        if (Array.isArray(remoteMsgs) && remoteMsgs.length > 0) {
          for (const msg of remoteMsgs) {
            const msgId = msg.id || msg.key?.id || "";
            let mediaBase64 = "";
            if (msgId) {
              mediaBase64 = await downloadWhatsAppMedia(msgId);
            }
            const entry = await buildRenewalQuoteEntry({
              groupName: msg.groupName || "Renwal Quote New",
              senderName: msg.senderName || msg.pushName || "Agent",
              messageBody: msg.body || msg.caption || `Quote for ${vehicleNumber}`,
              mediaBase64,
              sourceMessageId: msgId,
            });
            await storeRenewalQuoteEntry(entry);
          }
          entries = await readRenewalQuoteEntries();
          filtered = filterRenewalQuoteEntries(entries, vehicleNumber);
        }
      } catch {
        // Fallback gracefully
      }
    }

    return NextResponse.json({ success: true, quotes: filtered.slice(0, 20) });
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
    const { vehicleNumber, groupName, messageBody, mediaBase64, attachmentFileName, attachmentType } = payload || {};

    const isPdf = attachmentType === "document" ||
      String(attachmentFileName || "").toLowerCase().endsWith(".pdf") ||
      String(mediaBase64 || "").startsWith("data:application/pdf");

    const entry = await buildRenewalQuoteEntry({
      groupName: groupName || "Renewal Quote New",
      senderName: user.name || "Agent",
      body: messageBody || vehicleNumber,
      caption: messageBody,
      mediaBase64,
      attachmentFileName: attachmentFileName || (isPdf ? "quote.pdf" : "quote.jpg"),
      attachmentType: isPdf ? "document" : "image",
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
        attachmentFileName: attachmentFileName || (isPdf ? "quote.pdf" : "quote.jpg"),
        attachmentType: isPdf ? "document" : "image",
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
