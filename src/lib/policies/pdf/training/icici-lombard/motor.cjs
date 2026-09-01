const { normalizeAmount, sumAmounts } = require("../../utils/amounts.cjs");
const { buildDuration } = require("../../utils/dates.cjs");
const { matchGroup } = require("../../utils/regex.cjs");

const scope = { insurer: "icici-lombard", category: "motor" };

function matches({ text = "", result = {} }) {
  const category = String(result.documentCategory || result.policyType || "");
  const isIcici = /ICICI\s*Lombard|icicilombard\.com/i.test(text);
  const isMotor =
    /Motor|Standalone\s+Motor|Stand-Alone\s+Own\s+Damage|Own\s+Damage\s+Private\s+Car|Private\s+Car|Two\s+Wheeler|Commercial\s+Vehicle/i.test(
      category || text,
    ) || /3001\/[A-Z0-9]+|IRDAN115/i.test(text);
  const isHealth = /ELEVATE|ICIHLIP|Complete\s+Health|Health\s+Shield/i.test(text);
  return isIcici && isMotor && !isHealth;
}

function clean(value = "") {
  return String(value).replace(/[\r\n\s]+/g, " ").trim();
}

function formatAmount(value = "") {
  return value ? sumAmounts(normalizeAmount(String(value).replace(/,/g, ""))) : "";
}

