import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { createCanvas, loadImage } from "@napi-rs/canvas";

// Common locations for Chrome / Chromium / Edge binaries on Windows and Linux
const BROWSER_EXECUTABLE_CANDIDATES = [
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
];

function getBrowserExecutablePath() {
  for (const p of BROWSER_EXECUTABLE_CANDIDATES) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

/**
 * Generates a personalized Birthday Card image buffer directly from birthday/index.html.
 *
 * @param {Object} options
 * @param {string} options.recipientName - Full name of the recipient (e.g., "Abhishek Verma")
 * @returns {Promise<{ buffer: Buffer, base64: string, mimeType: string, width: number, height: number }>}
 */
export async function generateBirthdayCard({ recipientName = "Valued Client" } = {}) {
  const cleanName = (recipientName || "Valued Client").trim();
  const width = 1086;
  const height = 1448;

  const browserPath = getBrowserExecutablePath();
  const indexPath = path.resolve(process.cwd(), "birthday/index.html");

  if (browserPath && fs.existsSync(indexPath)) {
    try {
      let html = fs.readFileSync(indexPath, "utf8");

      // Replace name inside SVG textPath
      html = html.replace(
        /<textPath id="recipientTextPath"[^>]*>[\s\S]*?<\/textPath>/,
        `<textPath id="recipientTextPath" href="#ribbonTextArch" startOffset="50%" text-anchor="middle">${cleanName}</textPath>`
      );

      // Hide surrounding dashboard/browser controls and isolate the 1086x1448 greeting card
      const styleInjection = `
        <style>
          .app-header-controls, .floating-actions-bar, .interactive-tool-panel, .ambient-dust-container { display: none !important; }
          body { background: transparent !important; margin: 0 !important; padding: 0 !important; overflow: hidden !important; width: 1086px !important; height: 1448px !important; }
          .card-scene { margin: 0 !important; padding: 0 !important; width: 1086px !important; height: 1448px !important; perspective: none !important; }
          .card-frame { transform: none !important; box-shadow: none !important; width: 1086px !important; height: 1448px !important; border-radius: 0 !important; }
          .greeting-card { width: 1086px !important; height: 1448px !important; border-radius: 0 !important; }
        </style>
      `;
      html = html.replace("</head>", `${styleInjection}</head>`);

      const tempId = `card_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const tempHtmlPath = path.resolve(process.cwd(), `birthday/temp_${tempId}.html`);
      const tempOutPng = path.resolve(process.cwd(), `birthday/temp_${tempId}.png`);

      fs.writeFileSync(tempHtmlPath, html, "utf8");

      const fileUrl = `file:///${tempHtmlPath.replace(/\\/g, "/")}`;
      const cmd = `"${browserPath}" --headless=new --disable-gpu --hide-scrollbars --window-size=1086,1448 --screenshot="${tempOutPng}" "${fileUrl}"`;

      execSync(cmd, { stdio: "pipe", timeout: 10000 });

      if (fs.existsSync(tempHtmlPath)) fs.unlinkSync(tempHtmlPath);

      if (fs.existsSync(tempOutPng)) {
        const rawPng = fs.readFileSync(tempOutPng);
        fs.unlinkSync(tempOutPng);

        // Convert to high-quality JPEG 95% for WhatsApp native compatibility
        const img = await loadImage(rawPng);
        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

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
    } catch (browserErr) {
      console.warn("Headless HTML rendering encountered an issue, falling back to canvas composition:", browserErr.message);
    }
  }

  // Fallback Canvas Composition directly from the 4 HTML assets
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  // 1. Base image
  const baseImg = await loadImage(path.resolve(process.cwd(), "birthday/base_image.png"));
  ctx.drawImage(baseImg, 0, 0, width, height);

  // 2. Bottom section (cake, gifts, trust pillars, signature)
  const bottomImg = await loadImage(path.resolve(process.cwd(), "birthday/assets/bottom_section.png"));
  const bottomH = (bottomImg.height / bottomImg.width) * width;
  ctx.drawImage(bottomImg, 0, height - bottomH, width, bottomH);

  // 3. Brand Logo
  const logoImg = await loadImage(path.resolve(process.cwd(), "birthday/brand_logo.png"));
  const logoW = 235;
  const logoH = (logoImg.height / logoImg.width) * logoW;
  ctx.drawImage(logoImg, (width - logoW) / 2, 45, logoW, logoH);

  // 4. Happy Birthday 3D Title
  const hbImg = await loadImage(path.resolve(process.cwd(), "birthday/assets/happy_birthday.png"));
  const hbW = 540;
  const hbH = (hbImg.height / hbImg.width) * hbW;
  ctx.drawImage(hbImg, (width - hbW) / 2, 170, hbW, hbH);

  // 5. Arched SVG Ribbon with Recipient Name
  const fontSize = cleanName.length > 20 ? 32 : (cleanName.length > 14 ? 38 : 44);
  const svgRibbon = `
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
        <path id="ribbonTextArch" d="M 70, 71 Q 270, 52 470, 71" fill="none" />
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
        <text font-family="'Cinzel', 'Playfair Display', serif" font-weight="bold" font-size="${fontSize}" fill="#FFF5A5" letter-spacing="0.04em">
          <textPath href="#ribbonTextArch" startOffset="50%" text-anchor="middle">
            ${cleanName}
          </textPath>
        </text>
      </g>
    </svg>
  `;

  try {
    const ribbonImg = await loadImage(Buffer.from(svgRibbon));
    const ribW = 680;
    const ribH = (ribbonImg.height / ribbonImg.width) * ribW;
    ctx.drawImage(ribbonImg, (width - ribW) / 2, 430, ribW, ribH);
  } catch (ribbonErr) {
    console.warn("Could not draw SVG ribbon:", ribbonErr.message);
  }

  // 6. Wishes Text
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#0A1930";
  ctx.font = "25px serif, Georgia, Times";
  ctx.fillText("Wishing you a day filled with", 543, 675);
  ctx.font = "bold 29px serif, Georgia, Times";
  ctx.fillText("happiness, love and success.", 543, 710);
  ctx.font = "25px serif, Georgia, Times";
  ctx.fillText("May this year bring you endless", 543, 745);
  ctx.fillText("joy, good health and all the", 543, 778);
  ctx.fillText("dreams you aspire to achieve.", 543, 811);
  ctx.font = "italic 32px serif, Georgia, Times";
  ctx.fillText("Have a wonderful year ahead!", 543, 855);
  ctx.restore();

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
