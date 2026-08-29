import { prisma } from "@/lib/db/prisma";
import { getLocalPhysicalPath, getSignedUrl } from "@/lib/storage";
import { downloadGoogleDriveFile } from "@/lib/storage/google-drive-storage";
import { NextResponse } from "next/server";
import fs from "fs/promises";

export const runtime = "nodejs";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function sanitizeFileName(name) {
  return (name || "policy.pdf")
    .replace(/[^\w.-]/g, "_")
    .replace(/_{2,}/g, "_");
}

export async function GET(_request, { params }) {
  const { code } = await params;
  if (!code) {
    return NextResponse.json({ error: "Missing document code" }, { status: 400 });
  }

  const cleanCode = String(code).trim();
  const isUuid = UUID_REGEX.test(cleanCode);

  let record = null;
  try {
    if (isUuid) {
      record = await prisma.policyRecord.findFirst({
        where: {
          OR: [{ id: cleanCode }, { uploadedFileId: cleanCode }],
          deletedAt: null,
        },
        include: {
          uploadedFile: true,
        },
      });
    }

    if (!record) {
      // Look up by policy number in data / reviewedData / extractedData
      const foundRecords = await prisma.policyRecord.findMany({
        where: { deletedAt: null },
        include: { uploadedFile: true },
        take: 100,
        orderBy: { savedAt: "desc" },
      });

      record = foundRecords.find(
        (r) =>
          r.id === cleanCode ||
          r.uploadedFileId === cleanCode ||
          r.extractedData?.policyNumber === cleanCode ||
          r.reviewedData?.policyNumber === cleanCode ||
          r.data?.policyNumber === cleanCode
      );
    }
  } catch (findErr) {
    console.error("Error finding policy record for /d/[code]:", findErr);
  }

  if (!record || !record.uploadedFile) {
    // Check uploadedFile directly if code is UUID
    let uploadedFile = null;
    if (isUuid) {
      try {
        uploadedFile = await prisma.uploadedFile.findFirst({
          where: {
            id: cleanCode,
            deletedAt: null,
          },
        });
      } catch (fileErr) {
        console.error("Error finding uploaded file for /d/[code]:", fileErr);
      }
    }

    if (!uploadedFile || (!uploadedFile.storagePath && !uploadedFile.pdfBytes && !record?.pdfBytes)) {
      return new Response(
        `<!DOCTYPE html>
        <html>
          <head>
            <title>Document Not Found | Bima Headquarter</title>
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #F8FAFC; color: #1E293B; }
              .card { background: white; padding: 2.5rem; border-radius: 1rem; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05); text-align: center; max-width: 420px; }
              h1 { font-size: 1.25rem; margin-bottom: 0.5rem; color: #0F172A; }
              p { font-size: 0.95rem; color: #64748B; margin-bottom: 1.5rem; }
              .btn { display: inline-block; background: #0F172A; color: white; padding: 0.75rem 1.5rem; border-radius: 0.5rem; text-decoration: none; font-weight: 500; font-size: 0.9rem; }
            </style>
          </head>
          <body>
            <div class="card">
              <h1>Document Not Found</h1>
              <p>The requested policy document could not be located or may have been updated. Please contact support.</p>
              <a href="https://wa.me/918818889660" class="btn">Contact Bima Headquarter Support</a>
            </div>
          </body>
        </html>`,
        {
          status: 404,
          headers: { "Content-Type": "text/html; charset=utf-8" },
        }
      );
    }

    const fileToServe = uploadedFile || {
      sourceFile: record?.pdfFileName || record?.sourceFile || "policy.pdf",
      mimeType: record?.pdfMimeType || "application/pdf",
      pdfBytes: record?.pdfBytes,
    };
    return serveFile(fileToServe, sanitizeFileName(fileToServe.sourceFile || "policy.pdf"));
  }

  const file = record.uploadedFile;
  const policyNum = record.extractedData?.policyNumber || record.reviewedData?.policyNumber || record.data?.policyNumber || "";
  const baseName = policyNum ? `Policy_${policyNum}.pdf` : (record.pdfFileName || file?.sourceFile || "policy.pdf");
  const fileName = sanitizeFileName(baseName);

  if (record.pdfBytes && (!file || !file.storagePath)) {
    return new Response(Buffer.from(record.pdfBytes), {
      headers: {
        "Content-Type": record.pdfMimeType || "application/pdf",
        "Content-Disposition": `inline; filename="${fileName}"`,
        "Content-Length": String(record.pdfBytes.length),
      },
    });
  }

  return serveFile(file, fileName);
}

async function serveFile(file, fileName) {
  if (!file) {
    return new Response("Document not found.", { status: 404 });
  }

  if (file.pdfBytes) {
    return new Response(Buffer.from(file.pdfBytes), {
      headers: {
        "Content-Type": file.mimeType || "application/pdf",
        "Content-Disposition": `inline; filename="${fileName}"`,
        "Content-Length": String(file.pdfBytes.length),
      },
    });
  }

  if (file.storageProvider === "local" || !file.storageProvider) {
    try {
      const physicalPath = getLocalPhysicalPath(file.storagePath);
      const fileBuffer = await fs.readFile(physicalPath);
      return new Response(fileBuffer, {
        headers: {
          "Content-Type": file.mimeType || "application/pdf",
          "Content-Disposition": `inline; filename="${fileName}"`,
          "Content-Length": String(fileBuffer.length),
        },
      });
    } catch {
      return new Response("Policy file storage not accessible on local disk.", { status: 404 });
    }
  } else if (file.storageProvider === "google_drive") {
    try {
      const fileBuffer = await downloadGoogleDriveFile(file.storagePath);
      return new Response(fileBuffer, {
        headers: {
          "Content-Type": file.mimeType || "application/pdf",
          "Content-Disposition": `inline; filename="${fileName}"`,
          "Content-Length": String(fileBuffer.length),
        },
      });
    } catch {
      return new Response("Could not download file from Google Drive storage.", { status: 502 });
    }
  } else {
    try {
      const signedUrl = await getSignedUrl(file.storagePath);
      return NextResponse.redirect(signedUrl);
    } catch {
      return new Response("Signed storage URL could not be generated.", { status: 500 });
    }
  }
}
