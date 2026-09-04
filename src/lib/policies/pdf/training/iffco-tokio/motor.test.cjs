const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');
const { extractPolicyFromText } = require('../../extractor.cjs');
const { applyScopedTraining, selectScopedTraining } = require('../registry.cjs');
const iffcoMotorTrainer = require('./motor.cjs');
const libertyMotorTrainer = require('../liberty/motor.cjs');
const goDigitMotorTrainer = require('../go-digit/motor.cjs');

const targetPdfs = [
  {
    path: "storage/iffco/JAY SHANKAR BALWANI_MP04EB2062_2026-27 POLICY.pdf",
    policyNo: "N8001571",
    expectedNet: "4799.00",
    expectedGst: "863.82",
    expectedTotal: "5662.82"
  },
  {
    path: "storage/iffco/MOHAN LAL GADHWAL_MP04CU9143.pdf",
    policyNo: "N7938058",
    expectedNet: "8062.00",
    expectedGst: "1451.16",
    expectedTotal: "9513.16"
  },
  {
    path: "storage/iffco/MS LION ENGINEERING CONSULTANTS PVT LTD_HR26EW3078_2026-27 POLICY.pdf",
    policyNo: "N8043481",
    expectedNet: "21699.00",
    expectedGst: "3905.82",
    expectedTotal: "25604.82"
  },
  {
    path: "storage/iffco/PRAKASH CHANDRA SHARMA_MP04CN0177_2026-27.pdf",
    policyNo: "N7946054",
    expectedNet: "4520.00",
    expectedGst: "813.60",
    expectedTotal: "5333.60"
  },
  {
    path: "storage/iffco/SHASHANK GARG_MP04QH6672_2026-27 POLICY.pdf",
    policyNo: "N7910766",
    expectedNet: "2493.00",
    expectedGst: "448.74",
    expectedTotal: "2941.74"
  },
  {
    path: "storage/iffco/SSN ANNAPURNA HEIGHTS LLP_MP48ZC2039_2026-27 POLICY (1).pdf",
    policyNo: "N8042126",
    expectedNet: "20435.00",
    expectedGst: "3678.30",
    expectedTotal: "24113.30"
  },
  {
    path: "storage/iffco/POOJA  PREMCHANDANI_MP04CQ4072_2026-27.pdf",
    policyNo: "201140070126790135204000",
    expectedNet: "8872.00",
    expectedGst: "1596.96",
    expectedTotal: "10469.00"
  },
  {
    path: "storage/SOURABH MEENA_MP15ZN1481_2026-27.PDF",
    policyNo: "N8194398",
    expectedNet: "1538.00",
    expectedGst: "276.84",
    expectedTotal: "1814.84"
  },
  {
    path: "storage/uploads/VIJAY KUMAR MISHRA CONSTRUCTION PVT. LTD._MP04YR6027_2026-27.pdf",
    policyNo: "N8440049",
    expectedNet: "23357.00",
    expectedGst: "4204.26",
    expectedTotal: "27561.26"
  },
  {
    path: "storage/uploads/VIJAY KUMAR MISHRA CONSTRUCTION PVT. LTD._MP04YR6085_2026-27.pdf",
    policyNo: "N8442949",
    expectedNet: "23357.00",
    expectedGst: "4204.26",
    expectedTotal: "27561.26"
  },
  {
    path: "storage/SURENDER GOLEY _PB07BY9749_2026-27.pdf",
    policyNo: "N8542422",
    uniqueInvoice: "1-8VWZREUL",
    expectedNet: "6774.00",
    expectedGst: "1219.32",
    expectedTotal: "7993.32",
    regNo: "PB07BY9749",
    chassis: "MZBFB812LMN109471"
  },
  {
    path: "storage/RAKSHA PATEL_MP04ZN4413_2026-27.pdf",
    policyNo: "N8544972",
    uniqueInvoice: "N8544972",
    expectedNet: "9770.00",
    expectedGst: "1758.60",
    expectedTotal: "11528.60",
    regNo: "MP04ZN4413",
    chassis: "MBHKWD13SPH157894",
    engine: "K12NP7344430",
    insured: "RAKSHA PATEL"
  },
  {
    path: "storage/RAMDAS _MP07ZG7414_2026-27_POLICY.pdf",
    policyNo: "N8556410",
    uniqueInvoice: "N8556410",
    expectedNet: "12327.00",
    expectedGst: "2218.86",
    expectedTotal: "14545.86",
    regNo: "MP07ZG7414",
    chassis: "MZBEP812LPN485293",
    engine: "G4FLNV464534",
    insured: "RAMDAS"
  }
];

