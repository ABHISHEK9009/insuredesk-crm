const { normalizeAmount, sumAmounts } = require("../../utils/amounts.cjs");
const { matchGroup } = require("../../utils/regex.cjs");
const { cleanHdfcValue, sliceText } = require("../../utils/text.cjs");

const scope = { insurer: "tata-aig", category: "health" };

function matches({ text = "" }) {
  return (
    /TATA\s*AIG/i.test(text) &&
    /Medicare|Health\s*AdvantEdge|TATHLIP|Health\s*Card|80\s*D\s*Certi/i.test(text) &&
    !/Private\s+Car|Auto\s*Secure|Two\s+Wheeler|Commercial\s+Vehicle/i.test(text)
  );
}

function normalizeDate(value = "") {
  const match = String(value).match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  return match ? `${match[1].padStart(2, "0")}/${match[2].padStart(2, "0")}/${match[3]}` : "";
}

function formatAmount(value = "") {
  return value ? sumAmounts(value) : "";
}

function cleanPersonName(value = "") {
  return cleanHdfcValue(value)
    .replace(/^(?:Mrs|Miss|Mr|Ms|Dr|Shri|Smt)\.?\s+/i, "")
    .replace(/\s*\.\s*$/, "")
    .trim();
}

function calculateAge(dateOfBirth = "", effectiveDate = "") {
  const [birthDay, birthMonth, birthYear] = dateOfBirth.split("/").map(Number);
  const [effectiveDay, effectiveMonth, effectiveYear] = (effectiveDate || "").split("/").map(Number);
  if (!birthYear || !effectiveYear) return "";
  const beforeBirthday =
    effectiveMonth < birthMonth || (effectiveMonth === birthMonth && effectiveDay < birthDay);
  return String(effectiveYear - birthYear - (beforeBirthday ? 1 : 0));
}

