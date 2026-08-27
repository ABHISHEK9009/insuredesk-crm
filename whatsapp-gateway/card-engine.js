import { createCanvas, loadImage } from "@napi-rs/canvas";
import { CARD_TEMPLATE_BASE64, BIMA_LOGO_BASE64 } from "./card-template-base64.js";

/**
 * Computes optimal font size for ribbon
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
 * Generates personalized card buffer in memory
 */
export async function renderBirthdayCardBuffer(recipientName = "Valued Client") {
  const cleanName = (recipientName || "Valued Client").trim();

  const templateBuffer = Buffer.from(CARD_TEMPLATE_BASE64, "base64");
  const templateImage = await loadImage(templateBuffer);
  const width = templateImage.width;
  const height = templateImage.height;

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  // 1. Draw background template
  ctx.drawImage(templateImage, 0, 0, width, height);

  // 2. Draw BimaHeadquarter Logo at top center
  try {
    const logoBuffer = Buffer.from(BIMA_LOGO_BASE64, "base64");
    const logoImage = await loadImage(logoBuffer);
    const logoW = 160;
    const logoH = (logoImage.height / logoImage.width) * logoW;
    ctx.drawImage(logoImage, 384 - logoW / 2, 48, logoW, logoH);
  } catch (logoErr) {
    console.warn("Could not draw logo in gateway:", logoErr.message);
  }

  // 3. Draw personalized recipient name centered on ribbon
  drawRibbonName(ctx, cleanName, 384, 448);

  // 4. Export high-quality JPEG (95%) for native WhatsApp compatibility and instant delivery
  return canvas.toBuffer("image/jpeg", 95);
}
