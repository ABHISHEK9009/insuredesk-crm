import { prisma } from "@/lib/db/prisma";
import { sendWhatsAppText } from "@/lib/whatsapp/whatsapp-client";

/**
 * Compiles and sends a 1-time WhatsApp Welcome Message with a clean branded PDF link
 * to the Contact Person when a Policy PDF is uploaded.
 *
 * @param {Object} params
 * @param {string} params.recordId - PolicyRecord ID
 * @param {Object} params.data - Extracted or user-provided policy data
 * @param {string} [params.contactName] - Contact person name (override if explicitly provided)
 * @param {string} [params.contactPhone] - Contact person phone (override if explicitly provided)
 * @returns {Promise<{ sent: boolean, reason?: string, messageId?: string }>}
 */
export async function sendPolicyUploadWelcomeMessage({
  recordId,
  data = {},
  contactName = null,
  contactPhone = null,
}) {
  if (!recordId) {
    return { sent: false, reason: "Missing record ID" };
  }

  // 1. Fetch current policy record from DB to verify 1-time delivery
  let record = null;
  try {
    record = await prisma.policyRecord.findUnique({
      where: { id: recordId },
    });
  } catch (dbErr) {
    return { sent: false, reason: dbErr.message || "Database query failed" };
  }

  if (!record) {
    return { sent: false, reason: "Record not found in database" };
  }

  const existingExtracted = record.extractedData || {};
  const existingReviewed = record.reviewedData || {};

  // Check if welcome message was already dispatched for this policy (strict 1-time protection)
  if (existingReviewed.welcomeMessageSentAt || existingExtracted.welcomeMessageSentAt) {
    return { sent: false, reason: "Welcome message was already sent previously" };
  }

  // 2. Resolve Contact Person Name and Phone Number
  const resolvedName =
    contactName ||
    data.contactPersonName ||
    data.contactName ||
    existingReviewed.contactPersonName ||
    existingExtracted.contactPersonName ||
    data.insuredName ||
    data.customerName ||
    existingReviewed.insuredName ||
    existingExtracted.insuredName ||
    record.customerName ||
    "Valued Client";

  const rawPhone =
    contactPhone ||
    data.contactPersonPhone ||
    data.contactPhone ||
    data.phone ||
    data.mobile ||
    data.customerPhone ||
    existingReviewed.contactPersonPhone ||
    existingExtracted.contactPersonPhone ||
    existingReviewed.phone ||
    existingExtracted.phone ||
    "";

  const cleanPhone = String(rawPhone || "").replace(/\D/g, "");
  if (!cleanPhone || cleanPhone.length < 10) {
    return { sent: false, reason: "No valid 10-digit contact phone number found" };
  }

  const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

  // 3. Resolve Policy Details
  const insuredName =
    data.insuredName ||
    data.customerName ||
    existingReviewed.insuredName ||
    existingExtracted.insuredName ||
    record.customerName ||
    resolvedName;

  const policyNumber =
    data.policyNumber ||
    existingReviewed.policyNumber ||
    existingExtracted.policyNumber ||
    "N/A";

  const insuranceCompany =
    data.insuranceCompany ||
    existingReviewed.insuranceCompany ||
    existingExtracted.insuranceCompany ||
    record.detectedCompany ||
    "Bima Headquarter Partner";

  const policyCode = record.id;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://bimaheadquarter.com";
  const normalizedBase = baseUrl.replace(/\/$/, "");
  const policyPdfUrl = `${normalizedBase}/d/${policyCode}`;

  // 4. Construct Exact Chosen Welcome Message Template
  const welcomeMessage = `Dear ${resolvedName},

Greetings from Bima Headquarter.

Thank you for choosing us as your trusted insurance partner. Your policy records are now active with us.

Policy Summary:
• Insured Name: ${insuredName}
• Policy No: ${policyNumber}
• Insurer: ${insuranceCompany}

Access Your Digital Policy Document:
${policyPdfUrl}

For any claim requests, policy endorsements, or queries, our team is always available on this WhatsApp number.

Best regards,  
Team Bima Headquarter
by InsureDesk IMF Pvt. Ltd.`;

  // 5. Send WhatsApp message via Gateway
  try {
    const sendRes = await sendWhatsAppText(formattedPhone, welcomeMessage);

    // 6. Record 1-time delivery timestamp in policy record
    const updatedReviewed = {
      ...existingReviewed,
      welcomeMessageSentAt: new Date().toISOString(),
      welcomeMessageRecipient: formattedPhone,
      welcomeMessageRecipientName: resolvedName,
    };

    await prisma.policyRecord.update({
      where: { id: record.id },
      data: {
        reviewedData: updatedReviewed,
      },
    });

    return {
      sent: true,
      messageId: sendRes.id || null,
      recipient: formattedPhone,
      policyPdfUrl,
    };
  } catch (sendErr) {
    console.warn("Could not dispatch policy upload welcome message via WhatsApp:", sendErr.message);
    return {
      sent: false,
      reason: sendErr.message || "WhatsApp gateway delivery failed",
    };
  }
}
