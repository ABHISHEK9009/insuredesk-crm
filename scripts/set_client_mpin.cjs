const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const mpin = '1234';
  const mpinHash = await bcrypt.hash(mpin, 10);

  // 1. Anand Soni
  const anand = await prisma.clientAccount.findFirst({
    where: { phone: { contains: '8818889660' } }
  });

  if (anand) {
    console.log('Found Anand Soni:', anand.id, anand.name, anand.phone);
    await prisma.task.upsert({
      where: { sourceKey: `client-credential:${anand.id}` },
      create: {
        organizationId: anand.organizationId,
        title: "Client portal credential",
        description: "Secured client MPIN credential.",
        type: "SERVICE_REQUEST",
        status: "COMPLETED",
        priority: "MEDIUM",
        module: "CLIENT_PORTAL_SECURITY",
        recordId: anand.id,
        recordLabel: anand.name,
        customerName: anand.name,
        customerMobile: anand.phone,
        sourceKey: `client-credential:${anand.id}`,
        metadata: {
          mpinHash,
          failedAttempts: 0,
          lockedUntil: null,
          credentialVersion: 1
        },
        completedAt: new Date(),
        archivedAt: new Date(),
      },
      update: {
        metadata: {
          mpinHash,
          failedAttempts: 0,
          lockedUntil: null,
          credentialVersion: 1
        },
        completedAt: new Date(),
        archivedAt: new Date(),
      }
    });
    console.log('✅ Set MPIN 1234 for Anand Soni');
  }

  // 2. Abhishek Verma
  const abhishek = await prisma.clientAccount.findFirst({
    where: { phone: { contains: '8839707135' } }
  });

  if (abhishek) {
    console.log('Found Abhishek Verma:', abhishek.id, abhishek.name, abhishek.phone);
    await prisma.task.upsert({
      where: { sourceKey: `client-credential:${abhishek.id}` },
      create: {
        organizationId: abhishek.organizationId,
        title: "Client portal credential",
        description: "Secured client MPIN credential.",
        type: "SERVICE_REQUEST",
        status: "COMPLETED",
        priority: "MEDIUM",
        module: "CLIENT_PORTAL_SECURITY",
        recordId: abhishek.id,
        recordLabel: abhishek.name,
        customerName: abhishek.name,
        customerMobile: abhishek.phone,
        sourceKey: `client-credential:${abhishek.id}`,
        metadata: {
          mpinHash,
          failedAttempts: 0,
          lockedUntil: null,
          credentialVersion: 1
        },
        completedAt: new Date(),
        archivedAt: new Date(),
      },
      update: {
        metadata: {
          mpinHash,
          failedAttempts: 0,
          lockedUntil: null,
          credentialVersion: 1
        },
        completedAt: new Date(),
        archivedAt: new Date(),
      }
    });
    console.log('✅ Set MPIN 1234 for Abhishek Verma');
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
