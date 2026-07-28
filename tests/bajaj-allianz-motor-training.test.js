import { createRequire } from "node:module";
import { describe, expect, it } from "vitest";

const require = createRequire(import.meta.url);
const trainer = require("../src/lib/policies/pdf/training/bajaj-allianz/motor.cjs");
const { applyScopedTraining, selectScopedTraining } = require("../src/lib/policies/pdf/training/registry.cjs");

const commercialLiabilityText = `
Welcome to the Bajaj General Insurance Family
Bajaj General Insurance Limited
Liability Only Policy for Commercial Vehicle - POLICY SCHEDULE CUM CERTIFICATE OF INSURANCE
UIN : IRDAN113RP0042V01200102
POLICY DETAILSINSURED DETAILS
Insured Name Sudeep Jaiswal
Kannod Road New Colony Ashta Sehore, Sehore, Madhya Pradesh-466116
23 - MADHYA PRADESH
12-1831-0010461706-00 Policy Number
Policy Issued on 27-07-2026 18:04:46 hrs
Policy Period
From: 27-07-2026 00:00:01 hrs
To: 26-07-2027 Midnight
Invoice Number 232607I001356078
Vehicle Details:
MP-37-P-0157TATA 29562009LP 407SCHOOL BUS (24) 5600
MP37-SEHORE24MAT35725198F15903DIESEL(D)0497SPTC36FQZ617576
Total IDV (Rs)
0
0
0
0
0
Compulsory Personal Accident - SI- 1500000 Period: From 27/07/2026 To 26/07/2027
331
LL To Person For Operation
Maintenance IMT 28
50
30072 Basic Third Party Liability
2741
SGST (9%)
2741
CGST (9%)
Final Premium 35935
A. Proposer details:
Mailing Address KANNOD ROAD NEW COLONY ASHTA SEHORE, SEHORE 466116 MADHYA PRADESH
Profession NA
Email ID INSUREDESKBHOPAL@GMAIL.COM
Mobile Number 9424411103
B. Vehicle Details:
Rs. 30453 9. Premium for Liability coverage, quoted and agreed upon
12. About the last insurance company
i. Insurance Provider
ii. Previous Policy No
iii. Previous Policy Expiry Date
Reliance General Insurance Company Limited.
230222523550000313
25/07/2026
Subject to Warranties/
IMT-Endorsements/
28
`;

describe("Bajaj Allianz motor scoped training", () => {
  it("extracts the commercial liability policy field by field", () => {
    const result = trainer.train({ text: commercialLiabilityText, result: {} });

    expect(result).toMatchObject({
      insuredName: "Sudeep Jaiswal",
      policyNumber: "12-1831-0010461706-00",
      policyType: "Liability Only Policy for Commercial Vehicle",
      policyCoverType: "Third Party",
      uinNumber: "IRDAN113RP0042V01200102",
      contactNumber: "9424411103",
      customerEmail: "INSUREDESKBHOPAL@GMAIL.COM",
      startDate: "27-07-2026",
      expiryDate: "26-07-2027",
      registrationNumber: "MP-37-P-0157",
      rtoLocation: "MP37-SEHORE",
      vehicleMake: "TATA",
      vehicleModel: "LP 407",
      variant: "SCHOOL BUS (24)",
      cubicCapacity: "2956",
      manufacturingYear: "2009",
      seatingCapacity: "24",
      grossVehicleWeight: "5600",
      chassisNumber: "MAT35725198F15903",
      engineNumber: "497SPTC36FQZ617576",
      fuelType: "Diesel",
      idv: "0.00",
      tpPremium: "30072.00",
      ownerDriverPremium: "331.00",
      legalLiabilityPremium: "50.00",
      netPremium: "30453.00",
      cgst: "2741.00",
      sgst: "2741.00",
      totalPremium: "35935.00",
      previousInsurer: "Reliance General Insurance Company Limited",
      previousPolicyNumber: "230222523550000313",
      previousPolicyExpiryDate: "25/07/2026",
      imtEndorsements: "IMT-28",
      extractionTrainingVersion: "BAJAJ_ALLIANZ_MOTOR_COMMERCIAL_LIABILITY_V1",
    });
  });

  it("is isolated from Bajaj non-motor and other motor insurers", () => {
    const bajajWarehouse = selectScopedTraining(
      { insuranceCompany: "Bajaj Allianz General Insurance Company Limited", documentCategory: "Warehouse Insurance" },
      { text: "Bajaj General Insurance Warehouse Policy" },
    );
    const tataMotor = selectScopedTraining(
      { insuranceCompany: "TATA AIG General Insurance", documentCategory: "Motor Insurance" },
      { text: "TATA AIG Liability Only Policy for Commercial Vehicle" },
    );

    expect(bajajWarehouse).not.toContain(trainer);
    expect(tataMotor).not.toContain(trainer);
  });

  it("cannot overwrite scope identity fields", () => {
    const base = {
      insuranceCompany: "Bajaj Allianz General Insurance Company Limited",
      companyName: "Bajaj Allianz General Insurance Company Limited",
      documentCategory: "Motor Insurance",
      documentFormat: "BAJAJ_ALLIANZ_MOTOR_V1",
      sourceDocumentType: "BAJAJ_ALLIANZ_MOTOR_V1",
    };
    const result = applyScopedTraining(base, { text: commercialLiabilityText });

    expect(result).toMatchObject(base);
  });
});
