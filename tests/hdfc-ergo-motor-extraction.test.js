/* @vitest-environment node */
import { createRequire } from "node:module";
import { describe, expect, it } from "vitest";

const require = createRequire(import.meta.url);
const hdfcErgoMotor = require("../src/lib/policies/pdf/training/hdfc-ergo/motor.cjs");
const { applyScopedTraining, deriveTrainingScope } = require("../src/lib/policies/pdf/training/registry.cjs");

const sampleOcrText = `HDFC ERGO General Insurance Company Limited PMTB082627608200
Proposal Form cum Transcript Letter For Standalone Motor Own Damage Cover - Private Car
Proposal No. PMTB082627608200

Vehicle Details
Make HYUNDAI
Model VENUE-1.2 S PETROL
Registration No MP-04-YA-8427
RTO BHOPAL
Chassis No. MALFB81BLRM632767
Cubic Capacity 1197 Seats 5
Year of Manufacture 2024 Body Type SUV
Engine No. G4LARM000239
Email ID : shxxxxxxxxxxxxxx97@gxxxx.com

Proposal Details
Proposal No. 202608140101351
Period of Insurance From 16 Aug, 2026 14:49 hrs To 15 Aug, 2027 23:59
Issuance Date
Invoice No. 082627608200
Customer Id 101585196512
PAN/Form 97 ID HPVPK4962Q

PMTB082627608200
MR SHUBHAM KUSHWAHA
S/O - RAKESH KUSHWAHA, AGRA NURSURY WARD NO 52
HOSHANGABAD ROAD MISROD BHOPAL HUZUR BHOPAL
MADHYA PRADESH BHOPAL BHOPAL - 462047
MADHYA PRADESH - Tel. 62XXXXXXX3

Policy Year Policy Period For the Vehicle (\`) Trailer (\`) Non Electrical Acc. (\`) Electrical Acc. (\`) CNG/LPG Kit (\`) Total IDV (\`)
Year 1 From 16/08/2026 To 15/08/2027 709800 0 0 0 0 709800
Own Damage Policy Period Liability Policy Period
From Date & Time 16/08/2026 14:49 hrs To Date & Time 15/08/2027 Midnight From Date & Time 16/08/2024 14:49 hrs To Date & Time 15/08/2027 Midnight

Premium Details
Own Damage Premium(a) (\`) Liability Premium(b) (\`)
Basic Own Damage 2265 Total Premium (a+b) 6491
Total Basic Premium 2265 GST 18% : Central Tax 9% ( \`584 ) + State Tax 9% ( \`584) 1168
Less: No Claim Bonus (25%) 566
Total - Less 566
Add on Coverages
Zero Depreciation (IRDAN125RP0001V02201920/A0014V01201920) 2236
Emergency Assistance (IRDAN125RP0001V02201920/A0013V01201920) 150
Engine and Gear box Protection (IRDAN125RP0001V02201920/A0006V01201920) 1150
Cost of Consumables (IRDAN125RP0001V02201920/A0007V01201920) 958
Emergency Assistance Wider IRDAN125RP0001V02201920/A0013V01201920 99
Loss of Personal Belonging - (IRDAN125RP0001V02201920/A0025V01202122) 199
Total - Add on 4792
Net Own Damage Premium (a) 6491 Total Premium 7659
(\`)
Geographical Area India Compulsory Deductible (IMT-22) 0 Voluntary Deductible (IMT-22A) 0
Previous Policy No. D219758536/14082025 Valid 16/08/2025 to 15/08/2026 of GO DIGIT GENERAL INSURANCE LIMITED NCB 20%
Policy Holder declare that no claim has been made in the previous year policy. If declaration found incorrect, benefits under the present policy in respect of own damage section will stand forfeited.

CSC Name : INSUREDESK IMF PRIVATE LIMITED CSC Code : 200427207967 Contact No : 91-8827731100

Customer Name: SHUBHAM KUSHWAHA PAN No. : HPVPK4962Q
UIN :IRDAN125RP0001V02201920
`;

describe("HDFC ERGO Motor Policy Extraction & Isolation", () => {
  it("derives the correct scope", () => {
    const scope = deriveTrainingScope(
      { insuranceCompany: "HDFC ERGO General Insurance Company Limited", documentCategory: "Motor Insurance" },
      { text: sampleOcrText }
    );
    expect(scope).toEqual({ insurer: "hdfc-ergo", category: "motor" });
  });

  it("extracts all fields accurately from HDFC ERGO Motor Proposal/Policy document", () => {
    const original = {
      insuranceCompany: "HDFC ERGO General Insurance Company Limited",
      documentCategory: "Motor Insurance",
    };

    const trained = applyScopedTraining(original, { text: sampleOcrText });

    expect(trained.policyNumber).toBe("PMTB082627608200");
    expect(trained.insuredName).toBe("SHUBHAM KUSHWAHA");
    expect(trained.panNumber).toBe("HPVPK4962Q");
    expect(trained.vehicleMake).toBe("HYUNDAI");
    expect(trained.vehicleModel).toBe("VENUE-1.2 S PETROL");
    expect(trained.registrationNumber).toBe("MP-04-YA-8427");
    expect(trained.vehicleNumber).toBe("MP04YA8427");
    expect(trained.chassisNumber).toBe("MALFB81BLRM632767");
    expect(trained.engineNumber).toBe("G4LARM000239");
    expect(trained.cubicCapacity).toBe("1197");
    expect(trained.seatingCapacity).toBe("5");
    expect(trained.manufacturingYear).toBe("2024");
    expect(trained.bodyType).toBe("SUV");
    expect(trained.idv).toBe("709800");
    expect(trained.startDate).toBe("16/08/2026");
    expect(trained.expiryDate).toBe("15/08/2027");
    expect(trained.basicOwnDamage).toBe("2,265.00");
    expect(trained.ncbDiscount).toBe("566.00");
    expect(trained.ncbPercentage).toBe("25%");
    expect(trained.netPremium).toBe("6,491.00");
    expect(trained.grossPremium).toBe("7,659.00");
    expect(trained.gst).toBe("1,168.00");
    expect(trained.previousPolicyNumber).toBe("D219758536/14082025");
    expect(trained.previousInsurer).toBe("GO DIGIT GENERAL INSURANCE LIMITED");
    expect(trained.previousNcb).toBe("20%");
    expect(trained.cscCode).toBe("200427207967");
    expect(trained.cscName).toBe("INSUREDESK IMF PRIVATE LIMITED");
    expect(trained.extractionTrainingVersion).toBe("HDFC_ERGO_MOTOR_V1");
  });

  it("does not match HDFC ERGO Health policies", () => {
    const healthText = "HDFC ERGO General Insurance Company Limited Optima Secure Individual Health Insurance Policy Schedule";
    expect(hdfcErgoMotor.matches({ text: healthText, result: { policyType: "Health Insurance" } })).toBe(false);
  });
});
