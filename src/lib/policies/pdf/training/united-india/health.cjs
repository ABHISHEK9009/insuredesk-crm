const { normalizeAmount } = require("../../utils/amounts.cjs");
const { matchGroup } = require("../../utils/regex.cjs");
const { cleanHdfcValue, sliceText } = require("../../utils/text.cjs");

const scope = { insurer: "united-india", category: "health" };

function matches({ text = "" }) {
  const header = text.slice(0, 4000);
  return (
    /United\s+India\s+Insurance/i.test(text) &&
    /INDIVIDUAL\s+HEALTH\s+INSURANCE|HEALTH\s+POLICY\s+SCHEDULE|UIIHLIP/i.test(header) &&
    !/Private\s+Car|Two\s+Wheeler|Goods\s+Carrying|Commercial\s+Vehicle|Registration\s+No/i.test(header)
  );
}

function normalizeDate(value = "") {
  const match = String(value).match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  return match ? `${match[1].padStart(2, "0")}/${match[2].padStart(2, "0")}/${match[3]}` : "";
}

function cleanPersonName(value = "") {
  return cleanHdfcValue(value).replace(/^(?:Mr|Mrs|Ms|Miss|Dr|Shri|Smt|MR|MRS|MS|MISS|DR|SHRI|SMT)\.?\s+/i, "");
}

function extractInsuredMembers(text = "") {
  const section = sliceText(text, /DETAILS\s+OF\s+INSURED\s+PERSONS/i, /PREMIUM\s+BREAK\s+DOWN|SUMMARY\s+OF\s+COVERAGE/i);
  const members = [];

  const nameMatches = section.match(/(?:SHRI|SMT|MR|MRS|MS)\s+[A-Z\s]+/gi) || [];
  const dobMatches = section.match(/(\d{2}\/\d{2}\/\d{4})/g) || [];

  nameMatches.forEach((nm, idx) => {
    const cleanNm = cleanPersonName(nm);
    if (cleanNm && !members.some(m => m.name === cleanNm)) {
      members.push({
        name: cleanNm,
        dateOfBirth: dobMatches[idx] || "",
        gender: /SMT|MRS|MS/i.test(nm) ? "Female" : "Male",
      });
    }
  });

  return members;
}

function train({ text = "", result = {} }) {
  const policyNumMatch = text.match(/YOUR\s+POLICY\s+No\.?\s*([A-Z0-9]+)/i) ||
    text.match(/POLICY\s+NO\.?:\s*([A-Z0-9]+)/i) ||
    text.match(/Policy\s+No\.?:\s*([A-Z0-9]+)/i);

  const policyNumber = policyNumMatch ? policyNumMatch[1].trim() : result.policyNumber;

  const holderMatch = text.match(/Dear\s+((?:MR|MRS|MS|MISS|SHRI|SMT)\s+[A-Z\s]+?)(?=\n|Welcome|$)/i) ||
    text.match(/Policyholder\s+Name\s*:\s*([^\n]+)/i) ||
    text.match(/This\s+is\s+to\s+certify\s+that\s+((?:MR|MRS|MS|MISS|SHRI|SMT)\s+[A-Z\s]+?)\s+has\s+paid/i);

  const rawHolder = holderMatch ? holderMatch[1].trim() : "";
  const cleanHolder = rawHolder ? cleanPersonName(rawHolder) : result.customerName || result.insuredName;

  const periodMatch = text.match(/Period\s+of\s+Insurance\s*:\s*From\s*(?:\d{2}:\d{2}\s*hrs\s*(?:of|On)\s*)?(\d{2}\/\d{2}\/\d{4})[\s\S]{0,40}?To\s*(?:Midnight\s*(?:of|on)\s*)?(\d{2}\/\d{2}\/\d{4})/i) ||
    text.match(/From\s*(?:\d{2}:\d{2}\s*hrs\s*(?:of|On)\s*)?(\d{2}\/\d{2}\/\d{4})[\s\S]{0,30}?To\s*(?:Midnight\s*(?:of|on)\s*)?(\d{2}\/\d{2}\/\d{4})/i);

  const policyStartDate = periodMatch ? normalizeDate(periodMatch[1]) : result.policyStartDate || result.startDate;
  const policyEndDate = periodMatch ? normalizeDate(periodMatch[2]) : result.policyEndDate || result.expiryDate;

  const totalPremMatch = text.match(/Total\s*\n+:\s*\n+([0-9,.]+)/i) ||
    text.match(/Total\s*:\s*([0-9,.]+)/i) ||
    text.match(/has\s+paid\s+([0-9,.]+)\s*\(/i) ||
    text.match(/Total\s+Basic\s+Premium\s*:\s*([0-9,.]+)/i) ||
    text.match(/Premium\s*:\s*([0-9,.]+)/i);

  const totalPremium = totalPremMatch ? normalizeAmount(totalPremMatch[1]) : result.totalPremium || result.grossPremium;

  const netPremMatch = text.match(/Total\s+Basic\s+Premium\s*\n+:\s*\n+([0-9,.]+)/i) ||
    text.match(/Total\s+Basic\s+Premium\s*:\s*([0-9,.]+)/i) ||
    text.match(/Premium\s*:\s*([0-9,.]+)/i);

  const netPremium = netPremMatch ? normalizeAmount(netPremMatch[1]) : totalPremium;

  const sumInsMatch = text.match(/Gold\s*([0-9,.]+)/i) ||
    text.match(/Platinum\s*([0-9,.]+)/i) ||
    text.match(/Sum\s+Insured\s*\(\)\s*([0-9,.]+)/i) ||
    text.match(/Sum\s+Insured\s*:\s*([0-9,.]+)/i);

  const sumInsured = sumInsMatch ? normalizeAmount(sumInsMatch[1]) : result.sumInsured;

  const members = extractInsuredMembers(text);

  return {
    insuranceCompany: "United India Insurance Company Limited",
    companyName: "United India Insurance Company Limited",
    documentCategory: "Health Insurance",
    policyCategory: "Health Insurance",
    policyType: "Individual Health Insurance",
    productName: "Individual Health Insurance Policy",
    documentFormat: "UNITED_INDIA_HEALTH_V1",
    sourceDocumentType: "UNITED_INDIA_HEALTH_V1",
    policyNumber: policyNumber || result.policyNumber,
    insuredName: cleanHolder || result.insuredName,
    customerName: cleanHolder || result.customerName,
    proposerName: cleanHolder || result.proposerName,
    contactPerson: cleanHolder || result.contactPerson,
    policyStartDate,
    startDate: policyStartDate,
    policyEndDate,
    expiryDate: policyEndDate,
    totalPremium,
    grossPremium: totalPremium,
    premium: totalPremium,
    premiumIncludingGst: totalPremium,
    netPremium,
    basicPremium: netPremium,
    sumInsured,
    totalSumInsured: sumInsured,
    insuredMembers: members.length > 0 ? members : result.insuredMembers || [],
    extractionTrainingVersion: "UNITED_INDIA_HEALTH_V1",
  };
}

module.exports = { scope, matches, train };
