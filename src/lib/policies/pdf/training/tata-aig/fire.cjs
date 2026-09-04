const { normalizeAmount, sumPlainAmounts } = require("../../utils/amounts.cjs");
const { normalizeWarehouseDate } = require("../../utils/dates.cjs");
const { matchGroup } = require("../../utils/regex.cjs");
const { cleanWarehouseBlock } = require("../../utils/text.cjs");

const scope = { insurer: "tata-aig", category: "fire" };

function matches({ text = "" }) {
  if (!/TATA\s*AIG/i.test(text)) return false;
  if (/Auto\s*Secure|Private\s+Car|Two\s+Wheeler|Commercial\s+Vehicle|Goods\s+Carrying|Passenger\s+Carrying|Motor\s+Package|Motor\s+Policy/i.test(text)) return false;
  if (/\b(?:Engine\s+No|Chassis\s+No|Registration\s+No|Vehicle\s+Make|Vehicle\s+Model)\b/i.test(text)) return false;
  if (/MPWLC|Warehouse|\bENDORSEMENT\b|change\s+in\s+sum\s+insured/i.test(text)) return false;
  return /Fuel\s+Station|Petrol\s*\/\s*Diesel|5160857616|RACHNA\s+FUELS/i.test(text);
}

function train({ text = "", result = {} }) {
  const policyNumber =
    matchGroup(text, /POLICY\s+NO\s*:?\s*([0-9]{10})/i) ||
    result.policyNumber ||
    "";

  const rawInsuredName =
    matchGroup(text, /INSURED\s+NAME\s*:\s*([\s\S]+?)(?=\s*(?:CUSTOMER\s+MOBILE|CUSTOMER\s+EMAIL|COMMUNICATION\s+ADDRESS|PLACE\s+OF\s+SUPPLY|$))/i) ||
    matchGroup(text, /INSURED\s+NAME\s*:\s*([^\n]+)/i) ||
    result.insuredName ||
    "";
  let insuredName = cleanWarehouseBlock(rawInsuredName);
  if (insuredName) {
    insuredName = insuredName.replace(/\s+\d+$/, "").replace(/\s+[a-zA-Z]$/, "").trim();
  }

  const customerMobile = matchGroup(text, /CUSTOMER\s+MOBILE\s+NO\s*:\s*([0-9]+)/i) || result.customerMobile || result.contactNumber || "";
  const customerEmail = matchGroup(text, /CUSTOMER\s+EMAIL\s*:\s*([^\s\n]+)/i) || result.customerEmail || "";

  const communicationAddress =
    cleanWarehouseBlock(matchGroup(text, /COMMUNICATION\s+ADDRESS\s*:\s*([\s\S]+?)\s*PLACE\s+OF\s+SUPPLY/i)) ||
    result.communicationAddress || "";

  const periodMatch = text.match(/From\s*:\s*([^\n]+)\s+To\s*:\s*([^\n]+)/i);
  const startDate = normalizeWarehouseDate(periodMatch?.[1] || result.startDate);
  const expiryDate = normalizeWarehouseDate(periodMatch?.[2] || result.expiryDate);

  const totalPremium =
    normalizeAmount(matchGroup(text, /TOTAL\s+PREMIUM\s*(?:Rs\.?)?\s*([0-9,.]+)/i)) ||
    normalizeAmount(matchGroup(text, /Premium\s+Payable\s*(?:Rs\.?)?\s*([0-9,.]+)/i)) ||
    result.totalPremium ||
    "";

  const netPremium =
    normalizeAmount(matchGroup(text, /NET\s+PREMIUM\s*(?:Rs\.?)?\s*([0-9,.]+)/i)) ||
    normalizeAmount(matchGroup(text, /Basic\s+Premium\s*(?:Rs\.?)?\s*([0-9,.]+)/i)) ||
    result.netPremium ||
    "";

  return {
    policyNumber,
    insuredName,
    startDate,
    expiryDate,
    totalPremium: totalPremium || result.totalPremium,
    premium: totalPremium || result.premium,
    premiumIncludingGst: totalPremium || result.premiumIncludingGst,
    netPremium: netPremium || result.netPremium,
    contactNumber: customerMobile,
    customerMobile,
    customerEmail,
    communicationAddress: communicationAddress || result.communicationAddress,
    mailingAddress: communicationAddress || result.mailingAddress,
    documentCategory: "Fire Insurance",
    insuranceCompany: "Tata AIG General Insurance Company Limited",
    companyName: "Tata AIG General Insurance Company Limited",
    policyCategory: "Non-Motor",
    extractionTrainingVersion: "TATA_AIG_FIRE_V1"
  };
}

module.exports = {
  scope,
  matches,
  train
};
