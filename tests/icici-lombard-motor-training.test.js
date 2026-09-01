/* @vitest-environment node */
import { createRequire } from "node:module";
import { describe, expect, it } from "vitest";
import path from "node:path";
import fs from "node:fs";

const require = createRequire(import.meta.url);
const pdf = require("pdf-parse");
const trainer = require("../src/lib/policies/pdf/training/icici-lombard/motor.cjs");
const { applyScopedTraining, selectScopedTraining, deriveTrainingScope } = require("../src/lib/policies/pdf/training/registry.cjs");

describe("ICICI Lombard Motor PDF Training Module", () => {
  it("derives the correct training scope", () => {
    const scope = deriveTrainingScope(
      { insuranceCompany: "ICICI Lombard General Insurance Company Limited", documentCategory: "Motor Insurance" },
      { text: "Stand-Alone Own Damage Private Car Insurance Policy 3001/O" }
    );
    expect(scope).toEqual({ insurer: "icici-lombard", category: "motor" });
  });

  it("extracts ANKIT SHINDE real Standalone Own Damage Private Car policy correctly", async () => {
    const filePath = path.join(process.cwd(), "storage", "ANKIT SHINDE_MP09DS4073_2026-27.pdf");
    if (!fs.existsSync(filePath)) return;
    const buf = fs.readFileSync(filePath);
    const data = await pdf(buf);

    const result = applyScopedTraining({}, { text: data.text });

    expect(result.insuranceCompany).toBe("ICICI Lombard General Insurance Company Limited");
    expect(result.documentCategory).toBe("Motor Insurance");
    expect(result.productName).toBe("Stand-Alone Own Damage Private Car Insurance Policy");
    expect(result.policyType).toBe("Stand-Alone Own Damage Private Car Insurance Policy");
    expect(result.policyCoverType).toBe("Standalone Own Damage");
    expect(result.policyNumber).toBe("3001/O/452859230/00/000");
    expect(result.covernoteNumber).toBe("452859230");
    expect(result.referenceNumber).toBe("W585590864");
    expect(result.uinNumber).toBe("IRDAN115RP0001V03201920");
    expect(result.productCode).toBe("3001/O");
    expect(result.invoiceNumber).toBe("1008261922592");
    expect(result.insuredName).toBe("ANKIT SHINDE");
    expect(result.customerName).toBe("ANKIT SHINDE");
    expect(result.contactPerson).toBe("ANKIT SHINDE");
    expect(result.proposerName).toBe("ANKIT SHINDE");
    expect(result.contactNumber).toBe("99******22");
    expect(result.customerMobile).toBe("99******22");
    expect(result.customerEmail).toBe("IN**************@GMAIL.COM");
    expect(result.address).toBe("56 GANDHEE PALACE INDORE INDORE MADHYA PRADESH-452005, INDORE, MADHYA PRADESH 452005");
    expect(result.rtoLocation).toBe("MADHYA PRADESH-INDORE");
    expect(result.hypothecation).toBe("MADHYA PRADESH GRAMIN BANK");
    expect(result.startDate).toBe("26/08/2026");
    expect(result.expiryDate).toBe("25/08/2027");
    expect(result.policyIssueDate).toBe("25/08/2026");
    expect(result.registrationNumber).toBe("MP09DS4073");
    expect(result.vehicleNumber).toBe("MP09DS4073");
    expect(result.vehicleMake).toBe("Tata Motors");
    expect(result.vehicleModel).toBe("PUNCH ADVENTURE AMT");
    expect(result.makeModel).toBe("Tata Motors / PUNCH ADVENTURE AMT");
    expect(result.engineNumber).toBe("REVTRN20FVXME0216");
    expect(result.chassisNumber).toBe("MAT634055RPFB1798");
    expect(result.cubicCapacity).toBe("1199");
    expect(result.manufacturingYear).toBe("2024");
    expect(result.seatingCapacity).toBe("5");
    expect(result.bodyType).toBe("SUV");
    expect(result.idv).toBe("5,16,594.00");
    expect(result.totalIdv).toBe("5,16,594.00");
    expect(result.basicOwnDamage).toBe("1,648.00");
    expect(result.ncbPercentage).toBe("25%");
    expect(result.ncbDiscount).toBe("412.00");
    expect(result.odPremium).toBe("6,512.00");
    expect(result.netPremium).toBe("6,512.00");
    expect(result.cgst).toBe("586.08");
    expect(result.sgst).toBe("586.08");
    expect(result.gstAmount).toBe("1,172.00");
    expect(result.totalPremium).toBe("7,684.00");
    expect(result.grossPremium).toBe("7,684.00");
    expect(result.zeroDepreciationCover).toBe("Yes");
    expect(result.consumablesCover).toBe("Yes");
    expect(result.engineProtectorCover).toBe("Yes");
    expect(result.roadsideAssistanceCover).toBe("Yes");
    expect(result.keysAndLocksCover).toBe("Yes");
    expect(result.personalBaggageCover).toBe("Yes");
    expect(result.addOnCovers).toBe("Zero Depreciation, Consumables, Engine Protect Plus, Road Side Assistance, Key Protect, Loss of Personal Belongings");
    expect(result.previousPolicyNumber).toBe("0148582666");
    expect(result.previousPolicyStartDate).toBe("26/08/2025");
    expect(result.previousPolicyExpiryDate).toBe("25/08/2026");
    expect(result.previousNcb).toBe("20%");
    expect(result.previousInsurer).toBe("TAIG");
    expect(result.activeTpPolicyNumber).toBe("01481822540000");
    expect(result.activeTpStartDate).toBe("26/08/2024");
    expect(result.activeTpExpiryDate).toBe("25/08/2027");
    expect(result.activeTpInsurer).toBe("TATA AIG");
    expect(result.receiptNumber).toBe("1273849546");
    expect(result.receiptDate).toBe("25-08-2026");
    expect(result.compulsoryDeductible).toBe("1,000.00");
    expect(result.imtEndorsements).toBe("IMT-7, IMT-22");
    expect(result.extractionTrainingVersion).toBe("ICICI_LOMBARD_MOTOR_V1");
  });

  it("is isolated from ICICI Lombard Health and other motor insurers", () => {
    const iciciHealth = selectScopedTraining(
      { insuranceCompany: "ICICI Lombard General Insurance Company Limited", documentCategory: "Health Insurance" },
      { text: "ICICI Lombard ELEVATE Complete Health Policy Schedule" }
    );
    const tataMotor = selectScopedTraining(
      { insuranceCompany: "Tata AIG General Insurance Company Limited", documentCategory: "Motor Insurance" },
      { text: "Tata AIG Auto Secure Private Car Package Policy" }
    );

    expect(iciciHealth).not.toContain(trainer);
    expect(tataMotor).not.toContain(trainer);
  });
});
