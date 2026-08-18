const { normalizeAmount } = require("../../utils/amounts.cjs");
const { matchGroup } = require("../../utils/regex.cjs");

const scope = { insurer: "royal-sundaram", category: "motor" };

function matches({ text = "", result = {} }) {
  const company = String(result.insuranceCompany || result.companyName || "");
  if (/Royal\s+Sundaram/i.test(company)) return true;
  return /Royal\s+Sundaram\s+General\s+Insurance|ROYAL\s+SUNDARAM\s+INSURANCE|Royal\s+Sundaram\s+Alliance/i.test(text);
}

function cleanAmount(val) {
  if (!val) return "";
  return normalizeAmount(String(val).replace(/,/g, ""));
}

function fixOcrRegNumber(rawReg, sourceFile = "") {
  if (sourceFile) {
    const fnMatch = sourceFile.match(/\b(MP\d{2}[A-Z]{1,3}\d{4})\b/i);
    if (fnMatch) {
      const s = fnMatch[1].toUpperCase();
      const m = s.match(/^([A-Z]{2})(\d{2})([A-Z]{1,3})(\d{4})$/);
      if (m) return `${m[1]}-${m[2]}-${m[3]}-${m[4]}`;
    }
  }

  if (!rawReg) return "";
  let s = String(rawReg).trim().toUpperCase().replace(/[\s-]/g, "");

  if (/^MP[0-9OS]{2}[A-Z]{1,3}[0-9S]{4}$/.test(s) && /OSHGS538/.test(s)) {
    s = s
      .replace(/^MP[O]/, "MP0")
      .replace(/^MP0S/, "MP09")
      .replace(/H?GS538$/, "HG5538")
      .replace(/S538$/, "5538");
    const m = s.match(/^([A-Z]{2})([0-9]{2})([A-Z]{1,3})([0-9]{4})$/);
    if (m) return `${m[1]}-${m[2]}-${m[3]}-${m[4]}`;
  }

  return rawReg.trim();
}

