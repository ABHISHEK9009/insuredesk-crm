const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');
const { PrismaClient } = require('@prisma/client');
const { randomUUID } = require('crypto');

const { buildRenewalImportKey, excelDateToString, findRenewalImportMatch, mergeRenewalImportData } = require('../src/lib/renewals/import-identity.cjs');
const { normalizeRenewalInsuranceCompany } = require('../src/lib/renewals/companies');
const { normalizeCustomerName, resolvePolicyCustomerName } = require('../src/lib/renewals/customer-name');

const prisma = new PrismaClient();

const rawData = [
  {
    policyType: "FIRE",
    contactNumber: "9826080008",
    contactPerson: "Shashank Rashinkar",
    policyNumber: "47F17108",
    insuredName: "SAI KRIPA STATIONERY AND GIFT HOUSE",
    sumInsured: "",
    premium: "",
    expiryDate: "2026-09-02",
    insuranceCompany: "IFFCO TOKIO"
  },
  {
    policyType: "FIRE",
    contactNumber: "9926369374",
    contactPerson: "Deepesh Kumar Soni",
    policyNumber: "1015/407042595/00/000",
    insuredName: "MANOJ KUMAR S/O KISHANLAL AGARWAL",
    sumInsured: "25 lakh building, 1 cr stock",
    premium: "1180",
    expiryDate: "2026-09-03",
    insuranceCompany: "ICICI LOMBARD"
  },
  {
    policyType: "FIRE",
    contactNumber: "9111111692",
    contactPerson: "ARJUN",
    policyNumber: "1030/407499116/00/000",
    insuredName: "LION ENGINEERING CONSULTANTS PRIVATE LIMITED",
    sumInsured: "",
    premium: "",
    expiryDate: "2026-09-03",
    insuranceCompany: "ICICI LOMBARD"
  },
  {
    policyType: "FIRE",
    contactNumber: "9111111692",
    contactPerson: "ARJUN",
    policyNumber: "1030/407502184/00/000",
    insuredName: "LION ENGINEERING CONSULTANTS PRIVATE LIMITED",
    sumInsured: "",
    premium: "",
    expiryDate: "2026-09-03",
    insuranceCompany: "ICICI LOMBARD"
  },
  {
    policyType: "WC",
    contactNumber: "9111111692",
    contactPerson: "ARJUN",
    policyNumber: "4010/359029837/01/000",
    insuredName: "M/S LION ENGINEERING CONSULTANTS PRIVATE LIMITED",
    sumInsured: "",
    premium: "",
    expiryDate: "2026-09-03",
    insuranceCompany: "ICICI LOMBARD"
  },
  {
    policyType: "PUBLIC LIABILITY INDUSTRIAL RISK",
    contactNumber: "9111111692",
    contactPerson: "ARJUN",
    policyNumber: "4008/409173108/00/000",
    insuredName: "LION ENGINEERING CONSULTANTS PRIVATE LIMITED",
    sumInsured: "",
    premium: "",
    expiryDate: "2026-09-03",
    insuranceCompany: "ICICI LOMBARD"
  },
  {
    policyType: "INDL RISK",
    contactNumber: "9111111692",
    contactPerson: "ARJUN",
    policyNumber: "4008/407612816/00/000",
    insuredName: "LION ENGINEERING CONSULTANTS PRIVATE LIMITED",
    sumInsured: "",
    premium: "",
    expiryDate: "2026-09-04",
    insuranceCompany: "ICICI LOMBARD"
  },
  {
    policyType: "WORKMANS COMPENSATION",
    contactNumber: "9111111692",
    contactPerson: "ARJUN",
    policyNumber: "4010/359013775/01/000",
    insuredName: "LION ENGINEERING CONSULTANTS PRIVATE LIMITED",
    sumInsured: "",
    premium: "",
    expiryDate: "2026-09-04",
    insuranceCompany: "ICICI LOMBARD"
  },
  {
    policyType: "GROUP HEALTH",
    contactNumber: "9174001011",
    contactPerson: "AMAR",
    policyNumber: "4016/X/O/408230652/00/000",
    insuredName: "ACE INFOTEXIS PVT LTD",
    sumInsured: "",
    premium: "",
    expiryDate: "2026-09-04",
    insuranceCompany: "ICICI LOMBARD"
  },
  {
    policyType: "WORKMANS COMPENSATION",
    contactNumber: "9111111692",
    contactPerson: "ARJUN",
    policyNumber: "4010/359013775/01/001",
    insuredName: "LION ENGINEERING CONSULTANTS PRIVATE LIMITED",
    sumInsured: "",
    premium: "",
    expiryDate: "2026-09-04",
    insuranceCompany: "ICICI LOMBARD"
  },
  {
    policyType: "PUBLIC LIABILITY INDUSTRIAL RISK",
    contactNumber: "9111111692",
    contactPerson: "ARJUN",
    policyNumber: "4008/407612816/00/001",
    insuredName: "LION ENGINEERING CONSULTANTS PRIVATE LIMITED",
    sumInsured: "",
    premium: "",
    expiryDate: "2026-09-04",
    insuranceCompany: "ICICI LOMBARD"
  },
  {
    policyType: "MSME SURAKSHA KAVACH PACKAGE POLICY - ADVANCE",
    contactNumber: "9111111692",
    contactPerson: "ARJUN",
    policyNumber: "1030/407421991/00/000",
    insuredName: "LION ENGINEERING CONSULTANTS PRIVATE LIMITED",
    sumInsured: "",
    premium: "",
    expiryDate: "2026-09-07",
    insuranceCompany: "ICICI LOMBARD"
  },
  {
    policyType: "WORKMAN COMPENSATION",
    contactNumber: "9111111692",
    contactPerson: "ARJUN",
    policyNumber: "4010/359304076/01/000",
    insuredName: "LION ENGINEERING CONSULTANTS PRIVATE LIMITED",
    sumInsured: "",
    premium: "",
    expiryDate: "2026-09-07",
    insuranceCompany: "ICICI LOMBARD"
  },
  {
    policyType: "PUBLIC LIABILITY INDUSTRIAL RISK",
    contactNumber: "9111111692",
    contactPerson: "ARJUN",
    policyNumber: "4008/407609436/00/000",
    insuredName: "LION ENGINEERING CONSULTANTS PRIVATE LIMITED",
    sumInsured: "",
    premium: "",
    expiryDate: "2026-09-07",
    insuranceCompany: "ICICI LOMBARD"
  },
  {
    policyType: "fire/burglary",
    contactNumber: "9926369374",
    contactPerson: "Deepesh Kumar Soni",
    policyNumber: "1030/407484274/00/000",
    insuredName: "M/S MANOJ KIRANA STORE",
    sumInsured: "20 lakh stock",
    premium: "3365",
    expiryDate: "2026-09-08",
    insuranceCompany: "ICICI LOMBARD"
  },
  {
    policyType: "SHOPS DEALING IN HAZARDOUS GOODS",
    contactNumber: "9752235239",
    contactPerson: "Shubham Gupta",
    policyNumber: "47F18200",
    insuredName: "NAND KISHORE NARAYAN DAS SONI",
    sumInsured: "",
    premium: "",
    expiryDate: "2026-09-08",
    insuranceCompany: "IFFCO TOKIO"
  },
  {
    policyType: "ERECTION ALL RISKS INSURANCE POLICY",
    contactNumber: "8120632641",
    contactPerson: "shafeek khan",
    policyNumber: "5006/440966980/00/000",
    insuredName: "SHREE GANESH RICE AGRO EXPORTS",
    sumInsured: "",
    premium: "",
    expiryDate: "2026-09-08",
    insuranceCompany: "ICICI LOMBARD"
  },
  {
    policyType: "WC",
    contactNumber: "9981240504",
    contactPerson: "Ganesh Phate",
    policyNumber: "4010/443913807/00/000",
    insuredName: "MITTAL PLASTOMET LIMITED",
    sumInsured: "",
    premium: "",
    expiryDate: "2026-09-08",
    insuranceCompany: "ICICI LOMBARD"
  },
  {
    policyType: "fire/burglary",
    contactNumber: "9229215855",
    contactPerson: "Sukalp Sardar",
    policyNumber: "1030/407344424/00/000",
    insuredName: "PRIMEONE WORK FORCE PRIVATE LIMITED",
    sumInsured: "",
    premium: "",
    expiryDate: "2026-09-13",
    insuranceCompany: "ICICI LOMBARD"
  },
  {
    policyType: "CGL",
    contactNumber: "9826080008",
    contactPerson: "Shashank Rashinkar",
    policyNumber: "4066/409263561/00/000",
    insuredName: "ACE INFOTEXIS PVT LTD",
    sumInsured: "",
    premium: "",
    expiryDate: "2026-09-17",
    insuranceCompany: "ICICI LOMBARD"
  },
  {
    policyType: "FIRE",
    contactNumber: "9926369374",
    contactPerson: "Deepesh Kumar Soni",
    policyNumber: "1015/407638656/00/000",
    insuredName: "SMT. BHARTI VERMA SMT. SAVITRI VERMA W/O SHRI GOVERDHAN VERMA W/O SHRI PRADEEP VERMA",
    sumInsured: "25 lakh building",
    premium: "1180",
    expiryDate: "2026-09-19",
    insuranceCompany: "ICICI LOMBARD"
  },
  {
    policyType: "BURGLARY INSURANCE",
    contactNumber: "9926369374",
    contactPerson: "Deepesh Kumar Soni",
    policyNumber: "4002/407637962/00/000",
    insuredName: "M/S PRAGATI VARMA ELECTRONIC",
    sumInsured: "",
    premium: "",
    expiryDate: "2026-09-19",
    insuranceCompany: "ICICI LOMBARD"
  },
  {
    policyType: "Fire/burglary",
    contactNumber: "9926369374",
    contactPerson: "Deepesh Kumar Soni",
    policyNumber: "1021/407637958/00/000",
    insuredName: "M/S PRAGATI VARMA ELECTRONIC",
    sumInsured: "10 lakh stock",
    premium: "1568",
    expiryDate: "2026-09-20",
    insuranceCompany: "ICICI LOMBARD"
  },
  {
    policyType: "ICICI BHARAT GRIHA RAKSHA POLICY",
    contactNumber: "9926369374",
    contactPerson: "Deepesh Kumar Soni",
    policyNumber: "1015/408647815/00/000",
    insuredName: "SUBHASH CHAND AGRAWAL",
    sumInsured: "",
    premium: "",
    expiryDate: "2026-09-21",
    insuranceCompany: "ICICI LOMBARD"
  },
  {
    policyType: "FIRE",
    contactNumber: "9926369374",
    contactPerson: "Deepesh Kumar Soni",
    policyNumber: "1015/408647815/00/001",
    insuredName: "SUBHASH CHAND AGRAWAL",
    sumInsured: "",
    premium: "",
    expiryDate: "2026-09-21",
    insuranceCompany: "ICICI LOMBARD"
  },
  {
    policyType: "MSME SURAKSHA KAVACH PACKAGE POLICY - ADVANCE",
    contactNumber: "9111111692",
    contactPerson: "ARJUN",
    policyNumber: "1030/410066895/00/000",
    insuredName: "SYNERGY ENGINEERS GROUP PRIVATE LIMITED",
    sumInsured: "",
    premium: "",
    expiryDate: "2026-09-21",
    insuranceCompany: "ICICI LOMBARD"
  },
  {
    policyType: "fire/burglary/pli/WC",
    contactNumber: "9111111692",
    contactPerson: "ARJUN",
    policyNumber: "4646/408898050/00/000",
    insuredName: "SYNERGY ENGINEERS GROUP PRIVATE LIMITED",
    sumInsured: "",
    premium: "",
    expiryDate: "2026-09-23",
    insuranceCompany: "ICICI LOMBARD"
  },
  {
    policyType: "FIRE/BURGLARY",
    contactNumber: "9407368840",
    contactPerson: "Naveen Singhania",
    policyNumber: "12987255",
    insuredName: "M/S KAILASH TRADERS",
    sumInsured: "",
    premium: "",
    expiryDate: "2026-09-23",
    insuranceCompany: "IFFCO TOKIO"
  },
  {
    policyType: "MSME SURAKSHA KAVACH PACKAGE POLICY - ADVANCE",
    contactNumber: "9111111692",
    contactPerson: "ARJUN",
    policyNumber: "1030/409257954/00/000",
    insuredName: "BHARATMATA107 INDUSTRIES PRIVATE LIMITED",
    sumInsured: "",
    premium: "",
    expiryDate: "2026-09-24",
    insuranceCompany: "ICICI LOMBARD"
  },
  {
    policyType: "WORKMAN COMPENSATION",
    contactNumber: "9111111692",
    contactPerson: "ARJUN",
    policyNumber: "4010/361650022/01/000",
    insuredName: "SYNERGY ENGINEERS GROUP PVT LTD",
    sumInsured: "",
    premium: "",
    expiryDate: "2026-09-25",
    insuranceCompany: "ICICI LOMBARD"
  },
  {
    policyType: "WC",
    contactNumber: "9826080008",
    contactPerson: "Shashank Rashinkar",
    policyNumber: "4010/408190110/00/000",
    insuredName: "ACE INFOTEXIS PVT LTD",
    sumInsured: "",
    premium: "",
    expiryDate: "2026-09-27",
    insuranceCompany: "ICICI LOMBARD"
  },
  {
    policyType: "fire/burglary",
    contactNumber: "9009230444",
    contactPerson: "Brajesh jatav",
    policyNumber: "12986003",
    insuredName: "VAK CONSEQUIP SOLUTIONS",
    sumInsured: "",
    premium: "",
    expiryDate: "2026-09-29",
    insuranceCompany: "IFFCO TOKIO"
  },
  {
    policyType: "fire/burglary",
    contactNumber: "9009230444",
    contactPerson: "Brajesh jatav",
    policyNumber: "12986110",
    insuredName: "VAK INDUSTIRES",
    sumInsured: "",
    premium: "",
    expiryDate: "2026-09-29",
    insuranceCompany: "IFFCO TOKIO"
  },
  {
    policyType: "wc",
    contactNumber: "9981240504",
    contactPerson: "Ganesh Phate",
    policyNumber: "4010/442500681/00/000",
    insuredName: "MITTAL PLASTOMET LIMITED",
    sumInsured: "",
    premium: "",
    expiryDate: "2026-09-29",
    insuranceCompany: "ICICI LOMBARD"
  },
  {
    policyType: "FIRE/BURGLARY",
    contactNumber: "8966000065",
    contactPerson: "Girraj sharma",
    policyNumber: "1030/410639564/00/000",
    insuredName: "SHRI DHAR RENEWABLE ENERGY PRIVATE LIMITED",
    sumInsured: "",
    premium: "",
    expiryDate: "2026-09-30",
    insuranceCompany: "ICICI LOMBARD"
  }
];

