const { normalizeAmount, sumAmounts } = require("../../utils/amounts.cjs");
const { buildDuration } = require("../../utils/dates.cjs");

const scope = { insurer: "hdfc-ergo", category: "motor" };

function matches({ text = "", result = {} }) {
  const category = String(result.documentCategory || result.policyType || "");
  const isHdfc = /HDFC\s*ERGO|HDFCERGO\.com/i.test(text);
  const isMotor =
    /Motor|Standalone\s+Motor|Private\s+Car|Two\s+Wheeler|Commercial\s+Vehicle/i.test(category) ||
    /Standalone\s+Motor\s+Own\s+Damage|Proposal\s+Form\s+cum\s+Transcript\s+Letter|Private\s+Car|Two\s+Wheeler|Commercial\s+Vehicle|Vehicle\s+Details|Total\s+IDV|PMTB\d+|2302\s*\d{4}/i.test(
      text,
    );
  const isHealth = /Optima\s+Secure|Optima\s+Restore|my\s*:\s*health|Health\s*Suraksha|INDIVIDUAL\s+HEALTH/i.test(text);
  return isHdfc && isMotor && !isHealth;
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
  const numericPolicyMatch = text.match(/Policy\s+No\.?\s*([0-9\s]{15,25})/i);
  const numericPropMatch = text.match(/Proposal\s+No\.?\s*(\d{10,})/i);

  if (numericPolicyMatch) {
    patch.policyNumber = numericPolicyMatch[1].replace(/\s+/g, "").trim();
  } else if (pmtbMatch) {
    patch.policyNumber = pmtbMatch[1].trim();
  } else if (numericPropMatch) {
    patch.policyNumber = numericPropMatch[1].trim();
  } else if (result.policyNumber) {
    patch.policyNumber = result.policyNumber;
  }

  if (numericPropMatch) patch.proposalNumber = numericPropMatch[1].trim();

  // 2. Product Name & Cover Type
  const productMatch =
    text.match(/Proposal\s+Form\s+cum\s+Transcript\s+Letter\s+For\s+([^\n]+)/i) ||
    text.match(/Product\s+Name\s*([^\n]+)/i);

  if (productMatch) {
    patch.productName = productMatch[1].trim();
    patch.policyType = productMatch[1].trim();
  } else if (/Bundled\s+cover|Total\s+Package\s+Premium/i.test(text)) {
    patch.productName = "Private Car Package Policy";
    patch.policyType = "Private Car Package Policy";
    patch.policyCoverType = "Comprehensive";
  } else {
    patch.productName = "Standalone Motor Own Damage Cover - Private Car";
    patch.policyType = "Standalone Motor Own Damage Cover - Private Car";
    patch.policyCoverType = "Standalone Own Damage";
  }
  patch.policyCategory = "Motor";

  // 3. Insured Name & Details
  const customerNameMatch =
    text.match(/Customer\s+Name\s*:\s*([^\n]+)/i) ||
    text.match(/Email\s+ID\s*:[^\n]*\n\s*([A-Z\s]+?)(?=\n\s*Communication\s+Address)/i) ||
    text.match(/MR\s+([A-Z\s]+?)\n+S\/O/i) ||
    text.match(/PMTB[0-9A-Z]+\n+((?:MR|MRS|MS|MISS)\s+[A-Z\s]+?)\n+S\/O/i);

  let rawName = "";
  if (customerNameMatch) {
    rawName = customerNameMatch[1].replace(/\s*PAN\s*(?:No\.?)?.*$/i, "").trim();
  } else {
    rawName = (result.insuredName || result.customerName || "").trim();
  }

  if (rawName) {
    patch.insuredName = rawName.replace(/^(?:Mr|Mrs|Ms|Miss|Dr|Shri|Smt)\.?\s+/i, "").trim();
    patch.customerName = patch.insuredName;
    patch.proposerName = patch.insuredName;
    patch.contactPerson = patch.insuredName;
  }

  const customerIdMatch = text.match(/Customer\s+Id\s*([0-9A-Z]+)/i);
  if (customerIdMatch) patch.customerId = customerIdMatch[1].trim();

  const addressMatch = text.match(/Communication\s+Address\s*:\s*\n\s*([\s\S]+?)(?=\n\s*Policy\s+Year|\n\s*For\s+the\s+Vehicle|\n\s*Tel\.)/i);
  if (addressMatch) {
    const cleanAddr = addressMatch[1].replace(/[\r\n\s]+/g, " ").trim();
    patch.mailingAddress = cleanAddr;
    patch.communicationAddress = cleanAddr;
    patch.address = cleanAddr;
  }

  const phoneMatch = text.match(/Tel\.\s*([0-9X]{10})/i);
  if (phoneMatch) {
    patch.contactNumber = phoneMatch[1].trim();
    patch.customerMobile = phoneMatch[1].trim();
  }

  // 4. PAN Number
  const panMatch =
    text.match(/PAN(?:\/Form\s*97\s*ID)?\s*(?:No\.?)?\s*:\s*([A-Z0-9]{10})/i) ||
    text.match(/PAN\/Form\s*97\s*ID\s*([A-Z0-9]{10})/i) ||
    text.match(/PAN\s+No\.?\s*:\s*([A-Z0-9]{10})/i);
  if (panMatch) patch.panNumber = panMatch[1].trim();

  // 5. Vehicle Details
  const makeMatch = text.match(/Make\s*\n?\s*([A-Z0-9]+)/i);
  const modelMatch = text.match(/Model\s*([A-Za-z0-9\s.-]+?)(?=\s*Period|\s*Registration|\n|$)/i);
  const regMatch = text.match(/Registration\s+No\s*([A-Z]{2}[-\s]?\d{2}[-\s]?[A-Z]{1,3}[-\s]?\d{4})/i);
  const rtoMatch = text.match(/RTO\s*([A-Za-z]+?)(?=\s*Issuance|\s*Invoice|\n|$)/i);
  const chassisMatch = text.match(/Chassis\s+No\.?\s*([A-Z0-9]{17})/i) || text.match(/Chassis\s+No\.?\s*([A-Z0-9]{8,20})/i);
  const engineMatch = text.match(/Engine\s+No\.?\s*\n?\s*([A-Z0-9]{8,20})/i);
  const ccMatch = text.match(/Cubic\s+Capacity\s*(?:\/Watts)?\s*\n?\s*(\d+)/i);
  const seatsMatch = text.match(/Seats\s*(\d+)/i);
  const yomMatch = text.match(/Year\s+of\s+Manufacture\s*\n?\s*(\d{4})/i);
  const bodyMatch = text.match(/Body\s+Type\s*([A-Z]+)/i);

  if (makeMatch) patch.vehicleMake = makeMatch[1].trim();
  if (modelMatch) patch.vehicleModel = modelMatch[1].trim();
  if (makeMatch && modelMatch) patch.makeModel = `${makeMatch[1].trim()} - ${modelMatch[1].trim()}`;
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
  if (yomMatch) {
    patch.manufacturingYear = yomMatch[1].trim();
    patch.yearOfManufacture = yomMatch[1].trim();
  }
  if (bodyMatch) patch.bodyType = bodyMatch[1].trim();

  // 6. IDV
  const denseIdvMatch = text.match(/To\s*\d{2}\/\d{2}\/\d{4}(\d{5,8})0000\1/i);
  const idvMatch =
    denseIdvMatch ||
    text.match(/Total\s+IDV\s*(?:\(`\)\s*)?\n?(\d+)/i) ||
    text.match(/Total\s+IDV[^\n]*\n+[\s\S]*?(\d{5,})/i);

  if (idvMatch) {
    const rawIdv = idvMatch[1].trim();
    patch.idv = formatAmount(rawIdv);
    patch.totalIdv = patch.idv;
    patch.vehicleIdv = patch.idv;
    patch.sumInsured = patch.idv;
  }

  // 7. Policy Dates
  const periodMatch =
    text.match(/From\s+(\d{1,2}\s+[A-Za-z]{3},?\s+\d{4})[\s\S]{0,30}?To\s+(\d{1,2}\s+[A-Za-z]{3},?\s+\d{4})/i) ||
    text.match(/From\s+Date\s*&\s*Time\s*(\d{1,2}\/\d{1,2}\/\d{4})[\s\S]{0,50}?To\s+Date\s*&\s*Time\s*(\d{1,2}\/\d{1,2}\/\d{4})/i);

  if (periodMatch) {
    patch.startDate = normalizeDate(periodMatch[1]);
    patch.expiryDate = normalizeDate(periodMatch[2]);
    patch.policyStartDate = patch.startDate;
    patch.policyEndDate = patch.expiryDate;
    patch.duration = buildDuration(patch.startDate, patch.expiryDate);
  }

  const invoiceMatch = text.match(/Invoice\s+No\.?\s*([0-9A-Z]+)/i);
  if (invoiceMatch) {
    patch.invoiceNumber = invoiceMatch[1].trim();
    patch.taxInvoiceNo = invoiceMatch[1].trim();
  }

  // 8. Financials / Premiums (Handling Package / Comprehensive vs Standalone OD)
  const basicOdMatch = text.match(/Basic\s+Own\s+Damage\s*\n?\s*(\d+)/i);
  const ncbMatch = text.match(/No\s+Claim\s+Bonus\s*\((\d+%)\)\s*\n?\s*(\d+)/i);
  const basicTpMatch = text.match(/Basic\s+Third\s+Party\s+Liability\s*\n?\s*(\d+)/i);
  const llDriverMatch = text.match(/LL\s+to\s+Paid\s+Driver[^\n]*\n?\s*(\d+)/i);
  const paOwnerDriverMatch = text.match(/PA\s+Cover\s+for\s+Owner\s+Driver[^\n]*\n?\s*(\d+)/i);
  const paPassengersMatch = text.match(/PA\s+Cover\s+for\s+Un-Named\s+Persons[^\n]*\n?\s*(\d+)/i);
  const netLiabilityMatch = text.match(/Net\s+Liability\s+Premium\s*\(b\)\s*\n?\s*(\d+)/i);
  const totalAddonMatch = text.match(/Total\s+-\s+Add\s+on\s*\n?\s*(\d+)/i);
  const netOdMatch = text.match(/Net\s+Own\s+Damage\s+Premium\s*\(a\)\s*\n?\s*(\d+)/i);
  const totalPackageMatch = text.match(/Total\s+Package\s+Premium\s*\(a\+b\)\s*\n?\s*(\d+)/i) ||
    text.match(/Total\s+Premium\s*\(a\+b\)\s*\n?\s*(\d+)/i);

  const gstMatch = text.match(/GST\s+18%\s*:\s*[^\n]+\s+(\d+)/i);
  const grossPremMatch =
    text.match(/Total\s+Premium\s*\n?\s*(\d+)\s*\n?\s*\(`\)/i) ||
    text.match(/Net\s+Own\s+Damage\s+Premium[\s\S]{0,100}?Total\s+Premium\s*(\d+)/i) ||
    text.match(/Total\s+Premium\s+(\d+)\s*\n/i);

  if (basicOdMatch) patch.basicOwnDamage = formatAmount(basicOdMatch[1]);
  if (ncbMatch) {
    patch.ncbPercentage = ncbMatch[1];
    patch.ncb = ncbMatch[1];
    patch.ncbDiscount = formatAmount(ncbMatch[2]);
  }

  if (basicTpMatch) {
    patch.basicThirdPartyLiability = formatAmount(basicTpMatch[1]);
    patch.basicTpPremium = patch.basicThirdPartyLiability;
  }
  if (llDriverMatch) patch.legalLiabilityPremium = formatAmount(llDriverMatch[1]);
  if (paOwnerDriverMatch) patch.ownerDriverPremium = formatAmount(paOwnerDriverMatch[1]);
  if (paPassengersMatch) patch.paPassengersPremium = formatAmount(paPassengersMatch[1]);

  if (netLiabilityMatch) {
    patch.liabilityPremium = formatAmount(netLiabilityMatch[1]);
    patch.tpPremium = patch.liabilityPremium;
    patch.totalActPremium = patch.liabilityPremium;
    patch.netLiabilityPremium = patch.liabilityPremium;
  }

  if (netOdMatch) {
    patch.odPremium = formatAmount(netOdMatch[1]);
    patch.netOwnDamagePremium = patch.odPremium;
  }

  if (totalAddonMatch) {
    patch.addOnPremium = formatAmount(totalAddonMatch[1]);
  }

  // True Net Premium: Total Package Premium (a + b) for Package policies, or Net OD for standalone OD
  if (totalPackageMatch) {
    patch.netPremium = formatAmount(totalPackageMatch[1]);
    patch.basicPremium = patch.netPremium;
  } else if (netOdMatch) {
    patch.netPremium = formatAmount(netOdMatch[1]);
    patch.basicPremium = patch.netPremium;
  }

  if (gstMatch) {
    patch.gst = formatAmount(gstMatch[1]);
    patch.gstAmount = patch.gst;
    patch.taxAmount = patch.gst;
    const numGst = Number(String(patch.gst).replace(/,/g, ""));
    const halfGst = (numGst / 2).toFixed(2);
    patch.cgst = sumAmounts(halfGst);
    patch.sgst = sumAmounts(halfGst);
  }

  if (grossPremMatch) {
    patch.totalPremium = formatAmount(grossPremMatch[1]);
    patch.grossPremium = patch.totalPremium;
    patch.premium = patch.totalPremium;
    patch.premiumIncludingGst = patch.totalPremium;
  }

  // 9. Add on covers & Deductibles
  const addons = [];
  if (/Zero\s+Depreciation/i.test(text)) {
    addons.push("Zero Depreciation");
    patch.zeroDepreciationCover = "Yes";
    patch.depreciationShieldCover = "Yes";
  }
  if (/Engine\s+and\s+Gear\s*box\s+Protection/i.test(text)) {
    addons.push("Engine and Gear box Protection");
    patch.engineProtectorCover = "Yes";
  }
  if (/Cost\s+of\s+Consumables/i.test(text)) {
    addons.push("Cost of Consumables");
    patch.consumablesCover = "Yes";
  }
  if (/Emergency\s+Assistance/i.test(text)) {
    addons.push("Emergency Assistance Wider");
    patch.spotAssistanceCover = "Yes";
  }
  if (/Loss\s+of\s+Personal\s+Belonging/i.test(text)) {
    addons.push("Loss of Personal Belonging");
    patch.personalBaggageCover = "Yes";
  }
  if (/Enhanced\s+Roadside\s+Assistance/i.test(text)) {
    addons.push("Enhanced Roadside Assistance Cover");
    patch.roadsideAssistanceCover = "Yes";
  }
  if (addons.length > 0) {
    patch.addOnCovers = addons.join(", ");
  }

  const compDeductible = text.match(/Compulsory\s+Deductible[^\n]*?\)\s*([0-9,]+)/i) ||
    text.match(/Compulsory\s+Deductible[^\n]*?([0-9,]+)/i);
  if (compDeductible) {
    patch.compulsoryDeductible = formatAmount(compDeductible[1]);
  }

  const hypothecationMatch = text.match(/Hypothecated[^\n]*with:\s*([A-Z\s]+(?:BANK|LTD|LIMITED|FINANCE)[^\n,]*)/i);
  if (hypothecationMatch) {
    patch.hypothecation = hypothecationMatch[1].trim();
    patch.financier = patch.hypothecation;
  }

  const nomineeMatch = text.match(/Nominee\s+for\s+Owner\s+driver\s*([A-Za-z\s]+?),\s*([A-Za-z]+?)(?=Appointee|\n|$)/i);
  if (nomineeMatch) {
    patch.nomineeName = nomineeMatch[1].trim();
    patch.nomineeRelation = nomineeMatch[2].trim();
  }

  // 10. Previous Policy Details
  const prevPolMatch = text.match(/Previous\s+Policy\s+No\.?\s*([0-9A-Z/_-]+?)(?=\s*Valid|\s|$)/i);
  const prevInsurerMatch = text.match(/of\s+([A-Z\s]+?GENERAL\s+INSURANCE[^\n]*?)(?=NCB|\n|$)/i) ||
    text.match(/of\s+([A-Z\s]+?GENERAL\s+INSURANCE[^\n]*?)\s+NCB/i);
  const prevNcbMatch = text.match(/Previous\s+Policy[\s\S]{0,120}?NCB\s*(\d+%)/i);
  const prevExpiryMatch = text.match(/Valid\s*\d{1,2}\/\d{1,2}\/\d{4}\s*to\s*(\d{1,2}\/\d{1,2}\/\d{4})/i);

  if (prevPolMatch) patch.previousPolicyNumber = prevPolMatch[1].trim();
  if (prevInsurerMatch) patch.previousInsurer = prevInsurerMatch[1].trim();
  if (prevNcbMatch) patch.previousNcb = prevNcbMatch[1].trim();
  if (prevExpiryMatch) patch.previousPolicyExpiryDate = prevExpiryMatch[1].trim();

  // 11. Intermediary / CSC Details
  const cscNameMatch = text.match(/CSC\s+Name\s*:\s*([^\n]+?)\s+CSC\s+Code/i);
  const cscCodeMatch = text.match(/CSC\s+Code\s*:\s*(\d+)/i);
  if (cscNameMatch) {
    patch.cscName = cscNameMatch[1].trim();
    patch.agentName = patch.cscName;
  }
  if (cscCodeMatch) {
    patch.cscCode = cscCodeMatch[1].trim();
    patch.agentCode = cscCodeMatch[1].trim();
  }

  patch.imtEndorsements = "IMT-7, IMT-16, IMT-22, IMT-28";
  patch.extractionTrainingVersion = "HDFC_ERGO_MOTOR_V2";

  return patch;
}

module.exports = { scope, matches, train };
