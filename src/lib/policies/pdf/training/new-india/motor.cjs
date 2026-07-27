const { normalizeAmount } = require("../../utils/amounts.cjs");

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

  // 1. Chassis No & Engine No extraction
  const chEngMatch = text.match(/Chassis\s+no\.\s*\/\s*Engine\s+no\.\s*:\s*([A-Z0-9]+)\s*\/\s*([A-Z0-9]+(?:\s+[A-Z0-9]+)?)/i);
  if (chEngMatch) {
    patch.chassisNumber = chEngMatch[1].trim();
    patch.engineNumber = chEngMatch[2].replace(/\s+/g, "").trim();
  }

  // 2. Name of Financier (if blank/followed by Chassis label, clear noisy string)
  const financerMatch = text.match(/Name\s+of\s+the\s+Financier\s*:\s*([^\n\r]*)/i);
  if (financerMatch) {
    const rawVal = financerMatch[1].trim();
    if (!rawVal || /Chassis\s+no|Engine\s+no/i.test(rawVal)) {
      patch.financerName = "";
    } else {
      patch.financerName = rawVal;
    }
  }

  // 3. Make / Model (remove glued Registration no. label)
  const makeModelMatch = text.match(/Make\s*\/\s*Model\s*:\s*([^\n\r]+)/i);
  if (makeModelMatch) {
    const rawMakeModel = makeModelMatch[1].replace(/Registration\s+no\..*/i, "").trim();
    if (rawMakeModel) {
      patch.makeModel = rawMakeModel;
      patch.vehicleMake = rawMakeModel.split("/")[0]?.trim() || rawMakeModel;
      patch.vehicleModel = rawMakeModel.split("/")[1]?.trim() || rawMakeModel;
    }
  }

  // 4. Type of Fuel
  const fuelMatch = text.match(/Type\s+of\s+fuel\s*:\s*([A-Z0-9/]+)/i);
  if (fuelMatch) {
    patch.fuelType = fuelMatch[1].trim();
  }

  // 5. Type of body
  const bodyMatch = text.match(/Type\s+of\s+body\s*:\s*([A-Z0-9/]+)/i);
  if (bodyMatch) {
    patch.bodyType = bodyMatch[1].trim();
  }

  // 6. Gross Vehicle Weight (GVW)
  const gvwMatch = text.match(/Gross\s+Vehicle\s+Weight\s*(?:\(GVW\))?\s*:\s*(\d+)/i);
  if (gvwMatch) {
    patch.grossVehicleWeight = gvwMatch[1].trim();
  }

  // 7. Seating capacity
  const seatingMatch = text.match(/Seating\s+capacity\s*(?:including\s+Driver)?\s*:\s*(\d+)/i);
  if (seatingMatch) {
    patch.seatingCapacity = seatingMatch[1].trim();
  }

  // 8. Commercial Vehicle Sub Type
  const subTypeMatch = text.match(/Sub\s+Type\s*:\s*([\s\S]*?)(?=Name\s+of\s+the\s+Financier|Chassis\s+no|Type\s+of\s+fuel|$)/i);
  if (subTypeMatch) {
    patch.commercialVehicleSubType = subTypeMatch[1].replace(/[\r\n]+/g, " ").replace(/\s+/g, " ").trim();
  }

  // 9. Insured / Customer Email
  const insuredEmailMatch = text.match(/INSURED\s+DETAILS[\s\S]*?Email\s+([a-zA-Z0-9._%+-]+\s*@\s*[a-zA-Z0-9\s.-]+?)(?=\s*GSTIN|\s*POLICY|POLICY\s+DETAILS|$)/i);
  if (insuredEmailMatch) {
    const cleanEmail = insuredEmailMatch[1].replace(/[\r\n\s]+/g, "").replace(/\.+$/, "").trim();
    patch.customerEmail = cleanEmail;
    patch.email = cleanEmail;
  }

  // 10. Policy Type
  const policyTypeMatch = text.match(/POLICY\s+SCHEDULE\s+CUM\s+CERTIFICATE\s+OF\s+INSURANCE\s*\n\s*([^\n\r]+)/i);
  if (policyTypeMatch) {
    const rawType = policyTypeMatch[1].replace(/UIN\s+Number.*/i, "").trim();
    if (rawType && !/UIN/i.test(rawType)) {
      patch.policyType = rawType;
    }
  }

  // 11. Previous Insurer
  const prevInsurerMatch = text.match(/Previous\s+Insurer\s+([^\n\r]+?)(?=\s+Previous\s+Policy\s+Number|$)/i);
  if (prevInsurerMatch) {
    patch.previousInsurer = prevInsurerMatch[1].trim();
  }

  // 12. Basic OD Premium
  const basicOdMatch = text.match(/Basic\s+OD\s+Premium\s+(\d+(?:\.\d+)?)/i);
  if (basicOdMatch) {
    patch.basicOwnDamage = normalizeAmount(basicOdMatch[1]);
    patch.basicPremium = normalizeAmount(basicOdMatch[1]);
  }

  // 13. Basic TP Premium
  const basicTpMatch = text.match(/Basic\s+TP\s+Premium\s+(\d+(?:\.\d+)?)/i);
  if (basicTpMatch) {
    patch.basicThirdPartyLiability = normalizeAmount(basicTpMatch[1]);
    patch.tpPremium = normalizeAmount(basicTpMatch[1]);
  }

  // 14. Period of Cover (Start Date & Expiry Date)
  const periodMatch = text.match(/Period\s+of\s+(?:cover|insurance)\s*:?\s*(\d{1,2}[/-]\d{1,2}[/-]\d{4})(?:\s+[0-9:]+\s*(?:AM|PM)?)?\s+to\s+(\d{1,2}[/-]\d{1,2}[/-]\d{4})/i);
  if (periodMatch) {
    patch.startDate = periodMatch[1].trim();
    patch.expiryDate = periodMatch[2].trim();
  }

  patch.extractionTrainingVersion = "NEW_INDIA_MOTOR_V1";

  return patch;
}

module.exports = {
  scope,
  matches,
  train,
};
