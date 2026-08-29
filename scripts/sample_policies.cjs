const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const policies = await prisma.policyRecord.findMany({
    where: { deletedAt: null },
    take: 10,
    select: {
      id: true,
      selectedCompany: true,
      selectedPolicyType: true,
      reviewedData: true,
      data: true
    }
  });

  console.log(`FOUND ${policies.length} POLICIES:`);
  for (const p of policies) {
    const d = p.reviewedData || p.data || {};
    console.log({
      id: p.id,
      company: p.selectedCompany || d.insuranceCompany,
      type: p.selectedPolicyType || d.policyType,
      policyNumber: d.policyNumber,
      insuredName: d.insuredName || d.customerName,
      contactNumber: d.contactNumber || d.mobileNumber || d.phone,
      clientId: d.clientId,
      premium: d.premium || d.totalPremium
    });
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
