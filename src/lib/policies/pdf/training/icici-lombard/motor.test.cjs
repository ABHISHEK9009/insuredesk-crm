/* global describe, it, expect */
const { selectScopedTraining } = require("../registry.cjs");
const trainer = require("./motor.cjs");

describe("ICICI Lombard Motor PDF Training Module", () => {
  it("isolates ICICI Lombard Motor trainer from non-motor and other insurers", () => {
    const iciciHealth = {
      insuranceCompany: "ICICI Lombard General Insurance Company Limited",
      documentCategory: "Health Insurance",
    };
    const tataMotor = {
      insuranceCompany: "Tata AIG General Insurance Company Limited",
      documentCategory: "Motor Insurance",
    };

    expect(selectScopedTraining(iciciHealth, { text: "ELEVATE Complete Health" })).not.toContain(trainer);
    expect(selectScopedTraining(tataMotor, { text: "Auto Secure Private Car" })).not.toContain(trainer);
  });
});
