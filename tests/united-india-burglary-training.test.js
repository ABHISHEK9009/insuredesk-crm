/* @vitest-environment node */
import { describe, expect, it } from "vitest";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { extractPolicyFromText } = require("../src/lib/policies/pdf/extractor.cjs");

describe("United India Burglary Training Module", () => {
  const doc2Text = `
UNITED INDIA INSURANCE COMPANY LIMITED
BURGLARY FIRST LOSS POLICY
Policy No.:1913011226P106340657
 UIN. IRDAN545CP0278V01200708
PERIOD OF INSURANCE 
From 00:00 hrs on 03/08/2026
To Midnight on 02/10/2026
Insured
M/s SHRI SATGURU AGROMILLS PRIVATE LIMITED
Agent Name : RUPAL SOMANI
Agent Code : AGN1051496
BURGLARY FIRST LOSS POLICY
SCHEDULE
 Policy Number 1913011226P106340657
 Insured Details
 Name/ID M/s SHRI SATGURU AGROMILLS PRIVATE LIMITED / 23635619559
 Period of Insurance From From 00:00 hrs on 03/08/2026 To To Midnight on 02/10/2026
Financier Name Agreement Type Branch Name Address
AXIS BANK LTD. Hypothecation PIPARIYA HOSHANGABAD 461775 MADHYA PRADESH
UNION BANK OF INDIA Hypothecation PIPARIYA HOSHANGABAD 461775 MADHYA PRADESH
PUNJAB NATIONAL BANK Hypothecation BRANCH PIPARIYA HOSHANGABAD 461775 MADHYA PRADESH
STATE BANK OF INDIA Hypothecation ADB BRANCH , PIPARIYA HOSHANGABAD 461775 MADHYA PRADESH
HDFC BANK LTD Hypothecation PIPARIYA HOSHANGABAD 461775 MADHYA PRADESH
Premium : 5,863.00
CGST(9%) : 528.00
SGST(9%) : 528.00
Stamp Duty : 1.00
Total : 6,920.00
Receipt Number : 10119130126137367471
Receipt Date : 28/07/2026
Agent/Broker Code : AGN1051496
Business Associate Code : BAS20674
Location Id Location Address / Sitation Pin Code
23551756317 M/S S. PODDAR INFRA,SURVEY NO. 61, NEAR NEW LP WAREHOUSE, TEHSIL BHARAPAR, DISTRICT KUTCH, GUJARAT, 370205 370205
Risk No./Description-Description of Goods Description of Items Insured First Loss(%) Sum Insured/Item Sum Insured/Risk
Others - Others RICE 25 250,000,000.00 250,000,000.00
Addon Cover Details:-
Cover Description SI(₹) Premium(₹)
Theft 250,000,000.00 3,106.25
Customer GST/UIN No.: 23ABJCS4644R1ZO Office GST No.: 23AAACU5552C1ZR 
SAC Code: 997137 Invoice No. & Date: 1226I106340657 & 28/07/2026
`;

  const doc4Text = `
UNITED INDIA INSURANCE COMPANY LIMITED
BURGLARY FIRST LOSS POLICY
Policy No.:1913011226P106344197
PERIOD OF INSURANCE 
From 00:00 hrs on 03/08/2026 To Midnight on 02/10/2026
Insured
M/s SHRI SATGURU AGROMILLS PRIVATE LIMITED
BURGLARY FIRST LOSS POLICY SCHEDULE
 Policy Number 1913011226P106344197
 Insured Details Name/ID M/s SHRI SATGURU AGROMILLS PRIVATE LIMITED / 23635619559
Premium : 469.00
CGST(9%) : 42.00
SGST(9%) : 42.00
Stamp Duty : 1.00
Total : 554.00
Receipt Number : 10119130126137370053
Receipt Date : 28/07/2026
Location Id Location Address / Sitation Pin Code
23551767397 M/S SHREEJI EXPORTS (NEW), GODOWN NO. 04, PLOT NO. 38, BEHIN D ACT WAREHOUSE, TEHSIL KANDLA, DISTRICT KUTCH, GUJARAT, 370210 370210
Risk No./Description-Description of Goods Description of Items Insured First Loss(%) Sum Insured/Item Sum Insured/Risk
Others - Others RICE 25 20,000,000.00 20,000,000.00
Addon Cover Details:-
Cover Description SI(₹) Premium(₹)
Theft 20,000,000.00 248.50
Customer GST/UIN No.: 23ABJCS4644R1ZO Office GST No.: 23AAACU5552C1ZR 
SAC Code: 997137 Invoice No. & Date: 1226I106344197 & 28/07/2026
`;

  it("extracts all fields accurately from Document 2 (Burglary First Loss - Policy 1913011226P106340657)", () => {
    const result = extractPolicyFromText(doc2Text, "Doc2_Burglary.pdf");

    expect(result.insuranceCompany).toBe("United India Insurance Company Limited");
    expect(result.documentCategory).toBe("Burglary Insurance");
    expect(result.policyNumber).toBe("1913011226P106340657");
    expect(result.insuredName).toContain("SATGURU AGROMILLS");
    expect(result.startDate).toBe("03/08/2026");
    expect(result.expiryDate).toBe("02/10/2026");
    expect(result.locationId).toBe("23551756317");
    expect(result.firstLossPercentage).toBe("25");
    expect(result.sumInsured).toBe("250,000,000.00");
    expect(result.burglarySumInsured).toBe("250,000,000.00");
    expect(result.theftSumInsured).toBe("250,000,000.00");
    expect(result.theftPremium).toBe("3,106.25");
    expect(result.netPremium).toBe("5,863.00");
    expect(result.cgst).toBe("528.00");
    expect(result.sgst).toBe("528.00");
    expect(result.stampDuty).toBe("1.00");
    expect(result.totalPremium).toBe("6,920.00");
    expect(result.receiptNumber).toBe("10119130126137367471");
    expect(result.receiptDate).toBe("28/07/2026");
    expect(result.invoiceNumber).toBe("1226I106340657");
    expect(result.invoiceDate).toBe("28/07/2026");
    expect(result.tehsil).toBe("BHARAPAR");
    expect(result.district).toBe("KUTCH");
    expect(result.state).toBe("GUJARAT");
    expect(result.pincode).toBe("370205");
    expect(result.goodsStored).toBe("RICE");
    expect(result.brokerCode).toBe("AGN1051496");
    expect(result.businessAssociateCode).toBe("BAS20674");
    expect(result.financialInstitutions).toEqual(
      expect.arrayContaining(["AXIS BANK LTD.", "UNION BANK OF INDIA", "PUNJAB NATIONAL BANK", "STATE BANK OF INDIA", "HDFC BANK LTD"]),
    );
    expect(result.extractionTrainingVersion).toBe("UNITED_INDIA_BURGLARY_TRAINING_V1");
  });

  it("extracts all fields accurately from Document 4 (Burglary First Loss - Policy 1913011226P106344197)", () => {
    const result = extractPolicyFromText(doc4Text, "Doc4_Burglary.pdf");

    expect(result.policyNumber).toBe("1913011226P106344197");
    expect(result.locationId).toBe("23551767397");
    expect(result.firstLossPercentage).toBe("25");
    expect(result.sumInsured).toBe("20,000,000.00");
    expect(result.theftPremium).toBe("248.50");
    expect(result.netPremium).toBe("469.00");
    expect(result.totalPremium).toBe("554.00");
    expect(result.riskLocation).toContain("M/S SHREEJI EXPORTS (NEW)");
    expect(result.tehsil).toBe("KANDLA");
    expect(result.pincode).toBe("370210");
  });
});
