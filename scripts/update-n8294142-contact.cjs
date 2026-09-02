require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { randomUUID } = require('node:crypto');
const prisma = new PrismaClient();

async function updateContact() {
  const records = await prisma.policyRecord.findMany({
    where: {
      deletedAt: null,
      OR: [
        { reviewedData: { path: ['policyNumber'], equals: 'N8294142' } },
        { data: { path: ['policyNumber'], equals: 'N8294142' } },
        { data: { path: ['Policy No.'], equals: 'N8294142' } }
      ]
    }
  });

  if (records.length === 0) {
    console.log('No record found for N8294142');
    return;
  }

  for (const record of records) {
    console.log(`Updating record ${record.id}...`);
    const oldReviewed = record.reviewedData || {};
    const oldData = record.data || {};

    const newReviewed = {
      ...oldReviewed,
      contactPerson: 'ARJUN SIR',
      contactNumber: '9111111692',
      customerMobile: '9111111692'
    };

    const newData = {
      ...oldData,
      contactPerson: 'ARJUN SIR',
      contactNumber: '9111111692',
      customerMobile: '9111111692'
    };

    await prisma.policyRecord.update({
      where: { id: record.id },
      data: {
        reviewedData: newReviewed,
        data: newData
      }
    });

    console.log(`Record ${record.id} updated successfully:`);
    console.log({
      policyNumber: newReviewed.policyNumber || newData.policyNumber,
      insuredName: newReviewed.insuredName || newData.insuredName,
      contactPerson: newReviewed.contactPerson,
      contactNumber: newReviewed.contactNumber
    });
  }
}

updateContact()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
