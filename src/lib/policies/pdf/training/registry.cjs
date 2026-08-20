const tataAigWarehouse = require("./tata-aig/warehouse.cjs");
const iciciLombardHealth = require("./icici-lombard/health.cjs");
const hdfcErgoHealth = require("./hdfc-ergo/health.cjs");
const unitedIndiaHealth = require("./united-india/health.cjs");
const tataAigHealth = require("./tata-aig/health.cjs");
const careHealthHealth = require("./care-health/health.cjs");
const iffcoTokioMotor = require("./iffco-tokio/motor.cjs");
const tataAigMotor = require("./tata-aig/motor.cjs");
const libertyMotor = require("./liberty/motor.cjs");
const goDigitMotor = require("./go-digit/motor.cjs");
const newIndiaMotor = require("./new-india/motor.cjs");
const bajajAllianzMotor = require("./bajaj-allianz/motor.cjs");
const royalSundaramMotor = require("./royal-sundaram/motor.cjs");
const unitedIndiaWarehouse = require("./united-india/warehouse.cjs");
const unitedIndiaBurglary = require("./united-india/burglary.cjs");

const trainers = [
  tataAigWarehouse,
  iciciLombardHealth,
  hdfcErgoHealth,
  unitedIndiaHealth,
  tataAigHealth,
  careHealthHealth,
  iffcoTokioMotor,
  tataAigMotor,
  libertyMotor,
  goDigitMotor,
  newIndiaMotor,
  bajajAllianzMotor,
  royalSundaramMotor,
  unitedIndiaWarehouse,
  unitedIndiaBurglary,
];
const protectedScopeFields = [
  "sourceFile",
  "insuranceCompany",
  "companyName",
  "documentCategory",
  "documentFormat",
  "sourceDocumentType",
];

function normalizeInsurer(value = "") {
  const insurer = String(value).trim();
  const known = [
    [/ICICI\s+Lombard/i, "icici-lombard"],
    [/TATA\s*AIG/i, "tata-aig"],
    [/IFFCO\s*Tokio/i, "iffco-tokio"],
    [/Bajaj\s*Allianz/i, "bajaj-allianz"],
    [/United\s+India/i, "united-india"],
    [/New\s+India/i, "new-india"],
    [/HDFC\s*ERGO/i, "hdfc-ergo"],
    [/Care\s*Health|Religare/i, "care-health"],
    [/(?:Future\s+)?Generali/i, "generali"],
    [/Royal\s+Sundaram/i, "royal-sundaram"],
    [/Shriram/i, "shriram"],
    [/Liberty/i, "liberty"],
    [/(?:Go\s+)?Digit/i, "go-digit"],
  ];
  return known.find(([pattern]) => pattern.test(insurer))?.[1] || slug(insurer);
}

