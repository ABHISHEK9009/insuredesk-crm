/* @vitest-environment node */
import { createRequire } from "node:module";
import { describe, expect, it } from "vitest";

const require = createRequire(import.meta.url);
const iffcoTokioMotor = require("../src/lib/policies/pdf/training/iffco-tokio/motor.cjs");
const { applyScopedTraining, deriveTrainingScope } = require("../src/lib/policies/pdf/training/registry.cjs");

const sampleEndorsementText = `IFFCO - TOKIO GENERAL INSURANCE CO. LTD Servicing Office:
Regd. Office: IFFCO SADAN,C1 Distt Centre,Saket,New Delhi- 110017 Plot no. 214, Bhagwan Complex
Endorsement- Two Wheeler Policy 2nd Floor, Zone - 1 M.P. Nagar
Policy Schedule Cum Tax Invoice Bhopal - 462011 (MP)
ORIGINAL FOR RECIPIENT Phone No :- 0755 - 4022601
GST Applicable State Code: 23, GSTIN: 23AAACI7573H1ZK
General Insurance Services:- 997134
Insured's name: SOURABH NEMA Original Invoice No. 1-8NHMA81A
Address: LIG 54 HOUSING BOARD COLONY NARSIMHAPUR, SAGAR, Unique Invoice No. 1-8NHMA81A00003
NARSINGHPUR, MADHYA PRADESH Policy No……………………. : N8194398
LIGHARI MADHYA PRADESH 487001 Date of Issuance : 04/08/2026
State Code/ Place
of Supply:
23 Country Name: India GSTIN: Endorsement Effecitve Date : 01/08/2026
Phone Number: XXXXXXX528 Intermediary No. 21002760 Policy effective from 1328 hrs 01/08/2026
To MidNight 31/07/2027
Insured Motor Vehicle Details and Premium Calculations
Reg. Mark and
No.
Year of Manuf. Type of
body
Make of Vehicle CC Coverage IDV in
(Rs.)
Engine No. Chassis No. Seating Capacity
MP15ZN1481 2025 - TVS JUPITER
DRUM
113 Own Damage only 82619 KG5GS123145
1
MD626EG56S1G254
98
2
Insured Declared Values
Two Wheeler Side Car Accessories Elec./Elec. Acc. Bi-Fuel Kit Total Value
82619 0 0 0 0 82619
Not withstanding any thing contained to the contrary,it is hereby declared and agreed that
CORRECTION IN NAME
CORRECT INSURED NAME - SOURABH NEMA
Subject otherwise to the terms,conditions and exclusions of the policy,upon which this endorsement has been issued
Exclusion: Losses or damages caused directly or indirectly due to any infectious or contagious disease, pandemic /epidemics as declared by WHO and / or
Government of India will be an exclusion under this policy.
Two Wheeler Policy (UIN : IRDAN106RP0001V01201920 )
Attaching to and forming part of Policy Number N8194398

Taxable Value CGST SGST IGST CESS 
Rate 0.00 0.00 0.00 0.00
Amount 0.00 0.00 0.00 0.00 0.00
Total Tax ₹0.0 Total Value ₹0.00
`;

describe("IFFCO Tokio Motor Policy Extraction & Isolation", () => {
  it("derives the correct scope", () => {
    const scope = deriveTrainingScope(
      { insuranceCompany: "IFFCO Tokio General Insurance Co. Ltd.", documentCategory: "Motor Insurance" },
      { text: sampleEndorsementText }
    );
    expect(scope).toEqual({ insurer: "iffco-tokio", category: "motor" });
  });

  it("extracts all fields accurately from IFFCO Tokio Motor Endorsement / Schedule", () => {
    const original = {
      insuranceCompany: "IFFCO Tokio General Insurance Co. Ltd.",
      documentCategory: "Motor Insurance",
    };

    const trained = applyScopedTraining(original, { text: sampleEndorsementText });

    expect(trained.policyNumber).toBe("N8194398");
    expect(trained.insuredName).toBe("SOURABH NEMA");
    expect(trained.registrationNumber).toBe("MP15ZN1481");
    expect(trained.vehicleMake).toBe("TVS");
    expect(trained.vehicleModel).toBe("JUPITER DRUM");
    expect(trained.manufacturingYear).toBe("2025");
    expect(trained.cubicCapacity).toBe("113");
    expect(trained.idv).toBe("82619");
    expect(trained.engineNumber).toBe("KG5GS1231451");
    expect(trained.chassisNumber).toBe("MD626EG56S1G25498");
    expect(trained.seatingCapacity).toBe("2");
    expect(trained.startDate).toBe("01/08/2026");
    expect(trained.expiryDate).toBe("31/07/2027");
    expect(trained.agentCode).toBe("21002760");
    expect(trained.endorsementRemarks).toBe("CORRECTION IN NAME : CORRECT INSURED NAME - SOURABH NEMA");
    expect(trained.netPremium).toBe("0.00");
    expect(trained.totalPremium).toBe("0.00");
    expect(trained.extractionTrainingVersion).toBe("IFFCO_TOKIO_MOTOR_V2");
  });
});
