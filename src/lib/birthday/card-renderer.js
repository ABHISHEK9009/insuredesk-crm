import { createCanvas, loadImage } from "@napi-rs/canvas";
import { CARD_TEMPLATE_BASE64 } from "./card-template-base64.js";

// Load template image buffer reliably from embedded constant with zero filesystem or network dependency
function loadTemplateBuffer() {
  return Buffer.from(CARD_TEMPLATE_BASE64, "base64");
}

/**
 * Computes font size that fits nicely along the ribbon (1086px wide canvas)
 */
function getOptimalFontSize(name) {
  const len = name.length;
  if (len <= 14) return 52;
  if (len <= 20) return 44;
  if (len <= 26) return 36;
  return 30;
}

/**
 * Draws recipient name boldly and centered on the navy ribbon with drop shadow
 */
function drawRibbonName(ctx, text, centerX = 543, centerY = 638) {
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const fontSize = getOptimalFontSize(text);
  ctx.font = `bold ${fontSize}px sans-serif, Arial, Helvetica`;

  // Deep dark shadow for gold text depth
  ctx.shadowColor = "rgba(0, 0, 0, 0.95)";
  ctx.shadowBlur = 8;
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 3;

  // Bright luxury gold
  ctx.fillStyle = "#FCE38A";
  ctx.fillText(text, centerX, centerY);

  ctx.restore();
}

/**
 * Generates a personalized Birthday Card image buffer in memory.
 * Zero database storage — returns raw Buffer or Base64 string.
 *
 * @param {Object} options
 * @param {string} options.recipientName - Full name of the recipient (e.g., "Abhishek Verma")
 * @returns {Promise<{ buffer: Buffer, base64: string, mimeType: string }>}
 */
export async function generateBirthdayCard({ recipientName = "Valued Client" } = {}) {
  const cleanName = (recipientName || "Valued Client").trim();

  // 1. Load master base template image buffer (1086 x 1448)
  const templateBuffer = await loadTemplateBuffer();
  const templateImage = await loadImage(templateBuffer);
  const width = templateImage.width;   // 1086
  const height = templateImage.height; // 1448

  // 2. Create in-memory canvas
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  // 3. Draw master template background
  ctx.drawImage(templateImage, 0, 0, width, height);

  // 4. Draw personalized recipient name centered on ribbon
  drawRibbonName(ctx, cleanName, width / 2, 638);

  // 5. Export directly to in-memory Buffer (JPEG 95% for native WhatsApp compatibility)
  const buffer = canvas.toBuffer("image/jpeg", 95);
  const base64 = buffer.toString("base64");

  return {
    buffer,
    base64,
    mimeType: "image/jpeg",
    width,
    height,
  };
}

