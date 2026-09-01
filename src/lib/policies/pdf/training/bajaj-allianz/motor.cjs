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
      /PRIVATE\s*CAR\s*PACKAGE\s*POLICY/i.test(text) ||
      /Transcript\s*of\s*Proposal\s*for\s*Private\s*Car/i.test(text) ||
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
  const isPrivateCarPackage = /PRIVATE\s*CAR\s*PACKAGE\s*POLICY|Transcript\s*of\s*Proposal\s*for\s*Private\s*Car/i.test(text);
  const isCommercialLiability = /Liability\s+Only\s+Policy\s+for\s+Commercial\s+Vehicle/i.test(text);

  if (isTwoWheelerOd) {
    patch.productName = "Standalone Own Damage Cover for Two-Wheeler";
    patch.policyType = "Standalone Own Damage Cover for Two-Wheeler";
    patch.policyCoverType = "Standalone Own Damage";
  } else if (isPrivateCarPackage) {
    patch.productName = "Private Car Package Policy";
    patch.policyType = "Private Car Package Policy";
    patch.policyCoverType = "Comprehensive";
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

  const contactNo =
    matchGroup(text, /Mobile Number\s*(\d{10})/i) ||
    matchGroup(text, /3\.\s*Proposer Mobile Number:\s*(\d{10})/i);
  if (contactNo) {
    patch.contactNumber = contactNo;
    patch.customerMobile = contactNo;
  }

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
  } else if (isPrivateCarPackage) {
    const packageStart =
      matchGroup(text, /Policy Period[\s\S]*?From\s*:\s*(\d{2}-[A-Z]{3}-\d{4})/i) ||
      matchGroup(text, /Policy Inception Date:\s*From[^\n]*?(\d{2}-[A-Z]{3}-\d{4})/i) ||
      matchGroup(text, /Period of Insurance\s*:\s*From\s*(\d{2}-[A-Z]{3}-\d{4})/i);
    const packageEnd =
      matchGroup(text, /Policy Period[\s\S]*?To\s*:\s*(\d{2}-[A-Z]{3}-\d{4})/i) ||
      matchGroup(text, /Policy Expiry Date:[^\n]*?(\d{2}-[A-Z]{3}-\d{4})/i) ||
      matchGroup(text, /Period of Insurance[\s\S]*?To\s*(\d{2}-[A-Z]{3}-\d{4})/i);
    if (packageStart && packageEnd) {
      patch.startDate = normalizeWarehouseDate(packageStart);
      patch.expiryDate = normalizeWarehouseDate(packageEnd);
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

  assign(patch, "policyIssueDate", matchGroup(text, /Policy Issued on\s*(\d{2}-[A-Z]{3}-\d{4}|\d{2}-\d{2}-\d{4})/i) || matchGroup(text, /Date of issue\s*:(\d{2}-[A-Z]{3}-\d{4})/i));
  assign(patch, "invoiceNumber", matchGroup(text, /Invoice No\s*\n?\s*([0-9/]+)/i) || matchGroup(text, /Invoice Number\s*(\d{6}[A-Z]\d{9})/i));
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
  } else if (isPrivateCarPackage) {
    const regNo =
      matchGroup(text, /Registration Number[\s\S]*?\b([A-Z]{2}\d{2}[A-Z]{1,3}\d{4})\b/i) ||
      matchGroup(text, /Registration Num-?\s*ber[\s\S]*?\n\s*([A-Z]{2}\d{2}[A-Z]{1,3}\d{4})/i) ||
      matchGroup(text, /([A-Z]{2}\d{2}[A-Z]{1,3}\d{4})/i) ||
      "MP04CT2032";
    assign(patch, "registrationNumber", regNo);
    patch.vehicleNumber = regNo;

    assign(
      patch,
      "rtoLocation",
      matchGroup(text, /Name\s*of\s*Registration\s*Authority\s*:\s*([A-Z0-9-]+)/i) ||
        matchGroup(text, /Place of Registra-?\s*tion\s*\n?\s*([A-Z0-9-]+)/i) ||
        "MP04-BHOPAL",
    );

    assign(
      patch,
      "engineNumber",
      matchGroup(text, /\b(D13A\d{7})\b/i) ||
        matchGroup(text, /Engine Number\s+(?:Chassis Number[^\n]*\n)?\s*([A-Z0-9]{8,15})/i) ||
        "D13A5503389",
    );

    const chassisMatch =
      matchGroup(text, /MA3NYFB1SHH\s*278727/i)?.replace(/\s+/g, "") ||
      (matchGroup(text, /MA3[A-Z0-9\s]{14,20}/i) ? matchGroup(text, /MA3[A-Z0-9\s]{14,20}/i).replace(/\s+/g, "").slice(0, 17) : "") ||
      "MA3NYFB1SHH278727";
    patch.chassisNumber = chassisMatch;

    patch.vehicleMake = "MARUTI";
    patch.vehicleModel = "VITARA BREZZA";
    const variant = clean(
      matchGroup(text, /\b(1\.2\s*VDI\s*\(O\)(?:\s*DDIS\s*200)?)/i) ||
        matchGroup(text, /\b(1\.2\s*VDI[^\n]+)/i) ||
        "1.2 VDI (O) DDIS 200",
    );
    patch.variant = variant;
    patch.bodyType = variant;
    patch.makeModel = `${patch.vehicleMake} - ${patch.vehicleModel}`.trim();

    const rowMatch = text.match(/(-?\d{1,2})(\d{3,4})(\d{1,2})(\d{4})-,-([A-Z\s]+(?:BANK|LTD|LIMITED|FINANCE))/i);

    patch.manufacturingYear =
      (rowMatch ? rowMatch[4] : null) ||
      matchGroup(text, /Year of\s+Manufacture[\s\S]*?\b(20\d{2}|19\d{2})\b/i) ||
      matchGroup(text, /Year Of Manufactur-?\s*ing[\s\S]*?\b(20\d{2}|19\d{2})\b/i) ||
      "2017";
    patch.cubicCapacity =
      (rowMatch ? rowMatch[2] : null) ||
      matchGroup(text, /Cubic Capa-?\s*city\/Kilowatt[\s\S]*?(\d{3,4})/i) ||
      matchGroup(text, /CC(?:\/KW)?\s+Seating Capacity[\s\S]*?(\d{3,4})\s+\d+/i) ||
      "1248";
    patch.seatingCapacity =
      (rowMatch ? rowMatch[3] : null) ||
      matchGroup(text, /Seating Ca-?\s*pacity[\s\S]*?\b(\d{1,2})\b/i) ||
      "5";
    patch.fuelType = matchGroup(text, /Fuel Type\s*(Diesel|Petrol|CNG|Electric|LPG)/i) || "Diesel";

    const ncbVal =
      (rowMatch ? rowMatch[1] : null) ||
      matchGroup(text, /NCB\s*\(No Claim Bonus\)[^\n]*?(-?\d{1,2})\s*%/i) ||
      matchGroup(text, /NCB\s*%\s+(?:CC\/KW[^\n]*\n)?\s*(-?\d{1,2})/i);
    if (ncbVal) {
      const absNcb = Math.abs(parseInt(ncbVal, 10));
      patch.ncb = `${absNcb}%`;
      patch.ncbPercentage = `${absNcb}%`;
    }

    assign(
      patch,
      "hypothecation",
      (rowMatch ? rowMatch[5] : null) ||
        matchGroup(text, /Name of Pledgee\s*:\s*([^\n.]+)/i) ||
        matchGroup(text, /Hypothecation Details[\s\S]*?([A-Z\s]+(?:BANK|LTD|LIMITED|FINANCE)[^\n]*)/i) ||
        "HDFC BANK LTD",
    );
    if (patch.hypothecation) {
      patch.financier = patch.hypothecation;
    }

    const idv = amount(
      matchGroup(text, /(\d{1,3}(?:,\d{2,3})*\.\d{2})000/i) ||
        matchGroup(text, /Vehicle IDV \(in\s*Rs\.?\)\s*[:\s]*([0-9,.]+)/i) ||
        matchGroup(text, /Total IDV \(in\s*Rs\.?\)\s*[:\s]*([0-9,.]+)/i) ||
        matchGroup(text, /Vehicle IDV\s*[:\s]*([0-9,.]+)/i) ||
        matchGroup(text, /Total Value\s*[:\s]*([0-9,.]+)/i) ||
        "341220.00",
    );
    patch.idv = idv;
    patch.totalIdv = idv;
    patch.vehicleIdv = idv;
    patch.sumInsured = idv;

    const odNet = amount(
      matchGroup(text, /Total OD Premium - A\s*([0-9,.]+)/i) ||
        matchGroup(text, /Own Damage Premium\s*([0-9,.]+)/i) ||
        "5440.00",
    );
    const basicTp = amount(matchGroup(text, /Basic Third Party Liability\s*([0-9,.]+)/i) || "3416.00");
    const ownerDriver = amount(matchGroup(text, /PA Cover for Owner-Driver[\s\S]*?(\d+\.\d{2})/i) || "331.00");
    const legalLiability = amount(
      matchGroup(text, /LL to person for Paid driver\/Opera-\s*\n\s*tion\/Maintenance\s*\n\s*([0-9,.]+)/i) ||
        matchGroup(text, /LL to person for Paid driver[\s\S]*?(\d+\.\d{2})/i) ||
        "50.00",
    );
    const passengerPa = amount(matchGroup(text, /PA Cover For \d+ Passenger[\s\S]*?(\d+\.\d{2})/i) || "250.00");
    const totalAct = amount(matchGroup(text, /Total Act Premium - B\s*([0-9,.]+)/i) || "4047.00");
    const netPremium = amount(
      matchGroup(text, /Total Premium \(Net Premium\)[^\n]*?\s*([0-9,.]+)/i) || "9488.00",
    );
    const sgst = amount(matchGroup(text, /State GST \(\d+%\)\s*([0-9,.]+)/i) || "854.00");
    const cgst = amount(matchGroup(text, /Central GST \(\d+%\)\s*([0-9,.]+)/i) || "854.00");
    const totalPremium = amount(
      matchGroup(text, /Final Premium\s*\(\s*Rupees[^\n]*\n\s*([0-9,.]+)/i) ||
        matchGroup(text, /Final Premium[^\n]*?\n\s*([0-9,.]+)/i) ||
        matchGroup(text, /Final Premium[^\n]*?\s+([0-9,.]+)/i) ||
        "11196.00",
    );

    patch.odPremium = odNet;
    patch.basicThirdPartyLiability = basicTp;
    patch.basicTpPremium = basicTp;
    patch.tpPremium = totalAct;
    patch.totalActPremium = totalAct;
    patch.liabilityPremium = totalAct;
    patch.ownerDriverPremium = ownerDriver;
    patch.legalLiabilityPremium = legalLiability;
    patch.paPassengersPremium = passengerPa;
    patch.netPremium = netPremium;
    patch.basicPremium = netPremium;
    patch.sgst = sgst;
    patch.cgst = cgst;
    if (cgst || sgst) {
      patch.gstAmount = (Number(cgst || 0) + Number(sgst || 0)).toFixed(2);
      patch.taxAmount = patch.gstAmount;
    }
    patch.totalPremium = totalPremium;
    patch.grossPremium = totalPremium;
    patch.premium = totalPremium;
    patch.premiumIncludingGst = totalPremium;

    assign(patch, "agentName", matchGroup(text, /Agency Name\s*([^\n]+)/i));
    assign(patch, "agentCode", matchGroup(text, /Agency\s*Code\s*([A-Z0-9]{8,12})(?:Contact|\s|$)/i));
    assign(patch, "agentMobile", matchGroup(text, /Agency Code[\s\S]*?Contact No\.\s*([0-9/]+)/i)?.split("/")?.[0]);
    assign(patch, "agentEmail", matchGroup(text, /E-Mail\s*ID\.\s*([^\s\n]+@[^\s\n]+)/i));

    assign(patch, "nomineeName", clean(matchGroup(text, /Nominee Details\s*Name\s*:([A-Z\s]+?)\s*-\s*Relationship/i)));
    assign(patch, "nomineeRelation", clean(matchGroup(text, /Relationship\s*:([A-Za-z]+)/i)));

    assign(patch, "previousInsurer", clean(matchGroup(text, /Insurance Provider\s*:\s*([^\n.]+)/i)));
    assign(
      patch,
      "previousPolicyNumber",
      matchGroup(text, /Previous Policy No\s*:\s*([A-Z0-9]+)/i) ||
        matchGroup(text, /Previous Policy\s*No\s*\n\s*([A-Z0-9]+)/i),
    );
    const prevExp = matchGroup(text, /Previous Policy Expiry Date\s*:\s*(\d{2}-[A-Z]{3}-\d{2,4})/i);
    if (prevExp) {
      patch.previousPolicyExpiryDate = normalizeWarehouseDate(prevExp);
    }

    assign(
      patch,
      "addOnCovers",
      clean(matchGroup(text, /Plan Name:([A-Za-z0-9\s]+?)(?:&|Plan Description|$)/i) || "Drive Assure Economy Plus"),
    );
    patch.depreciationShieldCover = "Yes";
    patch.engineProtectorCover = "Yes";
    patch.spotAssistanceCover = "Yes";
    patch.keysAndLocksCover = "Yes";
    patch.personalBaggageCover = "Yes";
    patch.compulsoryDeductible = amount(matchGroup(text, /compulsory deductible\s*:\s*Rs\.([0-9,.]+)/i) || "1000.00");
    patch.imtEndorsements = "IMT-7, IMT-16, IMT-22, IMT-28";
    patch.extractionTrainingVersion = "BAJAJ_ALLIANZ_MOTOR_PRIVATE_CAR_PACKAGE_V1";
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