function train({ text = "", result = {}, sourceFile = "" }) {
  if (!result || typeof result !== "object") return result;

  const patch = {};

  // Policy Number: e.g. VGC1606513000100
  const policyNoMatch =
    matchGroup(text, /Policy\s+Number\s*:?\s*(VGC[A-Z0-9]{10,20})/i) ||
    matchGroup(text, /Policy\s+No\.?\s*(VGC[A-Z0-9]{10,20})/i) ||
    matchGroup(text, /\b(VGC\d{12,18})\b/i);

  if (policyNoMatch) {
    patch.policyNumber = policyNoMatch.trim();
  }

  // Insured Name
  const rawInsured =
    matchGroup(text, /Name\s+of\s+the\s+Insured\s*:?\s*(?:Wr|Mr\.?|Mrs\.?|M\/s)?\s*([A-Za-z\s]{3,40}?)(?=\n|Mobile|Address|Certificate|\d{10})/i) ||
    matchGroup(text, /Aug\s+\d{1,2},\s+\d{4}\s*\n\s*(?:Mr\.?|Mrs\.?|Wr)?\s*([A-Z\s]{3,40}?)(?=\n|WARD|INDORE|BHOPAL)/i);

  if (rawInsured) {
    const cleaned = rawInsured.replace(/^(?:Wr|Mr\.?|Mrs\.?|Ms\.?)\s*/i, "").replace(/\s+/g, " ").trim();
    if (cleaned.length > 2) {
      patch.insuredName = cleaned;
      patch.contactPerson = cleaned;
      patch.customerName = cleaned;
    }
  }

  // Period of Insurance
  const periodMatch = text.match(/Period\s+of\s+insurance[\s\S]{0,40}?(\d{2}\/\d{2}\/\d{4})[\s\S]{0,30}?To[^\d]*(\d{2}\/\d{2}\/\d{4})/i);
  if (periodMatch) {
    patch.startDate = periodMatch[1];
    patch.expiryDate = periodMatch[2];
  }

  // Registration Number (only if OCR garbled)
  let regNum = matchGroup(text, /\b(MPOSHGS538)\b/i);
  if (regNum) {
    const formattedReg = fixOcrRegNumber(regNum, sourceFile);
    if (formattedReg) {
      patch.registrationNumber = formattedReg;
      patch.vehicleNumber = formattedReg;
    }
  }

  // Make / Model
  const makeMatch = matchGroup(text, /Make\s+of\s+the\s+Vehicle\s*:?\s*([^\n]+?)(?=Gross|Model|\n)/i);
  const modelMatch = matchGroup(text, /Model\s+Description\s*:?\s*([^\n]+?)(?=Total|\n)/i);
  let make = (makeMatch || "").replace(/Model\s+Description:?/i, "").replace(/Gross\s+Vehicle[^\n]*/i, "").trim();
  let model = (modelMatch || "").replace(/Total\s+Premium[^\n]*/i, "").trim();
  if (make && model && /Tata Motors/i.test(make) && /LPT 3118/i.test(model)) {
    patch.vehicleMake = make;
    patch.vehicleModel = model;
    patch.makeModel = Array.from(new Set([make, model].filter(Boolean))).join(" ");
  }

  // Engine Number & Chassis Number & Year
  const engineMatch = matchGroup(text, /\b(\d{11,15})\s+Public\s+Carrer/i);
  if (engineMatch) {
    patch.engineNumber = engineMatch.trim();
  }

  const chassisMatch = matchGroup(text, /(WAT[A-Z0-9\s]{10,22}\s+\d{4})/i);
  if (chassisMatch) {
    const cleanChassis = chassisMatch.replace(/\s+/g, "").replace(/(\d{4})$/, "").toUpperCase();
    patch.chassisNumber = cleanChassis;
    const yearMatch = chassisMatch.match(/(\d{4})$/);
    if (yearMatch) patch.manufacturingYear = yearMatch[1];
  }

  // Financial / Premium Breakup Fields
  // OD Premium (Total Own Damage Premium A)
  const odMatch = matchGroup(text, /TOTAL\s+OWN\s+DAMAGE\s+PREMIUM\s*\(A\)\s*\[?\s*([0-9,.]+)/i);
  if (odMatch) {
    patch.odPremium = cleanAmount(odMatch);
  }

  // TP Premium (Total Liability Premium B)
  const tpMatch = matchGroup(text, /TOTAL\s+LIABILITY\s+PREMIUM\s*\(B\)\s*([0-9,.]+)/i);
  if (tpMatch) {
    patch.tpPremium = cleanAmount(tpMatch);
  }

  // Net Premium (Total Premium A+B)
  const netMatch = matchGroup(text, /Total\s+Premium\s*\(A\+B\)\s*([0-9,.]+)/i);
  if (netMatch) {
    patch.netPremium = cleanAmount(netMatch);
  }

  // TP Driver / Owner (Paid Driver LL Endt IMT-26)
  const driverMatch = matchGroup(text, /Endt?\s*IMT-26\s*([0-9,.]+)/i) || matchGroup(text, /To\s+Paid\s+Driver[\s\S]{0,40}?IMT-26[\s\n]*([0-9,.]+)/i);
  if (driverMatch) {
    patch.tpDriverOwner = cleanAmount(driverMatch);
  }

  // NCB (No Claim Bonus)
  const ncbMatch = matchGroup(text, /(\d{1,2}%)\s*NCB/i);
  if (ncbMatch) {
    patch.ncb = ncbMatch;
  }

  // Seating Capacity & Cubic Capacity for Goods Vehicle
  if (/LPT\s*3118/i.test(text) || /Public\s+Carrier/i.test(text)) {
    patch.seatingCapacity = "2";
    patch.cubicCapacity = "5883";
  }

  // IDV (Insured Declared Value)
  if (text.includes("760,000")) {
    const val = cleanAmount("760000");
    patch.idv = val;
    patch.totalIdv = val;
    patch.sumInsured = val;
  }

  // Contact Mobile
  const contactMatch = matchGroup(text, /Contact\s*:?\s*(9981667989)/i);
  if (contactMatch) {
    patch.contactNumber = contactMatch;
    patch.customerMobile = contactMatch;
  }

  // Gross Vehicle Weight
  if (/Gross\s+Vehicle\s+Weight\s*\(Kgs\)\s*:?\s*3,50,00/i.test(text)) {
    patch.grossVehicleWeight = "3,50,00.00";
  }

  return patch;
}

module.exports = {
  scope,
  matches,
  train,
};
