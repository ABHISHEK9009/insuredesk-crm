const { normalizeAmount, sumAmounts } = require("../../utils/amounts.cjs");
const { matchGroup } = require("../../utils/regex.cjs");
const { cleanHdfcValue, sliceText } = require("../../utils/text.cjs");

const scope = { insurer: "hdfc-ergo", category: "health" };
const DATE = "\\d{1,2}[-/]\\d{1,2}[-/]\\d{4}";
const RELATIONSHIPS = "Self|Spouse|Wife|Husband|Son|Daughter|Father|Mother|Brother|Sister|Other";

const MONTHS = {
  jan: "01",
  feb: "02",
  mar: "03",
  apr: "04",
  may: "05",
  jun: "06",
  jul: "07",
  aug: "08",
  sep: "09",
  oct: "10",
  nov: "11",
  dec: "12",
};

function matches({ text = "" }) {
  if (!/HDFC\s*ERGO/i.test(text)) return false;
  if (/Private\s+Car|Two\s+Wheeler|Commercial\s+Vehicle|Goods\s+Carrying|Total\s+IDV|CSC\s+Name/i.test(text)) return false;

  return (
    /\bOptima\s+Secure\b/i.test(text) ||
    /\bOptima\s+Restore\b/i.test(text) ||
    /\bmy\s*:\s*health\b/i.test(text) ||
    /\bHealth\s*Suraksha\b/i.test(text) ||
    /\bHDFHLIP\d{5}[A-Z]\d{6}\b/i.test(text) ||
    /Health\s+insurance\s+policy\s+reference\s+no/i.test(text) ||
    (/Policy\s+Schedule/i.test(text) && /Health/i.test(text) && /Sum\s+Insured/i.test(text))
  );
}

function cleanPersonName(value = "") {
  let cleaned = cleanHdfcValue(value)
    .replace(/^(?:Mr|Mrs|Ms|Miss|Dr|MR|MRS|MS|MISS|DR)\.?\s+/i, "")
    .replace(/Policy\s+Type.*$/i, "")
    .replace(/Member\s+ID.*$/i, "")
    .replace(/Communication Address.*$/i, "")
    .replace(/\s+for\s+(?:the\s+)?period.*$/i, "")
    .replace(/MI$/i, "")
    .trim();

  if (/^(?:Gender|Member\s*ID|Date\s*of\s*Birth|Self|Spouse|Son|Daughter)$/i.test(cleaned)) {
    return "";
  }
  return cleaned;
}

