import { NextResponse } from "next/server";
import { verifyJWT } from "@/lib/auth";
import { sendWhatsAppText, sendWhatsAppImage, sendWhatsAppFile } from "@/lib/whatsapp/whatsapp-client";

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

function hasExistingSignature(message) {
  const text = String(message || "").toLowerCase();
  return [
    "*comprehensive insurance solutions*",
    "team bimaheadquarter",
    "bima headquarter",
    "insuredesk imf",
    "your trusted insurance partner",
  ].some((marker) => text.includes(marker));
}

function withAgentSignature(message, signature) {
  const text = String(message || "").trim();
  const signOff = String(signature || "").trim();
  if (!signOff || hasExistingSignature(text)) return text;
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

async function resolveAttachmentPayload(attachment = {}) {
  const attachmentData = attachment.mediaBase64 || attachment.data || attachment.attachmentData || attachment.base64 || "";
  const attachmentUrl = attachment.attachmentUrl || attachment.url || attachment.mediaUrl || "";
  const attachmentType = String(attachment.mediaType || attachment.type || "").toLowerCase() === "document" ? "document" : "image";
  const filename = String(attachment.filename || attachment.attachmentFileName || attachment.name || "").trim() || (attachmentType === "document" ? "quote.pdf" : "quote.jpg");
  const caption = attachment.caption || attachment.messageBody || "";

  if (attachmentData) {
    return {
      mediaBase64: String(attachmentData),
      mediaType: attachmentType,
      filename,
      caption,
    };
  }

  if (!attachmentUrl) return null;

  try {
    const response = await fetch(attachmentUrl);
    if (!response.ok) {
      throw new Error(`Could not download attachment from ${attachmentUrl}`);
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    return {
      mediaBase64: buffer.toString("base64"),
      mediaType: attachmentType,
      filename,
      caption,
    };
  } catch (error) {
    console.error("Failed to resolve quoted attachment:", error);
    return null;
  }
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
    const attachments = Array.isArray(body.attachments) ? body.attachments : [];

    if (!recipient || (!message && attachments.length === 0)) {
      return NextResponse.json({ error: "Recipient and a message or attachment are required" }, { status: 400 });
    }

    const signedMessage = withAgentSignature(message, body.signature || buildDefaultAgentSignature(session));
    console.log(`Sending WhatsApp test message to ${String(recipient).endsWith("@g.us") ? "a group" : "an individual"}...`);

    const resolvedAttachments = [];
    for (const attachment of attachments) {
      const resolved = await resolveAttachmentPayload(attachment);
      if (resolved) resolvedAttachments.push(resolved);
    }

    const responses = [];
    if (signedMessage) {
      const openwaResponse = await sendWhatsAppText(recipient, signedMessage);
      responses.push(openwaResponse);
    }

    for (const attachment of resolvedAttachments) {
      const sendResponse = attachment.mediaType === "document"
        ? await sendWhatsAppFile(recipient, attachment.mediaBase64, attachment.filename, attachment.caption)
        : await sendWhatsAppImage(recipient, attachment.mediaBase64, attachment.filename, attachment.caption);
      responses.push(sendResponse);
    }

    const firstResponse = responses[0];
    const msgId = typeof firstResponse === 'object' ? firstResponse.id || firstResponse.response : firstResponse;

    return NextResponse.json({
      success: true,
      messageId: msgId ? String(msgId) : null,
      response: firstResponse,
      attachmentCount: resolvedAttachments.length,
    });
  } catch (error) {
    console.error("Failed to send WhatsApp test message:", error);
    return NextResponse.json(
      { error: error.message || "Failed to send test message" },
      { status: 500 }
    );
  }
}