async function runTests() {
  console.log("=== Running Scoped PDF Training Unit Tests ===");
  let passed = 0;
  let failed = 0;

  for (const item of targetPdfs) {
    const fullPath = path.resolve(process.cwd(), item.path);
    if (!fs.existsSync(fullPath)) {
      console.log(`[SKIP] File not found: ${item.path}`);
      continue;
    }

    const buffer = fs.readFileSync(fullPath);
    const parsed = await pdf(buffer);
    const text = parsed.text;
    const baseExtracted = extractPolicyFromText(text, path.basename(item.path));
    const trained = applyScopedTraining(baseExtracted, { text, sourceFile: path.basename(item.path) });

    const netMatches = trained.netPremium === item.expectedNet;
    const gstMatches = trained.gstAmount === item.expectedGst;
    const totalMatches = trained.totalPremium === item.expectedTotal;
    const policyMatches = trained.policyNumber === item.policyNo;
    const invoiceMatches = !item.uniqueInvoice || trained.uniqueInvoiceNumber === item.uniqueInvoice;
    const chassisMatches = !item.chassis || trained.chassisNumber === item.chassis;
    const engineMatches = !item.engine || trained.engineNumber === item.engine;
    const insuredMatches = !item.insured || trained.insuredName === item.insured;
    const regMatches = !item.regNo || trained.registrationNumber === item.regNo;

    if (netMatches && gstMatches && totalMatches && policyMatches && invoiceMatches && chassisMatches && engineMatches && insuredMatches && regMatches) {
      console.log(`[PASS] ${path.basename(item.path)}: PolicyNo=${trained.policyNumber}, Insured=${trained.insuredName}, Inv=${trained.uniqueInvoiceNumber || ''}, Chassis=${trained.chassisNumber || ''}, Net=${trained.netPremium}, GST=${trained.gstAmount}, Total=${trained.totalPremium}`);
      passed++;
    } else {
      console.error(`[FAIL] ${path.basename(item.path)}: Expected PolicyNo=${item.policyNo}, Net=${item.expectedNet}, GST=${item.expectedGst}, Total=${item.expectedTotal} | Got PolicyNo=${trained.policyNumber}, Net=${trained.netPremium}, GST=${trained.gstAmount}, Total=${trained.totalPremium}`);
      failed++;
    }
  }

  console.log("\n=== Testing Category & Insurer Isolation ===");
  // Test 1: Non-motor category for IFFCO
  const nonMotorResult = { insuranceCompany: "IFFCO Tokio", documentCategory: "Fire Insurance" };
  const selectedForFire = selectScopedTraining(nonMotorResult, { text: "IFFCO Tokio Fire Policy" });
  const isFireIsolated = !selectedForFire.includes(iffcoMotorTrainer);
  console.log("Isolation Test 1 (IFFCO Fire isolated from Motor trainer):", isFireIsolated ? "[PASS]" : "[FAIL]");

  // Test 2: Non-IFFCO insurer for Motor
  const nonIffcoResult = { insuranceCompany: "ICICI Lombard", documentCategory: "Motor Insurance" };
  const selectedForIcici = selectScopedTraining(nonIffcoResult, { text: "ICICI Lombard Motor Policy" });
  const isInsurerIsolated = !selectedForIcici.includes(iffcoMotorTrainer) && !selectedForIcici.includes(libertyMotorTrainer) && !selectedForIcici.includes(goDigitMotorTrainer);
  console.log("Isolation Test 2 (ICICI Motor isolated from other trainers):", isInsurerIsolated ? "[PASS]" : "[FAIL]");

  if (!isFireIsolated || !isInsurerIsolated) failed++;
  else passed++;

  console.log(`\nResults: ${passed} Passed, ${failed} Failed`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error(err);
  process.exit(1);
});
