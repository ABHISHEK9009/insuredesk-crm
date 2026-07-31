/* @vitest-environment node */
import { describe, expect, it } from "vitest";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { extractPolicyFromText } = require("../src/lib/policies/pdf/extractor.cjs");

describe("Non-Motor Extraction Field Cleanup (tpPremium, dueCollection, collectedAmount, modeOfPayment)", () => {
  const warehouseText = `
UNITED INDIA INSURANCE COMPANY LIMITED
UNITED VALUE UDYAM SURAKSHA POLICY
POLICY NO.:1913011126P106344012
PERIOD OF INSURANCE 
From 00:00 Hrs of 03/08/2026 To Midnight of 02/10/2026
Insured: M/s SHRI SATGURU AGROMILLS PRIVATE LIMITED
Risks Covered Sum Insured(₹)
Contents 20,000,000.00
Net Premium: 4,162.00
CGST(9%): 375.00
SGST(9%): 375.00
Total: 4,913.00
`;

  const burglaryText = `
UNITED INDIA INSURANCE COMPANY LIMITED
BURGLARY FIRST LOSS POLICY
Policy No.:1913011226P106344197
PERIOD OF INSURANCE 
From 00:00 hrs on 03/08/2026 To Midnight on 02/10/2026
Insured: M/s SHRI SATGURU AGROMILLS PRIVATE LIMITED
Premium : 469.00
CGST(9%) : 42.00
SGST(9%) : 42.00
Total : 554.00
`;

  const tataWarehouseText = `
Tata AIG General Insurance Co. Ltd.
www.tataaig.com
Business Guard Laghu Package Policy
UIN: IRDAN108RP0024V01202223
SCHEDULE
POLICY NO: 5130027159
INSURED NAME: KAMALGURU WAREHOUSE
PERIOD OF INSURANCE:
From: 00:00hrs of 16-07-2026 To: Midnight of 15-02-2027
Net Premium: Rs. 13,915.00
Total Amount (Rounded Off): Rs.16,420.00
`;

  it("ensures United India Warehouse policy has tpPremium, dueCollection, collectedAmount, modeOfPayment cleared", () => {
    const result = extractPolicyFromText(warehouseText, "Warehouse.pdf");

    expect(result.documentCategory).toBe("Warehouse Insurance");
    expect(result.tpPremium || "").toBe("");
    expect(result.dueCollection || "").toBe("");
    expect(result.collectedAmount || "").toBe("");
    expect(result.modeOfPayment || "").toBe("");
  });

  it("ensures United India Burglary policy has tpPremium, dueCollection, collectedAmount, modeOfPayment cleared", () => {
    const result = extractPolicyFromText(burglaryText, "Burglary.pdf");

    expect(result.documentCategory).toBe("Burglary Insurance");
    expect(result.tpPremium || "").toBe("");
    expect(result.dueCollection || "").toBe("");
    expect(result.collectedAmount || "").toBe("");
    expect(result.modeOfPayment || "").toBe("");
  });

  it("ensures Tata AIG Warehouse policy has tpPremium, dueCollection, collectedAmount, modeOfPayment cleared", () => {
    const result = extractPolicyFromText(tataWarehouseText, "TataWarehouse.pdf");

    expect(result.documentCategory).toBe("Warehouse Insurance");
    expect(result.tpPremium || "").toBe("");
    expect(result.dueCollection || "").toBe("");
    expect(result.collectedAmount || "").toBe("");
    expect(result.modeOfPayment || "").toBe("");
  });
});
