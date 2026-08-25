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
    /\bEnergy\s*\(/i.test(text) ||
    /\bHDFHLIP\d{5}[A-Z]\d{6}\b/i.test(text) ||
    /Health\s+insurance\s+policy\s+reference\s+no/i.test(text) ||
    (/Policy\s+Schedule/i.test(text) && /Health/i.test(text) && /Sum\s+Insured/i.test(text))
  );
}

function cleanPersonName(value = "") {
  let cleaned = cleanHdfcValue(value)
    .replace(/^(?:Mrs|Miss|Mr|Ms|Dr|Shri|Smt|MRS|MISS|MR|MS|DR|SHRI|SMT)\.?\s+/i, "")
    .replace(/Policy\s+Type.*$/i, "")
    .replace(/Member\s+ID.*$/i, "")
    .replace(/Communication Address.*$/i, "")
    .replace(/\s+for\s+(?:the\s+)?period.*$/i, "")
    .replace(/MI$/i, "")
    .replace(/\s{2,}/g, " ")
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
  const premiumSection = sliceText(text, /Insured\s+Person['\u2018\u2019]s\s+Premium\s+Details/i, /\bNote\s*:/i);
  const pattern = new RegExp(
    `^([A-Za-z][A-Za-z .'-]+?)(${RELATIONSHIPS})(Male|Female|Other)(${DATE})\\d+(?:\\.\\d+)?$`,
    "gim",
  );
  const results = [...premiumSection.matchAll(pattern)].map((match) => ({
    name: cleanPersonName(match[1]),
    relationship: cleanHdfcValue(match[2]),
    gender: cleanHdfcValue(match[3]),
    dateOfBirth: normalizeDate(match[4]),
  }));
  if (results.length > 0) return results;

  // Multiline receipt block pattern (Optima Secure+ format)
  const blockPattern = new RegExp(
    `(?:\\d{2}-\\d{2}-\\d{4})\\s*([A-Za-z][A-Za-z\\s.'-]+?)\\s*(${RELATIONSHIPS})\\s*(Male|Female|Other)\\s*(\\d{2}-\\d{2}-\\d{4})`,
    "gi",
  );
  const blockResults = [];
  let bm;
  while ((bm = blockPattern.exec(premiumSection)) !== null) {
    const name = cleanPersonName(bm[1].replace(/\s+/g, " "));
    const dob = normalizeDate(bm[4]);
    if (name && !blockResults.some((x) => x.name.toLowerCase() === name.toLowerCase())) {
      blockResults.push({
        name,
        relationship: cleanHdfcValue(bm[2]),
        gender: cleanHdfcValue(bm[3]),
        dateOfBirth: dob,
      });
    }
  }
  return blockResults;
}

function extractOptimaSecurePlusMembers(text = "", policyStartDate = "") {
  const section = sliceText(
    text,
    /Insured\s+Person.?s\s+Details\s+and\s+Sum\s+Insured\s*.{0,5}\s*Optima\s+Secure/i,
    /Where\s+Nominee\s+is\s+a\s+minor|1st\s+inception\s+date/i,
  );
  if (!section || section.length < 50) return { members: [], nominee: {} };

  const premiumMembers = extractMemberRows(text);
  const members = premiumMembers.map((m) => ({
    ...m,
    age: calculateAge(m.dateOfBirth, policyStartDate),
  }));

  // Extract nominee from section
  let nominee = {};
  const nomineePattern = new RegExp(
    `(?:${RELATIONSHIPS})(?:Male|Female|Other)\\s*\\d{1,2}\\s*(?:\\d{2}[-/]\\d{2}[-/]\\d{4})\\s*([\\s\\S]+?)\\s*(${RELATIONSHIPS})\\s*(?:\\d{2}[-/]\\d{2}[-/]\\d{4})`,
    "i",
  );
  const nomineeMatch = section.match(nomineePattern);
  if (nomineeMatch) {
    let rawNomineeName = nomineeMatch[1].replace(/\s*\n\s*/g, " ").replace(/\s{2,}/g, " ").trim();
    rawNomineeName = rawNomineeName.replace(/([A-Z]{3,})\s+([A-Z]{1,3})\b/g, "$1$2");
    nominee = {
      name: cleanPersonName(rawNomineeName),
      relationship: cleanHdfcValue(nomineeMatch[2]),
    };
  }

  return { members, nominee };
}

function extractEnergyMembers(text = "", policyStartDate = "") {
  const section = sliceText(
    text,
    /Insured\s+Persons\s+Details/i,
    /Nominee\s+Details/i,
  );
  if (!section || section.length < 30) return [];

  const members = [];
  const namePattern = /(?:MR|MRS|MS|MISS|DR)\.?\s+([A-Z][A-Z .'-]+?)\n/gi;
  let nm;
  while ((nm = namePattern.exec(section)) !== null) {
    const name = cleanPersonName(nm[0]);
    if (!name || name.length < 2) continue;
    const isFemale = /\b(?:MRS|MS|MISS)\b/i.test(nm[0]);
    const isMale = /\bMR\b/i.test(nm[0]);
    const gender = isFemale ? "Female" : isMale ? "Male" : "";
    const dobMatch = section.slice(nm.index).match(/(\d{2}\/\d{2}\/\d{4})/);
    const dob = dobMatch ? dobMatch[1] : "";
    const ageMatch = section.slice(nm.index).match(/\((\d{1,3})\s*\)/);

    const firstInceptionMatch = text.match(/First\s+policy\s+inception\s+date\s*[:\s]*(\d{2}[-/]\d{2}[-/]\d{4})/i);
    const firstPolicyInceptionDate = firstInceptionMatch ? normalizeDate(firstInceptionMatch[1]) : "";

    members.push({
      name,
      relationship: "Self",
      gender,
      dateOfBirth: dob,
      age: dob ? (calculateAge(dob, policyStartDate) || (ageMatch ? ageMatch[1] : "")) : (ageMatch ? ageMatch[1] : ""),
      abhaId: "",
      preExistingDiseases: "",
      firstPolicyInceptionDate,
      specificConditions: "",
    });
  }
  return members;
}

function extractStandardNominee(text = "") {
  const section = sliceText(text, /Nominee\s+Details/i, /Premium\s+Calculation|The\s+nominee\s+must|Schedule\s+of\s+Benefits/i);
  const nameMatch = section.match(/Nominee\s+Name\s*:\s*(?:Mrs|Miss|Mr|Ms|Dr)?\.?\s*([A-Za-z][A-Za-z .'-]+?)(?=Relationship|\n)/i);
  const relMatch = section.match(/Relationship\s*(?:to\s+Policyholder)?\s*:\s*([A-Za-z]+)/i);
  return {
    name: nameMatch ? cleanPersonName(nameMatch[1]) : "",
    relationship: relMatch ? cleanHdfcValue(relMatch[1]) : "",
  };
}

function extractInsuredMembers(text = "", policyStartDate = "", fallbackName = "") {
  const members = extractMemberRows(text);
  if (members.length === 0) {
    const energy = extractEnergyMembers(text, policyStartDate);
    if (energy.length > 0) return energy;

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
  // Case 1: Intermediary NameIntermediary CodeIntermediary Contact Number
  const row1 = matchGroup(
    text,
    /Intermediary\s+NameIntermediary\s+CodeIntermediary\s+Contact\s+Number\s*\n([^\n]+)/i,
  );
  if (row1) {
    const mobile = matchGroup(row1, /([6-9]\d{9})$/);
    const withoutMobile = mobile ? row1.slice(0, -mobile.length).replace(/(?:\+?91[-\s]?)$/, "") : row1;
    const code = matchGroup(withoutMobile, /(\d{8,})$/);
    const name = cleanHdfcValue(code ? withoutMobile.slice(0, -code.length) : withoutMobile);
    return { name, code, mobile };
  }

  // Case 2: Intermediary CodeIntermediary Name Intermediary Contact Number
  const block2 = sliceText(
    text,
    /Intermediary\s+CodeIntermediary\s+Name\s*Intermediary\s+Contact\s+Number/i,
    /Renewal|Dear|Policy\s+Holder|\n\n/i,
  );
  if (block2) {
    const lines = block2.split("\n").map((l) => l.trim()).filter(Boolean).slice(1);
    const full = lines.join(" ");
    const codeMatch = full.match(/^(\d{8,12})/);
    const code = codeMatch ? codeMatch[1] : "";
    const rem = code ? full.slice(code.length).trim() : full;
    const mobileMatch = rem.match(/((?:91[- ]?)?[6-9]\d{9})$/);
    const mobile = mobileMatch ? mobileMatch[1].replace(/^91-?/, "") : "";
    const nameRaw = mobileMatch ? rem.slice(0, -mobileMatch[0].length) : rem;
    const name = cleanHdfcValue(nameRaw.replace(/^INSURANCE\s+MARKETING\s+FIRM\s*:\s*/i, ""));
    if (name) return { name, code, mobile };
  }

  const name = matchGroup(text, /Intermediary\s+Name\s*[:\n]\s*([^\n]+)/i);
  const code = matchGroup(text, /Intermediary\s+Code\s*[:\n]\s*([A-Z0-9]+)/i);
  const mobile = matchGroup(text, /Intermediary\s+Contact\s*(?:Number|No)\.?\s*[:\n]\s*([0-9-]+)/i);
  return { name: cleanHdfcValue(name), code, mobile };
}

function extractMailingAddress(text = "") {
  const comm = matchGroup(
    text,
    /Communication\s+Address\s*:\s*\n([\s\S]+?)(?=\n(?:Contact\s+No|XXX|Policy\s+No|Dear|\n\n))/i,
  );
  if (comm) return cleanHdfcValue(comm.replace(/\s*\n\s*/g, " "));

  const holderAddr = matchGroup(
    text,
    /Policy\s*Holder[’']?s\s+Address\s*([^\n]+)/i,
  );
  if (holderAddr) return cleanHdfcValue(holderAddr);

  const block = matchGroup(text, /Email\s+ID\s*:[^\n]*\n[^\n]*\n([\s\S]+?)\nContact\s+No\s*:/i);
  if (block) return cleanHdfcValue(block.replace(/\s*\n\s*/g, " "));

  const corr = matchGroup(text, /Correspondence\s+Address\s*\n([\s\S]+?)(?=GSTIN|Renewal|Contact\s+Number|Email\s+ID)/i);
  return corr ? cleanHdfcValue(corr.replace(/\s*\n\s*/g, " ")) : "";
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

  const holderMatch = text.match(/Policy\s+Holder['']?s\s+Name\s*([^\n]+)/i) ||
    text.match(/Policyholder\s+Name\s*\n?\s*([A-Za-z\s.'-]+?)(?=Policy\s+Number|Customer)/i) ||
    text.match(/issued\s+to\s+((?:MR|MRS|MS|Mr|Mrs|Ms|Miss|Dr)\.?\s+[A-Za-z .'-]+?)(?=\s+for\s+period|\s+for\s+the\s+period|\n)/i) ||
    text.match(/towards\s+premium\s+from\s+([A-Za-z .'-]+?)(?=\s+for\s+my:|\s+for\s+Optima|\s+for\s+Energy|\n)/i) ||
    text.match(/Dear\s+((?:MR|MRS|MS|Mr|Mrs|Ms|Miss|Dr)\.?\s+[A-Za-z\s]+?)(?:,|\n|Thank|!)/i) ||
    text.match(/\*28\d{17}\*\s*\n\s*28\d{17}\s*\n\s*([A-Za-z\s]+?)\n/i) ||
    text.match(/2856\s*\n\s*((?:MR|MRS|MS|Mr|Mrs|Ms|Miss|Dr)\.?\s+[A-Za-z\s]+?)\n/i) ||
    text.match(/Policy\s+Schedule\s*\n+((?:MR|MRS|MS|Mr|Mrs|Ms|Miss|Dr)\.?\s+[A-Za-z\s]+?)\n/i);

  const rawHolder = holderMatch ? holderMatch[1].trim() : "";
  const policyholderName = rawHolder ? cleanPersonName(rawHolder) : result.customerName || result.insuredName;

  // Extract members using standard extractor first
  const stdMembers = extractInsuredMembers(text, startDate, policyholderName);
  const securePlus = extractOptimaSecurePlusMembers(text, startDate);
  const energyMembers = stdMembers.length === 0 ? extractEnergyMembers(text, startDate) : [];
  const insuredMembers = stdMembers.length > 0
    ? stdMembers
    : energyMembers.length > 0
      ? energyMembers
      : securePlus.members;

  const finalMembers = insuredMembers.length > 0 ? insuredMembers : (policyholderName ? [{ name: policyholderName }] : result.insuredMembers || []);

  const primaryInsured = finalMembers[0]?.name && !/Member\s+ID|Date\s+Of\s+Birth/i.test(finalMembers[0].name)
    ? finalMembers[0].name
    : policyholderName;

  // Nominee: try Optima Secure+ inline nominee, then standard nominee, then existing extractor
  const standardNominee = extractStandardNominee(text);
  const nominee = securePlus.nominee?.name
    ? securePlus.nominee
    : standardNominee.name
      ? standardNominee
      : extractNominee(text, insuredMembers);
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
  else if (/Energy\s*\(/i.test(text)) {
    const variant = text.match(/Energy\s*\(([^)]+)\)/i);
    productName = variant ? `Energy (${cleanHdfcValue(variant[1])})` : "Energy";
  }

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
    issuanceDate: matchGroup(text, /Policy\s+Issuance\s+Date\s*[:\s]*(\d{2}[-/]\d{2}[-/]\d{4})/i) || result.issuanceDate,
    firstPolicyInceptionDate: matchGroup(text, /First\s+policy\s+inception\s+date\s*[:\s]*(\d{2}[-/]\d{2}[-/]\d{4})/i) || finalMembers[0]?.firstPolicyInceptionDate || "",
    firstInceptionDate: matchGroup(text, /First\s+policy\s+inception\s+date\s*[:\s]*(\d{2}[-/]\d{2}[-/]\d{4})/i) || finalMembers[0]?.firstPolicyInceptionDate || "",
    inceptionDate: matchGroup(text, /First\s+policy\s+inception\s+date\s*[:\s]*(\d{2}[-/]\d{2}[-/]\d{4})/i) || finalMembers[0]?.firstPolicyInceptionDate || "",
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
    insuredMembers: finalMembers,
    numberOfInsuredMembers: finalMembers.length,
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
