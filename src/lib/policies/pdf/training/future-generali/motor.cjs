const { matchGroup } = require("../../utils/regex.cjs");

const scope = { insurer: "future-generali", category: "motor" };

function matches({ text = "", result = {} }) {
  const company = String(result.insuranceCompany || result.companyName || "");
  if (/(?:Future\s+Generali|Generali\s+Central)/i.test(company)) return true;
  const header = text.slice(0, 3000);
  if (/ICICI\s*Lombard|TATA\s*AIG|HDFC\s*ERGO|Bajaj\s*Allianz|THE\s+NEW\s+INDIA/i.test(header)) return false;
  return /\b(?:Future\s+Generali|Generali\s+Central|generalicentral\.com)\b/i.test(header);
}

function cleanAmount(val) {
  if (!val) return "";
  const s = String(val).replace(/,/g, "").trim();
  const num = parseFloat(s);
  return isNaN(num) ? "" : num.toFixed(2);
}

function normalizeDate(raw) {
  if (!raw) return "";
  const m = raw.match(/(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{4})/);
  if (m) {
    return `${m[1].padStart(2, "0")}/${m[2].padStart(2, "0")}/${m[3]}`;
  }
  return raw;
}

function train({ text = "", result = {}, _sourceFile = "" }) {
  if (!result || typeof result !== "object") return result;

  const patch = {
    insuranceCompany: "Future Generali India Insurance Company Limited",
    companyName: "Future Generali India Insurance Company Limited",
    documentCategory: "Motor Insurance",
    documentFormat: "FUTURE_GENERALI_MOTOR_V1",
    sourceDocumentType: "FUTURE_GENERALI_MOTOR_V1",
    extractionTrainingVersion: "FUTURE_GENERALI_MOTOR_V1",
    policyCategory: "Motor",
    policyCoverType: "Comprehensive",
  };

  // 1. Policy Number & Invoices
  const polMatch =
    matchGroup(text, /Policy\s+No\.?\s*:?\s*(132[A-Z0-9/-]+)/i) ||
    matchGroup(text, /Policy\s+Number\s*:?\s*(132[A-Z0-9/-]+)/i) ||
    matchGroup(text, /\b(132\/\d{2}\/\d{2}\/[A-Z0-9/]+)\b/i);
  if (polMatch) {
    patch.policyNumber = polMatch.trim();
  }

  const invMatch =
    matchGroup(text, /([A-Z0-9]+)\s*:\s*Invoice\s+Number/i) ||
    matchGroup(text, /Invoice\s+Number\s*:?\s*([A-Z0-9]+)/i);
  if (invMatch) {
    patch.taxInvoiceNumber = invMatch.trim();
    patch.invoiceNumber = invMatch.trim();
    patch.uniqueInvoiceNumber = invMatch.trim();
  }

  // 2. Insured Name & Contact
  const nameMatch =
    matchGroup(text, /Dear\s+([A-Z0-9\s.,]+?)(?=\n\s*Welcome)/i) ||
    matchGroup(text, /Name\s+of\s+Insured\/Proposer\s*\n\s*:?\s*([A-Z0-9\s.,]+?)(?=\s*Address|\n\s*Address)/i);
  if (nameMatch) {
    const cleaned = nameMatch.replace(/\s+/g, " ").trim();
    patch.insuredName = cleaned;
    patch.customerName = cleaned;
    patch.proposerName = cleaned;
    patch.contactPerson = cleaned;
  }

  const addrMatch = text.match(/Address\s*:\s*(\d+,\s*[^\n]+[\s\S]*?Pincode\s*:\s*\d{6})/i);
  if (addrMatch) {
    patch.address = addrMatch[1].replace(/\s+/g, " ").trim();
  }

  const pinMatch = matchGroup(text, /Pincode\s*:\s*(\d{6})/i) || matchGroup(text, /\b(\d{6})\b/);
  if (pinMatch) patch.pinCode = pinMatch.trim();

  const custGstinMatch = text.match(/(?:^|\n)\s*GSTIN\s*(?:\/\s*UIN\s*)?Number\s*:\s*([0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1})/i);
  if (custGstinMatch) {
    patch.gstin = custGstinMatch[1].trim();
    patch.customerGstin = patch.gstin;
  }

  const panMatch = text.match(/(?:^|\n)\s*PAN\s*Number\s*:\s*([A-Z]{5}[0-9]{4}[A-Z]{1})/i);
  if (panMatch) patch.panNumber = panMatch[1].trim();

  const phoneMatch =
    matchGroup(text, /Telephone\(Mob,Hom\)\s*:\s*(\d{10})/i) ||
    matchGroup(text, /Telephone\s*\(Mob,Off\)\s*:\s*([0-9xX*]+)/i);
  if (phoneMatch) {
    patch.contactNumber = phoneMatch.trim();
    patch.customerMobile = phoneMatch.trim();
  }

  const allEmails = [...text.matchAll(/Email\s+ID\s*:?\s*([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})/gi)].map((m) => m[1]);
  const custEmail = allEmails.find((e) => !/generalicentral/i.test(e));
  if (custEmail) {
    patch.email = custEmail.trim();
    patch.customerEmail = patch.email;
  }

  // 3. Dates
  const periodMatch =
    text.match(/From\s+\d{2}:\d{2}(?:\s+hours)?\s+of\s+(\d{2}\/\d{2}\/\d{4})\s+To\s+Midnight\s+of\s+(\d{2}\/\d{2}\/\d{4})/i) ||
    text.match(/Period\s+of\s+Insurance\s*:?\s*From\s+[^\d]*(\d{2}\/\d{2}\/\d{4})[^\d]*To[^\d]*(\d{2}\/\d{2}\/\d{4})/i);
  if (periodMatch) {
    patch.startDate = normalizeDate(periodMatch[1]);
    patch.expiryDate = normalizeDate(periodMatch[2]);
    patch.policyStartDate = patch.startDate;
    patch.policyEndDate = patch.expiryDate;
  }

  const issueDateMatch =
    matchGroup(text, /Date\s+of\s+Issue\s*:\s*(\d{2}\/\d{2}\/\d{4})/i) ||
    matchGroup(text, /Date\s*:\s*(\d{2}\/\d{2}\/\d{4})/i);
  if (issueDateMatch) {
    patch.policyIssueDate = normalizeDate(issueDateMatch);
    patch.invoiceDate = patch.policyIssueDate;
  }

  // 4. Intermediary Details
  const intMatch =
    text.match(/Intermediary\s+Name\s*(?:\/\s*Code)?\s*:?\s*([A-Z\s]+)-(\d+)/i) ||
    text.match(/Intermediary\s+Name\s*:\s*([A-Z\s]+)-(\d+)/i);
  if (intMatch) {
    patch.intermediaryName = intMatch[1].trim();
    patch.agentCode = intMatch[2].trim();
    patch.intermediaryNo = patch.agentCode;
  }

  // 5. Vehicle Details
  const vehTableMatch = text.match(
    /([A-Z]{2}[-\s]?\d{1,2}[-\s]?[A-Z]{1,3}[-\s]?\d{4}),\s*([A-Z\s]+?)(KIA|HYUNDAI|MARUTI|TATA|MAHINDRA|HONDA|TOYOTA|VOLKSWAGEN|SKODA|NISSAN|RENAULT|MG|BMW|MERCEDES|AUDI|FORD|CHEVROLET|JEEP|BAJAJ|HERO|ROYAL\s+ENFIELD|TVS|YAMAHA|SUZUKI)\s+([^\n]+)\n([^\n]+)\n([A-Z0-9]+)/i
  );

  if (vehTableMatch) {
    patch.registrationNumber = vehTableMatch[1].toUpperCase().trim();
    patch.vehicleNumber = patch.registrationNumber;
    patch.rtoLocation = vehTableMatch[2].trim();
    patch.vehicleMake = vehTableMatch[3].trim();
    patch.vehicleModel = `${vehTableMatch[4]} ${vehTableMatch[5]}`.trim();
    patch.makeModel = `${patch.vehicleMake} ${patch.vehicleModel}`.trim();

    const engChass = vehTableMatch[6].trim();
    if (engChass.length >= 17) {
      patch.chassisNumber = engChass.slice(-17);
      patch.engineNumber = engChass.slice(0, -17);
    }
  }

  const specMatch = text.match(/(\d{4})(\d{3,5})([A-Za-z]+)(\d{1,2})([1-9][0-9,]*\.\d{2})/);
  if (specMatch) {
    patch.manufacturingYear = specMatch[1];
    patch.cubicCapacity = specMatch[2];
    patch.bodyType = specMatch[3];
    patch.seatingCapacity = specMatch[4];
  }

  // 6. IDV
  const idvMatch =
    text.match(/(?:TotalIDV|For\s+Vehicle[^\n]*)\n([0-9,]+(?:\.\d{2})?)/i) ||
    text.match(/([0-9]{1,3}(?:,[0-9]{2,3})+)\.00(?:\.00)*Year\s+1/i);
  if (idvMatch) {
    const val = cleanAmount(idvMatch[1] || idvMatch[0]);
    patch.idv = val;
    patch.totalIdv = val;
    patch.sumInsured = val;
  }

  // 7. Product Name
  const prodMatch =
    matchGroup(text, /(Motor\s+Protect\s+Private\s+Car\s+Package\s+Policy)/i) ||
    matchGroup(text, /(Motor\s+Secure\s+insurance\s+policy)/i) ||
    matchGroup(text, /(Private\s+Car\s+Package\s+Policy)/i);
  patch.productName = prodMatch || "Motor Protect Private Car Package Policy";
  patch.policyType = "Private Car Package Policy";

  // 8. Hypothecation
  const finMatch = text.match(/Hypothecation\s+Agreement\s+with\s*:?-?\s*(?:\d\))?(?:Hypothecation\s*-\s*)?([A-Z\s]+?)(?=\n\s*(?:SPECIAL|ADDITIONAL|The\s+nominee))/i);
  if (finMatch) {
    patch.financerName = finMatch[1].replace(/\s+/g, " ").trim();
    patch.hypothecationDetails = patch.financerName;
  }

  // 9. Financials
  const odMatch = matchGroup(text, /Total\s+Own\s+Damage\s+Premium\s*\(A\)[^\d]*([0-9,.]+(?:\.\d{2})?)/i);
  if (odMatch) patch.odPremium = cleanAmount(odMatch);

  const tpMatch = matchGroup(text, /Total\s+Liability\s+Premium\s*\(B\)[^\d]*([0-9,.]+(?:\.\d{2})?)/i);
  if (tpMatch) patch.tpPremium = cleanAmount(tpMatch);

  const netMatch =
    matchGroup(text, /Total\s+Premium\s+for\s+the\s+Policy\s+Period\s*([0-9,.]+(?:\.\d{2})?)/i) ||
    matchGroup(text, /Gross\s+Premium\s*([0-9,.]+(?:\.\d{2})?)/i) ||
    matchGroup(text, /Total\s+Annual\s+Premium\s*\(A\+B\)\s*([0-9,.]+(?:\.\d{2})?)/i);
  if (netMatch) {
    patch.netPremium = cleanAmount(netMatch);
    patch.basicPremium = patch.netPremium;
  }

  const cgstMatch = matchGroup(text, /Add\s*:\s*CGST\s*([0-9,]+(?:\.\d{2})?)/i);
  if (cgstMatch) patch.cgst = cleanAmount(cgstMatch);
  const sgstMatch = matchGroup(text, /Add\s*:\s*SGST\s*([0-9,]+(?:\.\d{2})?)/i);
  if (sgstMatch) patch.sgst = cleanAmount(sgstMatch);

  const gstMatch = matchGroup(text, /Goods\s+and\s+Service\s+Tax\s*([0-9,]+(?:\.\d{2})?)/i);
  if (gstMatch) {
    patch.gstAmount = cleanAmount(gstMatch);
    patch.taxAmount = patch.gstAmount;
  } else if (patch.cgst && patch.sgst) {
    patch.gstAmount = (parseFloat(patch.cgst) + parseFloat(patch.sgst)).toFixed(2);
    patch.taxAmount = patch.gstAmount;
  }

  const totalMatch =
    matchGroup(text, /Total\s*\(Rounded\s+to\s+the\s+nearest\s+rupee\)\s*([0-9,.]+(?:\.\d{2})?)/i) ||
    matchGroup(text, /Total\s+Premium\s*\(rounded\s+off\)\s*([0-9,.]+(?:\.\d{2})?)/i);
  if (totalMatch) {
    patch.totalPremium = cleanAmount(totalMatch);
    patch.grossPremium = patch.totalPremium;
    patch.premiumIncludingGst = patch.totalPremium;
    patch.premium = patch.totalPremium;
  }

  const ncbMatch =
    matchGroup(text, /No\s+Claim\s+Discount\s*\(\s*(\d{1,2}\s*%)\s*\)/i) ||
    matchGroup(text, /NCB\s+has\s+been\s+allowed\s*(\d{1,2}\s*%)/i);
  if (ncbMatch) {
    patch.ncb = ncbMatch.replace(/\s+/g, "");
    patch.ncbPercentage = patch.ncb.replace("%", "");
  }

  return patch;
}

module.exports = {
  scope,
  matches,
  train,
};
