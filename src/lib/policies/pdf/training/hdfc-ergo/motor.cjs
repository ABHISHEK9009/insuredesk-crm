const { normalizeAmount, sumAmounts } = require("../../utils/amounts.cjs");
const { buildDuration } = require("../../utils/dates.cjs");
const { cleanHdfcValue } = require("../../utils/text.cjs");

const scope = { insurer: "hdfc-ergo", category: "motor" };

function matches({ text = "", result = {} }) {
  const category = String(result.documentCategory || result.policyType || "");
  const isHdfc = /HDFC\s*ERGO|HDFCERGO\.com/i.test(text);
  const isMotor = /Motor|Standalone\s+Motor|Private\s+Car|Two\s+Wheeler|Commercial\s+Vehicle/i.test(category) ||
    /Standalone\s+Motor\s+Own\s+Damage|Proposal\s+Form\s+cum\s+Transcript\s+Letter|Private\s+Car|Two\s+Wheeler|Commercial\s+Vehicle|Vehicle\s+Details|Total\s+IDV|PMTB\d+/i.test(text);
  const isHealth = /Optima\s+Secure|Optima\s+Restore|my\s*:\s*health|Health\s*Suraksha|INDIVIDUAL\s+HEALTH/i.test(text);
  return isHdfc && isMotor && !isHealth;
}

function clean(value = "") {
  return cleanHdfcValue(value).replace(/^(?:Mr|Mrs|Ms|Miss|Dr|Shri|Smt|MR|MRS|MS|MISS|DR|SHRI|SMT)\.?\s+/i, "").trim();
}

function formatAmount(value = "") {
  return value ? sumAmounts(normalizeAmount(value)) : "";
}

