const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Find client accounts that have policies or check how clients and policies are linked
  const clients = await prisma.clientAccount.findMany({
    where: { deletedAt: null },
    take: 20,
    select: {
      id: true,
      name: true,
      phone: true,
      email: true,
      createdAt: true
    }
  });

  console.log(`TOTAL CLIENT ACCOUNTS FOUND: ${clients.length}`);
  console.log(JSON.stringify(clients, null, 2));

  // Also check all credential tasks
  const creds = await prisma.task.findMany({
    where: {
      sourceKey: { startsWith: 'client-credential:' }
    },
    select: {
      id: true,
      sourceKey: true,
      recordId: true,
      recordLabel: true,
      customerMobile: true,
      customerName: true,
      metadata: true
    }
  });

  console.log(`TOTAL CREDENTIAL TASKS: ${creds.length}`);
  console.log(JSON.stringify(creds, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
