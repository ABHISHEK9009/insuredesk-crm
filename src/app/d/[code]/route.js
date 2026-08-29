import { prisma } from "@/lib/db/prisma";
import { getLocalPhysicalPath, getSignedUrl } from "@/lib/storage";
import { downloadGoogleDriveFile } from "@/lib/storage/google-drive-storage";
import { NextResponse } from "next/server";
import fs from "fs/promises";

export const runtime = "nodejs";

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

  // Look up policy record by id, uploadedFileId, or policy number
  const record = await prisma.policyRecord.findFirst({
    where: {
      OR: [
        { id: code },
        { uploadedFileId: code },
        {
          extractedData: {
            path: ["policyNumber"],
            equals: code,
          },
        },
      ],
      deletedAt: null,
    },
    include: {
      uploadedFile: true,
    },
  });

  if (!record || !record.uploadedFile) {
    // If not found by direct record, check uploadedFile directly
    const uploadedFile = await prisma.uploadedFile.findFirst({
      where: {
        id: code,
        deletedAt: null,
      },
    });

    if (!uploadedFile || !uploadedFile.storagePath) {
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
              <a href="https://wa.me/918839707135" class="btn">Contact Bima Headquarter Support</a>
            </div>
          </body>
        </html>`,
        {
          status: 404,
          headers: { "Content-Type": "text/html; charset=utf-8" },
        }
      );
    }

    return serveFile(uploadedFile, sanitizeFileName(uploadedFile.sourceFile || "policy.pdf"));
  }

  const file = record.uploadedFile;
  const policyNum = record.extractedData?.policyNumber || record.reviewedData?.policyNumber || "";
  const baseName = policyNum ? `Policy_${policyNum}.pdf` : (record.pdfFileName || file.sourceFile || "policy.pdf");
  const fileName = sanitizeFileName(baseName);

  return serveFile(file, fileName);
}

async function serveFile(file, fileName) {
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
