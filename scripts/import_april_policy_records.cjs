const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');
const { PrismaClient } = require('@prisma/client');
const { randomUUID } = require('crypto');

const prisma = new PrismaClient();

function excelDateToString(val) {
  if (val === "" || val === null || val === undefined) return "";
  if (typeof val === 'number') {
    const utc_days = Math.floor(val - 25569);
    const utc_value = utc_days * 86400;
    const date_info = new Date(utc_value * 1000);
    return date_info.toISOString().split('T')[0];
  }
  const str = String(val).trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(str)) return str.slice(0, 10);
  if (/^\d{2}[-/]\d{2}[-/]\d{4}/.test(str)) {
    const parts = str.split(/[-/]/);
    const d = parts[0].padStart(2, '0');
    const m = parts[1].padStart(2, '0');
    const y = parts[2];
    return `${y}-${m}-${d}`;
  }
  return str;
}

function normalizePhone(val) {
  if (!val) return "";
  const cleaned = String(val).replace(/\D/g, "");
  if (cleaned.length === 10) return cleaned;
  if (cleaned.length === 11 && cleaned.startsWith("0")) return cleaned.slice(1);
  if (cleaned.length === 12 && cleaned.startsWith("91")) return cleaned.slice(2);
  return cleaned.slice(-10);
}

function normalizeCompanyName(row) {
  const comp = String(row['Current Year Insurance Company'] || row['Non Motor Current Year Insure Com'] || '').trim();
  if (!comp || comp === '.') return "Unknown Insurer";
  return comp;
}

