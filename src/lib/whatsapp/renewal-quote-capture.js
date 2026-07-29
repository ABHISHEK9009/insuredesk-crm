import { promises as fs } from "fs";
import path from "path";
import { createWorker } from "tesseract.js";

const RENEWAL_QUOTE_GROUP_PATTERN = /ren(e)?wal\s*quote/i;
const VEHICLE_NUMBER_PATTERNS = [
  /\b([A-Z]{2}[0-9]{1,2}[A-Z]{0,3}[0-9]{4})\b/i,
  /\b([A-Z]{2}[ -]?[0-9]{1,2}(?:[ -]?[A-Z]{1,3})?[ -]?[0-9]{4})\b/i,
  /\b([A-Z0-9]{2,10}[ -]?[0-9]{3,6})\b/i,
];
const STORAGE_PATH = path.join(process.cwd(), "storage", "whatsapp", "renewal-quotes.json");

export async function extractOcrTextFromImage(imageInput) {
  if (!imageInput) return "";
  try {
    let input = imageInput;
    if (typeof imageInput === "string" && !imageInput.startsWith("data:") && !imageInput.startsWith("http")) {
      input = `data:image/jpeg;base64,${imageInput}`;
    }
    const worker = await createWorker("eng");
    const result = await worker.recognize(input);
    await worker.terminate();
    return result?.data?.text || "";
  } catch (error) {
    console.warn("WhatsApp quote OCR fallback failed:", error?.message || error);
    return "";
  }
}

export function extractVehicleNumber(text = "") {
  const normalized = String(text || "")
    .replace(/\s+/g, " ")
    .trim();
  if (!normalized) return "";

  const candidates = [];
  for (const pattern of VEHICLE_NUMBER_PATTERNS) {
    const match = normalized.match(pattern);
    if (match?.[1]) {
      const value = match[1].replace(/[\s-]/g, "").toUpperCase();
      if (value.length >= 4) candidates.push(value);
    }
  }

  if (candidates.length === 0) return "";

  const preferred = candidates.find((value) => /[A-Z]{2}\d{1,2}[A-Z]{0,3}\d{4}/i.test(value));
  return preferred || candidates[0];
}

export function isRenewalQuoteGroup(groupName = "") {
  const normalized = String(groupName || "").trim().toLowerCase();
  if (!normalized) return false;
  return RENEWAL_QUOTE_GROUP_PATTERN.test(normalized) || normalized.includes("quote new") || normalized.includes("renwal");
}

export async function buildRenewalQuoteEntry({ groupName, senderName, body, caption, mediaBase64, timestamp, attachmentUrl = "", sourceMessageId = "" } = {}) {
  let cleanedBody = String(body || caption || "").trim();
  let vehicleNumber = extractVehicleNumber(cleanedBody);

  if (!vehicleNumber && mediaBase64) {
    const ocrText = await extractOcrTextFromImage(mediaBase64);
    if (ocrText) {
      cleanedBody = [cleanedBody, ocrText].filter(Boolean).join("\n");
      vehicleNumber = extractVehicleNumber(cleanedBody);
    }
  }

  if (!vehicleNumber) {
    return null;
  }

  return {
    id: sourceMessageId || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    groupName: String(groupName || "").trim(),
    senderName: String(senderName || "").trim() || "Unknown",
    messageBody: cleanedBody,
    vehicleNumber,
    attachmentUrl,
    mediaBase64: mediaBase64 || "",
    receivedAt: timestamp ? new Date(timestamp) : new Date(),
    sourceMessageId,
  };
}

export async function readRenewalQuoteEntries() {
  try {
    await fs.mkdir(path.dirname(STORAGE_PATH), { recursive: true });
    const raw = await fs.readFile(STORAGE_PATH, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    if (error?.code === "ENOENT") return [];
    throw error;
  }
}

export async function storeRenewalQuoteEntry(entry) {
  if (!entry) return null;
  const entries = await readRenewalQuoteEntries();
  const nextEntries = [entry, ...entries.filter((item) => item.id !== entry.id && item.sourceMessageId !== entry.sourceMessageId)].slice(0, 200);
  await fs.mkdir(path.dirname(STORAGE_PATH), { recursive: true });
  await fs.writeFile(STORAGE_PATH, JSON.stringify(nextEntries, null, 2), "utf8");
  return entry;
}

export function normalizeVehicleNumber(value = "") {
  return String(value || "")
    .replace(/\s+/g, "")
    .replace(/[^A-Z0-9]/gi, "")
    .toUpperCase();
}

export function filterRenewalQuoteEntries(entries = [], vehicleNumber = "") {
  const normalizedVehicle = normalizeVehicleNumber(vehicleNumber);
  if (!normalizedVehicle) return entries;
  return entries.filter((entry) => {
    const candidate = normalizeVehicleNumber(entry.vehicleNumber || "");
    return candidate && (candidate === normalizedVehicle || candidate.includes(normalizedVehicle) || normalizedVehicle.includes(candidate));
  });
}

export function prepareRenewalQuotePayload({
  attachmentData = "",
  attachmentType = "image",
  attachmentFileName = "",
  messageBody = "",
} = {}) {
  const normalizedType = String(attachmentType || "").toLowerCase() === "document" ? "document" : "image";
  const filename = String(attachmentFileName || "").trim() || (normalizedType === "document" ? "quote.pdf" : "quote.jpg");

  return {
    mediaBase64: String(attachmentData || ""),
    mediaType: normalizedType,
    filename,
    caption: String(messageBody || ""),
  };
}
