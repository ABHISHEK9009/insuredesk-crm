const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const creds = await prisma.task.findMany({
    where: {
      sourceKey: { startsWith: 'client-credential:' }
    },
    select: {
      id: true,
      recordId: true,
      recordLabel: true,
      customerMobile: true,
      customerName: true,
      metadata: true
    }
  });

  console.log(`\n=== REAL CLIENTS WITH SECURED MPIN CREDENTIALS IN CRM DATABASE ===`);
  for (const c of creds) {
    const clientPhone = (c.customerMobile || '').replace(/[^0-9]/g, '').slice(-10);
    const clientName = (c.customerName || c.recordLabel || '').trim();

    const matchedPolicies = await prisma.$queryRaw`
      SELECT id, 
             COALESCE(NULLIF(reviewed_data->>'policyNumber', ''), data->>'policyNumber', '') as "policyNumber",
             COALESCE(NULLIF(reviewed_data->>'insuranceCompany', ''), data->>'insuranceCompany', '') as "company",
             COALESCE(NULLIF(reviewed_data->>'policyType', ''), data->>'policyType', '') as "type",
             COALESCE(NULLIF(reviewed_data->>'totalPremium', ''), data->>'totalPremium', data->>'premium', '') as "premium"
      FROM pdf_records
      WHERE deleted_at IS NULL
        AND (
          LOWER(COALESCE(NULLIF(reviewed_data->>'clientId', ''), data->>'clientId', '')) = LOWER(${c.recordId})
          OR (${clientPhone} != '' AND COALESCE(NULLIF(reviewed_data->>'contactNumber', ''), data->>'contactNumber', '') LIKE ${'%' + clientPhone + '%'})
          OR (${clientPhone} != '' AND COALESCE(NULLIF(reviewed_data->>'mobileNumber', ''), data->>'mobileNumber', '') LIKE ${'%' + clientPhone + '%'})
          OR (${clientPhone} != '' AND COALESCE(NULLIF(reviewed_data->>'phone', ''), data->>'phone', '') LIKE ${'%' + clientPhone + '%'})
          OR (${clientName} != '' AND LOWER(COALESCE(NULLIF(reviewed_data->>'insuredName', ''), data->>'insuredName', '')) = LOWER(${clientName}))
        )
    `;

    console.log(`\nClient: ${c.customerName || c.recordLabel}`);
    console.log(`Client ID: ${c.recordId}`);
    console.log(`Mobile: ${c.customerMobile}`);
    console.log(`Credential Version: ${c.metadata?.credentialVersion || 1}`);
    console.log(`Matched Policies Count: ${matchedPolicies.length}`);
    if (matchedPolicies.length > 0) {
      console.log('Sample Policies:', matchedPolicies.slice(0, 3));
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
