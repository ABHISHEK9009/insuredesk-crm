const { normalizeAmount } = require("../../utils/amounts.cjs");
const { buildDuration } = require("../../utils/dates.cjs");

const scope = { insurer: "bajaj-allianz", category: "motor" };

function matches({ text = "", result = {} }) {
  const category = String(result.documentCategory || result.policyType || "");
  return (
    /Bajaj\s+General\s+Insurance\s+Limited/i.test(text) &&
    /Liability\s+Only\s+Policy\s+for\s+Commercial\s+Vehicle/i.test(text) &&
    /Motor|Commercial\s+Vehicle|Liability/i.test(category || text)
  );
}

function clean(value = "") {
  return String(value).replace(/\s+/g, " ").trim();
}

function amount(value = "") {
  return normalizeAmount(String(value).replace(/,/g, ""));
}

function assign(patch, key, value) {
  const normalized = clean(value);
  if (normalized) patch[key] = normalized;
}

function train({ text = "", result = {} }) {
  if (!result || typeof result !== "object") return result;

  const patch = {};
  const productName = clean(
    text.match(/(Liability\s+Only\s+Policy\s+for\s+Commercial\s+Vehicle)\s*-?\s*(?:POLICY|UIN)/i)?.[1],
  );
  if (productName) {
    patch.productName = productName;
    patch.policyType = productName;
    patch.policyCoverType = "Third Party";
  }

  assign(patch, "uinNumber", text.match(/UIN\s*:\s*(IRDAN113[A-Z0-9]+)/i)?.[1]);
  assign(patch, "insuredName", text.match(/POLICY DETAILSINSURED DETAILS\s+Insured Name\s*([^\n]+)/i)?.[1]);
  assign(patch, "customerName", patch.insuredName);
  assign(patch, "contactPerson", patch.insuredName);
  assign(patch, "policyNumber", text.match(/\b(\d{2}-\d{4}-\d{10}-\d{2})\s+Policy Number/i)?.[1]);

  const proposerBlock = text.match(/A\. Proposer details:([\s\S]+?)B\. Vehicle Details:/i)?.[1] || "";
  assign(patch, "mailingAddress", proposerBlock.match(/Mailing Address\s*([^\n]+(?:\n(?!Profession)[^\n]+)*)\s+Profession/i)?.[1]);
  assign(patch, "customerEmail", proposerBlock.match(/Email ID\s*([^\s]+@[^\s]+)/i)?.[1]);
  assign(patch, "contactNumber", proposerBlock.match(/Mobile Number\s*(\d{10})/i)?.[1]);
  assign(patch, "customerMobile", patch.contactNumber);

  const period = text.match(/Policy Period\s+From:\s*(\d{2}-\d{2}-\d{4})[\s\S]{0,40}?To:\s*(\d{2}-\d{2}-\d{4})/i);
  if (period) {
    patch.startDate = period[1];
    patch.expiryDate = period[2];
    patch.duration = buildDuration(period[1], period[2]);
  }
  assign(patch, "policyIssueDate", text.match(/Policy Issued on\s*(\d{2}-\d{2}-\d{4})/i)?.[1]);
  assign(patch, "invoiceNumber", text.match(/Invoice Number\s*(\d{6}[A-Z]\d{9})/i)?.[1]);
  assign(patch, "placeOfSupply", text.match(/Place of Supply\/[\s\S]{0,40}?(\d{2}\s*-\s*[A-Z ]+)/i)?.[1]);

  const vehicle = text.match(
    /(MP-\d{2}-[A-Z]{1,3}-\d{4})([A-Z]+)\s+(\d{3,4})(\d{4})([A-Z]+\s*\d+)(SCHOOL\s+BUS\s*\(\d+\))\s+(\d{3,6})/i,
  );
  if (vehicle) {
    patch.registrationNumber = vehicle[1].toUpperCase();
    patch.vehicleNumber = patch.registrationNumber;
    patch.vehicleMake = vehicle[2].toUpperCase();
    patch.cubicCapacity = vehicle[3];
    patch.manufacturingYear = vehicle[4];
    patch.vehicleModel = clean(vehicle[5]).toUpperCase();
    patch.variant = clean(vehicle[6]).toUpperCase();
    patch.bodyType = patch.variant;
    patch.grossVehicleWeight = vehicle[7];
    patch.makeModel = `${patch.vehicleMake} ${patch.vehicleModel}`;
  }

  const vehicleIdentifiers = text.match(
    /(MP\d{2}-[A-Z]+)(\d{1,2})([A-Z0-9]{17})(DIESEL|PETROL|CNG|LPG)(?:\([A-Z]\))?(\d)([A-Z0-9]{15,22})/i,
  );
  if (vehicleIdentifiers) {
    patch.rtoLocation = vehicleIdentifiers[1].toUpperCase();
    patch.seatingCapacity = vehicleIdentifiers[2];
    patch.chassisNumber = vehicleIdentifiers[3].toUpperCase();
    patch.fuelType = vehicleIdentifiers[4][0].toUpperCase() + vehicleIdentifiers[4].slice(1).toLowerCase();
    patch.numberOfTrailers = vehicleIdentifiers[5];
    patch.engineNumber = vehicleIdentifiers[6].toUpperCase();
  }

  const idv = amount(text.match(/Total IDV \(Rs\)[\s\S]{0,180}?\n(\d+)\n(?:\d+\n){0,4}/i)?.[1] || "0");
  patch.idv = idv;
  patch.totalIdv = idv;
  patch.vehicleIdv = idv;
  patch.sumInsured = idv;

  const basicThirdParty = amount(text.match(/(\d+)\s+Basic Third Party Liability/i)?.[1]);
  const netPremium = amount(text.match(/Rs\.\s*(\d+)\s+9\. Premium for Liability coverage/i)?.[1]);
  const finalPremium = amount(text.match(/Final Premium\s+(\d+)/i)?.[1]);
  const cgst = amount(text.match(/(\d+)\s+CGST \(9%\)/i)?.[1]);
  const sgst = amount(text.match(/(\d+)\s+SGST \(9%\)/i)?.[1]);
  const ownerDriver = amount(text.match(/Compulsory Personal Accident[\s\S]{0,120}?(\d+)\s+LL To Person/i)?.[1]);
  const legalLiability = amount(text.match(/LL To Person For Operation\s+Maintenance IMT 28\s+(\d+)/i)?.[1]);

  assign(patch, "tpPremium", basicThirdParty);
  assign(patch, "netPremium", netPremium);
  assign(patch, "basicPremium", netPremium);
  assign(patch, "liabilityPremium", netPremium);
  assign(patch, "tpDriverOwner", netPremium);
  assign(patch, "totalActPremium", netPremium);
  assign(patch, "ownerDriverPremium", ownerDriver);
  assign(patch, "legalLiabilityPremium", legalLiability);
  assign(patch, "cgst", cgst);
  assign(patch, "sgst", sgst);
  if (cgst || sgst) {
    const gstAmount = (Number(cgst || 0) + Number(sgst || 0)).toFixed(2);
    patch.gstAmount = gstAmount;
    patch.taxAmount = gstAmount;
  }
  assign(patch, "premium", finalPremium);
  assign(patch, "totalPremium", finalPremium);
  assign(patch, "grossPremium", finalPremium);
  assign(patch, "premiumIncludingGst", finalPremium);

  const previousPolicy = text.match(
    /About the last insurance company[\s\S]{0,250}?Reliance General Insurance Company Limited\.?\s+(\d{15,25})\s+(\d{2}\/\d{2}\/\d{4})/i,
  );
  if (previousPolicy) {
    patch.previousInsurer = "Reliance General Insurance Company Limited";
    patch.previousPolicyNumber = previousPolicy[1];
    patch.previousPolicyExpiryDate = previousPolicy[2];
  }

  if (
    /\b28\s+Subject to Warranties\/[\s\S]{0,40}?IMT-Endorsements\//i.test(text) ||
    /Subject to Warranties\/[\s\S]{0,40}?IMT-Endorsements\/[\s\S]{0,30}?\b28\b/i.test(text)
  ) {
    patch.imtEndorsements = "IMT-28";
  }
  patch.extractionTrainingVersion = "BAJAJ_ALLIANZ_MOTOR_COMMERCIAL_LIABILITY_V1";
  return patch;
}

module.exports = { scope, matches, train };
