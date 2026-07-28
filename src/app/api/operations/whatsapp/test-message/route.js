import { NextResponse } from "next/server";
import { verifyJWT } from "@/lib/auth";
import { sendWhatsAppText } from "@/lib/whatsapp/whatsapp-client";

export const runtime = "nodejs";

function buildDefaultAgentSignature(session) {
  return [
    "*Warm regards,*",
    "",
    `*${session.name || session.email || "CRM Team"}*`,
    "Insurance Advisor",
    "",
    "*Bima Headquarter*",
    "by *InsureDesk IMF Pvt. Ltd.*",
    "",
    "Phone: +91 88188 89660",
    "Email: insuredeskbhopal@gmail.com",
    "Website: www.bimaheadquarter.com",
    "",
    "*Comprehensive Insurance Solutions*",
    "Motor Insurance • Health Insurance • Life Insurance • Commercial Insurance • Marine Insurance • Policy Renewals • Claims Assistance",
  ].join("\n");
}

function withAgentSignature(message, signature) {
  const text = String(message || "").trim();
  const signOff = String(signature || "").trim();
  if (!signOff || text.includes("*Comprehensive Insurance Solutions*")) return text;
  return `${text}\n\n${signOff}`;
}

async function requireSession(request) {
  const token = request.cookies.get("token")?.value;
  if (!token) return { errorResponse: NextResponse.json({ error: "Not authenticated" }, { status: 401 }) };
  const session = await verifyJWT(token);
  if (!session) {
    return { errorResponse: NextResponse.json({ error: "Invalid or expired session" }, { status: 401 }) };
  }
  return session;
}

export async function POST(request) {
  try {
    const session = await requireSession(request);
    if (session.errorResponse) return session.errorResponse;

    if (session.role === "VIEWER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const recipient = body.recipient || body.phone;
    const { message } = body;

    if (!recipient || !message) {
      return NextResponse.json({ error: "Recipient and message are required" }, { status: 400 });
    }

    const signedMessage = withAgentSignature(message, body.signature || buildDefaultAgentSignature(session));
    console.log(`Sending WhatsApp test message to ${String(recipient).endsWith("@g.us") ? "a group" : "an individual"}...`);
    const openwaResponse = await sendWhatsAppText(recipient, signedMessage);

    const msgId = typeof openwaResponse === 'object' ? openwaResponse.id || openwaResponse.response : openwaResponse;

    return NextResponse.json({
      success: true,
      messageId: msgId ? String(msgId) : null,
      response: openwaResponse,
    });
  } catch (error) {
    console.error("Failed to send WhatsApp test message:", error);
    return NextResponse.json(
      { error: error.message || "Failed to send test message" },
      { status: 500 }
    );
  }
}
