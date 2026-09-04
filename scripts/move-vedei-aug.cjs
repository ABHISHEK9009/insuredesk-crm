require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const POLICY_NUMBER = '2856208923910800000';
const TARGET_DATE = new Date('2026-08-25T12:00:00.000Z');

async function main() {
  console.log(`\n========================================`);
  console.log(`Moving Policy ${POLICY_NUMBER} to August 2026`);
  console.log(`Target savedAt / createdAt: ${TARGET_DATE.toISOString()}`);

  const record = await prisma.policyRecord.findFirst({
    where: {
      deletedAt: null,
      OR: [
        { reviewedData: { path: ['policyNumber'], equals: POLICY_NUMBER } },
        { data: { path: ['policyNumber'], equals: POLICY_NUMBER } },
        { id: '22548685-ac35-4b0c-a2da-d266d8c1c3fa' }
      ]
    },
    include: {
      uploadedFile: true
    }
  });

  if (!record) {
    console.error(`[ERROR] No record found for policy ${POLICY_NUMBER}`);
    process.exit(1);
  }

  console.log(`Found record ${record.id}:`, {
    insuredName: record.reviewedData?.insuredName || record.data?.insuredName,
    policyNumber: record.reviewedData?.policyNumber || record.data?.policyNumber,
    currentSavedAt: record.savedAt,
    currentCreatedAt: record.createdAt,
    policyStartDate: record.reviewedData?.policyStartDate || record.reviewedData?.startDate || record.data?.startDate
  });

  const updatedReviewed = { ...(record.reviewedData || {}) };
  updatedReviewed.savedAt = TARGET_DATE.toISOString();
  updatedReviewed.createdAt = TARGET_DATE.toISOString();
  updatedReviewed.uploadedAt = TARGET_DATE.toISOString();

  const updatedData = { ...(record.data || {}) };
  updatedData.savedAt = TARGET_DATE.toISOString();
  updatedData.createdAt = TARGET_DATE.toISOString();
  updatedData.uploadedAt = TARGET_DATE.toISOString();

  await prisma.policyRecord.update({
    where: { id: record.id },
    data: {
      savedAt: TARGET_DATE,
      createdAt: TARGET_DATE,
      reviewedData: updatedReviewed,
      data: updatedData
    }
  });

  console.log(`Updated PolicyRecord ${record.id} savedAt and createdAt to ${TARGET_DATE.toISOString()}`);

  if (record.uploadedFileId) {
    try {
      await prisma.uploadedFile.update({
        where: { id: record.uploadedFileId },
        data: {
          createdAt: TARGET_DATE
        }
      });
      console.log(`Updated UploadedFile ${record.uploadedFileId} createdAt to ${TARGET_DATE.toISOString()}`);
    } catch (e) {
      console.warn(`UploadedFile update warning: ${e.message}`);
    }
  }

  // Verification query
  const verified = await prisma.policyRecord.findUnique({
    where: { id: record.id },
    include: { uploadedFile: true }
  });

  console.log('\n--- Verification Result ---');
  console.log('ID:', verified.id);
  console.log('savedAt:', verified.savedAt);
  console.log('createdAt:', verified.createdAt);
  console.log('reviewedData.savedAt:', verified.reviewedData?.savedAt);
  console.log('uploadedFile.createdAt:', verified.uploadedFile?.createdAt);
  console.log('Policy successfully moved to August 2026!');
}

main()
  .catch(err => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
