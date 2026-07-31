const { normalizeAmount, sumPlainAmounts } = require("../../utils/amounts.cjs");
const { matchGroup } = require("../../utils/regex.cjs");
const { cleanWarehouseBlock } = require("../../utils/text.cjs");

const scope = { insurer: "united-india", category: "burglary" };

function matches({ text = "" }) {
  return (
    /UNITED\s+INDIA\s+INSURANCE\s+COMPANY\s+LIMITED/i.test(text) &&
    /BURGLARY\s+(?:FIRST\s+LOSS\s+)?POLICY/i.test(text)
  );
}

function train({ text = "", result = {} }) {
  const policyNumber =
    matchGroup(text, /Policy\s+Number\s*:?\s*([A-Z0-9]{10,25})/i) ||
    matchGroup(text, /Policy\s+No\.?\s*:?\s*([A-Z0-9]{10,25})/i) ||
    result.policyNumber;

  const insuredBlock = text.match(/Name\/ID\s*([^\n]+)/i) || text.match(/\bInsured\s*\n\s*([^\n]+)/i);
  const insuredNameRaw = insuredBlock?.[1] || "";
  const insuredName = cleanWarehouseBlock(
    insuredNameRaw.replace(/^M\/s\.?\s*/i, "").split("/")[0],
  ) || result.insuredName;

  const startDate =
    matchGroup(text, /From\s+(?:From\s+)?(?:\d{1,2}:\d{2}\s+)?(?:hrs\s+on\s+)?(\d{1,2}\/\d{1,2}\/\d{4})/i) ||
    result.startDate;

  const expiryDate =
    matchGroup(text, /To\s+(?:To\s+)?Midnight\s+on\s+(\d{1,2}\/\d{1,2}\/\d{4})/i) ||
    result.expiryDate;

  const netPremium =
    normalizeAmount(matchGroup(text, /Premium\s*:\s*([0-9,]+(?:\.\d{1,2})?)/i)) ||
    result.netPremium;

  const cgst =
    normalizeAmount(matchGroup(text, /CGST\s*\(\s*9%\s*\)\s*:\s*([0-9,]+(?:\.\d{1,2})?)/i)) ||
    result.cgst;

  const sgst =
    normalizeAmount(matchGroup(text, /SGST\s*\(\s*9%\s*\)\s*:\s*([0-9,]+(?:\.\d{1,2})?)/i)) ||
    result.sgst;

  const stampDuty =
    normalizeAmount(matchGroup(text, /Stamp\s+Duty\s*:\s*([0-9,]+(?:\.\d{1,2})?)/i)) ||
    result.stampDuty;

  const totalPremium =
    normalizeAmount(matchGroup(text, /Total\s*:\s*([0-9,]+(?:\.\d{1,2})?)/i)) ||
    result.totalPremium;

  const receiptMatch = text.match(/Receipt\s+Number\s*:\s*([0-9]+)[\s\S]{0,50}?Receipt\s+Date\s*:\s*(\d{1,2}\/\d{1,2}\/\d{4})/i);
  const invoiceMatch = text.match(/Invoice\s+No\.\s*&\s*Date\s*:\s*([A-Z0-9]+)\s*&\s*(\d{1,2}\/\d{1,2}\/\d{4})/i);

  const agentMatch = text.match(/Agent\/Broker\s+Code\s*:\s*([A-Z0-9]+)/i);
  const businessAssocMatch = text.match(/Business\s+Associate\s+Code\s*:\s*([A-Z0-9]+)/i);

  const locationId =
    matchGroup(text, /Location\s+Id[\s\S]*?\n\s*(\d{8,15})/i) ||
    matchGroup(text, /\b(\d{11})\b\s+M\/S/i) ||
    "";
  const locationAddressMatch = text.match(/Location\s+Address\s*\/\s*Sitation[\s\S]*?\n(?:\d{8,15}\s+)?([^\n]+)/i);
  const rawLocationAddress = locationAddressMatch?.[1]?.trim() || result.riskLocation || "";

  const textWithoutLocationIds = text.replace(/\b\d{8,15}\b/g, "");
  const cleanAddress = rawLocationAddress.replace(/\b\d{8,15}\b/g, "");
  const pincode =
    matchGroup(cleanAddress, /(?:Pin-?|pincode:?\s*)([1-9]\d{5})\b/i) ||
    matchGroup(cleanAddress, /\b([1-9]\d{5})\b/) ||
    matchGroup(textWithoutLocationIds, /Pin\s*Code[\s\S]{0,40}?([1-9]\d{5})/i) ||
    result.pincode ||
    "";
  const tehsil = matchGroup(rawLocationAddress, /TEHSIL\s+([^,]+)/i) || "";
  const district = matchGroup(rawLocationAddress, /DISTRICT\s+([^,]+)/i) || "";
  const state = matchGroup(rawLocationAddress, /(GUJARAT|MADHYA\s+PRADESH|MAHARASHTRA|RAJASTHAN|UTTAR\s+PRADESH)/i).toUpperCase() || "";

  const firstLossPercentage = matchGroup(text, /First\s+Loss\(\s*%\s*\)\s*(\d+)/i) || "25";
  const sumInsured =
    normalizeAmount(matchGroup(text, /Total\s+Sum\s+Insured\s*:?\s*([0-9,]+(?:\.\d{2})?)/i)) ||
    normalizeAmount(matchGroup(text, /SI\(\s*₹?\s*\)\s+([0-9,]+(?:\.\d{2})?)/i)) ||
    normalizeAmount(matchGroup(text, /Sum\s+Insured\/Risk[\s\S]*?\n[^\n]*?\s([0-9,]{4,}(?:\.\d{2})?)/i)) ||
    result.sumInsured;

  const theftAddon = text.match(/Theft\s+([0-9,]+(?:\.\d{2})?)\s+([0-9,]+(?:\.\d{2})?)/i);
  const theftSumInsured = normalizeAmount(theftAddon?.[1]) || sumInsured;
  const theftPremium = normalizeAmount(theftAddon?.[2]) || "";

  const itemDescription =
    matchGroup(text, /\bOthers\s*-\s*Others\s+([A-Z]+)\b/i) ||
    matchGroup(text, /Description\s+of\s+Items\s+Insured[\s\S]*?\b([A-Z]{3,15})\s+\d{1,2}\b/i) ||
    "RICE";

  const financialInstitutions = extractFinancialInstitutions(text);

  return {
    policyNumber,
    insuredName,
    startDate,
    expiryDate,
    netPremium,
    cgst,
    sgst,
    stampDuty,
    totalPremium,
    premiumIncludingGst: totalPremium,
    gstAmount: sumPlainAmounts(cgst, sgst) || result.gstAmount,
    receiptNumber: receiptMatch?.[1] || result.receiptNumber || "",
    receiptDate: receiptMatch?.[2] || result.receiptDate || "",
    invoiceNumber: invoiceMatch?.[1] || result.invoiceNumber || "",
    invoiceDate: invoiceMatch?.[2] || result.invoiceDate || "",
    brokerCode: agentMatch?.[1] || result.brokerCode || "",
    businessAssociateCode: businessAssocMatch?.[1] || result.businessAssociateCode || "",
    locationId,
    riskLocation: rawLocationAddress || result.riskLocation,
    mailingAddress: rawLocationAddress || result.mailingAddress,
    premisesAddress: rawLocationAddress || result.premisesAddress,
    tehsil,
    district,
    state,
    pincode,
    firstLossPercentage,
    sumInsured,
    burglarySumInsured: sumInsured,
    theftSumInsured,
    theftPremium,
    goodsStored: itemDescription,
    financialInstitutions: financialInstitutions.length ? financialInstitutions : result.financialInstitutions || [],
    hypothecationDetails: financialInstitutions.join(", ") || result.hypothecationDetails || "",
    warehouseFinanced: financialInstitutions.length > 0,
    extractionTrainingVersion: "UNITED_INDIA_BURGLARY_TRAINING_V1",
  };
}

