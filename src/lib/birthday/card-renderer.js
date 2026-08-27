import { createCanvas, loadImage } from "@napi-rs/canvas";
import { CARD_TEMPLATE_BASE64, BIMA_LOGO_BASE64 } from "./card-template-base64.js";

// Load template image buffer reliably from embedded constant with zero filesystem or network dependency
function loadTemplateBuffer() {
  return Buffer.from(CARD_TEMPLATE_BASE64, "base64");
}

function loadLogoBuffer() {
  return Buffer.from(BIMA_LOGO_BASE64, "base64");
}

/**
 * Computes font size that fits nicely along the ribbon (768px wide canvas)
 */
function getOptimalFontSize(name) {
  const len = name.length;
  if (len <= 14) return 36;
  if (len <= 20) return 30;
  if (len <= 26) return 25;
  return 22;
}

/**
 * Draws recipient name boldly and centered on the navy ribbon with drop shadow
 */
function drawRibbonName(ctx, text, centerX = 384, centerY = 448) {
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const fontSize = getOptimalFontSize(text);
  ctx.font = `bold ${fontSize}px sans-serif, Arial, Helvetica`;

  // Deep dark shadow for gold text depth
  ctx.shadowColor = "rgba(0, 0, 0, 0.9)";
  ctx.shadowBlur = 6;
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 2;

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

  // 1. Load template image buffer
  const templateBuffer = await loadTemplateBuffer();
  const templateImage = await loadImage(templateBuffer);
  const width = templateImage.width;   // 768
  const height = templateImage.height; // 1024

  // 2. Create in-memory canvas
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  // 3. Draw master template background
  ctx.drawImage(templateImage, 0, 0, width, height);

  // 4. Draw BimaHeadquarter Logo at the top center
  try {
    const logoBuffer = loadLogoBuffer();
    const logoImage = await loadImage(logoBuffer);
    const logoW = 160;
    const logoH = (logoImage.height / logoImage.width) * logoW;
    ctx.drawImage(logoImage, 384 - logoW / 2, 48, logoW, logoH);
  } catch (logoErr) {
    console.warn("Could not draw logo on birthday card:", logoErr.message);
  }

  // 5. Draw personalized recipient name centered on ribbon
  drawRibbonName(ctx, cleanName, 384, 448);

  // 6. Export directly to in-memory Buffer (JPEG 95% for native WhatsApp compatibility)
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
