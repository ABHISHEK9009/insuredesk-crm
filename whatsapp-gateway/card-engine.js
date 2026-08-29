import { createCanvas, loadImage } from "@napi-rs/canvas";
import { CARD_TEMPLATE_BASE64 } from "./card-template-base64.js";

/**
 * Computes optimal font size for ribbon (1086px wide canvas)
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
 * Generates personalized card buffer in memory
 */
export async function renderBirthdayCardBuffer(recipientName = "Valued Client") {
  const cleanName = (recipientName || "Valued Client").trim();

  const templateBuffer = Buffer.from(CARD_TEMPLATE_BASE64, "base64");
  const templateImage = await loadImage(templateBuffer);
  const width = templateImage.width;   // 1086
  const height = templateImage.height; // 1448

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  // 1. Draw background template
  ctx.drawImage(templateImage, 0, 0, width, height);

  // 2. Draw personalized recipient name centered on ribbon
  drawRibbonName(ctx, cleanName, width / 2, 638);

  // 3. Export high-quality JPEG (95%) for native WhatsApp compatibility and instant delivery
  return canvas.toBuffer("image/jpeg", 95);
}

