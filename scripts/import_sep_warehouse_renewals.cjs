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
    policyType: "fire/burglary/fidelity",
    contactNumber: "9893371334",
    contactPerson: "Himanshu Singh",
    policyNumber: "1030/406900096/00/000",
    insuredName: "PARTH WAREHOUSE A/C MPWLC",
    sumInsured: "06 cr stock",
    premium: "110920",
    expiryDate: "2026-09-01",
    insuranceCompany: "ICICI LOMBARD"
  },
  {
    policyType: "fire",
    contactNumber: "9893371334",
    contactPerson: "Himanshu Singh",
    policyNumber: "1030/406906505/00/000",
    insuredName: "PARTH WAREHOUSE",
    sumInsured: "1.50 cr stock",
    premium: "9075",
    expiryDate: "2026-09-01",
    insuranceCompany: "ICICI LOMBARD"
  },
  {
    policyType: "fire/burglary/fidelity",
    contactNumber: "8120632641",
    contactPerson: "Shafeek Khan",
    policyNumber: "1030/447187824/00/000",
    insuredName: "SIYARAM WAREHOUSING AND AGRO SERVICES -02 MONTHS",
    sumInsured: "7.75 CR STOCK",
    premium: "11133",
    expiryDate: "2026-09-02",
    insuranceCompany: "ICICI LOMBARD"
  },
  {
    policyType: "fire/burglary/fidelity",
    contactNumber: "9165643093",
    contactPerson: "Pankaj Singh",
    policyNumber: "1030/432637034/00/000",
    insuredName: "SINGH WAREHOUSE - UNIT-1 - 6 MONTH",
    sumInsured: "15 CR STOCK",
    premium: "56075",
    expiryDate: "2026-09-05",
    insuranceCompany: "ICICI LOMBARD"
  },
  {
    policyType: "fire/burglary/fidelity",
    contactNumber: "9165643093",
    contactPerson: "Pankaj Singh",
    policyNumber: "1030/432818968/00/000",
    insuredName: "SINGH WAREHOUSE - UNIT-2 - 6 MONTH",
    sumInsured: "13.50 CR STOCK",
    premium: "50590",
    expiryDate: "2026-09-05",
    insuranceCompany: "ICICI LOMBARD"
  },
  {
    policyType: "fire/burglary/fidelity",
    contactNumber: "7509666750",
    contactPerson: "Nandkishorpatidar",
    policyNumber: "1030/443611176/00/000",
    insuredName: "KRISHNA WAREHOUSE A/C MPWLC - 03 MONTHS",
    sumInsured: "2.50 CR STOCK",
    premium: "3186",
    expiryDate: "2026-09-05",
    insuranceCompany: "ICICI LOMBARD"
  },
  {
    policyType: "fire/burglary/fidelity",
    contactNumber: "9407818400",
    contactPerson: "Narendra",
    policyNumber: "5130026540",
    insuredName: "KOMSHANTI WAREHOUSE A/C MPWLC - TATA",
    sumInsured: "10 CR STOCK",
    premium: "10679",
    expiryDate: "2026-09-05",
    insuranceCompany: "TATA"
  },
  {
    policyType: "fire/burglary/fidelity",
    contactNumber: "9826715556",
    contactPerson: "O P Gurjar",
    policyNumber: "1030/432322688/00/000",
    insuredName: "TARA AGRO PARK A/C MPWLC",
    sumInsured: "6.90 CR stock",
    premium: "31008",
    expiryDate: "2026-09-06",
    insuranceCompany: "ICICI LOMBARD"
  },
  {
    policyType: "fire/burglary/fidelity",
    contactNumber: "8462826255",
    contactPerson: "Alok Tomar",
    policyNumber: "1030/451166928/00/000",
    insuredName: "RAKHI TOMAR WAREHOUSE A/C MPWLC - 01 MONTH",
    sumInsured: "25.45 CR STOCK",
    premium: "9344",
    expiryDate: "2026-09-06",
    insuranceCompany: "ICICI LOMBARD"
  },
  {
    policyType: "fire/burglary/fidelity",
    contactNumber: "9993105058",
    contactPerson: "Amit Holani",
    policyNumber: "1030/407305642/00/000",
    insuredName: "SHREE BALAJI TRADERS",
    sumInsured: "25 lakh stock",
    premium: "1450",
    expiryDate: "2026-09-07",
    insuranceCompany: "ICICI LOMBARD"
  },
  {
    policyType: "fire/burglary/fidelity",
    contactNumber: "9545553910",
    contactPerson: "Vipul Jain",
    policyNumber: "5130026567",
    insuredName: "ABHA WAREHOUSE A/C MPWLC - 03 MONTHS- TATA",
    sumInsured: "25 CR STOCK",
    premium: "26168",
    expiryDate: "2026-09-07",
    insuranceCompany: "TATA"
  },
  {
    policyType: "fire",
    contactNumber: "9630795555",
    contactPerson: "Yaswhant",
    policyNumber: "1030/407342274/00/000",
    insuredName: "JYOTI WAREHOUSE",
    sumInsured: "1.50 cr building",
    premium: "7583",
    expiryDate: "2026-09-08",
    insuranceCompany: "ICICI LOMBARD"
  },
  {
    policyType: "fire/burglary/fidelity",
    contactNumber: "9407818400",
    contactPerson: "Narendra",
    policyNumber: "5130026600",
    insuredName: "KOMSHANTI WAREHOUSE A/C MPWLC -TATA - 03 MONTHS",
    sumInsured: "15 CR STOCK",
    premium: "15912",
    expiryDate: "2026-09-08",
    insuranceCompany: "TATA"
  },
  {
    policyType: "fire/burglary/fidelity",
    contactNumber: "9407818400",
    contactPerson: "Narendra",
    policyNumber: "5130026579",
    insuredName: "VINDHYAMOHNI VINAYAK WAREHOUSE A/C MPWLC - TATA - 03 MONTHS",
    sumInsured: "15 CR STOCK",
    premium: "15913",
    expiryDate: "2026-09-08",
    insuranceCompany: "TATA"
  },
  {
    policyType: "fire/burglary/fidelity",
    contactNumber: "7247327329",
    contactPerson: "Karanpathak",
    policyNumber: "5161024631",
    insuredName: "SHUBHAM WAREHOUSE AND AGRO SERVICES A/C MPWLC",
    sumInsured: "2 cr stock",
    premium: "7076",
    expiryDate: "2026-09-09",
    insuranceCompany: "TATA"
  },
  {
    policyType: "FIRE",
    contactNumber: "7247327329",
    contactPerson: "Karanpathak",
    policyNumber: "5161024624",
    insuredName: "SHUBHAM WAREHOUSE AND AGRO SERVICES",
    sumInsured: "1.5 CR BUILDING",
    premium: "4223",
    expiryDate: "2026-09-09",
    insuranceCompany: "TATA"
  },
  {
    policyType: "FIRE",
    contactNumber: "8823882981",
    contactPerson: "Kuldeep Singh Dhakad/ Anilmishra",
    policyNumber: "1030/407545171/00/000",
    insuredName: "CHANDRAKANTA WAREHOUSE",
    sumInsured: "1 cr building",
    premium: "5030",
    expiryDate: "2026-09-09",
    insuranceCompany: "ICICI LOMBARD"
  },
  {
    policyType: "fire/burglary/fidelity",
    contactNumber: "9425301715",
    contactPerson: "Radheshyam Chouhan",
    policyNumber: "5161025859",
    insuredName: "MAA KAMLA DEVI WAREHOUSE UNIT 2 A/C MPWLC",
    sumInsured: "80 Lakh Building, 2.58 CR STOCK",
    premium: "11618",
    expiryDate: "2026-09-12",
    insuranceCompany: "TATA"
  },
  {
    policyType: "fire/burglary/fidelity",
    contactNumber: "7507929916",
    contactPerson: "Nilesh",
    policyNumber: "1030/448157342/00/000",
    insuredName: "SHREE ROHANI PRASAD WAREHOUSE A/C MPWLC - 02 MONTHS",
    sumInsured: "7.80 CR STOCK",
    premium: "12581",
    expiryDate: "2026-09-12",
    insuranceCompany: "ICICI LOMBARD"
  },
  {
    policyType: "fire/burglary/fidelity",
    contactNumber: "9425131490",
    contactPerson: "Mahesh Agrawal",
    policyNumber: "5161026975",
    insuredName: "M/S NARENDRA TRADERS",
    sumInsured: "01.25 cr stock",
    premium: "4188",
    expiryDate: "2026-09-16",
    insuranceCompany: "TATA"
  },
  {
    policyType: "fire/burglary/fidelity",
    contactNumber: "9425028738",
    contactPerson: "Adv. Anshuman Jat",
    policyNumber: "1030/433867477/00/000",
    insuredName: "JAI SHIV SHAKTI WAREHOUSE UNIT II - 06 MONTHS",
    sumInsured: "8.50 cr stock",
    premium: "29190",
    expiryDate: "2026-09-16",
    insuranceCompany: "ICICI LOMBARD"
  },
  {
    policyType: "fire/burglary/fidelity",
    contactNumber: "9425028738",
    contactPerson: "Adv. Anshuman Jat",
    policyNumber: "1030/433965112/00/000",
    insuredName: "JAI SHIV SHAKTI WAREHOUSE - 06 MONTHS",
    sumInsured: "7.50 cr stock",
    premium: "25825",
    expiryDate: "2026-09-16",
    insuranceCompany: "ICICI LOMBARD"
  },
  {
    policyType: "FIRE",
    contactNumber: "9826584843",
    contactPerson: "Devendra Nagar",
    policyNumber: "5161027593",
    insuredName: "SHREE RADHE WAREHOUSE",
    sumInsured: "",
    premium: "2915",
    expiryDate: "2026-09-17",
    insuranceCompany: "TATA"
  },
  {
    policyType: "FIRE",
    contactNumber: "9826584843",
    contactPerson: "Devendra Nagar",
    policyNumber: "5161027352",
    insuredName: "SHREE PRAKASH WAREHOUSE",
    sumInsured: "1 CR builiding",
    premium: "2915",
    expiryDate: "2026-09-17",
    insuranceCompany: "TATA"
  },
  {
    policyType: "fire/burglary/fidelity",
    contactNumber: "9926369374",
    contactPerson: "Deepesh Kumar Soni",
    policyNumber: "5161027801",
    insuredName: "M/S MOOLCHAND GOPIKISHAN",
    sumInsured: "02 CR STOCK",
    premium: "6691",
    expiryDate: "2026-09-18",
    insuranceCompany: "TATA"
  },
  {
    policyType: "fire/burglary/fidelity",
    contactNumber: "8602533317",
    contactPerson: "Harsh Namdev",
    policyNumber: "5161028225",
    insuredName: "RADHESHYAM WAREHOUSE A/C MPWLC",
    sumInsured: "1.5 cr building, 50 lakh stock",
    premium: "6650",
    expiryDate: "2026-09-19",
    insuranceCompany: "TATA"
  },
  {
    policyType: "fire",
    contactNumber: "9826584843",
    contactPerson: "Devendra Nagar",
    policyNumber: "5161028226",
    insuredName: "SHREE DADA DARBAR WAREHOUSE",
    sumInsured: "01 cr building",
    premium: "2915",
    expiryDate: "2026-09-19",
    insuranceCompany: "TATA"
  },
  {
    policyType: "ICICI LOMBARD MSME SURAKSHA KAVACH (COMPLETE FIRE INSURANCE)",
    contactNumber: "8319518182",
    contactPerson: "Neer Gupta",
    policyNumber: "1021/408761045/00/000",
    insuredName: "SAI RAM WAREHOUSE",
    sumInsured: "",
    premium: "",
    expiryDate: "2026-09-20",
    insuranceCompany: "ICICI LOMBARD"
  },
  {
    policyType: "fire",
    contactNumber: "9425093658",
    contactPerson: "Mukesh Maheshwari",
    policyNumber: "1030/411058466/00/000",
    insuredName: "MANGAL MURTI LOGISTICS HUB, G.NO. - 26",
    sumInsured: "1 cr building",
    premium: "5030",
    expiryDate: "2026-09-21",
    insuranceCompany: "ICICI LOMBARD"
  },
  {
    policyType: "fire",
    contactNumber: "9425093658",
    contactPerson: "Mukesh Maheshwari",
    policyNumber: "1030/408660349/00/000",
    insuredName: "MANGAL MURTI FOODS, G.NO. - 1",
    sumInsured: "70 lakh building",
    premium: "3561",
    expiryDate: "2026-09-21",
    insuranceCompany: "ICICI LOMBARD"
  },
  {
    policyType: "MSME SURAKSHA KAVACH PACKAGE POLICY - ADVANCE",
    contactNumber: "7999797578",
    contactPerson: "Sohan Mahawar",
    policyNumber: "1030/408650187/00/000",
    insuredName: "M/S SHUBH MAHAWAR TRADERS",
    sumInsured: "",
    premium: "",
    expiryDate: "2026-09-21",
    insuranceCompany: "ICICI LOMBARD"
  },
  {
    policyType: "fire/burglary/fidelity",
    contactNumber: "8085183161",
    contactPerson: "Nitin Dubey",
    policyNumber: "1030/409463916/00/000",
    insuredName: "MS SHRI KAILASH WAREHOUSING A/C MPWLC",
    sumInsured: "16 cr stock",
    premium: "118236",
    expiryDate: "2026-09-23",
    insuranceCompany: "ICICI LOMBARD"
  },
  {
    policyType: "fire/burglary/fidelity",
    contactNumber: "7415456994",
    contactPerson: "Vikas Vishwakarma",
    policyNumber: "1030/408905374/00/000",
    insuredName: "SHRI VISHWAKARMA WAREHOUSE",
    sumInsured: "01cr building, 02 cr stock",
    premium: "17230",
    expiryDate: "2026-09-23",
    insuranceCompany: "ICICI LOMBARD"
  },
  {
    policyType: "fire",
    contactNumber: "8085183161",
    contactPerson: "Nitin Dubey",
    policyNumber: "1030/409034740/00/000",
    insuredName: "MS SHRI KAILASH WAREHOUSING",
    sumInsured: "1.40 cr building",
    premium: "7868",
    expiryDate: "2026-09-23",
    insuranceCompany: "ICICI LOMBARD"
  },
  {
    policyType: "fire",
    contactNumber: "9425093658",
    contactPerson: "Mukesh Maheshwari",
    policyNumber: "1030/411055234/00/000",
    insuredName: "MANGAL MURTI LOGISTICS HUB, G.NO. - 27",
    sumInsured: "1 cr building",
    premium: "5030",
    expiryDate: "2026-09-25",
    insuranceCompany: "ICICI LOMBARD"
  },
  {
    policyType: "fire/burglary/fidelity",
    contactNumber: "8770195915",
    contactPerson: "Dwarka",
    policyNumber: "1030/434292308/00/000",
    insuredName: "GANGA WAREHOUSE - 06 MONTHS",
    sumInsured: "12.50 cr stock",
    premium: "49000",
    expiryDate: "2026-09-25",
    insuranceCompany: "ICICI LOMBARD"
  },
  {
    policyType: "fire/burglary/fidelity",
    contactNumber: "9425093658",
    contactPerson: "Mukesh Maheshwari",
    policyNumber: "1030/434331915/00/000",
    insuredName: "MANGAL MURTI FOODS",
    sumInsured: "9.14 CR STOCK",
    premium: "31438",
    expiryDate: "2026-09-25",
    insuranceCompany: "ICICI LOMBARD"
  },
  {
    policyType: "fire/burglary/fidelity",
    contactNumber: "9977836683",
    contactPerson: "",
    policyNumber: "1030/433901690/00/000",
    insuredName: "SHREE VIJESHWAR WAREHOUSE A/C MPWLC- 06 MONTHS",
    sumInsured: "6 CR STOCK",
    premium: "29076",
    expiryDate: "2026-09-25",
    insuranceCompany: "ICICI LOMBARD"
  },
  {
    policyType: "fire/burglary/fidelity",
    contactNumber: "8839121899",
    contactPerson: "Akash Singh",
    policyNumber: "1030/410932343/00/000",
    insuredName: "TEKAM ENTERPRISES- STOCK",
    sumInsured: "10 CR STOCK",
    premium: "116820",
    expiryDate: "2026-09-26",
    insuranceCompany: "ICICI LOMBARD"
  },
  {
    policyType: "fire",
    contactNumber: "8839121899",
    contactPerson: "Akash Singh",
    policyNumber: "1030/409463646/00/000",
    insuredName: "TEKAM ENTERPRISES",
    sumInsured: "02 cr building",
    premium: "10001",
    expiryDate: "2026-09-26",
    insuranceCompany: "ICICI LOMBARD"
  },
  {
    policyType: "fire/burglary/fidelity",
    contactNumber: "9425093658",
    contactPerson: "Mukesh Maheshwari",
    policyNumber: "1030/434519256/00/000",
    insuredName: "MANGAL MURTI LOGISTICS HUB G.NO. 26",
    sumInsured: "14.32 cr stock",
    premium: "48860",
    expiryDate: "2026-09-26",
    insuranceCompany: "ICICI LOMBARD"
  },
  {
    policyType: "fire/burglary/fidelity",
    contactNumber: "9425093658",
    contactPerson: "Mukesh Maheshwari",
    policyNumber: "1030/434518344/00/000",
    insuredName: "MANGAL MURTI LOGISTICS HUB G.NO. 27",
    sumInsured: "13.81 cr stock",
    premium: "47142",
    expiryDate: "2026-09-26",
    insuranceCompany: "ICICI LOMBARD"
  },
  {
    policyType: "fire/burglary",
    contactNumber: "8120272988",
    contactPerson: "Aman Agrawal",
    policyNumber: "1913011126P106281439",
    insuredName: "A & I HOSPITALITY PVT. LTD. - UNITED- 02 MONTHS",
    sumInsured: "20 CR STOCK",
    premium: "49107",
    expiryDate: "2026-09-26",
    insuranceCompany: "UNITED"
  },
  {
    policyType: "fire/burglary/fidelity",
    contactNumber: "8720067676",
    contactPerson: "Manish Patel",
    policyNumber: "5161032837",
    insuredName: "SHRI NATH WAREHOUSE - TATA",
    sumInsured: "4.50 CR STOCK",
    premium: "14713",
    expiryDate: "2026-09-29",
    insuranceCompany: "TATA"
  },
  {
    policyType: "fire/burglary/fidelity",
    contactNumber: "7772003131",
    contactPerson: "Praduman Singh Ji Kachwah",
    policyNumber: "1030/449839762/00/000",
    insuredName: "KACHWAH WAREHOUSING A/C MPWLC - 02 MONTHS",
    sumInsured: "17.50 CR STOCK",
    premium: "12744",
    expiryDate: "2026-09-29",
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
  const sourceFileName = "Warehouse_September_2026_Renewals.xlsx";
  console.log(`Processing ${rawData.length} warehouse renewal records...`);

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
  XLSX.utils.book_append_sheet(wb, ws, "Warehouse Renewals");
  const outPath = path.join(process.cwd(), "storage", sourceFileName);
  XLSX.writeFile(wb, outPath);
  console.log(`Saved Excel file to: ${outPath}`);

  // 2. Also append/update sheet in SEP RENEWAL 2026.xlsx if it exists
  const sepRenewalPath = path.join(process.cwd(), "storage", "SEP RENEWAL 2026.xlsx");
  if (fs.existsSync(sepRenewalPath)) {
    try {
      const sepWb = XLSX.readFile(sepRenewalPath);
      const sheetName = "WAREHOUSE & NON-MOTOR";
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
  let unchangedCount = 0;

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