function normalizeDate(value = "") {
  if (!value) return "";
  const dmyMatch = String(value).match(/(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
  if (dmyMatch) {
    return `${dmyMatch[1].padStart(2, "0")}/${dmyMatch[2].padStart(2, "0")}/${dmyMatch[3]}`;
  }
  const textMatch = String(value).match(/(\d{1,2})\s+([A-Za-z]{3}),?\s+(\d{4})/);
  if (textMatch) {
    const months = { jan: "01", feb: "02", mar: "03", apr: "04", may: "05", jun: "06", jul: "07", aug: "08", sep: "09", oct: "10", nov: "11", dec: "12" };
    const month = months[textMatch[2].toLowerCase()];
    if (month) {
      return `${textMatch[1].padStart(2, "0")}/${month}/${textMatch[3]}`;
    }
  }
  return "";
}

function train({ text = "", result = {} }) {
  if (!result || typeof result !== "object") return result;

  const patch = {};

  // 1. Policy / Proposal Number
  const pmtbMatch = text.match(/Proposal\s+No\.?\s*(PMTB[A-Z0-9]+)/i) ||
    text.match(/\b(PMTB[A-Z0-9]{8,})\b/i);
  const numericPropMatch = text.match(/Proposal\s+No\.?\s*(\d{10,})/i);

  const policyNumber = pmtbMatch ? pmtbMatch[1].trim() : (numericPropMatch ? numericPropMatch[1].trim() : result.policyNumber);
  if (policyNumber) patch.policyNumber = policyNumber;
  if (numericPropMatch) patch.proposalNumber = numericPropMatch[1].trim();

  // 2. Product Name
  const productMatch = text.match(/Proposal\s+Form\s+cum\s+Transcript\s+Letter\s+For\s+([^\n]+)/i) ||
    text.match(/Product\s+Name\s*([^\n]+)/i);
  const productName = productMatch ? productMatch[1].trim() : "Standalone Motor Own Damage Cover - Private Car";
  patch.productName = productName;
  patch.policyType = productName;
  patch.policyCategory = "Motor";

  // 3. Insured Name & Details
  const customerNameMatch = text.match(/Customer\s+Name\s*:\s*([^\n]+)/i) ||
    text.match(/MR\s+([A-Z\s]+?)\n+S\/O/i) ||
    text.match(/PMTB[0-9A-Z]+\n+((?:MR|MRS|MS|MISS)\s+[A-Z\s]+?)\n+S\/O/i);

  let cleanName = "";
  if (customerNameMatch) {
    cleanName = clean(customerNameMatch[1].replace(/\s*PAN\s*(?:No\.?)?.*$/i, ""));
  } else {
    cleanName = clean(result.insuredName || result.customerName);
  }
  if (cleanName) {
    patch.insuredName = cleanName;
    patch.customerName = cleanName;
    patch.proposerName = cleanName;
  }

  // 4. PAN Number
  const panMatch = text.match(/PAN(?:\/Form\s*97\s*ID)?\s*(?:No\.?)?\s*:\s*([A-Z0-9]{10})/i) ||
    text.match(/PAN\s+No\.?\s*:\s*([A-Z0-9]{10})/i);
  if (panMatch) patch.panNumber = panMatch[1].trim();

  // 5. Vehicle Details
  const makeMatch = text.match(/Make\s+([A-Z0-9]+)/i);
  const modelMatch = text.match(/Model\s+([^\n]+)/i);
  const regMatch = text.match(/Registration\s+No\s*([A-Z0-9-]+)/i);
  const rtoMatch = text.match(/RTO\s+([A-Z]+)/i);
  const chassisMatch = text.match(/Chassis\s+No\.?\s*([A-Z0-9]+)/i);
  const engineMatch = text.match(/Engine\s+No\.?\s*([A-Z0-9]+)/i);
  const ccMatch = text.match(/Cubic\s+Capacity\s*(\d+)/i);
  const seatsMatch = text.match(/Seats\s*(\d+)/i);
  const yomMatch = text.match(/Year\s+of\s+Manufacture\s*(\d{4})/i);
  const bodyMatch = text.match(/Body\s+Type\s*([A-Z]+)/i);

  if (makeMatch) patch.vehicleMake = makeMatch[1].trim();
  if (modelMatch) patch.vehicleModel = modelMatch[1].trim();
  if (makeMatch && modelMatch) patch.makeModel = `${makeMatch[1].trim()} ${modelMatch[1].trim()}`;
  if (regMatch) {
    const rawReg = regMatch[1].trim();
    patch.registrationNumber = rawReg;
    patch.vehicleNumber = rawReg.replace(/-/g, "");
  }
  if (rtoMatch) patch.rtoLocation = rtoMatch[1].trim();
  if (chassisMatch) patch.chassisNumber = chassisMatch[1].trim();
  if (engineMatch) patch.engineNumber = engineMatch[1].trim();
  if (ccMatch) patch.cubicCapacity = ccMatch[1].trim();
  if (seatsMatch) patch.seatingCapacity = seatsMatch[1].trim();
  if (yomMatch) patch.manufacturingYear = yomMatch[1].trim();
  if (bodyMatch) patch.bodyType = bodyMatch[1].trim();

  // 6. IDV
  const idvMatch = text.match(/Total\s+IDV\s*(?:\(`\)\s*)?\n?(\d+)/i) ||
    text.match(/Total\s+IDV[^\n]*\n+[\s\S]*?(\d{5,})/i);
  if (idvMatch) {
    patch.idv = idvMatch[1].trim();
    patch.totalIdv = idvMatch[1].trim();
  }

  // 7. Policy Dates
  const periodMatch = text.match(/From\s+(\d{1,2}\s+[A-Za-z]{3},?\s+\d{4})[\s\S]{0,30}?To\s+(\d{1,2}\s+[A-Za-z]{3},?\s+\d{4})/i) ||
    text.match(/From\s+Date\s*&\s*Time\s*(\d{1,2}\/\d{1,2}\/\d{4})[\s\S]{0,50}?To\s+Date\s*&\s*Time\s*(\d{1,2}\/\d{1,2}\/\d{4})/i);

  if (periodMatch) {
    patch.startDate = normalizeDate(periodMatch[1]);
    patch.expiryDate = normalizeDate(periodMatch[2]);
    patch.policyStartDate = patch.startDate;
    patch.policyEndDate = patch.expiryDate;
    patch.duration = buildDuration(patch.startDate, patch.expiryDate);
  }

  // 8. Financials / Premiums
  const basicOdMatch = text.match(/Basic\s+Own\s+Damage\s*(\d+)/i);
  const ncbMatch = text.match(/No\s+Claim\s+Bonus\s*\((\d+%)\)\s*(\d+)/i);
  const netPremMatch = text.match(/Net\s+Own\s+Damage\s+Premium\s*\(a\)\s*(\d+)/i) ||
    text.match(/Total\s+Premium\s*\(a\+b\)\s*(\d+)/i);
  const gstMatch = text.match(/GST\s+18%\s*:\s*[^\n]+\s+(\d+)/i);
  const grossPremMatch = text.match(/Net\s+Own\s+Damage\s+Premium[\s\S]{0,100}?Total\s+Premium\s*(\d+)/i) ||
    text.match(/Total\s+Premium\s+(\d+)\s*\n/i);

  if (basicOdMatch) patch.basicOwnDamage = formatAmount(basicOdMatch[1]);
  if (ncbMatch) {
    patch.ncbPercentage = ncbMatch[1];
    patch.ncbDiscount = formatAmount(ncbMatch[2]);
  }
  if (netPremMatch) {
    patch.netPremium = formatAmount(netPremMatch[1]);
    patch.basicPremium = patch.netPremium;
  }
  if (gstMatch) patch.gst = formatAmount(gstMatch[1]);
  if (grossPremMatch) {
    patch.totalPremium = formatAmount(grossPremMatch[1]);
    patch.grossPremium = patch.totalPremium;
    patch.premium = patch.totalPremium;
    patch.premiumIncludingGst = patch.totalPremium;
  }

  // 9. Previous Policy Details
  const prevPolMatch = text.match(/Previous\s+Policy\s+No\.?\s*([^\s]+)/i);
  const prevInsurerMatch = text.match(/of\s+([A-Z\s]+?GENERAL\s+INSURANCE[^\n]*?)\s+NCB/i);
  const prevNcbMatch = text.match(/Previous\s+Policy[\s\S]{0,120}?NCB\s*(\d+%)/i);

  if (prevPolMatch) patch.previousPolicyNumber = prevPolMatch[1].trim();
  if (prevInsurerMatch) patch.previousInsurer = prevInsurerMatch[1].trim();
  if (prevNcbMatch) patch.previousNcb = prevNcbMatch[1].trim();

  // 10. Intermediary / CSC Details
  const cscNameMatch = text.match(/CSC\s+Name\s*:\s*([^\n]+?)\s+CSC\s+Code/i);
  const cscCodeMatch = text.match(/CSC\s+Code\s*:\s*(\d+)/i);
  if (cscNameMatch) patch.cscName = cscNameMatch[1].trim();
  if (cscCodeMatch) {
    patch.cscCode = cscCodeMatch[1].trim();
    patch.agentCode = cscCodeMatch[1].trim();
  }

  patch.extractionTrainingVersion = "HDFC_ERGO_MOTOR_V1";

  return patch;
}

module.exports = { scope, matches, train };
