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

const SAMPLE_TATA_QUOTE_IMAGE = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='550' viewBox='0 0 400 550'><rect width='400' height='550' fill='%23111827'/><rect x='10' y='10' width='380' height='530' fill='%23052e16' rx='8'/><rect x='20' y='20' width='360' height='30' fill='%2322c55e'/><text x='200' y='40' fill='%23000' font-family='Arial' font-size='16' font-weight='bold' text-anchor='middle'>Calculation</text><rect x='20' y='55' width='360' height='20' fill='%23dcfce7'/><text x='30' y='70' fill='%23000' font-family='Arial' font-size='11'>IDV</text><text x='370' y='70' fill='%23000' font-family='Arial' font-size='11' text-anchor='end'>24000</text><rect x='20' y='77' width='360' height='20' fill='%23fff'/><text x='30' y='92' fill='%23000' font-family='Arial' font-size='11'>Own Damage Premium</text><text x='370' y='92' fill='%23000' font-family='Arial' font-size='11' text-anchor='end'>432</text><rect x='20' y='99' width='360' height='20' fill='%23fff'/><text x='30' y='114' fill='%23000' font-family='Arial' font-size='11'>Discount 41%</text><text x='370' y='114' fill='%23000' font-family='Arial' font-size='11' text-anchor='end'>253</text><rect x='20' y='125' width='360' height='25' fill='%23fef08a'/><text x='30' y='142' fill='%23000' font-family='Arial' font-size='12' font-weight='bold'>No Claim Bonus (50%)</text><text x='370' y='142' fill='%23000' font-family='Arial' font-size='12' font-weight='bold' text-anchor='end'>127</text><rect x='20' y='155' width='360' height='20' fill='%23fff'/><text x='30' y='170' fill='%23000' font-family='Arial' font-size='11'>Third Party Premium</text><text x='370' y='170' fill='%23000' font-family='Arial' font-size='11' text-anchor='end'>714</text><rect x='20' y='180' width='360' height='25' fill='%23bbf7d0'/><text x='30' y='197' fill='%23000' font-family='Arial' font-size='12' font-weight='bold'>Total Net Premium</text><text x='370' y='197' fill='%23000' font-family='Arial' font-size='12' font-weight='bold' text-anchor='end'>841</text><rect x='20' y='207' width='360' height='20' fill='%23fff'/><text x='30' y='222' fill='%23000' font-family='Arial' font-size='11'>GST 18%</text><text x='370' y='222' fill='%23000' font-family='Arial' font-size='11' text-anchor='end'>151</text><rect x='20' y='230' width='360' height='30' fill='%2316a34a'/><text x='30' y='250' fill='%23fff' font-family='Arial' font-size='13' font-weight='bold'>Total Premium with ADD ON</text><text x='370' y='250' fill='%23fff' font-family='Arial' font-size='13' font-weight='bold' text-anchor='end'>993</text><rect x='20' y='270' width='360' height='260' fill='%23064e3b' rx='6'/><text x='200' y='300' fill='%23fff' font-family='Arial' font-size='14' font-weight='bold' text-anchor='middle'>TATA AIG GENERAL INSURANCE CO. LTD</text><text x='200' y='340' fill='%23fff' font-family='Arial' font-size='16' font-weight='bold' text-anchor='middle'>MR. JAGENDRA RATHORE</text><text x='200' y='380' fill='%23fff' font-family='Arial' font-size='16' font-weight='bold' text-anchor='middle'>MP04UC1162 / HONDA - ACTIVA</text><text x='200' y='420' fill='%23fef08a' font-family='Arial' font-size='14' font-weight='bold' text-anchor='middle'>DUE DATE - 17/08/2026</text></svg>";

const INITIAL_GROUP_QUOTES = [
  {
    id: "quote-jagendra-mp04uc1162",
    groupName: "Renwal Quote New",
    senderName: "Anand",
    messageBody: "TATA AIG GENERAL INSURANCE CO. LTD\nMR. JAGENDRA RATHORE\nMP04UC1162 / HONDA - ACTIVA\nDUE DATE - 17/08/2026\nNet Premium: ₹841 | GST 18%: ₹151 | Total: ₹993",
    vehicleNumber: "MP04UC1162",
    mediaBase64: SAMPLE_TATA_QUOTE_IMAGE,
    receivedAt: new Date("2026-07-29T12:32:00.000Z"),
  },
];

export async function readRenewalQuoteEntries() {
  try {
    await fs.mkdir(path.dirname(STORAGE_PATH), { recursive: true });
    const raw = await fs.readFile(STORAGE_PATH, "utf8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    return INITIAL_GROUP_QUOTES;
  } catch (error) {
    if (error?.code === "ENOENT") return INITIAL_GROUP_QUOTES;
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
