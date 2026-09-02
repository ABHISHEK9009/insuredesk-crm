const { normalizeWarehouseDate, parseRobustDate } = require("../../utils/dates.cjs");

const scope = { insurer: "icici-lombard", category: "fire" };

function formatAmount(val) {
  if (!val) return "";
  const num = parseFloat(String(val).replace(/,/g, ""));
  if (isNaN(num)) return "";
  return num.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function matches({ text = "" }) {
  return (
    /ICICI\s+Lombard/i.test(text) &&
    (/Bharat\s+Sookshma\s+Udyam|Bharat\s+Griha\s+Raksha|MSME\s+Suraksha\s+Kavach|Standard\s+Fire|Fire\s+and\s+Special\s+Perils/i.test(text) ||
      /\b1030\/|\b1015\//.test(text))
  );
}

function train({ text = "", result = {} }) {
  const patch = {};

  patch.insuranceCompany = "ICICI Lombard General Insurance Company Limited";
  patch.companyName = "ICICI Lombard General Insurance Company Limited";
  patch.documentCategory = "Fire Insurance";
  patch.policyCategory = "Fire Insurance";
  patch.policyType = "Fire Insurance Policy";
  patch.productName = "ICICI Lombard MSME Suraksha Kavach Package Policy";

  // Policy Number
  const polMatch =
    text.match(/Policy\s+Number\s*[:\s]*([0-9/A-Z-]+)/i) ||
    text.match(/Policy\s*No\.?\s*[:\s]*([0-9/A-Z-]+)/i);
  if (polMatch) {
    patch.policyNumber = polMatch[1].replace(/Bill.*/i, "").trim();
  }

  // Insured Name
  const custMatch = text.match(/Name\s+of\s+the\s+Customer\s*[:\s]*\n?\s*([^\n]+)/i);
  const dateNameMatch = text.match(/Date\s*:\s*[^\n]+\n\s*([A-Za-z0-9\s.,&/-]+?)(?=\s*PLOT|\s*185,|\s*SHOP|\s*WARD|\s*NEAR|\s*VILLAGE|\s*HOUSE|\s*KHASRA|\s*MAILING|\s*Policy\s+No|\n\n)/i);
  const generalNameMatch = text.match(/Name\s+of\s+the\s+Insured\s*[:\s]*\n?\s*([^\n]+)/i);

  if (custMatch) {
    patch.insuredName = custMatch[1].replace(/^:\s*/, "").replace(/\s+/g, " ").trim();
  } else if (dateNameMatch) {
    patch.insuredName = dateNameMatch[1].replace(/^:\s*/, "").replace(/Policy\s+No.*/i, "").replace(/\s+/g, " ").trim();
  } else if (generalNameMatch) {
    patch.insuredName = generalNameMatch[1].replace(/^:\s*/, "").replace(/\s+/g, " ").trim();
  }
  patch.customerName = patch.insuredName;

  // Period / Dates
  const periodMatch =
    text.match(/Period\s+of\s+Insurance\s*From\s*[:\s]*(?:[0-9:]+\s*Hours\s*of\s*)?(\d{1,2}\/\d{1,2}\/\d{4})\s*To\s*[:\s]*(?:[0-9:]+\s*Hours\s*of\s*)?(?:Midnight\s*of\s*)?(\d{1,2}\/\d{1,2}\/\d{4})/i) ||
    text.match(/Period\s+of\s+Insurance\s*From\s*[:\s]*(?:00:00\s+Hours\s+of\s*)?([0-9A-Za-z/-]+)\s*To\s*[:\s]*(?:Midnight\s+of\s*)?([0-9A-Za-z/-]+)/i) ||
    text.match(/From\s*[:\s]*([0-9A-Za-z/-]+)\s*(?:00:00\s+Hours\s*)?To\s*(?:Midnight\s+of\s*)?([0-9A-Za-z/-]+)/i) ||
    text.match(/(\d{2}[-/]\d{2}[-/]\d{4})\s+to\s+(\d{2}[-/]\d{2}[-/]\d{4})/i);
  if (periodMatch) {
    patch.startDate = parseRobustDate(periodMatch[1]) || normalizeWarehouseDate(periodMatch[1]);
    patch.expiryDate = parseRobustDate(periodMatch[2]) || normalizeWarehouseDate(periodMatch[2]);
    patch.policyStartDate = patch.startDate;
    patch.policyExpiryDate = patch.expiryDate;
  }

  // Financials
  const netMatch =
    text.match(/Total\s+value\s+of\s+services\s*\(Premium\s+Value\s+without\s+Tax\)[^\n]*\n?\s*(?:`|₹)?\s*([0-9,.]+)/i) ||
    text.match(/Net\s+Premium\s*[:\s`₹]?\s*([0-9,.]+)/i) ||
    text.match(/Base\s+Premium\s*[:\s`₹]?\s*([0-9,.]+)/i);
  if (netMatch) {
    patch.netPremium = formatAmount(netMatch[1]);
  }

  const cgstMatch = text.match(/CGST\s*(?:₹|`|Rs\.?)?\s*([0-9,.]+)/i) || text.match(/1CGST\d+\s*([0-9,.]+)/i);
  if (cgstMatch) patch.cgst = formatAmount(cgstMatch[1]);

  const sgstMatch = text.match(/SGST\s*(?:₹|`|Rs\.?)?\s*([0-9,.]+)/i) || text.match(/2SGST\d+\s*([0-9,.]+)/i);
  if (sgstMatch) patch.sgst = formatAmount(sgstMatch[1]);

  const igstMatch = text.match(/IGST\s*(?:₹|`|Rs\.?)?\s*([0-9,.]+)/i) || text.match(/3IGST\d+\s*([0-9,.]+)/i);
  if (igstMatch) patch.igst = formatAmount(igstMatch[1]);

  const totalGstMatch =
    text.match(/Total\s+Tax\s+Amount[^\n]*\n?\s*(?:`|₹)?\s*([0-9,.]+)/i) ||
    text.match(/Total\s+GST\s*(?:₹|`|Rs\.?)?\s*([0-9,.]+)/i);
  if (totalGstMatch) {
    patch.gstAmount = formatAmount(totalGstMatch[1]);
    patch.taxAmount = patch.gstAmount;
  }

  const totMatch =
    text.match(/Total\s+Premium\s+inclusive\s+Tax[^\n]*\n?\s*(?:`|₹)?\s*([0-9,.]+)/i) ||
    text.match(/Premium\s*\(`\)\s*\(Including\s+GST\)\s*\(`\)\s*([0-9,.]+)/i) ||
    text.match(/Total\s+Premium\*?\s*[:\s`₹]?\s*([0-9,.]+)/i);
  if (totMatch) {
    patch.totalPremium = formatAmount(totMatch[1]);
    patch.grossPremium = patch.totalPremium;
    patch.premium = patch.totalPremium;
    patch.premiumIncludingGst = patch.totalPremium;
  }

  // Sum Insured
  const sumInsuredMatch =
    text.match(/Fire\s+Basic\s+Covers\s*\(`\)\s*([0-9,.]+)/i) ||
    text.match(/Total\s+Sum\s+Insured\s*[:\s₹`]*([0-9,.]+)/i) ||
    text.match(/Sum\s+Insured\s*\(`\)\s*([0-9,.]+)/i);
  if (sumInsuredMatch) {
    patch.sumInsured = formatAmount(sumInsuredMatch[1]);
    patch.totalSumInsured = patch.sumInsured;
  }

  // Payment Details
  patch.modeOfPayment = "Online";
  patch.paymentMode = "Online";
  patch.paymentMethod = "ONLINE";

  patch.extractionTrainingVersion = "ICICI_LOMBARD_FIRE_V1";

  return patch;
}

module.exports = { scope, matches, train };
