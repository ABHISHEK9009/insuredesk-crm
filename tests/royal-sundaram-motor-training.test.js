/* @vitest-environment node */
import { describe, expect, it } from "vitest";
import { createRequire } from "node:module";
import path from "node:path";
import fs from "node:fs";

const require = createRequire(import.meta.url);
const pdf = require("pdf-parse");
const { extractPolicyFromText } = require("../src/lib/policies/pdf/extractor.cjs");
const { applyScopedTraining, selectScopedTraining, deriveTrainingScope } = require("../src/lib/policies/pdf/training/registry.cjs");

describe("Royal Sundaram Motor Policy Training", () => {
  const ocrSampleText = `
sf Royal Sundaram General Insurance Co. Limited
Corporate Office: Vishranti Melaram Towers, No 21315,
Service Branch Address: 3rd Floor, Alankar Complex, MP Nagar, Bhopal

Aug 10, 2026
Mr. DHARMENDRA RAI
WARD 11 INDRA NAGAR
MANDIDEEP GOHARGANJ INDORE - 452001, MADHYA PRADESH
Mobile: 88000060

Certificate of Insurance and Policy No. Policy Period:Period of insurance
VGC1606513000100 From 00:00:00 hours on 10/08/2026 To Midnight of 09/08/2027

Dear Customer,
Goods Carrying Vehicle Policy No. VGC1606513000100 which has been issued based on the details mentioned below:
Name of the Insured: Wr DHARMENDRA RAI

CERTIFICATE OF INSURANCE & POLICY SCHEDULE
Goods Carrying Vehicle Policy
INSURED DETAILS
MEDHARMENDRA RAI

INSURED'S DECLARED VALUE (IDV) (in Rs.)
760,000 0 0 0 0 760,000

VEHICLE DETAILS
MPOSHGS538 Type of Body OPEN
11663156132 Public Carrer/Prvate Carrer Public Carrier
WATassA1TBSG 2448 2011
Make of the Vehicle Tata Motors Ltd. Gross Vehicle Weight (Kgs) 3,50,00
Model Description LPT 3118 MS open Total Premium (in Rs.) 48,028

11. To Paid Driver/Cleaner(not exceeding 7 persons) End IMT-26 100.00
17.35% NCB 804.24] 17. TOTAL LIABILITY PREMIUM (B) 44,050.00
20. Total Premium (A+B) 45,544.00
24. TOTAL OWN DAMAGE PREMIUM (A) [ 1,494.00/ 24. TOTAL PREMIUM PAYABLE 48,028.42

Contact: 9981667989
`;

  it("extracts all motor fields field by field for Royal Sundaram motor policies", () => {
    const result = extractPolicyFromText(ocrSampleText, "Dharmendra Rai_MP09HG5538_Policy.pdf");

    expect(result.policyNumber).toBe("VGC1606513000100");
    expect(result.insuredName).toBe("DHARMENDRA RAI");
    expect(result.registrationNumber).toBe("MP-09-HG-5538");
    expect(result.vehicleNumber).toBe("MP-09-HG-5538");
    expect(result.makeModel).toBe("Tata Motors Ltd. LPT 3118 MS open");
    expect(result.engineNumber).toBe("11663156132");
    expect(result.chassisNumber).toBe("WATASSA1TBSG2448");
    expect(result.manufacturingYear).toBe("2011");
    expect(result.startDate).toBe("10/08/2026");
    expect(result.expiryDate).toBe("09/08/2027");
    expect(result.totalPremium).toBe("48,028.00");
    expect(result.odPremium).toBe("1494.00");
    expect(result.tpPremium).toBe("44050.00");
    expect(result.netPremium).toBe("45544.00");
    expect(result.tpDriverOwner).toBe("100.00");
    expect(result.ncb).toBe("35%");
    expect(result.seatingCapacity).toBe("2");
    expect(result.cubicCapacity).toBe("5883");
    expect(result.idv).toBe("760000.00");
    expect(result.grossVehicleWeight).toBe("3,50,00.00");
  });

  it("extracts SHREE BAHORA CONSTRUCTIONS real Goods Carrying Vehicle Policy PDF accurately", async () => {
    const filePath = path.join(process.cwd(), "storage", "Ms.SHREEBAHORACONSTRUCTIONSPRIVATELIMITED_UP85CT2063_2026-27.pdf");
    if (!fs.existsSync(filePath)) return;
    const buf = fs.readFileSync(filePath);
    const data = await pdf(buf);

    const result = applyScopedTraining(
      { insuranceCompany: "Royal Sundaram General Insurance Co. Limited", documentCategory: "Motor Insurance" },
      { text: data.text }
    );

    expect(result.insuranceCompany).toBe("Royal Sundaram General Insurance Co. Limited");
    expect(result.documentCategory).toBe("Motor Insurance");
    expect(result.policyNumber).toBe("VGC1605266000100");
    expect(result.taxInvoiceNumber).toBe("VGC160526600000");
    expect(result.insuredName).toBe("M/s.SHREE BAHORA CONSTRUCTIONS PRIVATE LIMITED");
    expect(result.registrationNumber).toBe("UP85CT2063");
    expect(result.vehicleMake).toBe("Tata Motors Ltd.");
    expect(result.vehicleModel).toBe("SIGNA 2823.TK BSVI");
    expect(result.makeModel).toBe("Tata Motors Ltd. SIGNA 2823.TK BSVI");
    expect(result.engineNumber).toBe("B56B6A220D06102K63845102");
    expect(result.chassisNumber).toBe("MAT797028L3K10794");
    expect(result.manufacturingYear).toBe("2020");
    expect(result.grossVehicleWeight).toBe("28,000.00");
    expect(result.idv).toBe("2300000.00");
    expect(result.productName).toBe("Goods Carrying Vehicle Policy");
    expect(result.startDate).toBe("07/08/2026");
    expect(result.expiryDate).toBe("06/08/2027");
    expect(result.policyIssueDate).toBe("07/08/2026");
    expect(result.financerName).toBe("TATA MOTORS FINANCE LTD");
    expect(result.previousPolicyNumber).toBe("3003/394189735/00/B00");
    expect(result.previousInsurer).toBe("ICICI LOMBARD GENERAL INSURANCE CO LTD");
    expect(result.gstin).toBe("09AAKCS9455N1ZC");
    expect(result.odPremium).toBe("5062.00");
    expect(result.tpPremium).toBe("44050.00");
    expect(result.netPremium).toBe("49112.00");
    expect(result.totalPremium).toBe("52,239.00");
    expect(result.gstAmount).toBe("3127.00");
  });

  it("extracts SHUKLA AGRITECH real UP70FT3435 and UP70FT3437 PDFs accurately", async () => {
    // 1. UP70FT3435
    const f1 = path.join(process.cwd(), "storage", "Ms.SHUKLA AGRITECH PRIVATE LIMITED_UP70FT3435_2026-27.pdf");
    if (fs.existsSync(f1)) {
      const d1 = await pdf(fs.readFileSync(f1));
      const res1 = applyScopedTraining(
        { insuranceCompany: "Royal Sundaram General Insurance Co. Limited", documentCategory: "Motor Insurance" },
        { text: d1.text }
      );
      expect(res1.policyNumber).toBe("VGC1609867000100");
      expect(res1.taxInvoiceNumber).toBe("VGC160986700000");
      expect(res1.insuredName).toBe("M/s.SHUKLA AGRITECH PRIVATE LIMITED");
      expect(res1.registrationNumber).toBe("UP70FT3435");
      expect(res1.vehicleMake).toBe("Tata Motors Ltd.");
      expect(res1.vehicleModel).toBe("LPT 3718");
      expect(res1.engineNumber).toBe("ISBE591804071H63612141");
      expect(res1.chassisNumber).toBe("MAT541025H3H18812");
      expect(res1.manufacturingYear).toBe("2017");
      expect(res1.idv).toBe("1410750.00");
      expect(res1.ncb).toBe("45%");
      expect(res1.netPremium).toBe("47642.00");
      expect(res1.totalPremium).toBe("50,466.00");
      expect(res1.gstAmount).toBe("2824.00");
      expect(res1.previousPolicyNumber).toBe("1914013125P107788503");
      expect(res1.previousInsurer).toBe("UNITED INDIA INSURANCE COMPANY LTD");
      expect(res1.gstin).toBe("23AASCS5782L1ZK");
    }

    // 2. UP70FT3437
    const f2 = path.join(process.cwd(), "storage", "Ms.SHUKLA AGRITECH PRIVATE LIMITED_UP70FT3437_2026-27.pdf");
    if (fs.existsSync(f2)) {
      const d2 = await pdf(fs.readFileSync(f2));
      const res2 = applyScopedTraining(
        { insuranceCompany: "Royal Sundaram General Insurance Co. Limited", documentCategory: "Motor Insurance" },
        { text: d2.text }
      );
      expect(res2.policyNumber).toBe("VGC1609866000100");
      expect(res2.taxInvoiceNumber).toBe("VGC160986600000");
      expect(res2.insuredName).toBe("M/s.SHUKLA AGRITECH PRIVATE LIMITED");
      expect(res2.registrationNumber).toBe("UP70FT3437");
      expect(res2.vehicleMake).toBe("Tata Motors Ltd.");
      expect(res2.vehicleModel).toBe("LPT 3718");
      expect(res2.engineNumber).toBe("ISBE591804071H63612081");
      expect(res2.chassisNumber).toBe("MAT541025H3H18749");
      expect(res2.manufacturingYear).toBe("2017");
      expect(res2.idv).toBe("1410750.00");
      expect(res2.ncb).toBe("35%");
      expect(res2.netPremium).toBe("48242.00");
      expect(res2.totalPremium).toBe("51,174.00");
      expect(res2.gstAmount).toBe("2932.00");
      expect(res2.previousPolicyNumber).toBe("1914013125P107788601");
      expect(res2.previousInsurer).toBe("UNITED INDIA INSURANCE COMPANY LTD");
      expect(res2.gstin).toBe("23AASCS5782L1ZK");
    }
  });

  it("preserves strict scope isolation so Royal Sundaram motor trainer does not trigger for other scopes", () => {
    const nonRoyalSundaramScope = deriveTrainingScope(
      { insuranceCompany: "Tata AIG General Insurance Company Limited", documentCategory: "Motor Insurance" },
      { text: "Tata AIG Auto Secure Policy" }
    );
    expect(nonRoyalSundaramScope.insurer).not.toBe("royal-sundaram");

    const nonMotorScope = deriveTrainingScope(
      { insuranceCompany: "Royal Sundaram General Insurance Company Limited", documentCategory: "Fire Insurance" },
      { text: "Royal Sundaram Fire and Special Perils Policy" }
    );
    expect(nonMotorScope.category).not.toBe("motor");
    const selected = selectScopedTraining(
      { insuranceCompany: "Royal Sundaram General Insurance Company Limited", documentCategory: "Fire Insurance" },
      { text: "Royal Sundaram Fire Policy" }
    );
    expect(selected.some((t) => t.scope.category === "motor")).toBe(false);
  });
});
