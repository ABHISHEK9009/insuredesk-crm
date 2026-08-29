const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const clients = await prisma.clientAccount.findMany({
    take: 10,
    select: {
      id: true,
      name: true,
      phone: true,
      email: true,
      organizationId: true
    }
  });

  console.log('CLIENTS FOUND:', JSON.stringify(clients, null, 2));

  // Check tasks with credentials
  const credentials = await prisma.task.findMany({
    where: {
      sourceKey: { startsWith: 'client-credential:' }
    },
    select: {
      id: true,
      sourceKey: true,
      recordId: true,
      recordLabel: true,
      customerMobile: true,
      metadata: true
    }
  });

  console.log('CREDENTIAL TASKS:', JSON.stringify(credentials, null, 2));

  // Also check total policies and customers
  const policiesCount = await prisma.policy.count();
  console.log('TOTAL POLICIES IN DB:', policiesCount);
}

main().catch(console.error).finally(() => prisma.$disconnect());
