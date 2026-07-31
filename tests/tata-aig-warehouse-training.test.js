/* @vitest-environment node */
import { describe, expect, it } from "vitest";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { extractPolicyFromText } = require("../src/lib/policies/pdf/extractor.cjs");

describe("Tata AIG Warehouse Training Module (KAMALGURU WAREHOUSE)", () => {
  const kamalguruText = `
Tata AIG General Insurance Co. Ltd.
www.tataaig.com
Business Guard Laghu Package Policy
UIN: IRDAN108RP0024V01202223
SCHEDULE
POLICY NO: 5130027159
INSURED NAME: KAMALGURU WAREHOUSE
CUSTOMER MOBILE NO: 7354627770
CUSTOMER EMAIL: insuredeskbhopal@gmail.com
COMMUNICATION ADDRESS: PROP. NEETU SHARMA, GRAM
BILWAR, POST GULGANJ, TEHSIL, BADA MALEHRA, DIST -
CHHATARPUR, BADA-MALHERA, MADHYA PRADESH- 471301
PLACE OF SUPPLY: MADHYA PRADESH
STATE CODE : 23
CUSTOMER GSTIN NO:
TELEPHONE NO. (LANDLINE NO.) :
LAN NUMBER :
Additional Insured:
RISK LOCATION ADDRESS: PROP. NEETU SHARMA, GRAM
BILWAR, POST GULGANJ, TEHSIL, BADA MALEHRA, DIST -
CHHATARPUR, BADA-MALHERA, MADHYA PRADESH- 471301
OCCUPANCY: Storage of Agro goods (grains & pulses) subject
to warranty that hazardous goods of Category I, II, III, Coir
waste, Coir fibre and Caddies are not stored therein. (Materials
stored in Godowns & Silos) Stock of wheat and rice
PERIOD OF INSURANCE:
From: 00:00hrs of 16-07-2026
To: Midnight of 15-02-2027
Agent/Broker Name - nidhi gupta-0023265000
Agent/Broker License Code -009046
Agent/Broker Contact No - 8818889660
BANK / FINANCIAL INSTITUTION : MPWLC
A. Fire Building and/or Contents Stock in Process (Refer Annexure "A") 6,49,00,000.00
B Burglary Stocks in Process (Refer Annexure "B") 6,49,00,000.00
F Employee Fidelity Sum Insured Limits Refer Annexure "F" 64,90,000.00
Gross Premium: Rs. 13,915.00
Net Premium: Rs. 13,915.00
CGST Rs. 1,252.35
SGST Rs. 1,252.35
Total Amount (Rounded Off): Rs.16,420.00
GST Registration No.: 23AABCT3518Q1Z4 , Service Accounting Code : 997137
ANNEXURE "A" to COVERAGE SECTION "A"
Attached to and forming part of the Policy No. 5130027159
Insured: KAMALGURU WAREHOUSE
Location of Risk: PROP. NEETU SHARMA, GRAM BILWAR, POST GULGANJ, TEHSIL, BADA MALEHRA, DIST -
CHHATARPUR, BADA-MALHERA, MADHYA PRADESH- 471301
Occupancy: Storage of Agro goods (grains & pulses) subject to warranty that hazardous goods of Category I,
II, III, Coir waste, Coir fibre and Caddies are not stored therein. (Materials stored in Godowns & Silos) Stock of
wheat and rice
Sr. No. Risk Description Sum Insured (Rs.)
1 Stocks or stocks in progress 6,49,00,000.00
Total Sum Insured 6,49,00,000.00
`;

  it("extracts every single line & field from Tata AIG KAMALGURU WAREHOUSE policy (5130027159)", () => {
    const result = extractPolicyFromText(kamalguruText, "Kamalguru_Warehouse.pdf");

    expect(result.insuranceCompany).toBe("Tata AIG General Insurance Company Limited");
    expect(result.documentCategory).toBe("Warehouse Insurance");
    expect(result.policyNumber).toBe("5130027159");
    expect(result.insuredName).toBe("KAMALGURU WAREHOUSE");
    expect(result.customerMobile).toBe("7354627770");
    expect(result.customerEmail).toBe("insuredeskbhopal@gmail.com");
    expect(result.communicationAddress).toContain("PROP. NEETU SHARMA");
    expect(result.riskLocation).toContain("GRAM BILWAR");
    expect(result.tehsil).toBe("BADA MALEHRA");
    expect(result.district).toBe("CHHATARPUR");
    expect(result.state).toBe("MADHYA PRADESH");
    expect(result.pincode).toBe("471301");
    expect(result.startDate).toBe("16/07/2026");
    expect(result.expiryDate).toBe("15/02/2027");
    expect(result.brokerName).toBe("nidhi gupta");
    expect(result.brokerCode).toBe("009046");
    expect(result.brokerMobile).toBe("8818889660");
    expect(result.financialInstitutions).toEqual(["MPWLC"]);
    expect(result.contentsSumInsured).toBe("6,49,00,000.00");
    expect(result.burglarySumInsured).toBe("6,49,00,000.00");
    expect(result.fidelitySumInsured).toBe("64,90,000.00");
    expect(result.sumInsured).toBe("6,49,00,000.00");
    expect(result.netPremium).toBe("13,915.00");
    expect(result.cgst).toBe("1,252.35");
    expect(result.sgst).toBe("1,252.35");
    expect(result.gstAmount).toBe("2504.70");
    expect(result.totalPremium).toBe("16,420.00");
    expect(result.sacCode).toBe("997137");
    expect(result.goodsStored).toBe("Stock of wheat and rice");
    expect(result.extractionTrainingVersion).toBe("TATA_AIG_WAREHOUSE_SCHEDULE_V1");
  });
});
