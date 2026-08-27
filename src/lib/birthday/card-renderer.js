import { createCanvas, loadImage } from "@napi-rs/canvas";
import { CARD_TEMPLATE_BASE64 } from "./card-template-base64.js";

// Load template image buffer reliably from embedded constant with zero filesystem or network dependency
function loadTemplateBuffer() {
  return Buffer.from(CARD_TEMPLATE_BASE64, "base64");
}

/**
 * Computes font size that fits nicely along the ribbon (768px wide canvas)
 */
function getOptimalFontSize(name) {
  const len = name.length;
  if (len <= 14) return 38;
  if (len <= 20) return 32;
  if (len <= 26) return 26;
  return 22;
}

/**
 * Draws text curved along a quadratic upward arch centered at (apexX, apexY)
 * @param {CanvasRenderingContext2D} ctx 
 * @param {string} text 
 * @param {number} apexX - Center X coordinate (384px)
 * @param {number} apexY - Apex Y coordinate at center of arch (450px)
 * @param {number} curvature - Arch curvature factor (default 0.00028)
 */
function drawCurvedText(ctx, text, apexX, apexY, curvature = 0.00028) {
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const totalWidth = ctx.measureText(text).width;
  const chars = Array.from(text);
  
  // Calculate character widths to accurately space each glyph along the curve
  const charWidths = chars.map((c) => ctx.measureText(c).width);
  
  let currentX = apexX - totalWidth / 2;

  for (let i = 0; i < chars.length; i++) {
    const char = chars[i];
    const w = charWidths[i];
    const charCenterX = currentX + w / 2;
    const dx = charCenterX - apexX;
    
    // Parabolic arch: y = apexY + curvature * dx^2
    const charY = apexY + curvature * dx * dx;
    
    // Tangent angle: dy/dx = 2 * curvature * dx
    const angle = Math.atan(2 * curvature * dx);

    ctx.save();
    ctx.translate(charCenterX, charY);
    ctx.rotate(angle);

    // Drop shadow for gold text depth
    ctx.shadowColor = "rgba(10, 15, 25, 0.75)";
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 1.5;
    ctx.shadowOffsetY = 2.5;

    // Golden gradient or solid luxury champagne gold
    ctx.fillStyle = "#F4DA8C";
    ctx.fillText(char, 0, 0);

    ctx.restore();
    currentX += w;
  }

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

  // 3. Draw master template background (100% uncut glitter text and clean ribbon)
  ctx.drawImage(templateImage, 0, 0, width, height);

  // 4. Set font typography
  const fontSize = getOptimalFontSize(cleanName);
  // System serif fallback stack (Georgia, Times New Roman, Playfair Display)
  ctx.font = `600 ${fontSize}px "Playfair Display", "Georgia", "Times New Roman", serif`;

  // 5. Draw dynamically curved name onto the exact ribbon apex
  const APEX_X = 384;
  const APEX_Y = 450;
  const CURVATURE = 0.00028;

  drawCurvedText(ctx, cleanName, APEX_X, APEX_Y, CURVATURE);

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
