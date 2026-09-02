const { normalizeWarehouseDate, parseRobustDate } = require("../../utils/dates.cjs");

const scope = { insurer: "icici-lombard", category: "marine" };

function formatAmount(val) {
  if (!val) return "";
  const num = parseFloat(String(val).replace(/,/g, ""));
  if (isNaN(num)) return "";
  return num.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function matches({ text = "" }) {
  return (
    /ICICI\s+Lombard/i.test(text) &&
    (/Marine\s*01|Marine\s+Cargo|Marine\s+Insurance|2001\//i.test(text))
  );
}

function train({ text = "", result = {} }) {
  const patch = {};

  patch.insuranceCompany = "ICICI Lombard General Insurance Company Limited";
  patch.companyName = "ICICI Lombard General Insurance Company Limited";
  patch.documentCategory = "Marine Insurance";
  patch.policyCategory = "Marine Insurance";
  patch.policyType = "Marine Cargo Open Insurance Policy";
  patch.productName = "Marine Cargo Insurance";

  const polMatch = text.match(/Policy\s+No\.?[:\s]*([0-9/]{10,30})/i) || text.match(/\b2001\/[0-9/]+/);
  if (polMatch) {
    patch.policyNumber = (polMatch[1] || polMatch[0]).trim();
  }

  const nameMatch = text.match(/VAK\s+CONSEQUIP\s+SOLUTIONS/i) || text.match(/1\.Name\s+of\s+the\s+Insured\s*([^\n]+)/i);
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

  patch.extractionTrainingVersion = "ICICI_LOMBARD_MARINE_V1";

  return patch;
}

module.exports = { scope, matches, train };
