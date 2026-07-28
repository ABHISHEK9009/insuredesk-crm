import { createRequire } from "node:module";
import { describe, expect, it } from "vitest";

const require = createRequire(import.meta.url);
const trainer = require("../src/lib/policies/pdf/training/go-digit/motor.cjs");
const { applyScopedTraining, selectScopedTraining } = require("../src/lib/policies/pdf/training/registry.cjs");

const privateCarText = `
Go Digit General Insurance Ltd.
Digit Private Car PolicyUIN No.:IRDAN158RP0005V01201718
YOUR DETAILS
D266839198 / 27072026
ixxxxxxxxxxxxxxl@gxxxxxcom
xxxxxxxxx7501
MP04CZ2280
SALASAR STEEL AND PROFILE INDUSTRIES
Email:
YOUR POLICY DETAILS
Policy Issue Date27-Jul-2026Invoice No.IA256271834Invoice Date27-Jul-2026
YOUR VEHICLE DETAILS
RTO Location
Bhopal,MADHYA PRADESH
MakeHYUNDAI
Model/Vehicle Variant (Sub-
Type)
VENUE/1.5 CRDi SX (MT) BSVI
Seating Capacity5Fuel TypeDiesel
Year of Regn./ Manufacturing
2020/0001-01-01
Engine No.D4FALM024478Chassis No.MALFC81DLLM120669Cubic Capacity1493 CC
NAFinancier DetailsSUNDARAM FINANCE LTD
FASTag NUMBER DECLARATION
MP04CZ2280 HYUNDAI VENUE 2026-08-03 2027-08-02 Digit Private Car Policy
YOUR VEHICLE IDV
Year 1511875
511875.00
CGST @ 9% = (1777.80) + SGST/UTGST @ 9% = (1777.80)
16137.35
3416.00
ENDORSEMENT
Invoice NumberInvoice DateNet Premium Igst Cgst Sgst Utgst CessGross Premium
IA2562718342026-07-2719753.350.001777.801777.800.000.0023308.95
`;

const twoWheelerText = `
Go Digit General Insurance Ltd.
UIN No.:
Digit Two-Wheeler Insurance
IRDAN158RPMT0045V01202425
Policy No: D278298212
NameMS SNEHA RAIVehicle Registration No.MP04SD7281
Mobile
xxxxxxxxx2985
Email
ixxxxxxxxxxxxxxl@gxxxxxcom
Digit Two-Wheeler Insurance
YOUR POLICY DETAILS
14-Jul-2026
14-Jul-2026
13-Jul-2027
13-Jul-2027
YOUR VEHICLE DETAILS
RTO Location
Bhopal,MADHYA PRADESH
MakeHONDA
Engine No.JC44E0300460Chassis No.ME4JC446K98023517
Model/Vehicle Variant (Sub-
Type)
ACTIVA/DLX
Body TypeScooterFuel TypePetrol
Year of Regn/Year of Mfg.
2009/0001-01-01
Seating Capacity2Cubic Capacity110 CC
YOUR VEHICLE IDV
Year 17500
NCB(50 %)
Total OD Premium
Total Act Premium
Own Damage Premium
OWN DAMAGE PREMIUM [A]
LIABILITY PREMIUM [B]
40.55
714.00
40.55
Invoice NumberInvoice DateNet Premium Igst Cgst Sgst Utgst CessGross Premium
IA2728356492026-07-13754.550.0067.9167.910.000.00890.37
`;

describe("Go Digit motor scoped training", () => {
  it("extracts the private-car policy field by field", () => {
    const result = trainer.train({ text: privateCarText, result: {} });

    expect(result).toMatchObject({
      insuredName: "SALASAR STEEL AND PROFILE INDUSTRIES",
      policyNumber: "D266839198",
      policyType: "Digit Private Car Policy",
      uinNumber: "IRDAN158RP0005V01201718",
      contactNumber: "xxxxxxxxx7501",
      startDate: "03-Aug-2026",
      expiryDate: "02-Aug-2027",
      registrationNumber: "MP04CZ2280",
      vehicleMake: "HYUNDAI",
      vehicleModel: "VENUE",
      variant: "1.5 CRDi SX (MT) BSVI",
      manufacturingYear: "2020",
      engineNumber: "D4FALM024478",
      chassisNumber: "MALFC81DLLM120669",
      fuelType: "Diesel",
      cubicCapacity: "1493 CC",
      seatingCapacity: "5",
      idv: "511875.00",
      financerName: "SUNDARAM FINANCE LTD",
      netPremium: "19753.35",
      odPremium: "16137.35",
      tpPremium: "3616.00",
      cgst: "1777.80",
      sgst: "1777.80",
      totalPremium: "23308.95",
      extractionTrainingVersion: "GO_DIGIT_MOTOR_V2",
    });
  });

  it("preserves the existing two-wheeler extraction", () => {
    const result = trainer.train({ text: twoWheelerText, result: {} });

    expect(result).toMatchObject({
      insuredName: "SNEHA RAI",
      policyNumber: "D278298212",
      policyType: "Digit Two-Wheeler Insurance",
      uinNumber: "IRDAN158RPMT0045V01202425",
      contactNumber: "xxxxxxxxx2985",
      startDate: "14-Jul-2026",
      expiryDate: "13-Jul-2027",
      registrationNumber: "MP04SD7281",
      makeModel: "HONDA ACTIVA",
      variant: "DLX",
      idv: "7500.00",
      odPremium: "40.55",
      tpPremium: "714.00",
      totalPremium: "890.37",
    });
  });

  it("is not selected for another Go Digit category or another motor insurer", () => {
    const digitHealth = selectScopedTraining(
      { insuranceCompany: "Go Digit General Insurance Limited", documentCategory: "Health Insurance" },
      { text: "Go Digit Health Insurance" },
    );
    const iffcoMotor = selectScopedTraining(
      { insuranceCompany: "IFFCO Tokio", documentCategory: "Motor Insurance" },
      { text: "IFFCO Tokio Motor Policy" },
    );
    const newIndiaWithPreviousDigitInsurer = selectScopedTraining(
      { insuranceCompany: "The New India Assurance Company Limited", documentCategory: "Motor Insurance" },
      { text: "THE NEW INDIA ASSURANCE Motor Policy Previous Insurer: Go Digit General Insurance Limited" },
    );

    expect(digitHealth).not.toContain(trainer);
    expect(iffcoMotor).not.toContain(trainer);
    expect(newIndiaWithPreviousDigitInsurer).not.toContain(trainer);
  });

  it("cannot overwrite scope identity fields", () => {
    const base = {
      insuranceCompany: "Go Digit General Insurance Limited",
      companyName: "Go Digit General Insurance Limited",
      documentCategory: "Motor Insurance",
      documentFormat: "GO_DIGIT_MOTOR_V1",
      sourceDocumentType: "GO_DIGIT_MOTOR_V1",
    };
    const result = applyScopedTraining(base, { text: privateCarText });

    expect(result).toMatchObject(base);
  });
});
