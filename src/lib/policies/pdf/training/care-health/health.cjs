const { normalizeAmount, sumAmounts } = require("../../utils/amounts.cjs");
const { cleanHdfcValue } = require("../../utils/text.cjs");

const scope = { insurer: "care-health", category: "health" };
const MONTHS = {
  jan: "01",
  feb: "02",
  mar: "03",
  apr: "04",
  may: "05",
  jun: "06",
  jul: "07",
  aug: "08",
  sep: "09",
  oct: "10",
  nov: "11",
  dec: "12",
};

function matches({ text = "" }) {
  return (
    /Care\s*Health|careinsurance\.com|Religare/i.test(text)
  );
}

function normalizeDate(value = "") {
  if (!value) return "";
  const dmyMatch = String(value).match(/(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
  if (dmyMatch) {
    return `${dmyMatch[1].padStart(2, "0")}/${dmyMatch[2].padStart(2, "0")}/${dmyMatch[3]}`;
  }
  const textMatch = String(value).match(/(\d{1,2})[-/\s]+([A-Za-z]{3})[-/\s]+(\d{4})/);
  if (textMatch) {
    const month = MONTHS[textMatch[2].toLowerCase()];
    if (month) {
      return `${textMatch[1].padStart(2, "0")}/${month}/${textMatch[3]}`;
    }
  }
  return "";
}

function formatAmount(value = "") {
  return value ? sumAmounts(value) : "";
}

function cleanPersonName(value = "") {
  return cleanHdfcValue(value).replace(/^(?:Mr|Mrs|Ms|Miss|Dr)\.?\s+/i, "");
}

function train({ text = "", result = {} }) {
  const policyNumMatch = text.match(/Policy\s+No\.?\s*[:\s]*([A-Z0-9]+)/i);
  const policyNumber = policyNumMatch ? policyNumMatch[1].trim() : result.policyNumber;

  const holderMatch = text.match(/Dear\s+((?:Mr|Mrs|Ms|Miss)\s+[A-Za-z\s]+?),/i) ||
    text.match(/Policyholder[^\n]*\n((?:Mr|Mrs|Ms|Miss)\s+[A-Za-z\s]+?)(?:Male|Female|\d)/i) ||
    text.match(/Date\s*:\s*[^\n]+\n+((?:Mr|Mrs|Ms|Miss)\s+[A-Za-z\s]+?)\n/i);

  const rawHolder = holderMatch ? holderMatch[1].trim() : "";
  const cleanHolder = rawHolder ? cleanPersonName(rawHolder) : result.customerName || result.insuredName;

  const startMatch = text.match(/Policy\s+Period\s*-\s*Start\s+Date\s*(?:\d{2}:\d{2}\s*hrs\s*)?([0-9A-Za-z-]+)/i) ||
    text.match(/Period\s+From\s*[:\s]*([0-9A-Za-z-]+)/i);
  const endMatch = text.match(/Policy\s+Period\s*-\s*End\s+Date\s*(?:Midnight\s*)?([0-9A-Za-z-]+)/i) ||
    text.match(/Period\s+To\s*[:\s]*([0-9A-Za-z-]+)/i);

  const policyStartDate = startMatch ? normalizeDate(startMatch[1]) : result.policyStartDate || result.startDate;
  const policyEndDate = endMatch ? normalizeDate(endMatch[1]) : result.policyEndDate || result.expiryDate;

  const totalPremMatch = text.match(/Premium\s+Paid\s*Rs\.?\s*([0-9,.]+)/i) ||
    text.match(/Total\s+Premium\s*[:\s]*([0-9,.]+)/i) ||
    text.match(/Premium\s+Rs\s*([0-9,.]+)/i);

  const totalPremium = totalPremMatch ? normalizeAmount(totalPremMatch[1]) : result.totalPremium || result.grossPremium;

  const netPremMatch = text.match(/Premium\s+Rs\s*([0-9,.]+)/i) ||
    text.match(/Net\s+Premium\s*[:\s]*([0-9,.]+)/i);

  const netPremium = netPremMatch ? normalizeAmount(netPremMatch[1]) : totalPremium;

  const sumInsMatch = text.match(/Sum\s+Insured\s*\n?\s*([0-9,.]+)/i) ||
    text.match(/Policy\s+Sum\s+Insured\s*\n?\s*([0-9,.]+)/i);

  const sumInsured = sumInsMatch ? normalizeAmount(sumInsMatch[1]) : result.sumInsured;

  const planMatch = text.match(/Plan\s+Name\s*([^\n]+)/i);
  const productName = planMatch ? planMatch[1].trim() : "Care Health Insurance";

  return {
    productName,
    policyNumber: policyNumber || result.policyNumber,
    policyType: "Health Insurance",
    insuredName: cleanHolder || result.insuredName,
    customerName: cleanHolder || result.customerName,
    proposerName: cleanHolder || result.proposerName,
    contactPerson: cleanHolder || result.contactPerson,
    policyStartDate,
    startDate: policyStartDate,
    policyEndDate,
    expiryDate: policyEndDate,
    totalPremium: totalPremium ? formatAmount(totalPremium) : result.totalPremium,
    grossPremium: totalPremium ? formatAmount(totalPremium) : result.grossPremium,
    premium: totalPremium ? formatAmount(totalPremium) : result.premium,
    premiumIncludingGst: totalPremium ? formatAmount(totalPremium) : result.premiumIncludingGst,
    netPremium: netPremium ? formatAmount(netPremium) : totalPremium,
    basicPremium: netPremium ? formatAmount(netPremium) : totalPremium,
    sumInsured: sumInsured ? formatAmount(sumInsured) : result.sumInsured,
    totalSumInsured: sumInsured ? formatAmount(sumInsured) : result.totalSumInsured,
    insuredMembers: cleanHolder ? [{ name: cleanHolder }] : result.insuredMembers || [],
    numberOfInsuredMembers: 1,
    extractionTrainingVersion: "CARE_HEALTH_V1",
  };
}

module.exports = { scope, matches, train };
