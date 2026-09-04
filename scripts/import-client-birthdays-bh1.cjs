require('dotenv').config();
const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

function normalizePhone(val) {
  if (!val) return '';
  let digits = String(val).replace(/\D/g, '');
  if (digits.startsWith('0091') && digits.length === 14) digits = digits.slice(4);
  if (digits.startsWith('91') && digits.length === 12) digits = digits.slice(2);
  if (digits.startsWith('0') && digits.length === 11) digits = digits.slice(1);
  if (/^[6-9]\d{9}$/.test(digits)) return digits;
  return '';
}

function parseDob(rawDob) {
  if (!rawDob) return null;
  if (typeof rawDob === 'number') {
    const dateObj = XLSX.SSF.parse_date_code(rawDob);
    if (dateObj && dateObj.y && dateObj.m && dateObj.d) {
      return new Date(Date.UTC(dateObj.y, dateObj.m - 1, dateObj.d, 0, 0, 0));
    }
  }

  if (typeof rawDob === 'string') {
    const s = rawDob.trim();
    if (s.toLowerCase() === 'na' || s.length < 4) return null;

    const isoMatch = s.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
    if (isoMatch) {
      return new Date(Date.UTC(parseInt(isoMatch[1], 10), parseInt(isoMatch[2], 10) - 1, parseInt(isoMatch[3], 10)));
    }

    const dmyMatch = s.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
    if (dmyMatch) {
      return new Date(Date.UTC(parseInt(dmyMatch[3], 10), parseInt(dmyMatch[2], 10) - 1, parseInt(dmyMatch[1], 10)));
    }

    const parsed = new Date(s);
    if (!isNaN(parsed.getTime()) && parsed.getFullYear() > 1900 && parsed < new Date()) {
      return parsed;
    }
  }

  return null;
}

function cleanName(raw) {
  if (!raw) return '';
  return String(raw)
    .replace(/[,\s]+$/, '')
    .trim();
}

async function main() {
  console.log('Starting BH1.xlsx client birthday import...');

  const filePath = path.join(process.cwd(), 'storage', 'BH1.xlsx');
  if (!fs.existsSync(filePath)) {
    console.error('File not found:', filePath);
    process.exit(1);
  }

  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0] || 'Sheet1';
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) {
    console.error(`Sheet "${sheetName}" not found in BH1.xlsx`);
    process.exit(1);
  }

  const rawJson = XLSX.utils.sheet_to_json(sheet);
  console.log(`Loaded sheet "${sheetName}": ${rawJson.length} raw rows`);

  // Resolve admin user
  const adminUser = await prisma.user.findFirst({
    where: { role: 'SUPER_ADMIN' },
    select: { id: true, name: true, organizationId: true },
  });

  const actorId = adminUser?.id || null;
  const actorName = adminUser?.name || 'Abhishek Verma';
  const orgId = adminUser?.organizationId || null;

  console.log(`Scoped User: ${actorName} (${actorId}), Organization: ${orgId}`);

  let createdCount = 0;
  let updatedCount = 0;
  let skippedCount = 0;
  const seenKeySet = new Set();
  const clientsToProcess = [];

  for (let idx = 0; idx < rawJson.length; idx++) {
    const row = rawJson[idx];
    const nameKey = Object.keys(row).find(k => k.toLowerCase().includes('name') || k.toLowerCase().includes('client'));
    const phoneKey = Object.keys(row).find(k => k.toLowerCase().includes('phone') || k.toLowerCase().includes('mobile') || k.toLowerCase().includes('contact'));
    const dobKey = Object.keys(row).find(k => k.toLowerCase().includes('dob') || k.toLowerCase().includes('birth') || k.toLowerCase().includes('date'));
    const lobKey = Object.keys(row).find(k => k.toLowerCase().includes('line') || k.toLowerCase().includes('business') || k.toLowerCase().includes('lob'));
    const remarkKey = Object.keys(row).find(k => k.toLowerCase().includes('remark'));

    const name = cleanName(row[nameKey]);
    const phone = normalizePhone(row[phoneKey]);
    const dob = parseDob(row[dobKey]);
    const lob = row[lobKey] ? String(row[lobKey]).trim() : '';
    const remark = row[remarkKey] ? String(row[remarkKey]).trim() : '';

    if (!name || !phone || !dob) {
      skippedCount++;
      continue;
    }

    const dedupeKey = `${name.toLowerCase()}_${phone}`;
    if (seenKeySet.has(dedupeKey)) {
      continue;
    }
    seenKeySet.add(dedupeKey);

    clientsToProcess.push({
      name,
      phone,
      dob,
      lob,
      remark,
    });
  }

  console.log(`Extracted ${clientsToProcess.length} unique valid client birthday records. (Skipped ${skippedCount} invalid/incomplete rows)`);

  for (let i = 0; i < clientsToProcess.length; i++) {
    const client = clientsToProcess[i];
    try {
      // Find matching profile with same phone and name
      const existing = await prisma.customerProfile.findFirst({
        where: {
          deletedAt: null,
          phone: client.phone,
          ...(orgId ? { organizationId: orgId } : {}),
          name: { equals: client.name, mode: 'insensitive' },
        },
      });

      const combinedRemarks = [
        client.lob ? `LOB: ${client.lob}` : '',
        client.remark ? `Remark: ${client.remark}` : '',
      ].filter(Boolean).join(' | ');

      if (existing) {
        await prisma.customerProfile.update({
          where: { id: existing.id },
          data: {
            dob: client.dob,
            referenceSource: 'BH1.xlsx',
            remarks: combinedRemarks || existing.remarks,
            updatedById: actorId,
          },
        });
        updatedCount++;
      } else {
        // Create new customer profile
        await prisma.customerProfile.create({
          data: {
            name: client.name,
            phone: client.phone,
            dob: client.dob,
            customerType: 'Existing',
            status: 'Converted',
            organizationId: orgId,
            createdById: actorId,
            updatedById: actorId,
            assignedTo: actorName,
            referenceSource: 'BH1.xlsx',
            remarks: combinedRemarks || undefined,
          },
        });
        createdCount++;
      }
    } catch (err) {
      console.error(`Error processing client ${client.name} (${client.phone}):`, err.message);
    }
  }

  console.log('\n=== BH1.xlsx Import Completed ===');
  console.log(`Total Valid Processed: ${clientsToProcess.length}`);
  console.log(`Created: ${createdCount}`);
  console.log(`Updated: ${updatedCount}`);

  const totalWithDob = await prisma.customerProfile.count({ where: { dob: { not: null } } });
  console.log(`Total Customer Profiles with Birthday in DB now: ${totalWithDob}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