function extractFinancialInstitutions(text = "") {
  const block = matchGroup(
    text,
    /Financier\s+Name\s+Agreement\s+Type[\s\S]*?Address([\s\S]*?)(?:Premise:|Location\s+Id|Policy\s+Number)/i,
  );
  if (!block) return [];

  const knownBanks = [
    [/AXIS\s+BANK\s+LTD/i, "AXIS BANK LTD."],
    [/UNION\s+BANK\s+OF\s+INDIA/i, "UNION BANK OF INDIA"],
    [/PUNJAB\s+NATIONAL\s+BANK/i, "PUNJAB NATIONAL BANK"],
    [/STATE\s+BANK\s+OF\s+INDIA/i, "STATE BANK OF INDIA"],
    [/HDFC\s+BANK\s+LTD/i, "HDFC BANK LTD"],
    [/YES\s+BANK\s+LTD/i, "YES BANK LTD."],
    [/CENTRAL\s+BANK\s+OF\s+INDIA/i, "CENTRAL BANK OF INDIA"],
    [/ICICI\s+BANK\s+LTD/i, "ICICI BANK LTD"],
    [/L\s*&\s*T\s+FINANCE/i, "L&T FINANCE LTD"],
  ];

  return knownBanks.filter(([pattern]) => pattern.test(block)).map(([, name]) => name);
}

module.exports = { scope, matches, train };
