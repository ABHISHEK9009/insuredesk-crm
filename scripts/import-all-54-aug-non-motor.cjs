require('dotenv').config();
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const pdf = require('pdf-parse');
const { PrismaClient } = require('@prisma/client');
const { extractPolicyFromText } = require('../src/lib/policies/pdf/extractor.cjs');

const prisma = new PrismaClient();

function calculateHash(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

function parseDateToAugust(rawDate) {
  if (!rawDate) return new Date('2026-08-31T12:00:00.000Z');
  const m = String(rawDate).match(/(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
  if (m) {
    const day = m[1].padStart(2, '0');
    const month = m[2].padStart(2, '0');
    const year = m[3];
    if (year === '2026' && month === '08') {
      return new Date(`2026-08-${day}T12:00:00.000Z`);
    }
  }
  return new Date('2026-08-31T12:00:00.000Z');
}

async function processFile(f, sourceDir, uploadDir, idx, total) {
  const sourceFilePath = path.join(sourceDir, f);
  const buffer = fs.readFileSync(sourceFilePath);
  const fileHash = calculateHash(buffer);
  const fileSize = buffer.length;

  const uniqueFileName = `${crypto.randomUUID()}.pdf`;
  const targetStoragePath = path.join(uploadDir, uniqueFileName);
  fs.writeFileSync(targetStoragePath, buffer);
  const relativeStoragePath = `2026/08/${uniqueFileName}`;

  const pdfData = await pdf(buffer);
  const extracted = extractPolicyFromText(pdfData.text, f);

  const polNumber = (extracted.policyNumber || '').trim();
  const targetDate = parseDateToAugust(extracted.startDate || extracted.policyStartDate);

  const fullPayload = {
    ...extracted,
    sourceFile: f,
    pdfFileName: f,
    status: 'saved',
    policyCategory: 'Non-Motor',
    isCommercial: true
  };

  // Create or update UploadedFile record
  let uploadedFile = await prisma.uploadedFile.findFirst({
    where: {
      OR: [
        { sourceFile: f },
        { fileHash: fileHash }
      ]
    }
  });

  if (uploadedFile) {
    uploadedFile = await prisma.uploadedFile.update({
      where: { id: uploadedFile.id },
      data: {
        sourceFile: f,
        storageProvider: 'local',
        storagePath: relativeStoragePath,
        fileSize,
        sizeBytes: fileSize,
        fileHash,
        mimeType: 'application/pdf',
        status: 'APPROVED',
        createdAt: targetDate
      }
    });
  } else {
    uploadedFile = await prisma.uploadedFile.create({
      data: {
        id: crypto.randomUUID(),
        sourceFile: f,
        storageProvider: 'local',
        storagePath: relativeStoragePath,
        fileSize,
        sizeBytes: fileSize,
        fileHash,
        mimeType: 'application/pdf',
        status: 'APPROVED',
        createdAt: targetDate
      }
    });
  }

  // Create or update PolicyRecord in DB
  let existingRecord = null;
  if (polNumber) {
    existingRecord = await prisma.policyRecord.findFirst({
      where: {
        deletedAt: null,
        OR: [
          { reviewedData: { path: ['policyNumber'], equals: polNumber } },
          { data: { path: ['policyNumber'], equals: polNumber } },
          { data: { path: ['Policy No.'], equals: polNumber } },
          { pdfFileName: f }
        ]
      }
    });
  }

  let policyRecord;
  if (existingRecord) {
    policyRecord = await prisma.policyRecord.update({
      where: { id: existingRecord.id },
      data: {
        uploadedFileId: uploadedFile.id,
        pdfFileName: f,
        sourceFile: f,
        savedAt: targetDate,
        createdAt: targetDate,
        updatedAt: targetDate,
        selectedServiceCategory: extracted.documentCategory || 'Fire Insurance',
        detectedServiceCategory: extracted.documentCategory || 'Fire Insurance',
        data: fullPayload,
        reviewedData: fullPayload
      }
    });
    console.log(`[${idx + 1}/${total}] UPDATED: ${f} -> ${polNumber} (ID: ${policyRecord.id})`);
  } else {
    policyRecord = await prisma.policyRecord.create({
      data: {
        id: crypto.randomUUID(),
        uploadedFileId: uploadedFile.id,
        pdfFileName: f,
        sourceFile: f,
        savedAt: targetDate,
        createdAt: targetDate,
        updatedAt: targetDate,
        selectedServiceCategory: extracted.documentCategory || 'Fire Insurance',
        detectedServiceCategory: extracted.documentCategory || 'Fire Insurance',
        data: fullPayload,
        reviewedData: fullPayload
      }
    });
    console.log(`[${idx + 1}/${total}] CREATED: ${f} -> ${polNumber} (ID: ${policyRecord.id})`);
  }

  return {
    file: f,
    policyNumber: polNumber,
    category: extracted.documentCategory,
    recordId: policyRecord.id,
    uploadedFileId: uploadedFile.id,
    storagePath: relativeStoragePath
  };
}

async function importAll54() {
  const sourceDir = path.join(process.cwd(), 'storage', 'aug policy (2)', 'aug policy');
  const files = fs.readdirSync(sourceDir).filter(f => f.toLowerCase().endsWith('.pdf'));

  const uploadDir = path.join(process.cwd(), 'storage', 'uploads', '2026', '08');
  fs.mkdirSync(uploadDir, { recursive: true });

  console.log(`Starting fast parallel import of ${files.length} non-motor policies into August 2026...\n`);

  const chunkSize = 8;
  const allResults = [];

  for (let i = 0; i < files.length; i += chunkSize) {
    const chunk = files.slice(i, i + chunkSize);
    const chunkPromises = chunk.map((file, cIdx) =>
      processFile(file, sourceDir, uploadDir, i + cIdx, files.length)
    );
    const chunkResults = await Promise.all(chunkPromises);
    allResults.push(...chunkResults);
  }

  console.log(`\nAll ${allResults.length} policies imported successfully into August 2026!`);
}

importAll54()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Fatal import error:', err);
    process.exit(1);
  });
