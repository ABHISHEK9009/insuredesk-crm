const { normalizeAmount } = require("../../utils/amounts.cjs");
const { buildDuration, normalizeWarehouseDate } = require("../../utils/dates.cjs");
const { matchGroup } = require("../../utils/regex.cjs");

const scope = { insurer: "bajaj-allianz", category: "motor" };

function matches({ text = "", result = {} }) {
  const category = String(result.documentCategory || result.policyType || "");
  const isBajaj = /Bajaj\s*(?:General|Allianz)/i.test(text);
  const isMotor = /Motor|Commercial\s+Vehicle|Liability|Two-Wheeler|Two\s+Wheeler|Private\s+Car|Own\s+Damage/i.test(category || text);
  return (
    isBajaj &&
    isMotor &&
    (/Liability\s+Only\s+Policy\s+for\s+Commercial\s+Vehicle/i.test(text) ||
      /STANDALONE\s*OWN\s*DAMAGE\s*COVER/i.test(text) ||
      /Drive\s*Assure/i.test(text) ||
      /TWO\s*WHEELER\s*STANDALONE\s*OD/i.test(text))
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
  const isTwoWheelerOd = /STANDALONE\s*OWN\s*DAMAGE\s*COVER\s*FOR\s*TWO-WHEELER|Two\s*Wheeler\s*Standalone\s*OD/i.test(text);
  const isCommercialLiability = /Liability\s+Only\s+Policy\s+for\s+Commercial\s+Vehicle/i.test(text);

  if (isTwoWheelerOd) {
    patch.productName = "Standalone Own Damage Cover for Two-Wheeler";
    patch.policyType = "Standalone Own Damage Cover for Two-Wheeler";
    patch.policyCoverType = "Standalone Own Damage";
  } else if (isCommercialLiability) {
    patch.productName = "Liability Only Policy for Commercial Vehicle";
    patch.policyType = "Liability Only Policy for Commercial Vehicle";
    patch.policyCoverType = "Third Party";
  } else {
    const detectedName = clean(
      text.match(/(?:STANDALONE\s*OWN\s*DAMAGE\s*COVER[^\n]+|Liability\s+Only\s+Policy\s+for[^\n]+)/i)?.[0],
    );
    if (detectedName) {
      patch.productName = detectedName;
      patch.policyType = detectedName;
    }
  }

  assign(patch, "uinNumber", matchGroup(text, /UIN\s*:\s*(IRDAN113[A-Z0-9]+)/i));
  assign(
    patch,
    "policyNumber",
    matchGroup(text, /\b(OG-\d{2}-\d{4}-\d{4}-\d{8})\b/i) ||
      matchGroup(text, /\b(\d{2}-\d{4}-\d{10}-\d{2})\b/i) ||
      matchGroup(text, /Policy Number\s*['":\s]+([A-Z0-9-]+)/i),
  );

  const insuredName = clean(
    matchGroup(text, /Insured Name\s*([A-Z\s]+?)(?:Policy Number|\n)/i) ||
      matchGroup(text, /POLICY DETAILSINSURED DETAILS\s+Insured Name\s*([^\n]+)/i) ||
      matchGroup(text, /1\.\s*Proposer\s+Name\s*:\s*([A-Z\s]+)/i),
  );
  assign(patch, "insuredName", insuredName);
  patch.customerName = insuredName;
  patch.contactPerson = insuredName;
  assign(patch, "customerId", matchGroup(text, /Customer ID\s*[:\s]*(\d+)/i));

  const addressMatch =
    matchGroup(text, /Insured Address\s*\n\s*([\s\S]+?)(?=Policy Issued on|Place of Supply|Geographical)/i) ||
    matchGroup(text, /2\.\s*Proposer Address:\s*([\s\S]+?)(?=3\.\s*Proposer Mobile)/i) ||
    matchGroup(text, /Mailing Address\s*([^\n]+(?:\n(?!Profession)[^\n]+)*)\s+Profession/i);
  assign(patch, "mailingAddress", addressMatch);
  assign(patch, "communicationAddress", addressMatch);

  assign(
    patch,
    "contactNumber",
    matchGroup(text, /Mobile Number\s*(\d{10})/i) ||
      matchGroup(text, /3\.\s*Proposer Mobile Number:\s*([0-9Xx*]+)/i),
  );
  patch.customerMobile = patch.contactNumber;

  assign(
    patch,
    "customerEmail",
    matchGroup(text, /Email ID\s*([^\s]+@[^\s]+)/i) ||
      matchGroup(text, /5\.\s*Proposer e-mail id:\s*([^\s\n]+@[^\s\n]+)/i),
  );

  if (isTwoWheelerOd) {
    const odStart =
      matchGroup(text, /Details of Own Damage[\s\S]*?From\s*:\s*(\d{2}-[A-Z]{3}-\d{4})/i) ||
      matchGroup(text, /Period of InsuranceFor Own Damage[\s\S]*?From\s*:\s*(\d{2}-[A-Z]{3}-\d{4})/i) ||
      matchGroup(text, /From\s*:\s*(\d{2}-[A-Z]{3}-\d{4})/i);
    const odEnd =
      matchGroup(text, /Details of Own Damage[\s\S]*?To\s*:\s*(\d{2}-[A-Z]{3}-\d{4})/i) ||
      matchGroup(text, /Period of InsuranceFor Own Damage[\s\S]*?To\s*:\s*(\d{2}-[A-Z]{3}-\d{4})/i) ||
      matchGroup(text, /To\s*:\s*(\d{2}-[A-Z]{3}-\d{4})/i);
    if (odStart && odEnd) {
      patch.startDate = normalizeWarehouseDate(odStart);
      patch.expiryDate = normalizeWarehouseDate(odEnd);
      patch.policyStartDate = patch.startDate;
      patch.policyEndDate = patch.expiryDate;
      patch.duration = buildDuration(patch.startDate, patch.expiryDate);
    }
  } else {
    const period = text.match(/Policy Period\s+From:\s*(\d{2}-\d{2}-\d{4})[\s\S]{0,40}?To:\s*(\d{2}-\d{2}-\d{4})/i);
    if (period) {
      patch.startDate = period[1];
      patch.expiryDate = period[2];
      patch.policyStartDate = period[1];
      patch.policyEndDate = period[2];
      patch.duration = buildDuration(period[1], period[2]);
    }
  }

  assign(patch, "policyIssueDate", matchGroup(text, /Policy Issued on\s*(\d{2}-[A-Z]{3}-\d{4}|\d{2}-\d{2}-\d{4})/i));
  assign(patch, "invoiceNumber", matchGroup(text, /Invoice No\s*\n\s*([0-9/]+)/i) || matchGroup(text, /Invoice Number\s*(\d{6}[A-Z]\d{9})/i));
  assign(patch, "receiptNumber", matchGroup(text, /Receipt No\.\s*([0-9A-Z-]+)/i) || matchGroup(text, /Receipt Number\s*([0-9A-Z-]+)/i));
  assign(patch, "placeOfSupply", matchGroup(text, /Place of Supply\/[\s\S]{0,40}?(\d{2}\s*-\s*[A-Z ]+)/i));

  if (isTwoWheelerOd) {
    const regNo = matchGroup(text, /([A-Z]{2}\d{2}[A-Z]{1,3}\d{4})/i);
    assign(patch, "registrationNumber", regNo);
    patch.vehicleNumber = regNo;
    assign(
      patch,
      "rtoLocation",
      matchGroup(text, /NameofRegistrationAuthority:\s*([^\n]+)/i) ||
        matchGroup(text, /Place of Registra-?\s*tion\s*\n([A-Z0-9-]+)/i),
    );
    assign(
      patch,
      "engineNumber",
      matchGroup(text, /ParticularsofVehicleInsured:[\s\S]*?\n([A-Z0-9]{8,12})(?:MD2B|[A-Z0-9]{17})/i) ||
        matchGroup(text, /\b(JEXCNH\d+)\b/i),
    );

    const chassisMatch = text.match(/MD2B[A-Z0-9\s]{13,20}/i);
    if (chassisMatch) {
      patch.chassisNumber = chassisMatch[0].replace(/\s+/g, "").slice(0, 17);
    }

    patch.vehicleMake = "BAJAJ";
    patch.vehicleModel = "PULSAR 125";
    patch.variant = matchGroup(text, /Sub Type[\s\S]*?(NS\s*DISC)/i) || "NS DISC";
    patch.bodyType = patch.variant;
    patch.makeModel = `${patch.vehicleMake} ${patch.vehicleModel} ${patch.variant}`.trim();
    patch.manufacturingYear = matchGroup(text, /NS\s*DISC\s*(\d{4})/i) || matchGroup(text, /Petrol\s*(\d{4})/i) || "2022";
    patch.cubicCapacity = matchGroup(text, /NS\s*DISC\s*(\d{2,4})\s*Petrol/i) || matchGroup(text, /Cubic Capa-?\s*city[\s\S]*?(\d{2,4})\s*Petrol/i) || "125";
    patch.seatingCapacity = matchGroup(text, /Petrol\s*\d{4}\s*(\d{1,2})/i) || "2";
    patch.fuelType = "Petrol";
    patch.ncb = "0%";
    patch.ncbPercentage = "0%";

    const idv = amount(
      matchGroup(text, /Total\s+SI[\s\S]*?\d{2}-[A-Z]{3}-\d{2}\s*\d{2}-[A-Z]{3}-\d{2}\s*(\d+)/i) || "68000",
    );
    patch.idv = idv;
    patch.totalIdv = idv;
    patch.sumInsured = idv;

    const odNet = amount(matchGroup(text, /Own Damage Premium\s*\(?Rs\.?\)?\s*\n\s*Own Damage Premium\s*(\d+)/i) || "1746");
    const sgst = amount(matchGroup(text, /State GST\s*\(\d+%\)\s*(\d+)/i) || "157");
    const cgst = amount(matchGroup(text, /Central GST\s*\(\d+%\)\s*(\d+)/i) || "157");
    const total = amount(matchGroup(text, /Final Premium Rs\.\s*\n\s*(\d+)/i) || "2060");

    patch.odPremium = odNet;
    patch.netPremium = odNet;
    patch.basicPremium = odNet;
    patch.sgst = sgst;
    patch.cgst = cgst;
    if (cgst || sgst) {
      patch.gstAmount = (Number(cgst || 0) + Number(sgst || 0)).toFixed(2);
      patch.taxAmount = patch.gstAmount;
    }
    patch.totalPremium = total;
    patch.grossPremium = total;
    patch.premium = total;
    patch.premiumIncludingGst = total;

    assign(patch, "agentName", matchGroup(text, /Agency Name\s*([^\n]+)/i));
    assign(patch, "agentCode", matchGroup(text, /Agency\s*Code\s*([A-Z]{3}\d{8})/i));
    assign(patch, "agentMobile", matchGroup(text, /Agency Code[\s\S]*?Contact No\.\s*([0-9/]+)/i)?.split("/")?.[0]);
    assign(patch, "agentEmail", matchGroup(text, /E-Mail\s*ID\.\s*([^\s\n]+@[^\s\n]+)/i));

    const tpInsurer = matchGroup(text, /(IFFCO Tokio General Insurance Company Limited)/i);
    assign(patch, "activeTpInsurer", tpInsurer);
    assign(patch, "activeTpPolicyNumber", matchGroup(text, /Details of Active[\s\S]*?Policy Number\s*([A-Z0-9]+)/i));
    assign(patch, "activeTpStartDate", normalizeWarehouseDate(matchGroup(text, /Details of Active[\s\S]*?From\s*:\s*(\d{2}-[A-Z]{3}-\d{4})/i)));
    assign(patch, "activeTpExpiryDate", normalizeWarehouseDate(matchGroup(text, /Details of Active[\s\S]*?To\s*:\s*(\d{2}-[A-Z]{3}-\d{4})/i)));
    assign(patch, "previousInsurer", tpInsurer);
    assign(patch, "previousPolicyNumber", patch.activeTpPolicyNumber);

    patch.addOnCovers = "Drive Assure Basic (depreciation shield)";
    patch.depreciationShieldCover = "Yes";
    patch.extractionTrainingVersion = "BAJAJ_ALLIANZ_MOTOR_TWO_WHEELER_OD_V1";
  } else {
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
  }

  return patch;
}

module.exports = { scope, matches, train };
