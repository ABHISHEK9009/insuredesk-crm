const { normalizeAmount, sumAmounts } = require("../../utils/amounts.cjs");
const { matchGroup } = require("../../utils/regex.cjs");
const { cleanHdfcValue, sliceText } = require("../../utils/text.cjs");

const scope = { insurer: "tata-aig", category: "health" };

function matches({ text = "" }) {
  return (
    /TATA\s*AIG/i.test(text) &&
    /Medicare|Health\s*AdvantEdge|TATHLIP|Health\s*Card|80\s*D\s*Certi/i.test(text) &&
    !/Private\s+Car|Auto\s*Secure|Two\s+Wheeler|Commercial\s+Vehicle/i.test(text)
  );
}

function normalizeDate(value = "") {
  const match = String(value).match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  return match ? `${match[1].padStart(2, "0")}/${match[2].padStart(2, "0")}/${match[3]}` : "";
}

function formatAmount(value = "") {
  return value ? sumAmounts(value) : "";
}

function cleanPersonName(value = "") {
  return cleanHdfcValue(value).replace(/^(?:Mr|Mrs|Ms|Miss|Dr)\.?\s+/i, "");
}

function extractInsuredMembers(text = "") {
  const section = sliceText(text, /Insured\s+Person\s+Details:/i, /Sum\s+Insured/i);
  const nameBlock = matchGroup(section, /Insured\s+Person['’]?s\s+Name\s*\n([^\n]+)/i);
  const members = [];

  if (nameBlock) {
    const names = nameBlock.replace(/([a-z])([A-Z])/g, "$1|$2").split("|").map(cleanPersonName).filter(Boolean);
    names.forEach(name => {
      if (name && !members.some(m => m.name === name)) {
        members.push({ name });
      }
    });
  }

  return members;
}

function train({ text = "", result = {} }) {
  const policyNumMatch = text.match(/Policy\s+Number\s*([0-9A-Z-]+)/i) ||
    text.match(/Policy\s+No\.?\s*([0-9A-Z-]+)/i);

  const policyNumber = policyNumMatch ? policyNumMatch[1].trim() : result.policyNumber;

  const holderMatch = text.match(/Policy\s+Holder['’]?s\s+Name\s*([^\n]+)/i) ||
    text.match(/Hello\s+([A-Za-z\s]+?)[!,\n]/i) ||
    text.match(/Name:\s*\n\s*([A-Za-z\s]+?)\n/i) ||
    text.match(/Name\s*\(Mr\/Mrs\/Ms\/Dr\)\s*([A-Za-z\s]+?)\n/i);

  const rawHolder = holderMatch ? holderMatch[1].trim() : "";
  const cleanHolder = rawHolder ? cleanPersonName(rawHolder) : result.customerName || result.insuredName;

  const periodMatch = text.match(/Policy\s+Period\s*From:\s*([0-9/]+)[\s\S]{0,30}?To:\s*([0-9/]+)/i) ||
    text.match(/Proposed\s+Policy\s+Period\s*:\s*([0-9/]+)[\s\S]{0,30}?To\s*([0-9/]+)/i) ||
    text.match(/From:\s*([0-9/]+)[\s\S]{0,30}?To:\s*([0-9/]+)/i);

  const policyStartDate = periodMatch ? normalizeDate(periodMatch[1]) : result.policyStartDate || result.startDate;
  const policyEndDate = periodMatch ? normalizeDate(periodMatch[2]) : result.policyEndDate || result.expiryDate;

  const grossPremMatch = text.match(/Total\s+Premium\s+Paid\s*\(Inclusive\s+of\s+Loading\)\s*([0-9,.]+)/i) ||
    text.match(/Premium\s+amount\s+of\s+Rs\s*([0-9,.]+)/i) ||
    text.match(/Premium\s+Amount\s*\(in\s*₹\)\s*:\s*([0-9,.]+)/i) ||
    text.match(/Gross\s+Premium\s*\(₹\)\s*[:\s]*([0-9,.]+)/i) ||
    text.match(/Gross\s+Premium[^\n]*\n\s*([0-9,.]+)/i);

  const totalPremium = grossPremMatch ? normalizeAmount(grossPremMatch[1]) : result.totalPremium || result.grossPremium;

  const netPremMatch = text.match(/Net\s+Premium\s*\(₹\)\s*[:\s]*([0-9,.]+)/i) ||
    text.match(/Net\s+Premium[^\n]*\n\s*([0-9,.]+)/i);

  const netPremium = netPremMatch ? normalizeAmount(netPremMatch[1]) : totalPremium;

  const sumInsMatch = text.match(/Sum\s+Insured\s*\(₹\)#?\s*([0-9,]+)/i) ||
    text.match(/Sum\s+Insured#?\s*([0-9,]+)/i) ||
    text.match(/Sum\s+Insured\s*[:\s]*([0-9,]+)/i);

  const sumInsured = sumInsMatch ? normalizeAmount(sumInsMatch[1]) : result.sumInsured;

  const prodMatch = text.match(/Product\s+Name\s*([^\n]+)/i) ||
    text.match(/TATA\s+AIG\s+Medicare/i);

  const productName = prodMatch ? prodMatch[1] ? prodMatch[1].trim() : prodMatch[0].trim() : "TATA AIG Medicare";

  const members = extractInsuredMembers(text);

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
    insuredMembers: members.length > 0 ? members : (cleanHolder ? [{ name: cleanHolder }] : result.insuredMembers || []),
    numberOfInsuredMembers: members.length || 1,
    extractionTrainingVersion: "TATA_AIG_HEALTH_V1",
  };
}

module.exports = { scope, matches, train };
