import { createCanvas, loadImage } from "@napi-rs/canvas";
import { CARD_TEMPLATE_BASE64 } from "./card-template-base64.js";

/**
 * Computes optimal font size for ribbon
 */
function getOptimalFontSize(name) {
  const len = name.length;
  if (len <= 14) return 38;
  if (len <= 20) return 32;
  if (len <= 26) return 26;
  return 22;
}

/**
 * Draws text curved along the golden ribbon arch
 */
function drawCurvedText(ctx, text, apexX, apexY, curvature = 0.00028) {
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const totalWidth = ctx.measureText(text).width;
  const chars = Array.from(text);
  const charWidths = chars.map((c) => ctx.measureText(c).width);
  
  let currentX = apexX - totalWidth / 2;

  for (let i = 0; i < chars.length; i++) {
    const char = chars[i];
    const w = charWidths[i];
    const charCenterX = currentX + w / 2;
    const dx = charCenterX - apexX;
    
    // Parabolic arch: y = apexY + curvature * dx^2
    const charY = apexY + curvature * dx * dx;
    const angle = Math.atan(2 * curvature * dx);

    ctx.save();
    ctx.translate(charCenterX, charY);
    ctx.rotate(angle);

    // Drop shadow
    ctx.shadowColor = "rgba(10, 15, 25, 0.75)";
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 1.5;
    ctx.shadowOffsetY = 2.5;

    // Champagne gold text
    ctx.fillStyle = "#F4DA8C";
    ctx.fillText(char, 0, 0);

    ctx.restore();
    currentX += w;
  }

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

  // Draw background template
  ctx.drawImage(templateImage, 0, 0, width, height);

  // Set font
  const fontSize = getOptimalFontSize(cleanName);
  ctx.font = `600 ${fontSize}px "DejaVu Serif", "Georgia", "Times New Roman", serif`;

  // Draw curved name
  const APEX_X = 384;
  const APEX_Y = 450;
  const CURVATURE = 0.00028;

  drawCurvedText(ctx, cleanName, APEX_X, APEX_Y, CURVATURE);

  // Export high-quality JPEG (95%) for native WhatsApp compatibility and instant delivery
  return canvas.toBuffer("image/jpeg", 95);
}
