const { normalizeAmount } = require("../../utils/amounts.cjs");
const { buildDuration } = require("../../utils/dates.cjs");

const scope = { insurer: "new-india", category: "motor" };

function matches({ text = "", result = {} }) {
  const company = String(result.insuranceCompany || result.companyName || "");
  const format = String(result.documentFormat || "");
  const isNewIndiaCompany = /NEW\s+INDIA/i.test(company) || /NEW\s+INDIA/i.test(text);
  const isMotor = /Motor|Private\s+Car|Two\s+Wheeler|Commercial\s+Vehicle/i.test(
    result.documentCategory || result.policyType || format || text
  );
  return isNewIndiaCompany && isMotor;
}

function train({ text = "", result = {} }) {
  if (!result || typeof result !== "object") return result;

  const patch = {};

  // 1. Insured Name
  const nameMatch = text.match(/Insured'?s?\s*Name\s*:?\s*([A-Z\s.-]+?)(?=Customer|ID|PAN|Address|\n|$)/i);
  if (nameMatch) {
    patch.insuredName = nameMatch[1].trim();
  }

  // 2. Chassis No & Engine No extraction
  const chEngMatch = text.match(/Chassis\s+no\.\s*\/\s*Engine\s+no\.\s*:?\s*([A-Z0-9]+)\s*\/\s*([A-Z0-9]+[\s\r\n]*[A-Z0-9]+)/i);
  if (chEngMatch) {
    patch.chassisNumber = chEngMatch[1].trim();
    patch.engineNumber = chEngMatch[2].replace(/[\r\n\s]+/g, "").trim();
  }

  // 3. Name of Financier (if blank/followed by Chassis label, clear noisy string)
  const financerMatch = text.match(/Name\s+of\s+the\s+Financier\s*:?\s*([^\n\r]*)/i);
  if (financerMatch) {
    const rawVal = financerMatch[1].trim();
    if (!rawVal || /Chassis\s+no|Engine\s+no/i.test(rawVal)) {
      patch.financerName = "";
    } else {
      patch.financerName = rawVal;
    }
  }

  // 4. Make / Model (remove glued Registration no. label)
  const makeModelMatch = text.match(/Make\s*\/\s*Model\s*:?\s*([A-Z0-9 /&.,-]+?)(?=Registration|Variant|Year|\n|$)/i);
  if (makeModelMatch) {
    const rawMakeModel = makeModelMatch[1].replace(/Registration\s+no\..*/i, "").trim();
    if (rawMakeModel) {
      patch.makeModel = rawMakeModel;
      patch.vehicleMake = rawMakeModel.split("/")[0]?.trim() || rawMakeModel;
      patch.vehicleModel = rawMakeModel.split("/")[1]?.trim() || rawMakeModel;
    }
  }

  // 5. Type of Fuel
  const fuelMatch = text.match(/Type\s+of\s+fuel\s*:?\s*([A-Z0-9/]+)/i);
  if (fuelMatch) {
    const rawFuel = fuelMatch[1].trim().toUpperCase();
    if (rawFuel.includes("CNG")) patch.fuelType = "CNG";
    else if (rawFuel.includes("PETROL")) patch.fuelType = "Petrol";
    else if (rawFuel.includes("DIESEL")) patch.fuelType = "Diesel";
    else if (rawFuel.includes("LPG")) patch.fuelType = "LPG";
    else if (rawFuel.includes("ELECTRIC") || rawFuel.includes("EV")) patch.fuelType = "Electric";
    else patch.fuelType = fuelMatch[1].trim();
  }

  // 6. Cubic Capacity
  const ccMatch = text.match(/Cubic\s+capacity(?:\(cc\)\/Wattage\(kW\))?\s*:?\s*(\d+)\s*cc?/i);
  if (ccMatch) {
    patch.cubicCapacity = ccMatch[1].trim();
  }

  // 7. Variant
  const variantMatch = text.match(/Variant\s*:?\s*([^\n\r]+?)(?=\s+Automobile|\s+Colour|\s+Cover|\n|$)/i);
  if (variantMatch) {
    patch.variant = variantMatch[1].trim();
  }

  // 8. RTO Location
  const rtoMatch = text.match(/Name\s+of\s+registration\s+authority\s*:?\s*([^\n\r]+?)(?=\s+FASTag|\s+INSURED|\n|$)/i);
  if (rtoMatch) {
    patch.rtoLocation = rtoMatch[1].trim();
  }

  // 9. Type of body
  const bodyMatch = text.match(/Type\s+of\s+body\s*:?\s*([A-Z0-9/]+)/i);
  if (bodyMatch) {
    const rawBody = bodyMatch[1].replace(/Gross.*/i, "").trim();
    patch.bodyType = rawBody;
  }

  // 10. Gross Vehicle Weight (GVW)
  const gvwMatch = text.match(/Gross\s+Vehicle\s+Weight[\s\S]{0,30}?:?\s*(\d+)/i);
  if (gvwMatch) {
    patch.grossVehicleWeight = gvwMatch[1].trim();
  }

  // 11. Seating capacity
  const seatingMatch = text.match(/Seating\s+capacity[\s\S]{0,30}?:?\s*(\d+)/i);
  if (seatingMatch) {
    patch.seatingCapacity = seatingMatch[1].trim();
  }

  // 12. Commercial Vehicle Sub Type
  const subTypeMatch = text.match(/Sub\s+Type\s*:?\s*([\s\S]*?)(?=Name\s+of\s+the\s+Financier|Chassis\s+no|Type\s+of\s+fuel|$)/i);
  if (subTypeMatch) {
    patch.commercialVehicleSubType = subTypeMatch[1].replace(/[\r\n]+/g, " ").replace(/\s+/g, " ").trim();
  }

  // 13. Insured / Customer Email
  const insuredEmailMatch = text.match(/INSURED\s+DETAILS[\s\S]*?Email\s*([a-zA-Z0-9._%+-]+\s*@\s*[a-zA-Z0-9\s.-]+?)(?=\s*GSTIN|\s*POLICY|POLICY\s+DETAILS|$)/i);
  if (insuredEmailMatch) {
    const cleanEmail = insuredEmailMatch[1].replace(/[\r\n\s]+/g, "").replace(/\.+$/, "").trim();
    patch.customerEmail = cleanEmail;
    patch.email = cleanEmail;
  }

  // 14. GSTIN
  const gstinMatch = text.match(/GSTIN\(Issuing\s+Office\)\s*([0-9A-Z]{15})/i) || text.match(/GSTIN\s+([0-9A-Z]{15}|NA)/i);
  if (gstinMatch) {
    patch.gstin = gstinMatch[1].trim();
  }

  // 15. Policy Type
  const policyTypeMatch = text.match(/POLICY\s+SCHEDULE\s+CUM\s+CERTIFICATE\s+OF\s+INSURANCE\s*\n\s*([^\n\r]+)/i);
  if (policyTypeMatch) {
    const rawType = policyTypeMatch[1].replace(/UIN\s+Number.*/i, "").trim();
    if (rawType && !/UIN/i.test(rawType)) {
      patch.policyType = rawType;
    }
  }

  // 16. Previous Insurer
  const prevInsurerMatch = text.match(/Previous\s+Insurer\s*:?\s*([A-Z0-9 /&.,-]+?)(?=\s*Previous\s+Policy\s+Number|$)/i);
  if (prevInsurerMatch) {
    patch.previousInsurer = prevInsurerMatch[1].replace(/Previous.*/i, "").trim();
  }

  const prevPolicyNoMatch = text.match(/Previous\s+Policy\s+Number\s*:?\s*([A-Z0-9/.-]+)/i);
  if (prevPolicyNoMatch) {
    patch.previousPolicyNumber = prevPolicyNoMatch[1].trim();
  }

  // 17. IDV (Insured Declared Value) Table
  const denseIdv =
    text.match(/For\s+individual\s+covers\s*\(OD\)\s*in\s*RS\s*:?\s*([0-9,]+)/i) ||
    text.match(/INSURED\s+DECLARED\s+VALUE[\s\S]*?\n\s*([1-9][0-9]{4,7})0000([1-9][0-9]{4,7})/i) ||
    text.match(/INSURED\s+DECLARED\s+VALUE[\s\S]*?\n\s*([0-9,]{4,8})\s+[0-9,]+\s+[0-9,]+\s+[0-9,]+\s+[0-9,]+\s+([0-9,]{4,8})/i);

  if (denseIdv) {
    const val = normalizeAmount(denseIdv[1]);
    patch.idv = val;
    patch.totalIdv = val;
    patch.sumInsured = val;
  }

  // 18. Premium Breakdown (OD, TP, Net, GST, Total)
  const basicOdMatch = text.match(/Basic\s+OD\s+Premium[\s\S]{0,100}?\n\s*(\d+(?:\.\d+)?)/i);
  if (basicOdMatch) {
    patch.basicOwnDamage = normalizeAmount(basicOdMatch[1]);
  }

  const basicTpMatch = text.match(/Basic\s+TP\s+Premium[\s\S]{0,100}?\n\s*(\d+(?:\.\d+)?)/i);
  if (basicTpMatch) {
    patch.basicThirdPartyLiability = normalizeAmount(basicTpMatch[1]);
  }

  const calcOdMatch = text.match(/Calculated\s+OD\s+Premium\s*(\d+(?:\.\d+)?)/i) || text.match(/Total\s+OD\s+Premium\s*\(Rs\)\s*(\d+(?:\.\d+)?)/i);
  if (calcOdMatch) {
    patch.odPremium = normalizeAmount(calcOdMatch[1]);
    patch.netOwnDamagePremium = patch.odPremium;
  }

  const calcTpMatch = text.match(/Calculated\s+TP\s+Premium\s*(\d+(?:\.\d+)?)/i) || text.match(/Total\s+TP\s+Premium\s*\(Rs\)\s*(\d+(?:\.\d+)?)/i);
  if (calcTpMatch) {
    patch.tpPremium = normalizeAmount(calcTpMatch[1]);
    patch.netLiabilityPremium = patch.tpPremium;
    patch.tpDriverOwner = patch.tpPremium;
  }

  // 19. Period of Cover (Start Date & Expiry Date)
  const periodMatch = text.match(/Period\s+of\s+(?:cover|insurance)\s*:?\s*(\d{1,2}[/-]\d{1,2}[/-]\d{4})(?:\s+[0-9:]+\s*(?:AM|PM)?)?\s+to\s+(\d{1,2}[/-]\d{1,2}[/-]\d{4})/i);
  if (periodMatch) {
    patch.startDate = periodMatch[1].trim();
    patch.expiryDate = periodMatch[2].trim();
    patch.duration = buildDuration(patch.startDate, patch.expiryDate);
  }

  patch.extractionTrainingVersion = "NEW_INDIA_MOTOR_V1";

  return patch;
}

module.exports = {
  scope,
  matches,
  train,
};
