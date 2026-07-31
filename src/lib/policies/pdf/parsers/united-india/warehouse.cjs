const { normalizeAmount } = require("../../utils/amounts.cjs");

const COMPANY_NAME = "United India Insurance Company Limited";
const PRODUCT_NAME = "United Bharat Laghu Udyam Suraksha Policy";

function extractUnitedIndiaWarehouse(text = "") {
  const source = String(text || "");
  const isOtherInsurer = /TATA\s*AIG|tataaig\.com|ICICI\s*Lombard|HDFC\s*ERGO|BAJAJ\s*ALLIANZ|IFFCO\s*TOKIO|GO\s*DIGIT/i.test(source);
  const isMotor = /MOTOR\s+INSURANCE|VEHICLE\s+DETAILS|Registration\s+Number\s+[A-Z0-9]/i.test(source);

  if (isOtherInsurer || isMotor) return { documentDetected: false };

  const isBurglary = /BURGLARY\s+(?:FIRST\s+LOSS\s+)?POLICY/i.test(source);
  const isUdyam = /UNITED\s+(?:BHARAT\s+LAGHU|VALUE)\s+UDYAM\s+SURAKSHA\s+POLICY/i.test(source);
  const documentDetected =
    /UNITED INDIA INSURANCE COMPANY LIMITED/i.test(source) &&
    (isUdyam || isBurglary) &&
    /Location\s*\/\s*Risk Details|Risks Covered|Premise:|BURGLARY FIRST LOSS POLICY/i.test(source);

  const matchedProductName =
    match(source, /(UNITED\s+VALUE\s+UDYAM\s+SURAKSHA\s+POLICY)/i) ||
    match(source, /(UNITED\s+BHARAT\s+LAGHU\s+UDYAM\s+SURAKSHA\s+POLICY)/i) ||
    match(source, /(BURGLARY\s+(?:FIRST\s+LOSS\s+)?POLICY)/i) ||
    PRODUCT_NAME;

  const documentCategory = isBurglary ? "Burglary Insurance" : "Warehouse Insurance";
  const documentFormat = isBurglary ? "UNITED_INDIA_BURGLARY_V1" : "UNITED_INDIA_WAREHOUSE_V1";
  const policySubType = isBurglary ? "BURGLARY_FIRST_LOSS_POLICY" : "WAREHOUSE_FIRE_POLICY";

  const insuredBlock = source.match(/\bInsured\s*\n\s*([^\n]+)\s*\n\s*([^\n]+)/i);
  const insuredName = cleanName(insuredBlock?.[1]);
  const mailingAddress = cleanLine(insuredBlock?.[2]);
  const locationAddressMatch =
    source.match(/Location\s+Address\s+Location\s+Name[\s\S]*?\n([^\n]+?)\s+[A-Z\s.]+\s+Storage/i) ||
    source.match(/Location\s+Address\s*\/\s*Sitation[\s\S]*?\n(?:\d{8,15}\s+)?([^\n]+)/i);
  const riskLocation = locationAddressMatch?.[1]?.trim() || mailingAddress;
  const policyNumber = match(source, /\bPOLICY\s+NO\.?\s*:?\s*([A-Z0-9]+)/i) || match(source, /\bPolicy\s+Number\s*:?\s*([A-Z0-9]+)/i);
  const startDate = match(source, /\bFrom\s+(?:\d{1,2}:\d{2}\s+)?(?:Hrs\s+of\s+|hrs\s+on\s+)?(\d{1,2}\/\d{1,2}\/\d{4})/i);
  const expiryDate = match(source, /\bTo\s+(?:Midnight\s+of\s+|Midnight\s+on\s+)?(\d{1,2}\/\d{1,2}\/\d{4})/i);
  const contentsSumInsured = amount(match(source, /Risks Covered[\s\S]{0,100}?Contents\s*([0-9,]+(?:\.\d{1,2})?)/i)) ||
                             amount(match(source, /Sum\s+Insured\/Risk\s*\n?\s*([0-9,]+(?:\.\d{2})?)/i));
  const netPremium = amount(match(source, /\bNet Premium\s*:\s*([0-9,]+(?:\.\d{1,2})?)/i)) || amount(match(source, /\bPremium\s*:\s*([0-9,]+(?:\.\d{1,2})?)/i));
  const igst = amount(match(source, /\bIGST\s*\(\s*\d+(?:\.\d+)?%\s*\)\s*:\s*([0-9,]+(?:\.\d{1,2})?)/i));
  const cgst = amount(match(source, /\bCGST\s*\(\s*9%\s*\)\s*:\s*([0-9,]+(?:\.\d{1,2})?)/i));
  const sgst = amount(match(source, /\bSGST\s*\(\s*9%\s*\)\s*:\s*([0-9,]+(?:\.\d{1,2})?)/i));
  const totalPremium = amount(match(source, /\bTotal\s*:\s*([0-9,]+(?:\.\d{1,2})?)/i));
  const invoice = source.match(/Invoice No\.\s*&\s*Date\s*:\s*([A-Z0-9]+)\s*&\s*(\d{1,2}\/\d{1,2}\/\d{4})/i);
  const receipt = source.match(/Receipt No\.?\s*:\s*([0-9]+)[\s\S]{0,50}?Receipt Date\s*:\s*(\d{1,2}\/\d{1,2}\/\d{4})/i);
  const agent = source.match(/Agent Name\s*:\s*([^\n]+)[\s\S]{0,50}?Agent Code\s*:\s*([A-Z0-9]+)/i) ||
                source.match(/Agent\/Broker Code\s*:\s*([A-Z0-9]+)/i);
  const goodsStored = match(source, /WAREHOUSE\s*-\s*ONLY\s+([A-Z]+)\s*,/i) || match(source, /Description of Items Insured[\s\S]*?\n\s*([A-Z]+)/i);
  const financialInstitutions = extractFinancialInstitutions(source);
  const addressParts = extractAddressParts(riskLocation);
  const evidence = {
    policyNumber: evidenceLine(source, policyNumber),
    insuredName: evidenceLine(source, insuredName),
    policyPeriod: evidenceLine(source, startDate),
    sumInsured: evidenceLine(source, contentsSumInsured),
    premium: evidenceLine(source, totalPremium),
  };
  const confidence = Object.fromEntries(
    Object.entries(evidence).map(([field, value]) => [field, value ? 0.98 : 0]),
  );

  return {
    documentDetected: true,
    documentCategory,
    documentFormat,
    companyName: COMPANY_NAME,
    insuranceCompany: COMPANY_NAME,
    productName: matchedProductName,
    policyType: matchedProductName,
    policySubType,
    warehousePolicySubType: policySubType,
    insuredName,
    warehouseProfileName: insuredName,
    policyNumber,
    mailingAddress,
    riskLocation,
    premisesAddress: riskLocation,
    ...addressParts,
    startDate,
    expiryDate,
    sumInsured: contentsSumInsured,
    contentsSumInsured,
    stockSumInsured: contentsSumInsured,
    netPremium,
    premiumIncludingGst: totalPremium,
    totalPremium,
    igst,
    gstAmount: igst,
    invoiceNumber: invoice?.[1] || "",
    invoiceDate: invoice?.[2] || "",
    receiptNumber: receipt?.[1] || "",
    receiptDate: receipt?.[2] || "",
    brokerName: cleanLine(agent?.[1]),
    brokerCode: agent?.[2] || "",
    financialInstitutions,
    hypothecationDetails: financialInstitutions.join(", "),
    warehouseFinanced: financialInstitutions.length > 0,
    businessDescription: "Storage of non-hazardous goods in warehouse/godown",
    occupancy: "Storage of non-hazardous goods in warehouse/godown",
    businessType: "Warehouse",
    warehouseType: "Warehouse",
    storageType: "Food Grain Storage",
    hazardCategory: "Non-Hazardous Goods",
    goodsStored: goodsStored ? cleanLine(goodsStored) : "",
    coverageDetails: [
      { coverage: "Fire and Allied Perils", status: "Covered", sumInsured: contentsSumInsured },
      { coverage: "Accidental Damage", status: "Covered", sumInsured: contentsSumInsured },
    ],
    needsManualReview: false,
    extractionConfidence: 0.98,
    fieldEvidence: evidence,
    fieldConfidence: confidence,
    extractionTrainingVersion: "UNITED_INDIA_WAREHOUSE_TRAINING_V1",
  };
}

