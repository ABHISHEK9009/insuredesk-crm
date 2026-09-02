const { normalizeWarehouseDate, parseRobustDate } = require("../../utils/dates.cjs");

const scope = { insurer: "icici-lombard", category: "cpm" };

function formatAmount(val) {
  if (!val) return "";
  const num = parseFloat(String(val).replace(/,/g, ""));
  if (isNaN(num)) return "";
  return num.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function matches({ text = "" }) {
  return (
    /ICICI\s+Lombard/i.test(text) &&
    (/Engg\s*06|Contractors?\s+Plant\s+and\s+Machinery|5006\//i.test(text))
  );
}

function train({ text = "", result = {} }) {
  const patch = {};

  patch.insuranceCompany = "ICICI Lombard General Insurance Company Limited";
  patch.companyName = "ICICI Lombard General Insurance Company Limited";
  patch.documentCategory = "Contractors Plant & Machinery";
  patch.policyCategory = "Engineering / CPM";
  patch.policyType = "Contractor's Plant and Machinery Insurance Policy";
  patch.productName = "Contractor's Plant and Machinery Insurance";

  const polMatch = text.match(/Policy\s+No\.?[:\s]*([0-9/]+)/i) || text.match(/5006\/[0-9/]+/);
  if (polMatch) {
    patch.policyNumber = (polMatch[1] || polMatch[0]).trim();
  }

  const nameMatch = text.match(/SMT\s+ANSHU\s+SINGH\s+PARIHAR/i) || text.match(/1\.Name\s+of\s+the\s+Insured\s*([^\n]+)/i);
  if (nameMatch) {
    patch.insuredName = (nameMatch[1] || nameMatch[0]).trim();
    patch.customerName = patch.insuredName;
  }

  const periodMatch = text.match(/Period\s+of\s+Insurance\s*From\s*([0-9A-Za-z/-]+)\s*To\s*([0-9A-Za-z/-]+)/i);
  if (periodMatch) {
    patch.startDate = parseRobustDate(periodMatch[1]) || normalizeWarehouseDate(periodMatch[1]);
    patch.expiryDate = parseRobustDate(periodMatch[2]) || normalizeWarehouseDate(periodMatch[2]);
    patch.policyStartDate = patch.startDate;
    patch.policyExpiryDate = patch.expiryDate;
  }

  const totMatch = text.match(/Total\s+Premium\(Rs\.\)\s*([0-9,.]+)/i) || text.match(/Total\s+Premium[^\n]*\n?\s*([0-9,.]+)/i);
  if (totMatch) {
    patch.totalPremium = formatAmount(totMatch[1]);
    patch.grossPremium = patch.totalPremium;
    patch.premium = patch.totalPremium;
    patch.premiumIncludingGst = patch.totalPremium;
  }

  const netMatch = text.match(/Premium\s*\(Rs\.\)\s*([0-9,.]+)/i);
  if (netMatch) {
    patch.netPremium = formatAmount(netMatch[1]);
  }

  patch.extractionTrainingVersion = "ICICI_LOMBARD_CPM_V1";

  return patch;
}

module.exports = { scope, matches, train };