function normalizeDate(value = "") {
  if (!value) return "";
  const dmyMatch = String(value).match(/(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
  if (dmyMatch) {
    return `${dmyMatch[1].padStart(2, "0")}/${dmyMatch[2].padStart(2, "0")}/${dmyMatch[3]}`;
  }
  const textMatch = String(value).match(/(\d{1,2})[-/\s]+([A-Za-z]{3,9})[-/\s]+(\d{4})/);
  if (textMatch) {
    const mStr = textMatch[2].slice(0, 3).toLowerCase();
    const month = MONTHS[mStr];
    if (month) {
      return `${textMatch[1].padStart(2, "0")}/${month}/${textMatch[3]}`;
    }
  }
  return "";
}

function formatAmount(value = "") {
  return value ? sumAmounts(value) : "";
}

function calculateAge(dateOfBirth = "", effectiveDate = "") {
  const [birthDay, birthMonth, birthYear] = dateOfBirth.split("/").map(Number);
  const [effectiveDay, effectiveMonth, effectiveYear] = effectiveDate.split("/").map(Number);
  if (!birthYear || !effectiveYear) return "";
  const beforeBirthday =
    effectiveMonth < birthMonth || (effectiveMonth === birthMonth && effectiveDay < birthDay);
  return String(effectiveYear - birthYear - (beforeBirthday ? 1 : 0));
}

function extractMemberRows(text = "") {
  const premiumSection = sliceText(text, /Insured\s+Person[’']s\s+Premium\s+Details/i, /\bNote\s*:/i);
  const pattern = new RegExp(
    `^([A-Za-z][A-Za-z .'-]+?)(${RELATIONSHIPS})(Male|Female|Other)(${DATE})\\d+(?:\\.\\d+)?$`,
    "gim",
  );
  return [...premiumSection.matchAll(pattern)].map((match) => ({
    name: cleanPersonName(match[1]),
    relationship: cleanHdfcValue(match[2]),
    gender: cleanHdfcValue(match[3]),
    dateOfBirth: normalizeDate(match[4]),
  }));
}

function extractInsuredMembers(text = "", policyStartDate = "", fallbackName = "") {
  const members = extractMemberRows(text);
  if (members.length === 0) {
    const list = [];
    const cardMatch = text.match(/Insured\s+Name\s*Member\s*ID[^\n]*\n\s*([A-Za-z\s]+?)(?=\d{10,20}|\n)/i);
    if (cardMatch) {
      const clean = cleanPersonName(cardMatch[1]);
      if (clean && clean.length > 2) list.push({ name: clean });
    }

    const memberMatches = text.match(/(?:MR|MRS|MS|MISS)\s+[A-Za-z\s]+?(?=\s+(?:Self|Spouse|Wife|Husband|Son|Daughter|Father|Mother|Brother|Sister|Other|\d{2}[-/]\d{2}[-/]\d{4}))/gi) || [];
    memberMatches.forEach((nm) => {
      const clean = cleanPersonName(nm);
      if (
        clean &&
        !list.some((m) => m.name === clean) &&
        !/Member\s+ID|Date\s+Of\s+Birth|shall\s+be\s+payable|geography/i.test(clean) &&
        clean.length > 2 &&
        clean.length < 50
      ) {
        list.push({ name: clean });
      }
    });

    if (list.length === 0 && fallbackName) {
      list.push({ name: cleanPersonName(fallbackName) });
    }
    return list;
  }

  const schedule = sliceText(
    text,
    /Insured\s+Person[’']s\s+Details\s+and\s+Sum\s+Insured/i,
    /The\s+nominee\s+must\s+be/i,
  ).replace(/\s+/g, "");

  return members
    .filter((m) => !/shall\s+be\s+payable|geography/i.test(m.name))
    .map((member, index) => {
      const marker = `${member.name}${member.relationship}${member.gender}${member.dateOfBirth}`.replace(
        /\s+/g,
        "",
      );
      const start = schedule.indexOf(marker);
      const nextMember = members[index + 1];
      const nextMarker = nextMember
        ? `${nextMember.name}${nextMember.relationship}${nextMember.gender}${nextMember.dateOfBirth}`.replace(
            /\s+/g,
            "",
          )
        : "";
      const end = nextMarker ? schedule.indexOf(nextMarker, start + marker.length) : schedule.length;
      const row = start >= 0 ? schedule.slice(start + marker.length, end >= 0 ? end : schedule.length) : "";
      const inceptionDate = normalizeDate(matchGroup(row, new RegExp(`(${DATE})`)));

      return {
        ...member,
        age: calculateAge(member.dateOfBirth, policyStartDate),
        abhaId: "",
        preExistingDiseases: "",
        firstPolicyInceptionDate: inceptionDate,
        specificConditions: "",
      };
    });
}

function extractNominee(text = "", members = []) {
  const primary = members[0];
  if (!primary) return {};
  const schedule = sliceText(
    text,
    /Insured\s+Person[’']s\s+Details\s+and\s+Sum\s+Insured/i,
    /The\s+nominee\s+must\s+be/i,
  ).replace(/\s+/g, "");
  const marker = `${primary.name}${primary.relationship}${primary.gender}${primary.dateOfBirth}`.replace(
    /\s+/g,
    "",
  );
  const row = schedule.slice(schedule.indexOf(marker) + marker.length);
  const match = row.match(
    /^(.+?)(Wife|Husband|Spouse|Son|Daughter|Father|Mother)(?=\d{1,2}[-/]\d{1,2}[-/]\d{4})/i,
  );
  const compactName = match?.[1] || "";
  const personKey = (value = "") =>
    String(value)
      .replace(/[^a-z]/gi, "")
      .toLowerCase();
  const nomineeKey = personKey(compactName);
  const nomineeKeyWithoutTitle = nomineeKey.replace(/^(?:mrs|miss|mr|ms|dr)/, "");
  const linkedMember = members.find((member) =>
    [nomineeKey, nomineeKeyWithoutTitle].includes(personKey(member.name)),
  );
  return {
    name: linkedMember?.name || compactName,
    relationship: cleanHdfcValue(match?.[2] || ""),
  };
}

function extractIntermediary(text = "") {
  const row = matchGroup(
    text,
    /Intermediary\s+NameIntermediary\s+CodeIntermediary\s+Contact\s+Number\s*\n([^\n]+)/i,
  );
  const mobile = matchGroup(row, /([6-9]\d{9})$/);
  const withoutMobile = mobile ? row.slice(0, -mobile.length).replace(/(?:\+?91[-\s]?)$/, "") : row;
  const code = matchGroup(withoutMobile, /(\d{8,})$/);
  const name = cleanHdfcValue(code ? withoutMobile.slice(0, -code.length) : withoutMobile);
  return { name, code, mobile };
}

function extractMailingAddress(text = "") {
  const block = matchGroup(text, /Email\s+ID\s*:[^\n]*\n[^\n]*\n([\s\S]+?)\nContact\s+No\s*:/i);
  return cleanHdfcValue(block.replace(/\s*\n\s*/g, " "));
}

function train({ text = "", result = {} }) {
  const policyPeriod = text.match(
    /for\s+(?:the\s+)?period\s+(?:of\s+)?([0-9A-Za-z/-]+)\s+to\s+([0-9A-Za-z/-]+)/i,
  ) || text.match(
    /Period\s+of\s+Insurance\s*:\s*From\s*([0-9A-Za-z/-]+)[\s\S]{0,50}?To\s*([0-9A-Za-z/-]+)/i,
  ) || text.match(
    /Period\s+of\s+Insurance\s*:\s*([0-9A-Za-z/-]+)\s*to\s*([0-9A-Za-z/-]+)/i,
  ) || text.match(
    /From:\s*([0-9A-Za-z/-]+)[\s\S]{0,30}?To:\s*([0-9A-Za-z/-]+)/i,
  );

  const startDate = normalizeDate(policyPeriod?.[1] || "");
  const expiryDate = normalizeDate(policyPeriod?.[2] || "");

  const holderMatch = text.match(/Policy\s+Holder[’']?s\s+Name\s*([^\n]+)/i) ||
    text.match(/issued\s+to\s+((?:MR|MRS|MS|Mr|Mrs|Ms|Miss|Dr)\.?\s+[A-Za-z .'-]+?)(?=\s+for\s+period|\s+for\s+the\s+period|\n)/i) ||
    text.match(/towards\s+premium\s+from\s+([A-Za-z .'-]+?)(?=\s+for\s+my:|\s+for\s+Optima|\n)/i) ||
    text.match(/Policyholder\s+Name\s*:\s*([A-Za-z .'-]+?)(?=Policy\s+Type|\n|Customer)/i) ||
    text.match(/Dear\s+((?:MR|MRS|MS|Mr|Mrs|Ms|Miss|Dr)\.?\s+[A-Za-z\s]+?)(?:,|\n|Thank|!)/i) ||
    text.match(/\*28\d{17}\*\s*\n\s*28\d{17}\s*\n\s*([A-Za-z\s]+?)\n/i) ||
    text.match(/2856\s*\n\s*((?:MR|MRS|MS|Mr|Mrs|Ms|Miss|Dr)\.?\s+[A-Za-z\s]+?)\n/i) ||
    text.match(/Policy\s+Schedule\s*\n+((?:MR|MRS|MS|Mr|Mrs|Ms|Miss|Dr)\.?\s+[A-Za-z\s]+?)\n/i);

  const rawHolder = holderMatch ? holderMatch[1].trim() : "";
  const policyholderName = rawHolder ? cleanPersonName(rawHolder) : result.customerName || result.insuredName;

  const insuredMembers = extractInsuredMembers(text, startDate, policyholderName);
  const primaryInsured = insuredMembers[0]?.name && !/Member\s+ID|Date\s+Of\s+Birth/i.test(insuredMembers[0].name)
    ? insuredMembers[0].name
    : policyholderName;

  const nominee = extractNominee(text, insuredMembers);
  const intermediary = extractIntermediary(text);

  const totalPremiumMatch = text.match(/(?:have\s*)?received\s*an?\s*amount\s*of\s*[^0-9\n]{0,5}\s*([0-9,.]+)/i) ||
    text.match(/has\s*paid\s*(?:Rs\.?)?\s*([0-9,.]+)/i) ||
    text.match(/Total\s+Premium\s*\(?Rs\.?\)?\s*[:\s]*([0-9,.]+)/i) ||
    text.match(/Total\s+Amount\s+Payable\s*:\s*Rs\.?\s*([0-9,.]+)/i) ||
    text.match(/Gross\s+Premium\s*[:\s]*([0-9,.]+)/i) ||
    text.match(/Total\s+Premium\s*[:\s]*([0-9,.]+)/i);

  const totalPremium = totalPremiumMatch ? normalizeAmount(totalPremiumMatch[1]) : result.totalPremium || result.grossPremium;

  const sumInsuredMatch = text.match(/Sum\s+Insured\s+opted\s*:\s*([0-9,.]+)/i) ||
    text.match(/Base\s+Sum\s+Insured\s*(?:per\s+[^\n]+)?\n\s*(?:Year[^\n]*\n\s*)?([0-9,.]+)/i) ||
    text.match(/Sum\s+Insured\s*\(?`?\)?\s*\n\s*(?:[A-Za-z\s]+)?([0-9]{5,8})/i) ||
    text.match(/Sum\s+Insured\s*(\d+)\s*Lakhs?/i) ||
    text.match(/Base\s+Sum\s+Insured\s*[:\s]*([0-9,.]+)/i) ||
    text.match(/Sum\s+Insured\s*\(?Rs\.?\)?\s*[:\s]*([0-9,.]+)/i);

  let rawSumInsured = sumInsuredMatch ? sumInsuredMatch[1] : "";
  if (/^\d+$/.test(rawSumInsured) && Number(rawSumInsured) <= 100) {
    rawSumInsured = String(Number(rawSumInsured) * 100000);
  }
  const sumInsured = rawSumInsured ? normalizeAmount(rawSumInsured) : result.sumInsured;

  let productName = "HDFC ERGO Health";
  if (/Optima\s+Secure/i.test(text)) productName = "Optima Secure";
  else if (/Optima\s+Restore/i.test(text)) productName = "Optima Restore";
  else if (/Health\s+Suraksha/i.test(text)) productName = "Health Suraksha";
  else if (/my\s*:\s*health/i.test(text)) productName = "my:health";

  const policyNumMatch = text.match(/Health\s+insurance\s+policy\s+reference\s+no\s*([0-9]{15,25})/i) ||
    text.match(/Policy\s+Number\s*:\s*([0-9 ]{15,25})/i) ||
    text.match(/Policy\s+No\s*:\s*([0-9 ]{15,25})/i) ||
    text.match(/Policy\s+No\.?\s*([0-9]{15,25})/i) ||
    text.match(/\b(28\d{14,20})\b/);

  const policyNumber = policyNumMatch ? policyNumMatch[1].replace(/\s+/g, "") : result.policyNumber;

  const customerId = matchGroup(text, /Customer\s+Id\s*:\s*(\d+)/i);
  const paymentReference = matchGroup(text, /Instrument\s+details\s*([A-Z]+\d+)(?=Date|\s|$)/i);
  const bankName = matchGroup(text, /Bank\s+Name\s*([A-Z0-9 ]+?)(?=Processing\s+Centre|\n)/i);

  return {
    productName,
    productUin: matchGroup(text, /UIN\s*:\s*(HDFHLIP\d{5}[A-Z]\d{6})/i) || result.productUin,
    policyNumber: policyNumber || result.policyNumber,
    policyType: matchGroup(text, /Policy\s+Type\s*:\s*([^\n]+)/i) || "Health Insurance",
    newOrRenewal: /Renewal/i.test(text) ? "Renewal" : "New",
    policyTenure: startDate && expiryDate ? "1 Year" : result.policyTenure,
    startDate: startDate || result.startDate,
    expiryDate: expiryDate || result.expiryDate,
    policyStartDate: startDate || result.policyStartDate || result.startDate,
    policyEndDate: expiryDate || result.policyEndDate || result.expiryDate,
    proposerName: policyholderName || result.proposerName,
    customerName: policyholderName || result.customerName,
    insuredName: primaryInsured || result.insuredName,
    contactPerson: policyholderName || result.contactPerson,
    contactNumber: "",
    mobileNumber: "",
    customerMobile: "",
    email: "",
    customerEmail: "",
    mailingAddress: extractMailingAddress(text) || result.mailingAddress,
    communicationAddress: extractMailingAddress(text) || result.communicationAddress,
    policyholderEmailMasked: matchGroup(text, /Email\s+ID\s*:\s*([^\n]+)/i),
    policyholderMobileMasked: matchGroup(text, /Contact\s+No\s*:\s*([0-9Xx*]+)/i),
    invoiceNumber: matchGroup(text, /Invoice\s+No\.\s*:\s*([0-9]+)/i),
    customerId: customerId || result.customerId,
    sumInsured: sumInsured ? formatAmount(sumInsured) : result.sumInsured,
    totalSumInsured: sumInsured ? formatAmount(sumInsured) : result.totalSumInsured,
    basicPremium: totalPremium ? formatAmount(totalPremium) : result.basicPremium,
    netPremium: totalPremium ? formatAmount(totalPremium) : result.netPremium,
    taxAmount: "0.00",
    gstAmount: "0.00",
    totalPremium: totalPremium ? formatAmount(totalPremium) : result.totalPremium,
    grossPremium: totalPremium ? formatAmount(totalPremium) : result.grossPremium,
    premiumIncludingGst: totalPremium ? formatAmount(totalPremium) : result.premiumIncludingGst,
    premium: totalPremium ? formatAmount(totalPremium) : result.premium,
    previousPolicyNumber:
      matchGroup(text, /Previous\s+Policy\s*:\s*([0-9]+)/i) || result.previousPolicyNumber,
    nomineeName: nominee.name || result.nomineeName,
    nomineeRelationship: nominee.relationship || result.nomineeRelationship,
    insuredMembers: insuredMembers.length > 0 ? insuredMembers : result.insuredMembers || [],
    numberOfInsuredMembers: insuredMembers.length,
    agentName: intermediary.name || result.agentName,
    agentCode: intermediary.code || result.agentCode,
    agentMobile: intermediary.mobile || result.agentMobile,
    paymentReference: paymentReference || result.paymentReference,
    bankName: cleanHdfcValue(bankName) || result.bankName,
    servicingBranchAddress: matchGroup(text, /Branch\s*:\s*([^\n]+)/i) || result.servicingBranchAddress,
    vehicleNumber: "",
    registrationNumber: "",
    makeModel: "",
    vehicleMake: "",
    vehicleModel: "",
    variant: "",
    manufacturingYear: "",
    registrationDate: "",
    engineNumber: "",
    chassisNumber: "",
    fuelType: "",
    cubicCapacity: "",
    seatingCapacity: "",
    grossVehicleWeight: "",
    idv: "",
    totalPackagePremium: "",
    ncb: "",
    rtoLocation: "",
    policyCoverType: "",
    cscContactNumber: "",
    confidenceScore: 0.98,
    extractionMethod: "scoped_training",
    extractionQuality: {
      quality: "ready_for_review",
      schemaName: "HDFC ERGO Optima Secure Health training",
      schemaVersion: 1,
      schemaMatch: 1,
      understandingConfidence: 1,
      schemaLoadError: "",
      warnings: [],
    },
    policyUnderstanding: {},
    schemaExtraction: {},
    fieldConfidence: {},
    extractionTrainingVersion: "HDFC_ERGO_HEALTH_OPTIMA_SECURE_V1",
  };
}

module.exports = { scope, matches, train };