function extractInsuredMembers(text = "", policyStartDate = "") {
  const section = sliceText(text, /Insured\s+Person\s+Details:/i, /Sum\s+Insured/i);
  if (!section) return [];

  const nameBlock = matchGroup(section, /Insured\s+Person['’]?s\s+Name\s*\n([^\n]+)/i);
  const dobBlock = matchGroup(section, /Date\s+of\s+Birth\s*\n?([0-9/]+)/i);
  const relBlock = matchGroup(section, /Relationship\s+to\s+Proposer\s*\n([^\n]+)/i);
  const memberIdBlock = matchGroup(section, /Member\s+ID\s*\n?([A-Z0-9]+)/i);

  const splitRegex = /([a-z])([A-Z])/g;
  const names = nameBlock
    ? nameBlock.replace(splitRegex, (m, p1, p2) => `${p1}|${p2}`).split("|").map(cleanPersonName).filter(Boolean)
    : [];
  const dobs = dobBlock ? (dobBlock.match(/\d{2}\/\d{2}\/\d{4}/g) || []).map(normalizeDate) : [];
  const rels = relBlock
    ? relBlock.replace(splitRegex, (m, p1, p2) => `${p1}|${p2}`).split("|").map((r) => r.replace(/\s*\d+$/, "").trim())
    : [];
  const memberIds = memberIdBlock ? (memberIdBlock.match(/ZZZZ\d+/g) || []) : [];

  if (names.length === 0) return [];

  return names.map((name, idx) => {
    const dob = dobs[idx] || "";
    return {
      name,
      dateOfBirth: dob,
      age: dob ? calculateAge(dob, policyStartDate) : "",
      memberId: memberIds[idx] || "",
      relationship: rels[idx] || (idx === 0 ? "Self" : "Member"),
    };
  });
}

function extractNominee(text = "") {
  const m = text.match(
    /Nominee\s+Details\s+for\s+Proposer:\s*\n+Nominee\s+Name\s*Relationship\s*To\s*Policyholder\s*\n+([A-Za-z\s.'-]+?)(Wife|Husband|Spouse|Son|Daughter|Father|Mother|Brother|Sister|Other)/i,
  );
  if (m) {
    return {
      name: cleanPersonName(m[1]),
      relationship: cleanHdfcValue(m[2]),
    };
  }
  return {};
}

function extractIntermediary(text = "") {
  const m = text.match(
    /Intermediary\s+Name\s*Intermediary\s+Code\s*Intermediary\s+Contact\s*No\.?\s*\n+([A-Za-z\s.'-]+?)(\d{8})([0-9-]+)/i,
  );
  if (m) {
    return {
      name: cleanHdfcValue(m[1]),
      code: m[2],
      mobile: m[3],
    };
  }
  return {};
}

function extractMailingAddress(text = "") {
  const m1 = text.match(/Address:\s*\n+([\s\S]+?)(?=\nContact\s+No)/i);
  if (m1) return cleanHdfcValue(m1[1].replace(/\n/g, " "));

  const m2 = text.match(/Policy\s*Holder['’]?s\s*Permanent\s+Address\s*\n+([\s\S]+?)(?=\nPolicy\s*Holder)/i);
  return m2 ? cleanHdfcValue(m2[1].replace(/\n/g, " ")) : "";
}

function train({ text = "", result = {} }) {
  const policyNumMatch = text.match(/Policy\s+Number\s*([0-9A-Z-]+)/i) ||
    text.match(/Policy\s+No\.?\s*([0-9A-Z-]+)/i);

  const policyNumber = policyNumMatch ? policyNumMatch[1].trim() : result.policyNumber;

  const holderMatch = text.match(/Policy\s+Holder['’]?s\s+Name\s*([^\n]+)/i) ||
    text.match(/Hello\s+([A-Za-z\s]+?)[!,\n]/i) ||
    text.match(/Name:\s*\n\s*([A-Za-z\s]+?)\n/i) ||
    text.match(/Name\s*\(Mr\/Mrs\/Ms\/Dr\)\s*([A-Za-z\s]+?)\n/i);

  const rawHolder = holderMatch ? holderMatch[1].trim() : "";
  const cleanHolder = rawHolder ? cleanPersonName(rawHolder) : result.customerName || result.insuredName;

  const periodMatch = text.match(/Policy\s+Period\s*From:\s*([0-9/]+)[\s\S]{0,30}?To:\s*([0-9/]+)/i) ||
    text.match(/Proposed\s+Policy\s+Period\s*:\s*([0-9/]+)[\s\S]{0,30}?To\s*([0-9/]+)/i) ||
    text.match(/From:\s*([0-9/]+)[\s\S]{0,30}?To:\s*([0-9/]+)/i);

  const policyStartDate = periodMatch ? normalizeDate(periodMatch[1]) : result.policyStartDate || result.startDate;
  const policyEndDate = periodMatch ? normalizeDate(periodMatch[2]) : result.policyEndDate || result.expiryDate;

  const grossPremMatch = text.match(/Total\s+Premium\s+Paid\s*\(Inclusive\s+of\s+Loading\)\s*([0-9,.]+)/i) ||
    text.match(/Premium\s+amount\s+of\s+Rs\s*([0-9,.]+)/i) ||
    text.match(/Premium\s+Amount\s*\(in\s*₹\)\s*:\s*([0-9,.]+)/i) ||
    text.match(/Gross\s+Premium\s*\(₹\)\s*[:\s]*([0-9,.]+)/i) ||
    text.match(/Gross\s+Premium[^\n]*\n\s*([0-9,.]+)/i);

  const totalPremium = grossPremMatch ? normalizeAmount(grossPremMatch[1]) : result.totalPremium || result.grossPremium;

  const netPremMatch = text.match(/Net\s+Premium\s*\(₹\)\s*[:\s]*([0-9,.]+)/i) ||
    text.match(/Net\s+Premium[^\n]*\n\s*([0-9,.]+)/i);

  const netPremium = netPremMatch ? normalizeAmount(netPremMatch[1]) : totalPremium;

  const sumInsMatch = text.match(/Sum\s+Insured\s*\(₹\)#?\s*([0-9,]+)/i) ||
    text.match(/Sum\s+Insured#?\s*([0-9,]+)/i) ||
    text.match(/Sum\s+Insured\s*[:\s]*([0-9,]+)/i);

  const sumInsured = sumInsMatch ? normalizeAmount(sumInsMatch[1]) : result.sumInsured;

  const prodMatch = text.match(/Product\s+Name\s*([^\n]+)/i) ||
    text.match(/TATA\s+AIG\s+Medicare/i);

  const productName = prodMatch ? prodMatch[1] ? prodMatch[1].trim() : prodMatch[0].trim() : "TATA AIG Medicare";

  const planType = matchGroup(text, /Plan\s+Type\s*([A-Za-z]+)/i);
  const businessType = matchGroup(text, /Business\s+Type\s*([A-Za-z]+)/i);
  const clientId = matchGroup(text, /Client\s+ID\s*([A-Z0-9]+)/i);
  const proposalNumber = matchGroup(text, /Proposal\s+No\.?\s*([^\n]+)/i);
  const contactNumber = matchGroup(text, /Contact\s+No\.?\s*:\s*\n?([0-9]{10})/i);

  const members = extractInsuredMembers(text, policyStartDate);
  const nominee = extractNominee(text);
  const intermediary = extractIntermediary(text);
  const address = extractMailingAddress(text);

  const primaryInsured = members[0]?.name || cleanHolder;

  return {
    productName,
    policyNumber: policyNumber || result.policyNumber,
    policyType: planType ? `Health Insurance (${planType})` : "Health Insurance",
    policyCoverType: planType || result.policyCoverType,
    insuredName: primaryInsured || result.insuredName,
    customerName: cleanHolder || result.customerName,
    proposerName: cleanHolder || result.proposerName,
    contactPerson: cleanHolder || result.contactPerson,
    policyStartDate,
    startDate: policyStartDate,
    policyEndDate,
    expiryDate: policyEndDate,
    totalPremium: totalPremium ? formatAmount(totalPremium) : result.totalPremium,
    grossPremium: totalPremium ? formatAmount(totalPremium) : result.grossPremium,
    premium: totalPremium ? formatAmount(totalPremium) : result.premium,
    premiumIncludingGst: totalPremium ? formatAmount(totalPremium) : result.premiumIncludingGst,
    netPremium: netPremium ? formatAmount(netPremium) : totalPremium,
    basicPremium: netPremium ? formatAmount(netPremium) : totalPremium,
    sumInsured: sumInsured ? formatAmount(sumInsured) : result.sumInsured,
    totalSumInsured: sumInsured ? formatAmount(sumInsured) : result.totalSumInsured,
    insuredMembers: members.length > 0 ? members : (cleanHolder ? [{ name: cleanHolder }] : result.insuredMembers || []),
    numberOfInsuredMembers: members.length || 1,
    nomineeName: nominee.name || result.nomineeName,
    nomineeRelationship: nominee.relationship || result.nomineeRelationship,
    agentName: intermediary.name || result.agentName,
    agentCode: intermediary.code || result.agentCode,
    agentMobile: intermediary.mobile || result.agentMobile,
    mailingAddress: address || result.mailingAddress,
    communicationAddress: address || result.communicationAddress,
    newOrRenewal: /Renewal/i.test(businessType) ? "Renewal" : "New",
    customerId: clientId || result.customerId,
    proposalNumber: proposalNumber || result.proposalNumber,
    contactNumber: contactNumber || result.contactNumber,
    customerMobile: contactNumber || result.customerMobile,
    mobileNumber: contactNumber || result.mobileNumber,
    extractionTrainingVersion: "TATA_AIG_HEALTH_V1",
  };
}

module.exports = { scope, matches, train };
