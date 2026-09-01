require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { randomUUID } = require('node:crypto');

const prisma = new PrismaClient();

async function main() {
  const policyNum = 'OG-27-2301-1801-00000509';
  const targetIsoDate = new Date('2026-08-04T12:00:00.000Z');
  console.log(`Moving policy ${policyNum} to date ${targetIsoDate.toISOString()}...`);

  let record = null;
  for (let attempt = 1; attempt <= 10; attempt++) {
    try {
      record = await prisma.policyRecord.findUnique({
        where: { id: 'ed62cba8-609f-475e-82a5-0ddbb62b4e01' },
      });
      if (record) break;
    } catch (e) {
      console.log(`Fetch attempt ${attempt} failed: ${e.message}. Retrying in 2s...`);
      await new Promise(r => setTimeout(r, 2000));
    }
  }

  if (!record) {
    console.error('Policy record not found!');
    return;
  }

  console.log('Current Record State:', {
    id: record.id,
    savedAt: record.savedAt,
    createdAt: record.createdAt,
    uploadedFileId: record.uploadedFileId,
  });

  const updatedData = typeof record.data === 'object' && record.data !== null ? { ...record.data } : {};
  updatedData.savedAt = targetIsoDate.toISOString();
  updatedData.createdAt = targetIsoDate.toISOString();
  updatedData.uploadedAt = targetIsoDate.toISOString();
  updatedData.startDate = '04/08/2026';
  updatedData.policyStartDate = '04/08/2026';
  if (!updatedData.issueDate) updatedData.issueDate = '03/08/2026';

  const updatedReviewedData = typeof record.reviewedData === 'object' && record.reviewedData !== null ? { ...record.reviewedData } : {};
  updatedReviewedData.savedAt = targetIsoDate.toISOString();
  updatedReviewedData.createdAt = targetIsoDate.toISOString();
  updatedReviewedData.uploadedAt = targetIsoDate.toISOString();
  updatedReviewedData.startDate = '04/08/2026';
  updatedReviewedData.policyStartDate = '04/08/2026';
  if (!updatedReviewedData.issueDate) updatedReviewedData.issueDate = '03/08/2026';

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
              reason: 'User requested date adjustment from Sep to Aug 4, 2026',
              previousSavedAt: record.savedAt,
              previousCreatedAt: record.createdAt,
              newSavedAt: targetIsoDate,
              newCreatedAt: targetIsoDate,
              targetDate: '2026-08-04',
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
  console.log('Policy Successfully Moved to August 4, 2026!');
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

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
