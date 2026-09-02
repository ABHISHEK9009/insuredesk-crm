const { normalizeWarehouseDate, parseRobustDate } = require("../../utils/dates.cjs");

const scope = { insurer: "icici-lombard", category: "gpa" };

function formatAmount(val) {
  if (!val) return "";
  const num = parseFloat(String(val).replace(/,/g, ""));
  if (isNaN(num)) return "";
  return num.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function matches({ text = "" }) {
  return (
    /ICICI\s+Lombard/i.test(text) &&
    (/Group\s+Personal\s+Accident|4005\//i.test(text))
  );
}

function train({ text = "", result = {} }) {
  const patch = {};

  patch.insuranceCompany = "ICICI Lombard General Insurance Company Limited";
  patch.companyName = "ICICI Lombard General Insurance Company Limited";
  patch.documentCategory = "Group Personal Accident";
  patch.policyCategory = "Group Personal Accident";
  patch.policyType = "Group Personal Accident Policy";
  patch.productName = "Group Personal Accident";

  const polMatch = text.match(/Policy\s+Number\s*[:\s]*([0-9/]+)/i) || text.match(/4005\/[0-9/]+/);
  if (polMatch) {
    patch.policyNumber = (polMatch[1] || polMatch[0]).trim();
  }

  const nameMatch =
    text.match(/Name\s+of\s+the\s+Insured\s*([A-Za-z0-9\s.,&/-]+?)(?=\s*Mailing|\s*Address|\n)/i) ||
    text.match(/ASHRA\s+RETAIL\s+PRIVATE\s+LIMITED/i);
  if (nameMatch) {
    patch.insuredName = (nameMatch[1] || nameMatch[0]).replace(/^:\s*/, "").replace(/Mailing.*/i, "").trim();
    patch.customerName = patch.insuredName;
  }

  const periodMatch = text.match(/Period\s+of\s+Insurance\s*From\s*([0-9A-Za-z/-]+)\s*To\s*([0-9A-Za-z/-]+)/i);
  if (periodMatch) {
    patch.startDate = parseRobustDate(periodMatch[1]) || normalizeWarehouseDate(periodMatch[1]);
    patch.expiryDate = parseRobustDate(periodMatch[2]) || normalizeWarehouseDate(periodMatch[2]);
    patch.policyStartDate = patch.startDate;
    patch.policyExpiryDate = patch.expiryDate;
  }

  const totMatch = text.match(/Total\s+Premium\(Rs\.\)\s*([0-9,.]+)/i);
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

  patch.extractionTrainingVersion = "ICICI_LOMBARD_GPA_V1";

  return patch;
}

module.exports = { scope, matches, train };
