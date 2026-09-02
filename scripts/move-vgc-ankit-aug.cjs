require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');
const pdf = require('pdf-parse');
const { extractPolicyFromText } = require('../src/lib/policies/pdf/extractor.cjs');

const targetPolicies = [
  'VGC1620012000100',
  '3001/O/452859230/00/000'
];

async function main() {
  const targetDate = new Date('2026-08-25T12:00:00.000Z');

  for (const policyNum of targetPolicies) {
    console.log(`\n========================================`);
    console.log(`Processing Policy: ${policyNum}`);

    // Search in DB
    const records = await prisma.policyRecord.findMany({
      where: {
        deletedAt: null,
        OR: [
          { reviewedData: { path: ['policyNumber'], equals: policyNum } },
          { data: { path: ['policyNumber'], equals: policyNum } },
          { data: { path: ['Policy No.'], equals: policyNum } }
        ]
      }
    });

    if (records.length === 0) {
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

    if (records.length > 0) {
      for (const record of records) {
        console.log(`Updating existing record ${record.id}:`, {
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
        console.log(`Record ${record.id} updated to August 2026.`);
      }
    } else {
      console.log(`Record not found in DB for ${policyNum}. Checking if PDF file exists in storage to create entry...`);
      if (policyNum === '3001/O/452859230/00/000') {
        const filePath = 'storage/ANKIT SHINDE_MP09DS4073_2026-27.pdf';
        if (fs.existsSync(filePath)) {
          const buf = fs.readFileSync(filePath);
          const pdfData = await pdf(buf);
          const extracted = extractPolicyFromText(pdfData.text, 'ANKIT SHINDE_MP09DS4073_2026-27.pdf');
          const newRec = await prisma.policyRecord.create({
            data: {
              savedAt: targetDate,
              createdAt: targetDate,
              reviewedData: {
                ...extracted,
                savedAt: targetDate.toISOString(),
                createdAt: targetDate.toISOString()
              },
              data: {
                ...extracted,
                savedAt: targetDate.toISOString(),
                createdAt: targetDate.toISOString()
              }
            }
          });
          console.log(`Created new record for ${policyNum} (ANKIT SHINDE) with ID ${newRec.id} in August month.`);
        }
      }
    }
  }

  // Verification
  console.log(`\n========================================`);
  console.log(`DATABASE VERIFICATION:`);
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
        reviewed_data::text LIKE '%VGC1620012000100%'
        OR data::text LIKE '%VGC1620012000100%'
        OR reviewed_data::text LIKE '%452859230%'
        OR data::text LIKE '%452859230%'
      )
  `;
  console.log(check);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