function normalizeCategory(value = "") {
  const category = String(value).trim();
  const known = [
    [/Motor/i, "motor"],
    [/Warehouse/i, "warehouse"],
    [/Fire/i, "fire"],
    [/Health/i, "health"],
    [/Marine/i, "marine"],
    [/Burglary/i, "burglary"],
    [/Fidelity/i, "fidelity"],
    [/Workm(?:e|a)n(?:'s)?\s+Compensation/i, "workmen-compensation"],
  ];
  return known.find(([pattern]) => pattern.test(category))?.[1] || slug(category);
}

function slug(value = "") {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function isIciciLombardHealth(result = {}, context = {}) {
  const insurer = result.insuranceCompany || result.companyName || "";
  if (insurer && !/ICICI\s+Lombard/i.test(insurer)) return false;

  const text = String(context.text || result.sourceText || "");
  if (!/ICICI\s+Lombard/i.test(text)) return false;
  if (/Private\s+Car|Two\s+Wheeler|Goods\s+Carrying|Commercial\s+Vehicle/i.test(text)) return false;

  return (
    /ELEVATE|ICIHLIP|Complete\s+Health|Health\s+Shield/i.test(text) ||
    (/\bPolicyholder\s+Details\b/i.test(text) && /\bInsured\s+Details\b/i.test(text))
  );
}

function isHdfcErgoHealth(result = {}, context = {}) {
  const insurer = result.insuranceCompany || result.companyName || "";
  if (insurer && !/HDFC\s*ERGO/i.test(insurer)) return false;

  const text = String(context.text || result.sourceText || "");
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

function isUnitedIndiaHealth(result = {}, context = {}) {
  const insurer = result.insuranceCompany || result.companyName || "";
  if (insurer && !/United\s+India/i.test(insurer)) return false;

  const text = String(context.text || result.sourceText || "");
  const header = text.slice(0, 4000);
  if (!/UNITED\s+INDIA\s+INSURANCE/i.test(text)) return false;
  if (/Private\s+Car|Two\s+Wheeler|Goods\s+Carrying|Commercial\s+Vehicle|Registration\s+No/i.test(header)) return false;

  return /INDIVIDUAL\s+HEALTH\s+INSURANCE|HEALTH\s+POLICY\s+SCHEDULE|UIIHLIP/i.test(header);
}

function isTataAigHealth(result = {}, context = {}) {
  const insurer = result.insuranceCompany || result.companyName || "";
  if (insurer && !/TATA\s*AIG/i.test(insurer)) return false;

  const text = String(context.text || result.sourceText || "");
  if (!/TATA\s*AIG/i.test(text)) return false;
  if (/Auto\s*Secure|Private\s+Car|Two\s+Wheeler|Commercial\s+Vehicle/i.test(text)) return false;

  return /Medicare|Health\s*AdvantEdge|TATHLIP|Health\s*Card|80\s*D\s*Certi/i.test(text);
}

function isCareHealth(result = {}, context = {}) {
  const insurer = result.insuranceCompany || result.companyName || "";
  if (insurer && !/Care\s*Health|Religare/i.test(insurer)) return false;

  const text = String(context.text || result.sourceText || "");
  return /Care\s*Health|careinsurance\.com|Religare/i.test(text);
}

function isGoDigitMotor(result = {}, context = {}) {
  const text = String(context.text || result.sourceText || "");
  if (/TATA\s*AIG|tataaig\.com|customersupport@tataaig\.com/i.test(text)) return false;
  return (
    /Go\s+Digit|godigit\.com|Digit\s+Two-Wheeler/i.test(text) &&
    /Motor|Two-Wheeler|Private\s+Car|Commercial\s+Vehicle/i.test(result.documentCategory || result.policyType || text)
  );
}

function isNewIndiaMotor(result = {}, context = {}) {
  const text = String(context.text || result.sourceText || "");
  const category = normalizeCategory(result.documentCategory);
  if (category && category !== "motor") return false;
  const insurer = result.insuranceCompany || result.companyName || "";
  if (insurer && /TATA\s*AIG|ICICI\s*Lombard|Bajaj|HDFC\s*ERGO|Shriram|Liberty|Digit/i.test(insurer)) {
    return false;
  }
  return (
    /THE\s+NEW\s+INDIA\s+ASSURANCE|NEW\s+INDIA\s+ASSURANCE|newindia\.co\.in/i.test(text) &&
    /Motor|Private\s+Car|Two\s+Wheeler|Commercial\s+Vehicle/i.test(result.documentCategory || result.policyType || text)
  );
}

function isTataAigMotor(result = {}, context = {}) {
  const text = String(context.text || result.sourceText || "");
  const category = normalizeCategory(result.documentCategory || result.policyType);
  if (category && category !== "motor") return false;
  return (
    /TATA\s*AIG|tataaig\.com|customersupport@tataaig\.com/i.test(text) &&
    /Auto\s*Secure|Private\s+Car\s+Package\s+Policy|Vehicle\s+Details|Chassis\s+No/i.test(text)
  );
}

function deriveTrainingScope(result = {}, context = {}) {
  if (isIciciLombardHealth(result, context)) {
    return { insurer: "icici-lombard", category: "health" };
  }
  if (isHdfcErgoHealth(result, context)) {
    return { insurer: "hdfc-ergo", category: "health" };
  }
  if (isUnitedIndiaHealth(result, context)) {
    return { insurer: "united-india", category: "health" };
  }
  if (isTataAigHealth(result, context)) {
    return { insurer: "tata-aig", category: "health" };
  }
  if (isCareHealth(result, context)) {
    return { insurer: "care-health", category: "health" };
  }

  const insurer = isTataAigMotor(result, context)
    ? "tata-aig"
    : isGoDigitMotor(result, context)
    ? "go-digit"
    : isNewIndiaMotor(result, context)
      ? "new-india"
      : normalizeInsurer(result.insuranceCompany || result.companyName);
  return {
    insurer,
    category: normalizeCategory(result.documentCategory),
  };
}

function establishTrainingIdentity(result = {}, context = {}) {
  if (isIciciLombardHealth(result, context)) {
    return {
      ...result,
      insuranceCompany: "ICICI Lombard General Insurance Company Limited",
      companyName: "ICICI Lombard General Insurance Company Limited",
      documentCategory: "Health Insurance",
      documentFormat: "ICICI_LOMBARD_HEALTH_ELEVATE_V1",
      sourceDocumentType: "ICICI_LOMBARD_HEALTH_ELEVATE_V1",
    };
  }
  if (isHdfcErgoHealth(result, context)) {
    return {
      ...result,
      insuranceCompany: "HDFC ERGO General Insurance Company Limited",
      companyName: "HDFC ERGO General Insurance Company Limited",
      documentCategory: "Health Insurance",
      documentFormat: "HDFC_ERGO_HEALTH_OPTIMA_SECURE_V1",
      sourceDocumentType: "HDFC_ERGO_HEALTH_OPTIMA_SECURE_V1",
    };
  }
  if (isUnitedIndiaHealth(result, context)) {
    return {
      ...result,
      insuranceCompany: "United India Insurance Company Limited",
      companyName: "United India Insurance Company Limited",
      documentCategory: "Health Insurance",
      documentFormat: "UNITED_INDIA_HEALTH_V1",
      sourceDocumentType: "UNITED_INDIA_HEALTH_V1",
    };
  }
  if (isTataAigHealth(result, context)) {
    return {
      ...result,
      insuranceCompany: "Tata AIG General Insurance Company Limited",
      companyName: "Tata AIG General Insurance Company Limited",
      documentCategory: "Health Insurance",
      documentFormat: "TATA_AIG_HEALTH_V1",
      sourceDocumentType: "TATA_AIG_HEALTH_V1",
    };
  }
  if (isCareHealth(result, context)) {
    return {
      ...result,
      insuranceCompany: "Care Health Insurance Limited",
      companyName: "Care Health Insurance Limited",
      documentCategory: "Health Insurance",
      documentFormat: "CARE_HEALTH_V1",
      sourceDocumentType: "CARE_HEALTH_V1",
    };
  }
  if (isGoDigitMotor(result, context)) {
    return {
      ...result,
      insuranceCompany: "Go Digit General Insurance Limited",
      companyName: "Go Digit General Insurance Limited",
    };
  }
  if (isTataAigMotor(result, context)) {
    return {
      ...result,
      insuranceCompany: "Tata AIG General Insurance Company Limited",
      companyName: "Tata AIG General Insurance Company Limited",
      documentCategory: "Motor Insurance",
    };
  }
  if (isNewIndiaMotor(result, context)) {
    return {
      ...result,
      insuranceCompany: "The New India Assurance Company Limited",
      companyName: "The New India Assurance Company Limited",
      documentCategory: "Motor Insurance",
    };
  }
  return result;
}

function selectScopedTraining(result = {}, context = {}) {
  const scope = deriveTrainingScope(result, context);
  if (!scope.insurer || !scope.category) return [];
  return trainers.filter((trainer) => {
    if (trainer.scope.insurer !== scope.insurer || trainer.scope.category !== scope.category) return false;
    try {
      return !trainer.matches || trainer.matches({ result: clone(result), ...context });
    } catch {
      return false;
    }
  });
}

function clone(value) {
  return typeof globalThis.structuredClone === "function"
    ? globalThis.structuredClone(value)
    : JSON.parse(JSON.stringify(value));
}

function protectScopeIdentity(candidate, original) {
  for (const field of protectedScopeFields) {
    if (Object.prototype.hasOwnProperty.call(original, field)) candidate[field] = original[field];
    else delete candidate[field];
  }
  return candidate;
}

function applyScopedTraining(result, context = {}) {
  if (!result || typeof result !== "object") return result;

  const scopedResult = establishTrainingIdentity(result, context);
  return selectScopedTraining(scopedResult, context).reduce((current, trainer) => {
    try {
      const working = clone(current);
      const patch = trainer.train({ result: working, ...context }) || {};
      const changes = patch && typeof patch === "object" && !Array.isArray(patch) ? patch : {};
      return protectScopeIdentity({ ...working, ...changes }, current);
    } catch (error) {
      return {
        ...current,
        extractionTrainingWarnings: [
          ...(current.extractionTrainingWarnings || []),
          `${trainer.scope.insurer}/${trainer.scope.category}: ${error?.message || String(error)}`,
        ],
      };
    }
  }, scopedResult);
}

module.exports = {
  trainers,
  deriveTrainingScope,
  selectScopedTraining,
  applyScopedTraining,
};
