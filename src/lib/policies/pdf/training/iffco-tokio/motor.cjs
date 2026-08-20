const { normalizeAmount } = require("../../utils/amounts.cjs");
const { buildDuration } = require("../../utils/dates.cjs");
const { cleanHdfcValue } = require("../../utils/text.cjs");

const scope = { insurer: "iffco-tokio", category: "motor" };

function matches({ text = "", result = {} }) {
  const company = String(result.insuranceCompany || result.companyName || "");
  const format = String(result.documentFormat || "");
  const isIffcoCompany = /IFFCO\s*[- ]?\s*TOKIO/i.test(company) || /IFFCO\s*[- ]?\s*TOKIO/i.test(text);
  const isMotor = /Motor|Private\s+Car|Two\s+Wheeler|Commercial\s+Vehicle|Insured\s+Motor\s+Vehicle/i.test(
    result.documentCategory || result.policyType || format || text
  );
  return isIffcoCompany && isMotor;
}

function clean(value = "") {
  return cleanHdfcValue(value)
    .replace(/^(?:Mr|Mrs|Ms|Miss|Dr|Shri|Smt|MR|MRS|MS|MISS|DR|SHRI|SMT)\.?\s+/i, "")
    .replace(/\s*Policy\s*#.*$/i, "")
    .replace(/\s*Tax\s+Invoice.*$/i, "")
    .trim();
}

function normalizeDate(value = "") {
  if (!value) return "";
  const dmyMatch = String(value).match(/(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
  if (dmyMatch) {
    return `${dmyMatch[1].padStart(2, "0")}/${dmyMatch[2].padStart(2, "0")}/${dmyMatch[3]}`;
  }
  return "";
}

function extractPremiumBifurcation(text = "") {
  const idx = text.indexOf("Premium Bifurcation");
  if (idx === -1) return null;

  const block = text.slice(idx, idx + 450);

  // Case A: 6 dense numbers -> Sec1, Sec2, Sec3, TaxableValue, GST, TotalInvoice
  const match6 = block.match(
    /(\d{1,7}\.\d{2})\s*(\d{1,7}\.\d{2})\s*(\d{1,7}\.\d{2})\s*(\d{1,7}\.\d{2})\s*([0-9,]{1,9}\.\d{2})\s*([0-9,]{1,9}\.\d{2})/
  );
  if (match6) {
    const sec1 = normalizeAmount(match6[1]);
    const sec2 = normalizeAmount(match6[2]);
    const sec3 = normalizeAmount(match6[3]);
    const taxableNet = normalizeAmount(match6[4]);
    const gst = normalizeAmount(match6[5]);
    const totalInvoice = normalizeAmount(match6[6]);

    return {
      sec1,
      sec2,
      sec3,
      netPremium: taxableNet,
      gstAmount: gst,
      totalPremium: totalInvoice,
      hasAddons: Boolean(parseFloat(sec2 || 0) > 0 || parseFloat(sec3 || 0) > 0),
    };
  }

  // Case B: 5 dense numbers -> Sec1, Sec2, TaxableValue, GST, TotalInvoice
  const match5 = block.match(
    /(\d{1,7}\.\d{2})\s*(\d{1,7}\.\d{2})\s*(\d{1,7}\.\d{2})\s*([0-9,]{1,9}\.\d{2})\s*([0-9,]{1,9}\.\d{2})/
  );
  if (match5) {
    const sec1 = normalizeAmount(match5[1]);
    const sec2 = normalizeAmount(match5[2]);
    const taxableNet = normalizeAmount(match5[3]);
    const gst = normalizeAmount(match5[4]);
    const totalInvoice = normalizeAmount(match5[5]);

    return {
      sec1,
      sec2,
      sec3: "0.00",
      netPremium: taxableNet,
      gstAmount: gst,
      totalPremium: totalInvoice,
      hasAddons: Boolean(parseFloat(sec2 || 0) > 0),
    };
  }

  return null;
}

function train({ text = "", result = {} }) {
  if (!result || typeof result !== "object") return result;

  const patch = {};

  // 1. Policy Number & Invoices
  const p400Match = text.match(/P400\s+Policy\s*#\s*:\s*([A-Z0-9]+)/i);
  const polScheduleMatch = text.match(/Policy\s+No\.?[\s….:]+([A-Z0-9]+)/i);
  const polNumMatch = text.match(/Policy\s*#\s*:\s*([A-Z0-9-]+)/i);
  
  if (p400Match) {
    patch.policyNumber = p400Match[1].trim();
    if (polNumMatch && polNumMatch[1].trim() !== patch.policyNumber) {
      patch.uniqueInvoiceNumber = polNumMatch[1].trim();
      patch.invoiceNumber = polNumMatch[1].trim();
    }
  } else if (polScheduleMatch) {
    patch.policyNumber = polScheduleMatch[1].trim();
  } else if (polNumMatch) {
    patch.policyNumber = polNumMatch[1].trim();
  }

  const taxInvMatch = text.match(/Tax\s+Invoice\s+No\s*:\s*([A-Z0-9-]+)/i);
  if (taxInvMatch) {
    patch.taxInvoiceNumber = taxInvMatch[1].trim();
    patch.invoiceNumber = patch.invoiceNumber || taxInvMatch[1].trim();
  }

  const origInvMatch = text.match(/Original\s+Invoice\s+No\.?\s*([A-Z0-9-]+)/i);
  const uniqInvMatch = text.match(/Unique\s+Invoice\s+No\.?\s*([A-Z0-9-]+)/i);
  if (origInvMatch) patch.originalInvoiceNumber = origInvMatch[1].trim();
  if (uniqInvMatch) {
    patch.uniqueInvoiceNumber = uniqInvMatch[1].trim();
    patch.invoiceNumber = uniqInvMatch[1].trim();
  }

  // 2. Insured / Customer Name
  const correctNameMatch = text.match(/CORRECT\s+INSURED\s+NAME\s*-\s*([^\n]+)/i);
  const insuredNameColonMatch = text.match(/Insured'?s?\s*Name:\s*([A-Z\s]+?)(?=\s*Policy\s*#:|\s*Tax\s+Invoice|\s*Original|\s*Unique|\n|$)/i);
  const rawName = correctNameMatch ? correctNameMatch[1] : (insuredNameColonMatch ? insuredNameColonMatch[1] : "");
  const cleanName = clean(rawName);
  if (cleanName) {
    patch.insuredName = cleanName;
    patch.customerName = cleanName;
    patch.proposerName = cleanName;
  }

  // 3. Address & Contact
  const addressMatch = text.match(/Address:\s*([\s\S]+?)(?=\s*Invoice\/Issuance|State\s+Code|GSTIN|Phone|Pin\s+Code|\n\n)/i);
  if (addressMatch) {
    patch.address = addressMatch[1]
      .replace(/Unique\s+Invoice\s+No\.?[^\n]*/gi, "")
      .replace(/Policy\s+No\.?[^\n]*/gi, "")
      .replace(/Date\s+of\s+Issuance[^\n]*/gi, "")
      .replace(/Original\s+Invoice\s+No\.?[^\n]*/gi, "")
      .replace(/Endorsement\s+Effec?itve\s+Date[^\n]*/gi, "")
      .replace(/Invoice\/Issuance\s+Date[^\n]*/gi, "")
      .replace(/Period\s+of\s+Insurance[^\n]*/gi, "")
      .replace(/\s+/g, " ")
      .trim();
  }
  const pinMatch = text.match(/Pin\s+Code\s*:?\s*(\d{6})/i);
  if (pinMatch) patch.pinCode = pinMatch[1].trim();

  const phoneMatch = text.match(/Pin\s+Code[\s\S]*?Phone\s*#?\s*:\s*([0-9X]+)/i) ||
    text.match(/Intermediary\s+Mobile\s*#?\s*:\s*([0-9X]+)/i) ||
    text.match(/Phone\s*#?\s*:\s*([0-9X]+)/i);
  if (phoneMatch) patch.contactNumber = phoneMatch[1].trim();

  // 4. Dates
  const issueDateMatch = text.match(/(?:Invoice\/Issuance\s+Date|Date\s+of\s+Issuance)\s*:\s*(\d{1,2}\/\d{1,2}\/\d{4})/i);
  if (issueDateMatch) patch.policyIssueDate = normalizeDate(issueDateMatch[1]);

  const endEffDateMatch = text.match(/Endorsement\s+Effec?itve\s+Date\s*:\s*(\d{1,2}\/\d{1,2}\/\d{4})/i);
  if (endEffDateMatch) patch.endorsementEffectiveDate = normalizeDate(endEffDateMatch[1]);

  const policyDatesMatch = text.match(/From\s*:\s*(\d{1,2}\/\d{1,2}\/\d{4})[\s\S]{0,30}?To\s*:\s*(?:Midnight\s+On\s*)?(\d{1,2}\/\d{1,2}\/\d{4})/i) ||
    text.match(/Policy\s+effective\s+from[^\d]*(\d{1,2}\/\d{1,2}\/\d{4})[^\d]*To\s+MidNight\s*(\d{1,2}\/\d{1,2}\/\d{4})/i) ||
    text.match(/effective\s+from[\s\S]{0,30}?(\d{1,2}\/\d{1,2}\/\d{4})[\s\S]{0,30}?To\s+(?:MidNight\s+)?(\d{1,2}\/\d{1,2}\/\d{4})/i);
  if (policyDatesMatch) {
    patch.startDate = normalizeDate(policyDatesMatch[1]);
    patch.expiryDate = normalizeDate(policyDatesMatch[2]);
    patch.policyStartDate = patch.startDate;
    patch.policyEndDate = patch.expiryDate;
    patch.duration = buildDuration(patch.startDate, patch.expiryDate);
  }

  // 5. Intermediary
  const agentMatch = text.match(/Intermediary\s*(?:No\.?|#)?\s*[:.]?\s*(\d+)/i);
  if (agentMatch) {
    patch.agentCode = agentMatch[1].trim();
    patch.intermediaryNo = agentMatch[1].trim();
  }
  const agentNameMatch = text.match(/Intermediary\s+Name\s*:\s*([^\n]+)/i);
  if (agentNameMatch) patch.intermediaryName = clean(agentNameMatch[1]);
  const agentMobileMatch = text.match(/Intermediary\s+Mobile\s*#?\s*:\s*(\d+)/i);
  if (agentMobileMatch) patch.intermediaryMobile = agentMobileMatch[1].trim();

  // 6. Vehicle Details
  const regMatch = text.match(/([A-Z]{2}\d{1,2}[A-Z]{1,3}\d{4})(?=\d{4}|\b|\s)/i) ||
    text.match(/\b([A-Z]{2}\d{1,2}[A-Z]{1,3}\d{4})\b/i);
  if (regMatch) {
    patch.registrationNumber = regMatch[1].trim().toUpperCase();
    patch.vehicleNumber = patch.registrationNumber;
  }

  const yomMatch = text.match(/[A-Z]{2}\d{1,2}[A-Z]{1,3}\d{4}(20\d{2})/i) ||
    text.match(/\b(20\d{2})\s+Make\s+of\s+Vehicle/i) ||
    text.match(/\b(20\d{2})\s+-\s+([A-Z0-9\s]+?)\s+(\d{2,4})\s+Own/i) ||
    text.match(/Year\s+of\s+Manuf\.?[\s\S]{0,50}?\b(20\d{2})\b/i);
  if (yomMatch) patch.manufacturingYear = yomMatch[1].trim();

  const mmChassMatch = text.match(/(TVS\s+JUPITER\s+DRUM|TVS\s+[A-Z0-9\s-]+?)(MD\d{3}[A-Z0-9]{12}|[A-Z0-9]{17})/i);
  if (mmChassMatch) {
    const rawMm = mmChassMatch[1].replace(/\s+/g, " ").trim();
    patch.makeModel = rawMm;
    const parts = rawMm.split(" ");
    patch.vehicleMake = parts[0] || rawMm;
    patch.vehicleModel = parts.slice(1).join(" ") || rawMm;
    patch.chassisNumber = mmChassMatch[2].replace(/\s+/g, "").slice(0, 17);
  } else {
    const makeModelMatch = text.match(/Make\s+of\s+Vehicle[\s\S]{0,40}?(TVS\s+[A-Z0-9\s]+?)(?=\s+MD626|\s+KG5GS|\s+Own|\n)/i) ||
      text.match(/-\s*([A-Z0-9\s]+?)\s+(\d{2,4})\s+Own/i) ||
      text.match(/Make\s+of\s+Vehicle[\s\S]{0,80}?\n\s*(?:-\s*)?([A-Z0-9\s]+?)(?=\s+\d{2,4}|\n)/i);
    if (makeModelMatch) {
      const rawMm = makeModelMatch[1].replace(/\s+/g, " ").trim();
      patch.makeModel = rawMm;
      const parts = rawMm.split(" ");
      patch.vehicleMake = parts[0] || rawMm;
      patch.vehicleModel = parts.slice(1).join(" ") || rawMm;
    }
  }

  const ccIdvMatch = text.match(/(\d{2,4})\s*Stand\s*Alone\s*OD\s*([0-9,.]+)/i);
  if (ccIdvMatch) {
    patch.cubicCapacity = ccIdvMatch[1].trim();
    patch.idv = normalizeAmount(ccIdvMatch[2]);
    patch.totalIdv = patch.idv;
  } else {
    const ccMatch = text.match(/\bCC\b[\s\S]{0,60}?\b(\d{2,4})\b/i) ||
      text.match(/(\d{2,4})\s+Stand\s+Alone\s+OD/i) ||
      text.match(/(\d{2,4})\s+Own\s+Damage/i);
    if (ccMatch) patch.cubicCapacity = ccMatch[1].trim();

    const idvMatch = text.match(/Stand\s+Alone\s+OD\s+([0-9,.]+)/i) ||
      text.match(/\bOwn\s+Damage\s+only\s+(\d{4,8})\b/i) ||
      text.match(/IDV\s+in[\s\S]{0,40}?\b(\d{4,8}(?:\.\d{2})?)\b/i) ||
      text.match(/Two\s+Wheeler[\s\S]{0,40}?\b(\d{4,8}(?:\.\d{2})?)\b/i);
    if (idvMatch) {
      patch.idv = normalizeAmount(idvMatch[1]);
      patch.totalIdv = patch.idv;
    }
  }

  const engMatch = text.match(/KG5GS\d+[\s\r\n]*\d+/i) ||
    text.match(/Engine\s+No\.?[\s\S]{0,40}?([A-Z0-9\s]{6,20})(?=\s+MD626|MD|\n\d)/i);
  if (engMatch) {
    patch.engineNumber = engMatch[0].replace(/\s+/g, "").trim();
  }

  if (!patch.chassisNumber) {
    const chassMatch = text.match(/MD626[A-Z0-9\s]{12,20}/i) ||
      text.match(/Chassis\s+No\.?[\s\S]{0,80}?([A-Z0-9\s]{14,25})(?=\s+\d|\n\s*\d)/i);
    if (chassMatch) {
      const rawChass = chassMatch[0].replace(/\s+/g, "").trim();
      patch.chassisNumber = rawChass.slice(0, 17);
    }
  }

  const seatsMatch = text.match(/Chassis\s+No\.[\s\S]{0,30}?\b([1-9])\b/i) ||
    text.match(/MD626[A-Z0-9\s]+?\d{2}\s*\n+(\d)\b/i) ||
    text.match(/Seating\s+Capacity[\s\S]{0,80}?\b([1-9])\b/i);
  if (seatsMatch) patch.seatingCapacity = seatsMatch[1].trim();

  // 7. Product & Category
  const isTwoWheeler = /Two\s+Wheeler/i.test(text);
  const isEndorsement = /Endorsement/i.test(text);
  patch.productName = isTwoWheeler ? "Two Wheeler Policy" : (isEndorsement ? "Motor Endorsement" : "Motor Policy");
  patch.policyType = patch.productName;
  patch.policyCategory = "Motor";

  // 8. Endorsement Remarks
  if (isEndorsement) {
    const remarkLines = [];
    if (/CORRECTION\s+IN\s+NAME/i.test(text)) remarkLines.push("CORRECTION IN NAME");
    if (correctNameMatch) remarkLines.push(`CORRECT INSURED NAME - ${clean(correctNameMatch[1])}`);
    if (remarkLines.length > 0) patch.endorsementRemarks = remarkLines.join(" : ");
  }

  // 9. Third Party (TP) Policy Details
  const tpInsurerMatch = text.match(/TP\s+Insurer\s+Name\s*:\s*([^\n]+)/i);
  if (tpInsurerMatch) patch.tpInsurerName = clean(tpInsurerMatch[1]);
  const tpPolMatch = text.match(/TP\s+Policy\s+Number\s*:\s*([A-Z0-9]+)/i);
  if (tpPolMatch) patch.tpPolicyNumber = tpPolMatch[1].trim();
  const tpStartMatch = text.match(/TP\s+Start\s+Date\s*:\s*(\d{1,2}\/\d{1,2}\/\d{4})/i);
  if (tpStartMatch) patch.tpStartDate = normalizeDate(tpStartMatch[1]);
  const tpEndMatch = text.match(/TP\s+End\s+Date\s*:\s*(\d{1,2}\/\d{1,2}\/\d{4})/i);
  if (tpEndMatch) patch.tpEndDate = normalizeDate(tpEndMatch[1]);

  // 10. NCB Discount
  const ncbPctMatch = text.match(/No\s+Claim\s+Bonus\s+Discount\s*\(\s*(\d+)\s*%\s*\)/i);
  if (ncbPctMatch) patch.ncbPercentage = ncbPctMatch[1].trim();
  const ncbAmtMatch = text.match(/No\s+Claim\s+Bonus\s+Discount[^\n]*-([0-9,.]+)/i);
  if (ncbAmtMatch) patch.ncbDiscount = normalizeAmount(ncbAmtMatch[1]);

  // 11. Premium Bifurcation / Financials
  const bifurcation = extractPremiumBifurcation(text);
  if (bifurcation) {
    if (bifurcation.netPremium) {
      patch.netPremium = bifurcation.netPremium;
      patch.basicPremium = bifurcation.netPremium;
    }
    if (bifurcation.gstAmount) {
      patch.gstAmount = bifurcation.gstAmount;
      patch.taxAmount = bifurcation.gstAmount;
    }
    if (bifurcation.totalPremium) {
      patch.totalPremium = bifurcation.totalPremium;
      patch.grossPremium = bifurcation.totalPremium;
      patch.premiumIncludingGst = bifurcation.totalPremium;
      patch.premium = bifurcation.totalPremium;
    }
  } else {
    // Check invoice table on page 2 e.g. Taxable Value / Total Value
    const invMatch = text.match(/Taxable\s+Value[\s\S]*?Amount\s*([0-9,.]+)\s*([0-9,.]+)\s*([0-9,.]+)\s*([0-9,.]+)\s*([0-9,.]+)/i);
    const totTaxMatch = text.match(/Total\s+Tax\s*₹?\s*([0-9,.]+)/i);
    const totValMatch = text.match(/Total\s+Tax[^\n]*\s+Total\s+Value\s*₹?\s*([0-9,.]+)/i) ||
      text.match(/Total\s+Value\s*₹?\s*([0-9,.]+)/i);

    if (invMatch) {
      patch.netPremium = normalizeAmount(invMatch[1]);
      patch.basicPremium = patch.netPremium;
    }
    if (totTaxMatch) {
      patch.gst = normalizeAmount(totTaxMatch[1]);
      patch.taxAmount = patch.gst;
    }
    if (totValMatch) {
      patch.totalPremium = normalizeAmount(totValMatch[1]);
      patch.grossPremium = patch.totalPremium;
      patch.premium = patch.totalPremium;
      patch.premiumIncludingGst = patch.totalPremium;
    }
  }

  patch.extractionTrainingVersion = "IFFCO_TOKIO_MOTOR_V2";

  return patch;
}

module.exports = {
  scope,
  matches,
  train,
};
