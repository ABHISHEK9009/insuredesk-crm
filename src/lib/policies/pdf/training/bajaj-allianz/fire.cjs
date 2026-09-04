const { normalizeAmount, sumPlainAmounts } = require("../../utils/amounts.cjs");
const { normalizeWarehouseDate } = require("../../utils/dates.cjs");
const { matchGroup } = require("../../utils/regex.cjs");
const { cleanWarehouseBlock } = require("../../utils/text.cjs");

const scope = { insurer: "bajaj-allianz", category: "fire" };

function matches({ text = "" }) {
  if (!/BAJAJ\s*(?:ALLIANZ|GENERAL)/i.test(text)) return false;
  if (/Private\s+Car|Two\s+Wheeler|Commercial\s+Vehicle|Goods\s+Carrying|Passenger\s+Carrying|Motor\s+Package|Motor\s+Policy|Drive\s*Smart/i.test(text)) return false;
  if (/\b(?:Engine\s+No|Chassis\s+No|Registration\s+No|Vehicle\s+Make|Vehicle\s+Model)\b/i.test(text)) return false;
  return /SHOP\s+NON\s+HAZARDOUS/i.test(text) || /OG-\d{2}-\d{4}-4056-\d{8}/i.test(text);
}

function train({ text = "", result = {} }) {
  const policyNumber =
    matchGroup(text, /Policy\s+Number\s*:?\s*([A-Z0-9/-]{15,30})/i) ||
    matchGroup(text, /(OG-\d{2}-\d{4}-\d{4}-\d{8})/i) ||
    result.policyNumber ||
    "";

  const insuredName =
    cleanWarehouseBlock(
      matchGroup(text, /Insured\s+Name\s*:?\s*([^\n]+)/i) ||
      matchGroup(text, /Dear\s+([^\n,]+),/i)
    ) || result.insuredName || "";

  const startDate =
    matchGroup(text, /From\s*([0-9]{1,2}[-/][A-Za-z]{3}[-/][0-9]{4})/i) ||
    matchGroup(text, /From\s*:?\s*([0-9]{1,2}[-/][0-9]{1,2}[-/][0-9]{4})/i) ||
    result.startDate ||
    "";

  const expiryDate =
    matchGroup(text, /To\s*([0-9]{1,2}[-/][A-Za-z]{3}[-/][0-9]{4})/i) ||
    matchGroup(text, /To\s*:?\s*([0-9]{1,2}[-/][0-9]{1,2}[-/][0-9]{4})/i) ||
    result.expiryDate ||
    "";

  const totalPremium =
    normalizeAmount(matchGroup(text, /Total\s+Premium\s*(?:Rs\.?)?\s*([0-9,.]+)/i)) ||
    normalizeAmount(matchGroup(text, /Total\s+Amount\s+Payable\s*(?:Rs\.?)?\s*([0-9,.]+)/i)) ||
    result.totalPremium ||
    "";

  const netPremium =
    normalizeAmount(matchGroup(text, /Net\s+Premium\s*(?:Rs\.?)?\s*([0-9,.]+)/i)) ||
    normalizeAmount(matchGroup(text, /Basic\s+Premium\s*(?:Rs\.?)?\s*([0-9,.]+)/i)) ||
    result.netPremium ||
    "";

  const contactNumber =
    matchGroup(text, /Mobile\s+Number\s*:?\s*([0-9*xX•]{10,})/i) ||
    result.contactNumber ||
    "";

  let communicationAddress = result.communicationAddress || result.mailingAddress || "";
  if (!communicationAddress || communicationAddress.length < 15) {
    const rawAddr = matchGroup(text, /Mailing\s+Address\s*([\s\S]+?)(?=1\.Contact\s+person|Business\s+and\s+Location|$)/i);
    if (rawAddr) {
      communicationAddress = cleanWarehouseBlock(rawAddr);
    }
  }

  return {
    policyNumber,
    insuredName,
    startDate: normalizeWarehouseDate(startDate),
    expiryDate: normalizeWarehouseDate(expiryDate),
    totalPremium: totalPremium || result.totalPremium,
    premium: totalPremium || result.premium,
    premiumIncludingGst: totalPremium || result.premiumIncludingGst,
    netPremium: netPremium || result.netPremium,
    contactNumber: contactNumber || result.contactNumber,
    communicationAddress: communicationAddress || result.communicationAddress,
    mailingAddress: communicationAddress || result.mailingAddress,
    documentCategory: "Fire Insurance",
    insuranceCompany: "Bajaj Allianz General Insurance Company Limited",
    companyName: "Bajaj Allianz General Insurance Company Limited",
    policyCategory: "Non-Motor",
    extractionTrainingVersion: "BAJAJ_ALLIANZ_FIRE_V1"
  };
}

module.exports = {
  scope,
  matches,
  train
};
