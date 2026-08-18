import { describe, expect, it } from "vitest";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { extractPolicyFromText } = require("../src/lib/policies/pdf/extractor.cjs");
const { selectScopedTraining, deriveTrainingScope } = require("../src/lib/policies/pdf/training/registry.cjs");

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
    const selected = selectScopedTraining(
      { insuranceCompany: "Royal Sundaram General Insurance Company Limited", documentCategory: "Fire Insurance" },
      { text: "Royal Sundaram Fire Policy" }
    );
    expect(selected.some((t) => t.scope.category === "motor")).toBe(false);
  });
});
