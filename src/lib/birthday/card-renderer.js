import fs from "fs";
import path from "path";
import { createCanvas, loadImage } from "@napi-rs/canvas";

// Helper to load template image buffer across local dev, Vercel serverless, and production URLs
async function loadTemplateBuffer() {
  const candidatePaths = [
    path.join(process.cwd(), "public", "templates", "card_template.png"),
    path.join(process.cwd(), "birthday", "card_template.png"),
    path.join(process.cwd(), "public", "card_template.png"),
  ];

  for (const p of candidatePaths) {
    try {
      if (fs.existsSync(p)) {
        return fs.readFileSync(p);
      }
    } catch {
      // Continue searching
    }
  }

  // Fallback: fetch from hosted domain if running in isolated serverless bundle
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://bimaheadquarter.com").replace(/\/$/, "");
  const fallbackUrls = [
    `${appUrl}/templates/card_template.png`,
    "https://bimaheadquarter.com/templates/card_template.png",
  ];

  for (const url of fallbackUrls) {
    try {
      const res = await fetch(url);
      if (res.ok) {
        const ab = await res.arrayBuffer();
        return Buffer.from(ab);
      }
    } catch {
      // Continue searching
    }
  }

  throw new Error("Birthday card template image could not be loaded from filesystem or network.");
}

/**
 * Computes font size that fits nicely along the ribbon
 * Default: 54px for names <= 18 chars, scaled down progressively for longer names
 */
function getOptimalFontSize(name) {
  const len = name.length;
  if (len <= 16) return 54;
  if (len <= 22) return 46;
  if (len <= 28) return 38;
  if (len <= 34) return 32;
  return 28;
}

/**
 * Draws text curved along a quadratic upward arch centered at (apexX, apexY)
 * @param {CanvasRenderingContext2D} ctx 
 * @param {string} text 
 * @param {number} apexX - Center X coordinate (555px)
 * @param {number} apexY - Apex Y coordinate at center of arch (623px)
 * @param {number} curvature - Arch curvature factor (default 0.00038)
 */
function drawCurvedText(ctx, text, apexX, apexY, curvature = 0.00038) {
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
  const width = templateImage.width;   // 1086
  const height = templateImage.height; // 1448

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
  const APEX_X = 555;
  const APEX_Y = 623;
  const CURVATURE = 0.00038;

  drawCurvedText(ctx, cleanName, APEX_X, APEX_Y, CURVATURE);

  // 6. Export directly to in-memory Buffer (PNG)
  const buffer = canvas.toBuffer("image/png");
  const base64 = buffer.toString("base64");

  return {
    buffer,
    base64,
    mimeType: "image/png",
    width,
    height,
  };
}
