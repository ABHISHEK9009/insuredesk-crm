require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const policies = [
  '3001/405801684/01/000',
  '3001/405863910/01/000'
];

async function main() {
  const targetDate = new Date('2026-08-15T12:00:00.000Z');

  for (const policyNum of policies) {
    console.log(`\n========================================`);
    console.log(`Processing Policy: ${policyNum}`);
    console.log(`Target saved_at: ${targetDate.toISOString()}`);

    const records = await prisma.policyRecord.findMany({
      where: {
        deletedAt: null,
        OR: [
          { reviewedData: { path: ['policyNumber'], equals: policyNum } },
          { data: { path: ['policyNumber'], equals: policyNum } },
          { data: { path: ['Policy No.'], equals: policyNum } },
          { reviewedData: { path: ['policyNumber'], string_contains: policyNum.split('/')[1] } },
          { data: { path: ['policyNumber'], string_contains: policyNum.split('/')[1] } }
        ]
      }
    });

    if (records.length === 0) {
      // Fallback search
      const rawRecords = await prisma.$queryRaw`
        SELECT id, saved_at, created_at, uploaded_file_id, reviewed_data, data
        FROM pdf_records
        WHERE deleted_at IS NULL
          AND (
            reviewed_data::text LIKE ${'%' + policyNum + '%'}
            OR data::text LIKE ${'%' + policyNum + '%'}
          )
      `;
      if (rawRecords.length > 0) {
        for (const raw of rawRecords) {
          const rec = await prisma.policyRecord.findUnique({ where: { id: raw.id } });
          if (rec) records.push(rec);
        }
      }
    }

    if (records.length === 0) {
      console.log(`No record found for ${policyNum}`);
      continue;
    }

    for (const record of records) {
      console.log(`Found record ${record.id}:`, {
        insuredName: record.reviewedData?.insuredName || record.data?.insuredName,
        currentSavedAt: record.savedAt,
        policyNumber: record.reviewedData?.policyNumber || record.data?.policyNumber
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
            data: {
              createdAt: targetDate
            }
          });
          console.log(`Updated uploadedFile ${record.uploadedFileId}`);
        } catch (e) {
          console.log(`Note: uploadedFile update skipped: ${e.message}`);
        }
      }

      console.log(`Record ${record.id} moved to August 2026 successfully.`);
    }
  }

  // Final verification
  console.log(`\n========================================`);
  console.log(`VERIFICATION FROM DATABASE:`);
  const check = await prisma.$queryRaw`
    SELECT id, saved_at, created_at, reviewed_data->>'policyNumber' as policy_number, reviewed_data->>'insuredName' as insured_name, reviewed_data->>'totalPremium' as total_premium, reviewed_data->>'netPremium' as net_premium
    FROM pdf_records
    WHERE deleted_at IS NULL
      AND (
        reviewed_data::text LIKE '%405801684%'
        OR data::text LIKE '%405801684%'
        OR reviewed_data::text LIKE '%405863910%'
        OR data::text LIKE '%405863910%'
      )
  `;
  console.log(check);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
