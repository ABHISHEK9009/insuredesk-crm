/* @vitest-environment node */
import { describe, expect, it } from "vitest";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { extractPolicyFromText } = require("../src/lib/policies/pdf/extractor.cjs");

describe("United India Warehouse Training Module", () => {
  const doc1Text = `
UNITED INDIA INSURANCE COMPANY LIMITED
BRANCH OFFICE DEWAS 168, FIRST FLOOR, MOTI BANGLA ABOVE DCB BANK, DEWAS, MP
BO DEWAS - 455001 MADHYA PRADESH
PHONE: (07272) 226081 FAX: EMAIL: 
UNITED VALUE UDYAM SURAKSHA POLICY
POLICY NO.:1913011126P106340518
UIN. IRDAN545RP0001V01202223
PERIOD OF INSURANCE 
From 00:00 Hrs of 03/08/2026
To Midnight of 02/10/2026
Insured
M/s SHRI SATGURU AGROMILLS PRIVATE LIMITED
P H NO 18 VILLAGE JHIL ,PIPARIYA SANDIYA ROAD, PIPARIYA, MADHYA PRADESH, 461775
461775
HOSHANGABAD
MADHYA PRADESH
Agent Name : RUPAL SOMANI
Agent Code : AGN1051496
Mobile/Landline Number/Email :
9691085850
rupalsomani05@gmail.com
POLICY NO.:1913011126P106340518
UNITED VALUE UDYAM SURAKSHA POLICY
SCHEDULE
Policy No. 1913011126P106340518 Prev. Pol. No.
Name Of Insured M/s SHRI SATGURU AGROMILLS PRIVATE LIMITED / 23635619559
Period of Insurance From 00:00 Hrs of 03/08/2026 To Midnight of 02/10/2026
Risks Covered Sum Insured(₹)
Contents 250,000,000.00
Net Premium: 52,020.00
CGST(9%): 4,682.00
SGST(9%): 4,682.00
Stamp Duty: 1.00
Total: 61,385.00
Receipt No: 10119130126137366321
Receipt Date: 28/07/2026
Agency/Broker Code: RUPAL SOMANI AGN1051496
Business Associate Code: ASHOK KUMAR SOMANI BAS20674
Financier Name Branch Name Agreement Type Loan Number
HDFC BANK LTD Hypothecation
AXIS BANK LTD. Hypothecation
YES BANK LTD. Hypothecation
UNION BANK OF INDIA Hypothecation
CENTRAL BANK OF INDIA Hypothecation
PUNJAB NATIONAL BANK Hypothecation
ICICI BANK LTD Hypothecation
STATE BANK OF INDIA Hypothecation
L&T FINANCE LTD Hypothecation
Location/Risk Details :
Location Address Location Name Risk Description Item Type Item Description Sum Insured(₹)
M/S S. PODDAR INFRA,SURVEY NO. 61, NEAR NEW LP WAREHOUSE , TEHSIL BHARAPAR, DISTRICT KUTCH, GUJARAT, 370205,KACHCHH,GUJARAT,Pin-370205 S. PODDAR INFRA Storage of Non-hazardous goods subject to warranty... Other Contents (Other than Stocks) , Specific Items RICE 250,000,000.00
Special Condition
RENEWAL OF PREVIOUS POLICY NO. 1913011126P104882811
Customer GST/UIN No.: 23ABJCS4644R1ZO Office GST No.: 23AAACU5552C1ZR 
SAC Code: 997137 Invoice No. & Date: 1126I106340518 & 28/07/2026
`;

  const doc3Text = `
UNITED INDIA INSURANCE COMPANY LIMITED
UNITED VALUE UDYAM SURAKSHA POLICY
POLICY NO.:1913011126P106344012
PERIOD OF INSURANCE 
From 00:00 Hrs of 03/08/2026 To Midnight of 02/10/2026
Insured
M/s SHRI SATGURU AGROMILLS PRIVATE LIMITED
Agent Name : RUPAL SOMANI
Agent Code : AGN1051496
Risks Covered Sum Insured(₹)
Contents 20,000,000.00
Net Premium: 4,162.00
CGST(9%): 375.00
SGST(9%): 375.00
Stamp Duty: 1.00
Total: 4,913.00
Receipt No: 10119130126137369867
Receipt Date: 28/07/2026
Location/Risk Details :
Location Address Location Name Risk Description Item Type Item Description Sum Insured(₹)
M/S SHREEJI EXPORTS (NEW), GODOWN NO. 04, PLOT NO. 38, BEHIN D ACT WAREHOUSE, TEHSIL KANDLA, DISTRICT KUTCH, GUJARAT, 370210,KACHCHH,GUJARAT,Pin-370210 SHREEJI EXPORT Storage of Non-hazardous goods... Other Contents RICE 20,000,000.00
Special Condition
RENEWAL OF PREVIOUS POLICY NO. 1913011126P104882625
Customer GST/UIN No.: 23ABJCS4644R1ZO Office GST No.: 23AAACU5552C1ZR
SAC Code: 997137 Invoice No. & Date: 1126I106344012 & 28/07/2026
`;

  it("extracts all fields accurately from Document 1 (United Value Udyam Suraksha - Policy 1913011126P106340518)", () => {
    const result = extractPolicyFromText(doc1Text, "Doc1_Udyam.pdf");

    expect(result.insuranceCompany).toBe("United India Insurance Company Limited");
    expect(result.documentCategory).toBe("Warehouse Insurance");
    expect(result.policyNumber).toBe("1913011126P106340518");
    expect(result.previousPolicyNumber).toBe("1913011126P104882811");
    expect(result.insuredName).toContain("SATGURU AGROMILLS");
    expect(result.startDate).toBe("03/08/2026");
    expect(result.expiryDate).toBe("02/10/2026");
    expect(result.sumInsured).toBe("250,000,000.00");
    expect(result.netPremium).toBe("52,020.00");
    expect(result.cgst).toBe("4,682.00");
    expect(result.sgst).toBe("4,682.00");
    expect(result.stampDuty).toBe("1.00");
    expect(result.totalPremium).toBe("61,385.00");
    expect(result.receiptNumber).toBe("10119130126137366321");
    expect(result.receiptDate).toBe("28/07/2026");
    expect(result.invoiceNumber).toBe("1126I106340518");
    expect(result.invoiceDate).toBe("28/07/2026");
    expect(result.tehsil).toBe("BHARAPAR");
    expect(result.district).toBe("KUTCH");
    expect(result.state).toBe("GUJARAT");
    expect(result.pincode).toBe("370205");
    expect(result.goodsStored).toBe("RICE");
    expect(result.brokerCode).toBe("AGN1051496");
    expect(result.businessAssociateCode).toBe("BAS20674");
    expect(result.financialInstitutions).toEqual(
      expect.arrayContaining(["HDFC BANK LTD", "AXIS BANK LTD.", "YES BANK LTD.", "STATE BANK OF INDIA"]),
    );
    expect(result.extractionTrainingVersion).toBe("UNITED_INDIA_WAREHOUSE_TRAINING_V2");
  });

  it("extracts all fields accurately from Document 3 (United Value Udyam Suraksha - Policy 1913011126P106344012)", () => {
    const result = extractPolicyFromText(doc3Text, "Doc3_Udyam.pdf");

    expect(result.policyNumber).toBe("1913011126P106344012");
    expect(result.previousPolicyNumber).toBe("1913011126P104882625");
    expect(result.sumInsured).toBe("20,000,000.00");
    expect(result.netPremium).toBe("4,162.00");
    expect(result.totalPremium).toBe("4,913.00");
    expect(result.tehsil).toBe("KANDLA");
    expect(result.pincode).toBe("370210");
    expect(result.goodsStored).toBe("RICE");
  });
});
