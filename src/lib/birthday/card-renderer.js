import { createCanvas, loadImage, GlobalFonts } from "@napi-rs/canvas";
import {
  BASE_IMAGE_B64,
  BRAND_LOGO_B64,
  HAPPY_BIRTHDAY_B64,
  BOTTOM_SECTION_B64,
  ARIAL_FONT_B64,
  GEORGIA_FONT_B64,
} from "./card-assets.js";

// Register custom bundled fonts once to guarantee rendering on Linux / Vercel serverless containers
let fontsRegistered = false;
function ensureFontsRegistered() {
  if (!fontsRegistered) {
    try {
      if (ARIAL_FONT_B64) {
        GlobalFonts.register(Buffer.from(ARIAL_FONT_B64, "base64"), "CardSans");
      }
      if (GEORGIA_FONT_B64) {
        GlobalFonts.register(Buffer.from(GEORGIA_FONT_B64, "base64"), "CardSerif");
      }
      fontsRegistered = true;
    } catch (fontErr) {
      console.warn("Could not register custom font buffer:", fontErr.message);
    }
  }
}

function getOptimalFontSize(name) {
  const len = name.length;
  if (len <= 14) return 46;
  if (len <= 20) return 38;
  if (len <= 26) return 32;
  return 26;
}

/**
 * Generates a personalized Birthday Card image buffer in memory.
 *
 * @param {Object} options
 * @param {string} options.recipientName - Full name of the recipient (e.g., "Abhishek Verma")
 * @returns {Promise<{ buffer: Buffer, base64: string, mimeType: string, width: number, height: number }>}
 */
export async function generateBirthdayCard({ recipientName = "Valued Client" } = {}) {
  ensureFontsRegistered();

  const cleanName = (recipientName || "Valued Client").trim();
  const width = 1086;
  const height = 1448;

  // Load all 4 visual assets reliably from embedded buffers
  const [baseImg, logoImg, hbImg, bottomImg] = await Promise.all([
    loadImage(Buffer.from(BASE_IMAGE_B64, "base64")),
    loadImage(Buffer.from(BRAND_LOGO_B64, "base64")),
    loadImage(Buffer.from(HAPPY_BIRTHDAY_B64, "base64")),
    loadImage(Buffer.from(BOTTOM_SECTION_B64, "base64")),
  ]);

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  // 1. Draw base backdrop (balloons)
  ctx.drawImage(baseImg, 0, 0, width, height);

  // 2. Draw bottom celebration asset (cake, gifts, trust pillars, signature)
  const bottomH = (bottomImg.height / bottomImg.width) * width;
  ctx.drawImage(bottomImg, 0, height - bottomH, width, bottomH);

  // 3. Draw brand logo
  const logoW = 235;
  const logoH = (logoImg.height / logoImg.width) * logoW;
  ctx.drawImage(logoImg, (width - logoW) / 2, 45, logoW, logoH);

  // 4. Draw Happy Birthday 3D title
  const hbW = 540;
  const hbH = (hbImg.height / hbImg.width) * hbW;
  ctx.drawImage(hbImg, (width - hbW) / 2, 170, hbW, hbH);

  // 5. Draw 3D Navy Ribbon
  const svgRibbonOnly = `
    <svg xmlns="http://www.w3.org/2000/svg" width="680" height="158" viewBox="0 0 540 125">
      <defs>
        <linearGradient id="ribbonMainNavy" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#193358" />
          <stop offset="35%" stop-color="#0E213D" />
          <stop offset="70%" stop-color="#081528" />
          <stop offset="100%" stop-color="#040B16" />
        </linearGradient>
        <linearGradient id="ribbonFoldDark" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#050C18" />
          <stop offset="100%" stop-color="#010408" />
        </linearGradient>
        <linearGradient id="goldStitch" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#AA7E1E" />
          <stop offset="25%" stop-color="#FFE885" />
          <stop offset="50%" stop-color="#DFB745" />
          <stop offset="75%" stop-color="#FFF099" />
          <stop offset="100%" stop-color="#9C7015" />
        </linearGradient>
      </defs>
      <g>
        <path d="M 65 32 L 8 44 L 38 66 L 8 88 L 65 80 Z" fill="url(#ribbonMainNavy)" />
        <path d="M 60 38 L 18 47 L 44 66 L 18 84 L 60 77" fill="none" stroke="url(#goldStitch)" stroke-width="1.3" stroke-dasharray="3.5 2.5" />
        <polygon points="65,77 82,73 65,94" fill="url(#ribbonFoldDark)" />
        <path d="M 475 32 L 532 44 L 502 66 L 532 88 L 475 80 Z" fill="url(#ribbonMainNavy)" />
        <path d="M 480 38 L 522 47 L 496 66 L 522 84 L 480 77" fill="none" stroke="url(#goldStitch)" stroke-width="1.3" stroke-dasharray="3.5 2.5" />
        <polygon points="475,77 458,73 475,94" fill="url(#ribbonFoldDark)" />
        <path d="M 55 30 Q 270 12 485 30 L 485 92 Q 270 74 55 92 Z" fill="url(#ribbonMainNavy)" />
        <path d="M 55 30 Q 270 12 485 30 L 485 92 Q 270 74 55 92 Z" fill="none" stroke="url(#goldStitch)" stroke-width="1" />
        <path d="M 62 36 Q 270 18 478 36 L 478 86 Q 270 68 62 86 Z" fill="none" stroke="url(#goldStitch)" stroke-width="1.4" stroke-dasharray="4.5 3" />
      </g>
    </svg>
  `;

  try {
    const ribbonImg = await loadImage(Buffer.from(svgRibbonOnly));
    const ribW = 680;
    const ribH = (ribbonImg.height / ribbonImg.width) * ribW;
    const ribX = (width - ribW) / 2;
    const ribY = 430;
    ctx.drawImage(ribbonImg, ribX, ribY, ribW, ribH);
  } catch (ribbonErr) {
    console.warn("Could not draw SVG ribbon:", ribbonErr.message);
  }

  // 6. Draw Name directly on canvas over the ribbon in bold 3D Gold
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const fontSize = getOptimalFontSize(cleanName);
  ctx.font = `bold ${fontSize}px CardSans, Arial, sans-serif`;
  ctx.shadowColor = "rgba(0, 0, 0, 0.95)";
  ctx.shadowBlur = 8;
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 3;
  ctx.fillStyle = "#FCE38A";
  ctx.fillText(cleanName, width / 2, 506);
  ctx.restore();

  // 7. Draw Wish Poem Text directly on canvas
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#0A1930";
  ctx.font = "26px CardSerif, Georgia, serif";
  ctx.fillText("Wishing you a day filled with", 543, 665);
  ctx.font = "bold 30px CardSerif, Georgia, serif";
  ctx.fillText("happiness, love and success.", 543, 702);
  ctx.font = "26px CardSerif, Georgia, serif";
  ctx.fillText("May this year bring you endless", 543, 738);
  ctx.fillText("joy, good health and all the", 543, 772);
  ctx.fillText("dreams you aspire to achieve.", 543, 806);
  ctx.font = "italic 32px CardSerif, Georgia, serif";
  ctx.fillText("Have a wonderful year ahead!", 543, 852);
  ctx.restore();

  // Export to high-quality JPEG 95%
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
