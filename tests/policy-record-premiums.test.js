import { describe, expect, it } from "vitest";
import { normalizeRecord } from "../src/lib/records/index.js";
import { getExportValueForRecord, FIELD_LABELS, FIELD_GROUPS } from "../src/app/lib/dashboard-helpers.js";

describe("policy record gross and net premium display", () => {
  it("normalizes both grossPremium and netPremium on warehouse records", () => {
    const mockWarehouseRecord = {
      id: "test-warehouse-1",
      data: {
        insuredName: "TARA AGRO PARK",
        policyNumber: "1030/454099113/00/000",
        netPremium: "39,500.00",
        totalPremium: "46,610.00",
        premium: "46,610.00",
      },
    };

    const normalized = normalizeRecord(mockWarehouseRecord);
    expect(normalized.netPremium).toBe("39,500.00");
    expect(normalized.grossPremium).toBe("46,610.00");
    expect(normalized.totalPremium).toBe("46,610.00");

    expect(getExportValueForRecord(normalized, "netPremium")).toBe("39,500.00");
    expect(getExportValueForRecord(normalized, "grossPremium")).toBe("46,610.00");
  });

  it("normalizes motor records with netPremium and total/gross premium", () => {
    const mockMotorRecord = {
      id: "test-motor-1",
      data: {
        insuredName: "BHAIJILAL CHOUHAN",
        policyNumber: "N4116778",
        netPremium: "1057",
        totalPremium: "1247",
        premium: "1247",
      },
    };

    const normalized = normalizeRecord(mockMotorRecord);
    expect(normalized.netPremium).toBe("1057");
    expect(normalized.grossPremium).toBe("1247");
    expect(getExportValueForRecord(normalized, "netPremium")).toBe("1057");
    expect(getExportValueForRecord(normalized, "grossPremium")).toBe("1247");
  });

  it("includes grossPremium and netPremium in FIELD_LABELS and FIELD_GROUPS", () => {
    expect(FIELD_LABELS.netPremium).toBe("Net Premium");
    expect(FIELD_LABELS.grossPremium).toBe("Gross Premium");

    const policyDetails = FIELD_GROUPS.find((g) => g.title === "Policy Details");
    expect(policyDetails.fields).toContain("netPremium");
    expect(policyDetails.fields).toContain("grossPremium");

    const payment = FIELD_GROUPS.find((g) => g.title === "Payment");
    expect(payment.fields).toContain("netPremium");
    expect(payment.fields).toContain("grossPremium");
  });
});