function normalizeDate(value = "") {
  if (!value) return "";
  const dmyMatch = String(value).match(/(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
  if (dmyMatch) {
    return `${dmyMatch[1].padStart(2, "0")}/${dmyMatch[2].padStart(2, "0")}/${dmyMatch[3]}`;
  }
  const textMatch = String(value).match(/([A-Za-z]{3})\s+(\d{1,2}),?\s+(\d{4})/);
  if (textMatch) {
    const months = { jan: "01", feb: "02", mar: "03", apr: "04", may: "05", jun: "06", jul: "07", aug: "08", sep: "09", oct: "10", nov: "11", dec: "12" };
    const month = months[textMatch[1].toLowerCase()];
    if (month) {
      return `${textMatch[2].padStart(2, "0")}/${month}/${textMatch[3]}`;
    }
  }
  return "";
}

function assign(patch, key, value) {
  const normalized = clean(value);
  if (normalized) patch[key] = normalized;
}

function train({ text = "", result = {} }) {
  if (!result || typeof result !== "object") return result;

  const patch = {};

  // 1. Policy Number & Core Identifiers
  const policyNumber =
    matchGroup(text, /Policy No\.\s*[:\n\s]*(\d{4}\/[A-Z0-9/]+)/i) ||
    matchGroup(text, /\b(\d{4}\/[A-Z0-9/]{10,35})\b/i);
  if (policyNumber) {
    patch.policyNumber = policyNumber.trim();
  }

  assign(patch, "covernoteNumber", matchGroup(text, /Covernote No\.\s*[:\s]*([0-9A-Z]+)/i));
  assign(patch, "referenceNumber", matchGroup(text, /Reference No\.:\s*([0-9A-Z]+)/i));
  assign(patch, "uinNumber", matchGroup(text, /UIN:\s*([A-Z0-9/]+)/i));
  assign(patch, "productCode", matchGroup(text, /Product Code:\s*([0-9A-Z/]+)/i));
  assign(patch, "invoiceNumber", matchGroup(text, /Invoice No\.\s*[:\s]*([0-9A-Z]+)/i));

  // 2. Product Name & Cover Type
  if (/Stand-Alone\s+Own\s+Damage\s+Private\s+Car/i.test(text)) {
    patch.productName = "Stand-Alone Own Damage Private Car Insurance Policy";
    patch.policyType = "Stand-Alone Own Damage Private Car Insurance Policy";
    patch.policyCoverType = "Standalone Own Damage";
  } else if (/Private\s+Car\s+Package/i.test(text)) {
    patch.productName = "Private Car Package Policy";
    patch.policyType = "Private Car Package Policy";
    patch.policyCoverType = "Comprehensive";
  } else if (/Two\s*Wheeler/i.test(text)) {
    patch.productName = "Two Wheeler Insurance Policy";
    patch.policyType = "Two Wheeler Insurance Policy";
    patch.policyCoverType = /Own\s+Damage/i.test(text) ? "Standalone Own Damage" : "Comprehensive";
  } else if (/Commercial\s+Vehicle/i.test(text)) {
    patch.productName = "Commercial Vehicle Insurance Policy";
    patch.policyType = "Commercial Vehicle Insurance Policy";
    patch.policyCoverType = /Liability\s+Only/i.test(text) ? "Third Party" : "Comprehensive";
  } else {
    patch.productName = "Stand-Alone Own Damage Private Car Insurance Policy";
    patch.policyType = "Stand-Alone Own Damage Private Car Insurance Policy";
    patch.policyCoverType = "Standalone Own Damage";
  }
  patch.policyCategory = "Motor";

  // 3. Insured Details
  const insuredNameMatch =
    matchGroup(text, /Dear\s+([A-Z\s.-]+?),/i) ||
    matchGroup(text, /Name of the Insured\s*[:\n\s]*([A-Z\s.-]+?)(?=Policy No|Period of Insurance|\n|$)/i);
  if (insuredNameMatch) {
    const rawName = clean(insuredNameMatch.replace(/^(?:Mr|Mrs|Ms|Miss|Dr|Shri|Smt)\.?\s+/i, ""));
    patch.insuredName = rawName;
    patch.customerName = rawName;
    patch.contactPerson = rawName;
    patch.proposerName = rawName;
  }

  const mobileMatch =
    matchGroup(text, /Mobile No:\s*([0-9*X]+)/i) ||
    matchGroup(text, /Mobile Number\s*[:\s]*([0-9*X]+)/i);
  if (mobileMatch && mobileMatch !== "-") {
    patch.contactNumber = mobileMatch;
    patch.customerMobile = mobileMatch;
  }

  const emailMatch = text.match(/Email Address\s*[:\s]*([^\s\n]+@[^\s\n]+)/i);
  if (emailMatch) {
    const cleanEmail = emailMatch[1].replace(/E-Policy.*/i, "").trim();
    patch.customerEmail = cleanEmail;
    patch.email = cleanEmail;
  }

  const addressMatch =
    matchGroup(text, /Address\s*:\s*\n\s*([\s\S]+?)(?=\n\s*Period of Insurance|\n\s*Telephone No)/i) ||
    matchGroup(text, /ANKIT SHINDE\s*\n\s*([\s\S]+?)(?=\n\s*INDORE|\n\s*Mobile No)/i);
  if (addressMatch) {
    const cleanAddr = clean(addressMatch);
    patch.mailingAddress = cleanAddr;
    patch.communicationAddress = cleanAddr;
    patch.address = cleanAddr;
  }

  const rtoMatch =
    matchGroup(text, /RTO Location\s*:\s*([A-Z0-9\s-]+?)(?=\n|GSTIN|Hypothecated|$)/i) ||
    matchGroup(text, /RTO City\s*\n\s*([A-Z0-9\s-]+)/i);
  if (rtoMatch) {
    patch.rtoLocation = clean(rtoMatch);
  }

  const hypothecationMatch = matchGroup(
    text,
    /Hypothecated To\s*:\s*([A-Z0-9\s,-]+?)(?=\n|Servicing Branch|Invoice No|$)/i,
  );
  if (hypothecationMatch) {
    const cleanHyp = clean(hypothecationMatch);
    patch.hypothecation = cleanHyp;
    patch.financier = cleanHyp;
  }

  // 4. Policy Period Dates
  const periodMatch = text.match(
    /Period of Insurance - Own Damage[\s\S]*?([A-Za-z]{3}\s+\d{1,2},?\s+\d{4})[\s\S]*?to[\s\S]*?([A-Za-z]{3}\s+\d{1,2},?\s+\d{4})/i,
  );
  if (periodMatch) {
    patch.startDate = normalizeDate(periodMatch[1]);
    patch.expiryDate = normalizeDate(periodMatch[2]);
    patch.policyStartDate = patch.startDate;
    patch.policyEndDate = patch.expiryDate;
    patch.duration = buildDuration(patch.startDate, patch.expiryDate);
  }

  const issueDateMatch =
    matchGroup(text, /Policy Issued On\s*:\s*([A-Za-z]{3}\s+\d{1,2},?\s+\d{4})/i) ||
    matchGroup(text, /Date:\s*([A-Za-z]{3}\s+\d{1,2},?\s+\d{4})/i);
  if (issueDateMatch) {
    patch.policyIssueDate = normalizeDate(issueDateMatch);
  }

  // 5. Vehicle Details
  const regNoMatch =
    matchGroup(text, /\b([A-Z]{2}\d{2}[A-Z]{1,3}\d{4})\b/i) ||
    matchGroup(text, /Vehicle Registration No\.\s*[:\n]?\s*([A-Z0-9-]+)/i);
  if (regNoMatch) {
    patch.registrationNumber = regNoMatch;
    patch.vehicleNumber = regNoMatch;
  }

  const makeModelMatch =
    text.match(/Vehicle Make \/ Model\s*\n\s*([A-Za-z0-9\s]+?)\s*\/\s*([^\n]+)/i) ||
    text.match(/(Tata\s+Motors)\s*\n\s*([^\n]+?)\s+SUV/i);
  if (makeModelMatch) {
    patch.vehicleMake = clean(makeModelMatch[1]);
    patch.vehicleModel = clean(makeModelMatch[2]);
    patch.makeModel = `${patch.vehicleMake} / ${patch.vehicleModel}`;
  }

  const engChMatch = text.match(/Engine No\.\s*\n\s*Chassis No\.[\s\S]*?\n\s*([A-Z0-9]{10,20})\s*\n\s*([A-Z0-9]{10,20})/i);
  if (engChMatch) {
    patch.engineNumber = engChMatch[1].trim();
    patch.chassisNumber = engChMatch[2].trim();
  } else {
    const chassis = matchGroup(text, /\b(MAT[A-Z0-9]{14})\b/i) || matchGroup(text, /Chassis No\.[\s\S]{0,100}?\n\s*([A-Z0-9]{17})/i);
    const engine = matchGroup(text, /\b(REVTRN[A-Z0-9]{11})\b/i) || matchGroup(text, /Engine No\.[\s\S]{0,100}?\n\s*([A-Z0-9]{10,20})/i);
    if (chassis) patch.chassisNumber = chassis;
    if (engine) patch.engineNumber = engine;
  }

  const vehicleSpecs = text.match(/(?:SUV|Sedan|Hatchback|MUV)\s*(\d{3,4})\s*(\d{4})\s*(\d{1,2})/i);
  if (vehicleSpecs) {
    patch.cubicCapacity = vehicleSpecs[1];
    patch.manufacturingYear = vehicleSpecs[2];
    patch.yearOfManufacture = vehicleSpecs[2];
    patch.seatingCapacity = vehicleSpecs[3];
  } else {
    const ccMatch = matchGroup(text, /CC\/KW[\s\S]*?\n\s*(\d{3,4})/i);
    const yomMatch = matchGroup(text, /Mfg Yr[\s\S]*?\n\s*(\d{4})/i);
    const seatsMatch = matchGroup(text, /Seating Capacity[\s\S]*?\n\s*(\d{1,2})/i);
    if (ccMatch) patch.cubicCapacity = ccMatch;
    if (yomMatch) {
      patch.manufacturingYear = yomMatch;
      patch.yearOfManufacture = yomMatch;
    }
    if (seatsMatch) patch.seatingCapacity = seatsMatch;
  }

  const bodyMatch = matchGroup(text, /(SUV|Sedan|Hatchback|MUV)/i);
  if (bodyMatch) patch.bodyType = bodyMatch;

  // 6. IDV
  const idvMatch =
    text.match(/([1-9]\d{0,2}(?:,\d{2,3})*\.\d{2})0\.000\.000\.000\.000\.00\1/i) ||
    text.match(/Total IDV\s*\(`\)\s*\n\s*([0-9,.]+)/i) ||
    text.match(/Vehicle IDV\s*\(`\)\s*\n\s*([0-9,.]+)/i);
  if (idvMatch) {
    const rawIdv = idvMatch[1].trim();
    patch.idv = formatAmount(rawIdv);
    patch.totalIdv = patch.idv;
    patch.vehicleIdv = patch.idv;
    patch.sumInsured = patch.idv;
  }

  // 7. Financials & Premium Breakdown
  const basicOdMatch = text.match(/Basic OD Premium[\s\S]*?\n\s*([0-9,.]+)/i);
  if (basicOdMatch) patch.basicOwnDamage = formatAmount(basicOdMatch[1]);

  const ncbPercentMatch =
    text.match(/No Claim Bonus\s*(\d+%)/i) ||
    text.match(/Current Year NCB\(%\)\s*\n\s*(\d+%)/i);
  if (ncbPercentMatch) {
    patch.ncbPercentage = ncbPercentMatch[1];
    patch.ncb = ncbPercentMatch[1];
  }

  if (patch.ncbPercentage && patch.basicOwnDamage) {
    const pct = parseFloat(patch.ncbPercentage) / 100;
    const baseAmt = parseFloat(String(patch.basicOwnDamage).replace(/,/g, ""));
    if (!isNaN(pct) && !isNaN(baseAmt)) {
      patch.ncbDiscount = formatAmount((pct * baseAmt).toFixed(2));
    }
  }

  const totalOdMatch = text.match(/Total Own Damage Premium\(A\)\s*([0-9,.]+)/i);
  if (totalOdMatch) {
    patch.odPremium = formatAmount(totalOdMatch[1]);
    patch.netOwnDamagePremium = patch.odPremium;
    patch.netPremium = patch.odPremium;
    patch.basicPremium = patch.odPremium;
  }

  const cgstMatch = text.match(/CGST[\s\S]*?`\s*([0-9,.]+)/i);
  const sgstMatch = text.match(/SGST[\s\S]*?`\s*([0-9,.]+)/i);
  if (cgstMatch) patch.cgst = formatAmount(cgstMatch[1]);
  if (sgstMatch) patch.sgst = formatAmount(sgstMatch[1]);

  const totalTaxMatch = text.match(/Total Tax Payable in `\s*([0-9,.]+)/i);
  if (totalTaxMatch) {
    patch.gst = formatAmount(totalTaxMatch[1]);
    patch.gstAmount = patch.gst;
    patch.taxAmount = patch.gst;
  }

  const totalPremiumMatch = text.match(/Total Premium Payable In `\s*([0-9,.]+)/i);
  if (totalPremiumMatch) {
    patch.totalPremium = formatAmount(totalPremiumMatch[1]);
    patch.grossPremium = patch.totalPremium;
    patch.premium = patch.totalPremium;
    patch.premiumIncludingGst = patch.totalPremium;
  }

  // 8. Add-on Covers
  const addons = [];
  if (/Zero Depreciation/i.test(text)) {
    addons.push("Zero Depreciation");
    patch.zeroDepreciationCover = "Yes";
  }
  if (/Consumables/i.test(text)) {
    addons.push("Consumables");
    patch.consumablesCover = "Yes";
  }
  if (/Engine Protect Plus|EngineProtect/i.test(text)) {
    addons.push("Engine Protect Plus");
    patch.engineProtectorCover = "Yes";
  }
  if (/Road Side Assistance/i.test(text)) {
    addons.push("Road Side Assistance");
    patch.roadsideAssistanceCover = "Yes";
  }
  if (/Key Protect/i.test(text)) {
    addons.push("Key Protect");
    patch.keysAndLocksCover = "Yes";
  }
  if (/Loss of Personal Belongings/i.test(text)) {
    addons.push("Loss of Personal Belongings");
    patch.personalBaggageCover = "Yes";
  }
  if (addons.length > 0) {
    patch.addOnCovers = addons.join(", ");
  }

  const subTotalMatch = text.match(/Sub Total[\s\S]{0,100}?\n\s*([0-9,.]+)/i);
  if (subTotalMatch && patch.basicOwnDamage) {
    const subTotalNum = Number(subTotalMatch[1].replace(/,/g, ""));
    const basicOdNum = Number(String(patch.basicOwnDamage).replace(/,/g, ""));
    if (!isNaN(subTotalNum) && !isNaN(basicOdNum) && subTotalNum > basicOdNum) {
      patch.addOnPremium = formatAmount((subTotalNum - basicOdNum).toFixed(2));
    }
  }

  // 9. Previous Policy & Active TP Details (Page 1 Column Tables)
  const prevMatch = text.match(
    /Previous\s+Policy\s+Type\s*\n\s*([0-9A-Z]+)\s*\n\s*(\d{2}[-/]\d{2}[-/]\d{4}\s+to\s+\d{2}[-/]\d{2}[-/]\d{4})\s*\n\s*(\d+%)\s*\n\s*\d+\s*\n\s*([A-Za-z0-9\s]+?)\n/i,
  );
  if (prevMatch) {
    patch.previousPolicyNumber = prevMatch[1].trim();
    const periodParts = prevMatch[2].split("to");
    patch.previousPolicyStartDate = normalizeDate(periodParts[0].trim());
    patch.previousPolicyExpiryDate = normalizeDate(periodParts[1].trim());
    patch.previousNcb = prevMatch[3].trim();
    patch.previousInsurer = prevMatch[4].trim();
  }

  const tpMatch = text.match(
    /Third\s+Party\s+Insurer\s+Name\s*\n\s*([0-9A-Z]+)\s*\n\s*([A-Za-z]{3}\s+\d{1,2},?\s+\d{4}\s+to\s+[A-Za-z]{3}\s+\d{1,2},?\s+\d{4})\s*\n\s*([A-Za-z0-9\s]+?)\n/i,
  );
  if (tpMatch) {
    patch.activeTpPolicyNumber = tpMatch[1].trim();
    const tpPeriodParts = tpMatch[2].split("to");
    patch.activeTpStartDate = normalizeDate(tpPeriodParts[0].trim());
    patch.activeTpExpiryDate = normalizeDate(tpPeriodParts[1].trim());
    patch.activeTpInsurer = tpMatch[3].trim();
  }

  // 10. Receipts and IMT Clauses
  const receiptMatch = text.match(/Premium Collection No\.?\s*(\d{8,15})/i);
  if (receiptMatch) {
    patch.receiptNumber = receiptMatch[1].trim();
  }
  assign(patch, "receiptDate", matchGroup(text, /Receipt Date\s*(\d{2}-\d{2}-\d{4})/i));
  assign(patch, "compulsoryDeductible", formatAmount(matchGroup(text, /Compulsory Deductible \(`\) :\s*([0-9,.]+)/i) || "1000"));

  const imtMatch = matchGroup(text, /Applicable IMT Clauses:\s*([0-9,\s.]+?)(?=\n|Compulsory Deductible|$)/i);
  if (imtMatch) {
    patch.imtEndorsements = imtMatch
      .split(",")
      .map((x) => x.replace(/\.00/g, "").trim())
      .filter(Boolean)
      .map((x) => (x.startsWith("IMT") ? x : `IMT-${x}`))
      .join(", ");
  }

  patch.extractionTrainingVersion = "ICICI_LOMBARD_MOTOR_V1";

  return patch;
}

module.exports = { scope, matches, train };