async function importAprilData() {
  console.log("=== STARTING FAST BATCH IMPORT OF APRIL 26 DATA.XLSX ===");

  const filePath = path.join(__dirname, '../storage/April 26 data.xlsx');
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  const workbook = XLSX.readFile(filePath);
  const sheet = workbook.Sheets['Sheet1'];
  const rawRows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

  console.log(`Loaded ${rawRows.length} rows from Excel.`);

  // 1. Get Super Admin user
  const adminUser = await prisma.user.findFirst({
    where: { role: 'SUPER_ADMIN' },
    select: { id: true, organizationId: true }
  });

  const actorId = adminUser?.id || null;
  const organizationId = adminUser?.organizationId || null;

  // 2. Fetch all existing policy numbers into memory
  console.log("Fetching existing policy numbers from database...");
  const existingRows = await prisma.policyRecord.findMany({
    where: { deletedAt: null },
    select: { id: true, data: true }
  });

  const existingMap = new Map();
  for (const r of existingRows) {
    const pNum = r.data?.policyNumber;
    if (pNum) {
      existingMap.set(String(pNum).trim().toLowerCase(), r.id);
    }
  }
  console.log(`Found ${existingMap.size} existing policy numbers in database.`);

  const toCreate = [];
  const toUpdate = [];
  let skippedCount = 0;
  let totalNetSum = 0;
  let totalGrossSum = 0;

  for (const row of rawRows) {
    const policyNumber = String(row['Policy Number'] || '').trim();
    const insuredName = String(row['Insure Name'] || row['First Name'] || '').trim();

    if (!policyNumber && !insuredName) {
      skippedCount++;
      continue;
    }

    const company = normalizeCompanyName(row);
    const contactPerson = String(row['Contact Person'] || row['Sale Agent'] || row['First Name'] || '').trim();
    const mobile = normalizePhone(row['Mobile No']);
    const product = String(row['Product'] || '').trim();
    const coverage = String(row['Coverage'] || '').trim();
    const policyType = product ? (coverage ? `${product} - ${coverage}` : product) : "Motor Policy";

    const make = String(row['Make'] || '').trim();
    const model = String(row['Model'] || '').trim();
    const makeModel = [make, model].filter(Boolean).join(" ");
    const registrationNumber = String(row['Registration Num'] || '').trim();

    const startDate = excelDateToString(row['Policy Start Date'] || row['Non Motor Policy Start Date']);
    const expiryDate = excelDateToString(row['Policy Expiry Date'] || row['Non Motor Policy Expiry Date']);
    const sourcingDateStr = excelDateToString(row['Sourcing Date']);

    const idv = String(row['IDV'] || '').trim();
    const ncb = String(row['NCB'] || '').trim();
    const discount = String(row['Discount'] || '').trim();

    const netPremium = String(row['Net Premium'] || '').trim();
    const totalPremium = String(row['Total Premium'] || row['Non Motor Premium'] || '').trim();
    const odPremium = String(row['OD Premium'] || '').trim();
    const tpPremium = String(row['TP+Driver+Owner'] || '').trim();

    const netNum = parseFloat(netPremium) || 0;
    const grossNum = parseFloat(totalPremium) || 0;
    totalNetSum += netNum;
    totalGrossSum += grossNum;

    const customerId = String(row['Customer Id'] || '').trim();
    const address = String(row['Address'] || '').trim();
    const landmark = String(row['Landmark'] || '').trim();
    const pan = String(row['Pan Num'] || '').trim();
    const aadhar = String(row['Aadhar Num'] || '').trim();
    const gstin = String(row['GST Num'] || '').trim();
    const dob = excelDateToString(row['Date Of Birth']);

    let savedAtDate = new Date();
    if (sourcingDateStr) {
      const parsed = new Date(sourcingDateStr);
      if (!isNaN(parsed.getTime())) savedAtDate = parsed;
    } else if (startDate) {
      const parsed = new Date(startDate);
      if (!isNaN(parsed.getTime())) savedAtDate = parsed;
    }

    const policyPayload = {
      customerId,
      insuredName,
      policyNumber,
      insuranceCompany: company,
      companyName: company,
      policyType,
      selectedPolicyType: product || "Motor",
      documentCategory: "Motor",
      contactPerson,
      contactPersonName: contactPerson,
      contactNumber: mobile,
      customerMobile: mobile,
      renewalRecipientName: insuredName,
      renewalRecipientMobile: mobile,
      vehicleNumber: registrationNumber,
      registrationNumber,
      make,
      model,
      makeModel,
      startDate,
      expiryDate,
      idv,
      ncb,
      discount,
      netPremium,
      totalPremium,
      premium: totalPremium,
      odPremium,
      tpPremium,
      address,
      landmark,
      panNumber: pan,
      aadharNumber: aadhar,
      gstin,
      dateOfBirth: dob,
      sourceFile: "April 26 data.xlsx",
      sourceDocumentType: "EXCEL_POLICY_BOOK",
      month: String(row['Month'] || '').trim(),
    };

    const key = policyNumber.toLowerCase();
    if (policyNumber && existingMap.has(key)) {
      toUpdate.push({
        id: existingMap.get(key),
        payload: policyPayload,
        company,
        product: product || "Motor",
        contactPerson,
        mobile,
        insuredName,
      });
    } else {
      toCreate.push({
        id: randomUUID(),
        savedAt: savedAtDate,
        sourceFile: "April 26 data.xlsx",
        pdfFileName: "April 26 data.xlsx",
        selectedCompany: company,
        selectedServiceCategory: "Motor",
        selectedPolicyType: product || "Motor",
        contactPersonName: contactPerson,
        contactPersonMobile: mobile,
        renewalRecipientName: insuredName,
        renewalRecipientMobile: mobile,
        data: policyPayload,
        reviewedData: policyPayload,
        extractedData: policyPayload,
        organizationId,
        createdById: actorId,
        updatedById: actorId,
        clientIdPending: false,
        clientIdStatus: "UNLINKED",
      });
    }
  }

  console.log(`Ready to create: ${toCreate.length} new records, to update: ${toUpdate.length} existing records.`);

  // 3. Batch insert new records in chunks of 250
  const CHUNK_SIZE = 250;
  for (let i = 0; i < toCreate.length; i += CHUNK_SIZE) {
    const chunk = toCreate.slice(i, i + CHUNK_SIZE);
    await prisma.policyRecord.createMany({
      data: chunk,
      skipDuplicates: true,
    });
    console.log(`Created ${Math.min(i + CHUNK_SIZE, toCreate.length)} / ${toCreate.length} records...`);
  }

  // 4. Update existing records if any
  for (const item of toUpdate) {
    await prisma.policyRecord.update({
      where: { id: item.id },
      data: {
        data: item.payload,
        reviewedData: item.payload,
        selectedCompany: item.company,
        selectedServiceCategory: "Motor",
        selectedPolicyType: item.product,
        contactPersonName: item.contactPerson,
        contactPersonMobile: item.mobile,
        renewalRecipientName: item.insuredName,
        renewalRecipientMobile: item.mobile,
        updatedById: actorId,
      }
    });
  }

  console.log("\n=== IMPORT COMPLETED SUCCESSFULLY ===");
  console.log(`Total Rows in Excel: ${rawRows.length}`);
  console.log(`New Records Created: ${toCreate.length}`);
  console.log(`Existing Records Updated: ${toUpdate.length}`);
  console.log(`Skipped Rows: ${skippedCount}`);
  console.log(`Total Gross Premium: ₹${totalGrossSum.toLocaleString('en-IN')}`);
  console.log(`Total Net Premium: ₹${totalNetSum.toLocaleString('en-IN')}`);

  const totalInDb = await prisma.policyRecord.count({ where: { deletedAt: null } });
  console.log(`Total Active Policy Records in Database Now: ${totalInDb}`);
}

importAprilData()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
