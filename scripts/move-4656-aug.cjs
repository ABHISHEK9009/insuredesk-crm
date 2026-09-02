require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function movePolicy() {
  const policyNum = '45140031260100004656';
  const targetDate = new Date('2026-08-15T12:00:00.000Z');

  console.log(`Searching for policy: ${policyNum}...`);

  const records = await prisma.policyRecord.findMany({
    where: {
      deletedAt: null,
      OR: [
        { reviewedData: { path: ['policyNumber'], equals: policyNum } },
        { data: { path: ['policyNumber'], equals: policyNum } },
        { data: { path: ['Policy No.'], equals: policyNum } },
        { reviewedData: { path: ['policyNumber'], string_contains: '4656' } },
        { data: { path: ['policyNumber'], string_contains: '4656' } }
      ]
    }
  });

  if (records.length === 0) {
    const raw = await prisma.$queryRaw`
      SELECT id, saved_at, created_at, uploaded_file_id, reviewed_data, data
      FROM pdf_records
      WHERE deleted_at IS NULL
        AND (
          reviewed_data::text LIKE '%45140031260100004656%'
          OR data::text LIKE '%45140031260100004656%'
          OR reviewed_data::text LIKE '%4656%'
          OR data::text LIKE '%4656%'
        )
    `;
    if (raw.length > 0) {
      for (const r of raw) {
        const rec = await prisma.policyRecord.findUnique({ where: { id: r.id } });
        if (rec) records.push(rec);
      }
    }
  }

  if (records.length === 0) {
    console.log(`No record found for ${policyNum}`);
    return;
  }

  for (const record of records) {
    console.log(`Found record ${record.id}:`, {
      policyNumber: record.reviewedData?.policyNumber || record.data?.policyNumber,
      insuredName: record.reviewedData?.insuredName || record.data?.insuredName,
      oldSavedAt: record.savedAt
    });

    const updatedReviewed = { ...(record.reviewedData || {}) };
    updatedReviewed.savedAt = targetDate.toISOString();
    updatedReviewed.createdAt = targetDate.toISOString();
    updatedReviewed.uploadedAt = targetDate.toISOString();

    const updatedData = { ...(record.data || {}) };
    updatedData.savedAt = targetDate.toISOString();
    updatedData.createdAt = targetDate.toISOString();
    updatedData.uploadedAt = targetDate.toISOString();

    await prisma.policyRecord.update({
      where: { id: record.id },
      data: {
        savedAt: targetDate,
        createdAt: targetDate,
        reviewedData: updatedReviewed,
        data: updatedData
      }
    });

    if (record.uploadedFileId) {
      try {
        await prisma.uploadedFile.update({
          where: { id: record.uploadedFileId },
          data: { createdAt: targetDate }
        });
        console.log(`Updated uploadedFile ${record.uploadedFileId}`);
      } catch (e) {
        console.log(`Note: uploadedFile update skipped: ${e.message}`);
      }
    }
    console.log(`Record ${record.id} moved to August 2026 successfully.`);
  }

  // Verification
  console.log('\n=== VERIFICATION ===');
  const check = await prisma.$queryRaw`
    SELECT id, saved_at, created_at,
           reviewed_data->>'policyNumber' as policy_number,
           reviewed_data->>'insuredName' as insured_name,
           reviewed_data->>'registrationNumber' as reg_no,
           reviewed_data->>'totalPremium' as total_premium,
           reviewed_data->>'netPremium' as net_premium
    FROM pdf_records
    WHERE deleted_at IS NULL
      AND (
        reviewed_data::text LIKE '%45140031260100004656%'
        OR data::text LIKE '%45140031260100004656%'
      )
  `;
  console.log(check);
}

movePolicy()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
