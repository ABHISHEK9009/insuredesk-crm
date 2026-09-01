/* @vitest-environment node */
import { describe, expect, it } from "vitest";
import { createRequire } from "node:module";
import path from "node:path";
import fs from "node:fs";

const require = createRequire(import.meta.url);
const pdf = require("pdf-parse");
const { extractPolicyFromText } = require("../src/lib/policies/pdf/extractor.cjs");
const { selectScopedTraining, deriveTrainingScope } = require("../src/lib/policies/pdf/training/registry.cjs");

describe("Future Generali Motor Policy Training", () => {
  it("extracts SHREENATHJI INFRASTRUCTURE real Future Generali Motor policy correctly", async () => {
    const filePath = path.join(process.cwd(), "storage", "SHREENATHJI INFRASTRUCTURE_MP04EC1080_2026-27.pdf");
    if (!fs.existsSync(filePath)) return;
    const buf = fs.readFileSync(filePath);
    const data = await pdf(buf);

    const result = extractPolicyFromText(data.text, "SHREENATHJI INFRASTRUCTURE_MP04EC1080_2026-27.pdf");

    expect(result.insuranceCompany).toBe("Future Generali India Insurance Company Limited");
    expect(result.documentCategory).toBe("Motor Insurance");
    expect(result.policyNumber).toBe("132/02/11/0827/MTP/1010597941");
    expect(result.taxInvoiceNumber).toBe("232608I000014560");
    expect(result.insuredName).toBe("SHREENATHJI INFRASTRUCTURE");
    expect(result.registrationNumber).toBe("MP-04-EC-1080");
    expect(result.vehicleMake).toBe("KIA");
    expect(result.vehicleModel).toBe("SELTOS D1.5 CRDI 6MT HTX");
    expect(result.makeModel).toBe("KIA SELTOS D1.5 CRDI 6MT HTX");
    expect(result.engineNumber).toBe("D4FAMM349322");
    expect(result.chassisNumber).toBe("MZBEU813LMN275748");
    expect(result.manufacturingYear).toBe("2021");
    expect(result.cubicCapacity).toBe("1493");
    expect(result.seatingCapacity).toBe("5");
    expect(result.bodyType).toBe("Saloon");
    expect(result.idv).toBe("923643.00");
    expect(result.productName).toBe("MOTOR PROTECT PRIVATE CAR PACKAGE POLICY");
    expect(result.startDate).toBe("27/08/2026");
    expect(result.expiryDate).toBe("26/08/2027");
    expect(result.policyIssueDate).toBe("26/08/2026");
    expect(result.odPremium).toBe("5113.00");
    expect(result.tpPremium).toBe("3716.00");
    expect(result.netPremium).toBe("8829.12");
    expect(result.gstAmount).toBe("1589.24");
    expect(result.totalPremium).toBe("10418.00");
    expect(result.ncb).toBe("25%");
    expect(result.financerName).toBe("CANARA BANK");
    expect(result.agentCode).toBe("60123694");
    expect(result.intermediaryName).toBe("ROSHNI SAHU");
    expect(result.gstin).toBe("23ADJFS5900M1ZV");
    expect(result.panNumber).toBe("ADJFS5900M");
    expect(result.customerEmail).toBe("ANAND.INSUREDESK@GMAIL.COM");
  });

  it("preserves strict scope isolation so Future Generali motor trainer does not trigger for other scopes", () => {
    const nonGeneraliScope = deriveTrainingScope(
      { insuranceCompany: "Tata AIG General Insurance Company Limited", documentCategory: "Motor Insurance" },
      { text: "Tata AIG Auto Secure Policy" }
    );
    expect(nonGeneraliScope.insurer).not.toBe("future-generali");

    const nonMotorScope = deriveTrainingScope(
      { insuranceCompany: "Future Generali India Insurance Company Limited", documentCategory: "Fire Insurance" },
      { text: "Future Generali Standard Fire Policy" }
    );
    expect(nonMotorScope.category).not.toBe("motor");
    const selected = selectScopedTraining(
      { insuranceCompany: "Future Generali India Insurance Company Limited", documentCategory: "Fire Insurance" },
      { text: "Future Generali Standard Fire Policy" }
    );
    expect(selected.some((t) => t.scope.category === "motor")).toBe(false);
  });
});