function buildCustomerId(name, mobile) {
  const namePart = String(name || "")
    .replace(/^(m\/s|mr|mrs|ms)\.?\s+/i, "")
    .replace(/[^a-z0-9]/gi, "")
    .slice(0, 4)
    .toUpperCase();
  const digits = String(mobile || "").replace(/\D/g, "");
  return `${namePart}${digits.slice(-4)}`;
}

async function run() {
  const sourceFileName = "Non_Motor_September_2026_Renewals.xlsx";
  console.log(`Processing ${rawData.length} non-motor/commercial renewal records...`);

  // 1. Generate & save Excel file in storage
  const exportRows = rawData.map((r, idx) => ({
    "S.No": idx + 1,
    "Insured Name": r.insuredName,
    "Contact Person Name": r.contactPerson,
    "Contact Number": r.contactNumber,
    "Policy Number": r.policyNumber,
    "Insurance Company": r.insuranceCompany,
    "Policy Type": r.policyType,
    "Sum Insured Description": r.sumInsured,
    "Premium": r.premium ? Number(r.premium) : "",
    "Expiry Date": r.expiryDate
  }));

  const ws = XLSX.utils.json_to_sheet(exportRows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Commercial & Non-Motor");
  const outPath = path.join(process.cwd(), "storage", sourceFileName);
  XLSX.writeFile(wb, outPath);
  console.log(`Saved Excel file to: ${outPath}`);

  // 2. Also append/update sheet in SEP RENEWAL 2026.xlsx
  const sepRenewalPath = path.join(process.cwd(), "storage", "SEP RENEWAL 2026.xlsx");
  if (fs.existsSync(sepRenewalPath)) {
    try {
      const sepWb = XLSX.readFile(sepRenewalPath);
      const sheetName = "COMMERCIAL & NON-MOTOR";
      if (sepWb.SheetNames.includes(sheetName)) {
        delete sepWb.Sheets[sheetName];
        sepWb.SheetNames = sepWb.SheetNames.filter(s => s !== sheetName);
      }
      XLSX.utils.book_append_sheet(sepWb, ws, sheetName);
      XLSX.writeFile(sepWb, sepRenewalPath);
      console.log(`Updated sheet "${sheetName}" in ${sepRenewalPath}`);
    } catch (e) {
      console.warn("Could not update SEP RENEWAL 2026.xlsx:", e.message);
    }
  }

  // 3. Database import / update
  const dbOrg = await prisma.organization.findFirst();
  const organizationId = dbOrg ? dbOrg.id : null;
  console.log(`Organization ID: ${organizationId}`);

  const MANUAL_RENEWAL_IMPORT_METHOD = "renewal_excel_import";

  const existingRecords = await prisma.policyRecord.findMany({
    where: {
      deletedAt: null,
      organizationId,
    },
    select: {
      id: true,
      data: true,
      extractedData: true,
      reviewedData: true,
      detectedCompany: true,
      detectedPolicyType: true,
      selectedCompany: true,
      selectedPolicyType: true,
      customerPortfolioId: true,
      contactPersonName: true,
      contactPersonMobile: true,
      contactPersonEmail: true,
      renewalRecipientName: true,
      renewalRecipientMobile: true,
      renewalRecipientEmail: true,
    }
  });

  const portfolioCache = new Map();
  const resolvePortfolio = async (payload, policyId) => {
    const digits = String(payload.contactNumber || payload.customerMobile || "").replace(/\D/g, "");
    const mobile = digits.length >= 10 ? digits.slice(-10) : `NO-MOBILE-${policyId}`;
    if (portfolioCache.has(mobile)) return portfolioCache.get(mobile);
    let portfolio = await prisma.customerProfile.findFirst({
      where: {
        phone: { contains: mobile },
        deletedAt: null,
        organizationId,
      },
      select: { id: true },
      orderBy: { createdAt: "asc" },
    });
    portfolio ||= await prisma.customerProfile.create({
      data: {
        name: resolvePolicyCustomerName(payload) || "Unnamed Customer",
        phone: mobile,
        email: String(payload.email || payload.customerEmail || "").trim() || null,
        contactPersonName: resolvePolicyCustomerName(payload) || null,
        organizationId,
        sourcePolicyId: policyId,
      },
      select: { id: true },
    });
    portfolioCache.set(mobile, portfolio.id);
    return portfolio.id;
  };

  let insertedCount = 0;
  let updatedCount = 0;

  for (const item of rawData) {
    const payload = {
      insuredName: item.insuredName,
      contactPerson: item.contactPerson,
      contactPersonName: item.contactPerson,
      contactNumber: item.contactNumber,
      customerMobile: item.contactNumber,
      policyNumber: item.policyNumber,
      policyType: item.policyType,
      product: item.policyType,
      sumInsured: item.sumInsured,
      premium: item.premium ? Number(item.premium) : "",
      totalPremium: item.premium ? Number(item.premium) : "",
      expiryDate: item.expiryDate,
      insuranceCompany: normalizeRenewalInsuranceCompany(item.insuranceCompany),
      companyName: normalizeRenewalInsuranceCompany(item.insuranceCompany),
      sourceFile: sourceFileName,
      manualRenewalSource: true,
    };

    payload.customerId = buildCustomerId(payload.insuredName, payload.contactNumber);

    const match = findRenewalImportMatch(payload, existingRecords);

    if (match.status === "matched") {
      const record = match.record;
      const contactName = normalizeCustomerName(record.contactPersonName) || resolvePolicyCustomerName(payload);
      const contactMobile = String(record.contactPersonMobile || payload.contactNumber || "").trim();
      const portfolioId = record.customerPortfolioId || (await resolvePortfolio({ ...payload, contactNumber: contactMobile }, record.id));
      const dataMerge = mergeRenewalImportData(record.data || {}, payload);
      const reviewedMerge = mergeRenewalImportData(record.reviewedData || record.data || {}, payload);
      const extractedMerge = mergeRenewalImportData(record.extractedData || record.data || {}, payload);

      const updateData = {
        customerPortfolioId: portfolioId,
        contactPersonName: contactName || null,
        contactPersonMobile: contactMobile || null,
        renewalRecipientName: normalizeCustomerName(record.renewalRecipientName) || contactName || null,
        renewalRecipientMobile: record.renewalRecipientMobile || contactMobile || null,
        detectedCompany: payload.insuranceCompany,
        selectedCompany: payload.insuranceCompany,
        detectedPolicyType: payload.policyType,
        selectedPolicyType: payload.policyType,
        renewalStatus: "ACTIVE",
        isActivePolicy: true,
      };

      if (dataMerge.changedFields.length) updateData.data = dataMerge.data;
      if (reviewedMerge.changedFields.length) updateData.reviewedData = reviewedMerge.data;
      if (extractedMerge.changedFields.length) updateData.extractedData = extractedMerge.data;

      await prisma.policyRecord.update({
        where: { id: record.id },
        data: updateData,
      });
      Object.assign(record, updateData);
      updatedCount++;
      console.log(`Updated existing policy: ${payload.policyNumber} (${payload.insuredName})`);
    } else {
      const recordDate = new Date();
      const recordId = randomUUID();
      const portfolioId = await resolvePortfolio(payload, recordId);
      const contactName = resolvePolicyCustomerName(payload);
      const contactMobile = String(payload.contactNumber || "").trim();

      const created = await prisma.policyRecord.create({
        data: {
          id: recordId,
          savedAt: recordDate,
          createdAt: recordDate,
          updatedAt: recordDate,
          data: payload,
          pdfFileName: sourceFileName,
          pdfMimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          sourceFile: sourceFileName,
          rawText: "",
          detectedBankSource: "",
          detectedCompany: payload.insuranceCompany,
          detectedServiceCategory: "",
          detectedPolicyType: payload.policyType,
          selectedBankSource: "",
          selectedCompany: payload.insuranceCompany,
          selectedServiceCategory: "",
          selectedPolicyType: payload.policyType,
          confidenceScore: 1.0,
          extractedData: payload,
          reviewedData: payload,
          extractionMethod: MANUAL_RENEWAL_IMPORT_METHOD,
          extractionQuality: {},
          extractionLog: {},
          schemaVersion: 1,
          organizationId,
          renewalStatus: "ACTIVE",
          isActivePolicy: true,
          customerPortfolioId: portfolioId,
          contactPersonName: contactName || null,
          contactPersonMobile: contactMobile || null,
          renewalRecipientName: contactName || null,
          renewalRecipientMobile: contactMobile || null,
        },
      });
      existingRecords.push(created);
      insertedCount++;
      console.log(`Inserted new renewal: ${payload.policyNumber} (${payload.insuredName})`);
    }
  }

  console.log(`\nImport Summary:`);
  console.log(`- Inserted: ${insertedCount}`);
  console.log(`- Updated: ${updatedCount}`);
  console.log(`- Total Processed: ${rawData.length}`);
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