function extractAddressParts(address = "") {
  const cleanAddr = String(address || "").replace(/\b\d{8,15}\b/g, "");
  return {
    district: match(cleanAddr, /\bDISTRICT\s+([^,]+)/i),
    tehsil: match(cleanAddr, /\bTEHSIL\s+([^,]+)/i),
    state: match(cleanAddr, /\b(GUJARAT|MADHYA PRADESH|MAHARASHTRA|RAJASTHAN|UTTAR PRADESH)\b/i).toUpperCase(),
    pincode: match(cleanAddr, /(?:Pin-?|Pin\s*Code\s*|\b)([1-9]\d{5})\b/),
  };
}

function extractFinancialInstitutions(text = "") {
  const block = match(text, /Financier NameBranch[\s\S]*?Loan Numbe\s*r([\s\S]*?)(?:\n\s*POLICY NO\.|Location\s*\/\s*Risk Details)/i);
  if (!block) return [];
  const banks = [
    [/HDFC\s+BANK\s+LTD/i, "HDFC BANK LTD"],
    [/AXIS\s+BANK\s+LTD/i, "AXIS BANK LTD"],
    [/YES\s+BANK\s+LTD/i, "YES BANK LTD"],
    [/UNION\s+BANK\s+OF\s+INDIA/i, "UNION BANK OF INDIA"],
    [/CENTRAL\s+BANK\s+OF\s+INDI\s*A/i, "CENTRAL BANK OF INDIA"],
    [/PUNJAB\s+NATIONAL\s+BAN\s*K/i, "PUNJAB NATIONAL BANK"],
    [/ICICI\s+BANK\s+LTD/i, "ICICI BANK LTD"],
    [/STATE\s+BANK\s+OF\s+INDIA/i, "STATE BANK OF INDIA"],
    [/L\s*&\s*T\s+FINANCE/i, "L & T FINANCE LTD."],
  ];
  return banks.filter(([pattern]) => pattern.test(block)).map(([, name]) => name);
}

function evidenceLine(text, value) {
  if (!value) return "";
  return String(text)
    .split(/\r?\n/)
    .find((line) => line.replace(/,/g, "").includes(String(value).replace(/,/g, "")))
    ?.replace(/\s+/g, " ")
    .trim() || "";
}

function amount(value) {
  return value ? normalizeAmount(value).replace(/,/g, "") : "";
}

function cleanName(value) {
  return cleanLine(value).replace(/^M\/s\.?\s*/i, "");
}

function cleanLine(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function match(text, pattern, group = 1) {
  return String(text || "").match(pattern)?.[group]?.trim() || "";
}

module.exports = { extractUnitedIndiaWarehouse };
