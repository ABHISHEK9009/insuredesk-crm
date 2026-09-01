const { PrismaClient } = require("@prisma/client");
const { randomUUID } = require("node:crypto");

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

async function main() {
  console.log("Starting policy deduplication script (Non-destructive soft-delete)...");

  // 1. Identify all duplicate policy number groups in pdf_records
  const duplicateGroups = await prisma.$queryRaw`
    SELECT 
      COALESCE(
        NULLIF(TRIM(reviewed_data->>'policyNumber'), ''),
        NULLIF(TRIM(data->>'policyNumber'), ''),
        NULLIF(TRIM(data->>'Policy No.'), '')
      ) AS policy_number,
      COUNT(*)::int AS count,
      ARRAY_AGG(id::text ORDER BY saved_at ASC) AS record_ids,
      ARRAY_AGG(saved_at::text ORDER BY saved_at ASC) AS saved_dates,
      ARRAY_AGG(uploaded_file_id::text ORDER BY saved_at ASC) AS uploaded_file_ids,
      ARRAY_AGG(organization_id::text ORDER BY saved_at ASC) AS organization_ids
    FROM pdf_records
    WHERE deleted_at IS NULL
    GROUP BY 1
    HAVING COUNT(*) > 1 AND COALESCE(
      NULLIF(TRIM(reviewed_data->>'policyNumber'), ''),
      NULLIF(TRIM(data->>'policyNumber'), ''),
      NULLIF(TRIM(data->>'Policy No.'), '')
    ) IS NOT NULL
    ORDER BY count DESC;
  `;

  console.log(`Found ${duplicateGroups.length} duplicate policy groups to resolve.`);
  const now = new Date();
  let totalPoliciesSoftDeleted = 0;
  let totalUploadsSoftDeleted = 0;

  for (const group of duplicateGroups) {
    const policyNumber = group.policy_number;
    const [primaryId, ...duplicateIds] = group.record_ids;
    const [primaryUploadId, ...duplicateUploadIds] = group.uploaded_file_ids;
    const organizationId = group.organization_ids[0] || null;

    console.log(`\nProcessing Policy #${policyNumber}:`);
    console.log(`  Keeping Primary Record: ${primaryId} (savedAt: ${group.saved_dates[0]})`);
    console.log(`  Soft-deleting ${duplicateIds.length} duplicate record(s): ${duplicateIds.join(", ")}`);

    for (let i = 0; i < duplicateIds.length; i++) {
      const dupRecordId = duplicateIds[i];
      const dupUploadId = duplicateUploadIds[i];

      // Verify no active endorsements or claims linked to duplicate record
      const endorsementsCount = await prisma.endorsement.count({
        where: { policyId: dupRecordId, deletedAt: null },
      });
      const customerSourcedCount = await prisma.customerProfile.count({
        where: { sourcePolicyId: dupRecordId, deletedAt: null },
      });

      if (endorsementsCount > 0 || customerSourcedCount > 0) {
        console.warn(
          `  SKIPPING ${dupRecordId}: has ${endorsementsCount} endorsements or ${customerSourcedCount} customer links.`,
        );
        continue;
      }

      // Soft delete the duplicate PolicyRecord
      await prisma.policyRecord.update({
        where: { id: dupRecordId },
        data: { deletedAt: now },
      });
      totalPoliciesSoftDeleted++;

      // Log Audit entry
      await prisma.auditLog.create({
        data: {
          id: randomUUID(),
          action: "SOFT_DELETE_DUPLICATE_POLICY",
          entityType: "PolicyRecord",
          entityId: dupRecordId,
          severity: "INFO",
          source: "SYSTEM",
          organizationId: organizationId,
          metadata: {
            reason: "Deduplication: duplicate copy of primary policy record",
            policyNumber: policyNumber,
            primaryRecordId: primaryId,
          },
        },
      });

      // Soft delete the corresponding UploadedFile if exists
      if (dupUploadId && dupUploadId !== primaryUploadId) {
        await prisma.uploadedFile.update({
          where: { id: dupUploadId },
          data: { deletedAt: now },
        });
        totalUploadsSoftDeleted++;

        await prisma.auditLog.create({
          data: {
            id: randomUUID(),
            action: "SOFT_DELETE_DUPLICATE_UPLOAD",
            entityType: "UploadedFile",
            entityId: dupUploadId,
            severity: "INFO",
            source: "SYSTEM",
            organizationId: organizationId,
            metadata: {
              reason: "Deduplication: duplicate upload linked to duplicate policy record",
              policyNumber: policyNumber,
              primaryUploadId: primaryUploadId,
            },
          },
        });
      }
    }
  }

  console.log("\n=== DEDUPLICATION SUMMARY ===");
  console.log(`Total Policy Records Soft-Deleted: ${totalPoliciesSoftDeleted}`);
  console.log(`Total Uploaded Files Soft-Deleted: ${totalUploadsSoftDeleted}`);

  // Re-verify remaining active duplicate count
  const remainingDuplicates = await prisma.$queryRaw`
    SELECT 
      COALESCE(
        NULLIF(TRIM(reviewed_data->>'policyNumber'), ''),
        NULLIF(TRIM(data->>'policyNumber'), ''),
        NULLIF(TRIM(data->>'Policy No.'), '')
      ) AS policy_number,
      COUNT(*)::int AS count
    FROM pdf_records
    WHERE deleted_at IS NULL
    GROUP BY 1
    HAVING COUNT(*) > 1 AND COALESCE(
      NULLIF(TRIM(reviewed_data->>'policyNumber'), ''),
      NULLIF(TRIM(data->>'policyNumber'), ''),
      NULLIF(TRIM(data->>'Policy No.'), '')
    ) IS NOT NULL;
  `;

  console.log(`Remaining Active Duplicate Policy Groups: ${remainingDuplicates.length}`);
}

main()
  .catch((e) => {
    console.error("Error in deduplication script:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
