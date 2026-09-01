require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { randomUUID } = require('node:crypto');

const prisma = new PrismaClient();

async function movePolicy(policyNum, targetDateStr) {
  // Parse target date (format: DD/MM/YYYY e.g. 30/07/2026)
  const [d, m, y] = targetDateStr.split('/');
  const targetIsoDate = new Date(`${y}-${m}-${d}T12:00:00.000Z`);

  console.log(`Searching for policy: ${policyNum}...`);
  console.log(`Target Date: ${targetDateStr} (${targetIsoDate.toISOString()})`);

  let record = null;
  for (let attempt = 1; attempt <= 10; attempt++) {
    try {
      const records = await prisma.policyRecord.findMany({
        where: {
          deletedAt: null,
          OR: [
            { reviewedData: { path: ['policyNumber'], equals: policyNum } },
            { data: { path: ['policyNumber'], equals: policyNum } },
            { data: { path: ['Policy No.'], equals: policyNum } },
          ]
        },
      });

      if (records.length > 0) {
        record = records[0];
        break;
      }
    } catch (e) {
      console.log(`Search attempt ${attempt} failed: ${e.message}. Retrying in 2s...`);
      await new Promise(r => setTimeout(r, 2000));
    }
  }

  if (!record) {
    // Try raw fallback query
    console.log('Trying raw search for policy number...');
    for (let attempt = 1; attempt <= 5; attempt++) {
      try {
        const rawRecords = await prisma.$queryRaw`
          SELECT id, saved_at, created_at, uploaded_file_id, reviewed_data, data
          FROM pdf_records
          WHERE deleted_at IS NULL
            AND (
              reviewed_data->>'policyNumber' = ${policyNum}
              OR data->>'policyNumber' = ${policyNum}
              OR data->>'Policy No.' = ${policyNum}
              OR reviewed_data::text LIKE ${'%' + policyNum + '%'}
              OR data::text LIKE ${'%' + policyNum + '%'}
            )
          LIMIT 1
        `;
        if (rawRecords.length > 0) {
          record = await prisma.policyRecord.findUnique({
            where: { id: rawRecords[0].id }
          });
          break;
        }
      } catch (e) {
        console.log(`Raw search attempt ${attempt} failed: ${e.message}. Retrying in 2s...`);
        await new Promise(r => setTimeout(r, 2000));
      }
    }
  }

  if (!record) {
    console.error(`No active PolicyRecord found matching policy number: ${policyNum}`);
    return;
  }

  console.log('Found Record:', {
    id: record.id,
    savedAt: record.savedAt,
    createdAt: record.createdAt,
    uploadedFileId: record.uploadedFileId,
    insuredName: record.reviewedData?.insuredName || record.data?.insuredName,
    policyNumber: record.reviewedData?.policyNumber || record.data?.policyNumber,
  });

  const updatedData = typeof record.data === 'object' && record.data !== null ? { ...record.data } : {};
  updatedData.savedAt = targetIsoDate.toISOString();
  updatedData.createdAt = targetIsoDate.toISOString();
  updatedData.uploadedAt = targetIsoDate.toISOString();
  if (updatedData.startDate) updatedData.startDate = targetDateStr;
  if (updatedData.policyStartDate) updatedData.policyStartDate = targetDateStr;

  const updatedReviewedData = typeof record.reviewedData === 'object' && record.reviewedData !== null ? { ...record.reviewedData } : {};
  updatedReviewedData.savedAt = targetIsoDate.toISOString();
  updatedReviewedData.createdAt = targetIsoDate.toISOString();
  updatedReviewedData.uploadedAt = targetIsoDate.toISOString();
  if (updatedReviewedData.startDate) updatedReviewedData.startDate = targetDateStr;
  if (updatedReviewedData.policyStartDate) updatedReviewedData.policyStartDate = targetDateStr;

  let results = null;
  for (let attempt = 1; attempt <= 10; attempt++) {
    try {
      results = await prisma.$transaction([
        prisma.policyRecord.update({
          where: { id: record.id },
          data: {
            savedAt: targetIsoDate,
            createdAt: targetIsoDate,
            data: updatedData,
            reviewedData: updatedReviewedData,
          },
        }),
        ...(record.uploadedFileId ? [
          prisma.uploadedFile.update({
            where: { id: record.uploadedFileId },
            data: {
              createdAt: targetIsoDate,
            }
          })
        ] : []),
        prisma.auditLog.create({
          data: {
            id: randomUUID(),
            entityType: 'PolicyRecord',
            entityId: record.id,
            action: 'UPDATE',
            metadata: {
              policyNumber: policyNum,
              reason: `User requested date adjustment to ${targetDateStr}`,
              previousSavedAt: record.savedAt,
              previousCreatedAt: record.createdAt,
              newSavedAt: targetIsoDate,
              newCreatedAt: targetIsoDate,
              targetDate: targetDateStr,
            },
          }
        })
      ]);
      if (results) break;
    } catch (e) {
      console.log(`Transaction attempt ${attempt} failed: ${e.message}. Retrying in 2s...`);
      await new Promise(r => setTimeout(r, 2000));
    }
  }

  if (!results) {
    console.error('Failed to complete transaction.');
    return;
  }

  const [updatedRecord, updatedUpload] = results;
  console.log('Policy Successfully Moved!');
  console.log('Updated Record:', {
    id: updatedRecord.id,
    savedAt: updatedRecord.savedAt,
    createdAt: updatedRecord.createdAt,
    policyNumber: updatedRecord.reviewedData?.policyNumber,
    startDate: updatedRecord.reviewedData?.startDate,
    uploadedFileId: updatedRecord.uploadedFileId,
  });
  if (updatedUpload) {
    console.log('Updated UploadedFile:', {
      id: updatedUpload.id,
      createdAt: updatedUpload.createdAt,
    });
  }
}

const policyNum = process.argv[2] || '45140031260200004025';
const targetDate = process.argv[3] || '30/07/2026';

movePolicy(policyNum, targetDate)
  .catch(console.error)
  .finally(() => prisma.$disconnect());
