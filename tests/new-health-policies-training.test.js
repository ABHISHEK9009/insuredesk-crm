/* @vitest-environment node */
import { createRequire } from "node:module";
import { describe, expect, it } from "vitest";
import path from "node:path";
import fs from "node:fs";

const require = createRequire(import.meta.url);
const pdf = require("pdf-parse");
const { applyScopedTraining } = require("../src/lib/policies/pdf/training/registry.cjs");

describe("New Health Policies Training Verification", () => {
  async function extract(filename) {
    const filePath = path.join(process.cwd(), "storage", "NEW HEALTH", filename);
    const buf = fs.readFileSync(filePath);
    const data = await pdf(buf);
    return applyScopedTraining({}, { text: data.text });
  }

  describe("HDFC ERGO Health Policies", () => {
    it("extracts GEETA TIWARI Energy Silver policy correctly", async () => {
      const result = await extract("GEETA TIWARI_ health policy_26-27.pdf");
      expect(result.insuranceCompany).toBe("HDFC ERGO General Insurance Company Limited");
      expect(result.productName).toBe("Energy (Silver)");
      expect(result.policyNumber).toBe("2814203597618606000");
      expect(result.customerName).toBe("GEETA TIWARI");
      expect(result.policyStartDate).toBe("30/07/2026");
      expect(result.policyEndDate).toBe("29/07/2027");
      expect(result.totalPremium).toBe("29,588.00");
      expect(result.sumInsured).toBe("3,00,000.00");
      expect(result.firstPolicyInceptionDate).toBe("28/06/2016");
      expect(result.nomineeName).toBe("K K Tiwari");
      expect(result.nomineeRelationship).toBe("Husband");
      expect(result.numberOfInsuredMembers).toBe(1);
      expect(result.insuredMembers[0]).toMatchObject({
        name: "GEETA TIWARI",
        dateOfBirth: "10/09/1964",
        firstPolicyInceptionDate: "28/06/2016",
      });
      expect(result.agentName).toBe("INSUREDESK IMF PRIVATE LIMITED");
      expect(result.agentCode).toBe("200427207967");
      expect(result.agentMobile).toBe("8827731100");
    });

    it("extracts MANOJ KUMAR KHURANA Optima Secure+ policy with 3 family members", async () => {
      const result = await extract("MANOJ KUMAR KHURANA_health policy-25-26.pdf");
      expect(result.insuranceCompany).toBe("HDFC ERGO General Insurance Company Limited");
      expect(result.productName).toBe("Optima Secure");
      expect(result.policyNumber).toBe("2800000041436000000");
      expect(result.customerName).toBe("MANOJ KUMAR KHURANA");
      expect(result.policyStartDate).toBe("11/07/2026");
      expect(result.policyEndDate).toBe("10/07/2027");
      expect(result.totalPremium).toBe("47,527.00");
      expect(result.sumInsured).toBe("15,00,000.00");
      expect(result.nomineeName).toBe("Sakshi Khurana");
      expect(result.nomineeRelationship).toBe("Wife");
      expect(result.numberOfInsuredMembers).toBe(3);
      expect(result.insuredMembers).toEqual([
        expect.objectContaining({
          name: "MANOJ KUMAR KHURANA",
          relationship: "Self",
          gender: "Male",
          dateOfBirth: "29/09/1973",
        }),
        expect.objectContaining({
          name: "Sakshi Khurana",
          relationship: "Wife",
          gender: "Female",
          dateOfBirth: "04/04/1976",
        }),
        expect.objectContaining({
          name: "Suhani Khurana",
          relationship: "Daughter",
          gender: "Female",
          dateOfBirth: "23/10/2004",
        }),
      ]);
      expect(result.agentName).toBe("INSUREDESK IMF PRIVATE LIMITED");
    });

    it("extracts Neeraj Vijay Optima Secure+ policy correctly", async () => {
      const result = await extract("Neeraj vijay_health policy- 26-29.pdf");
      expect(result.insuranceCompany).toBe("HDFC ERGO General Insurance Company Limited");
      expect(result.productName).toBe("Optima Secure");
      expect(result.policyNumber).toBe("2800000049711300000");
      expect(result.customerName).toBe("Neeraj Vijay");
      expect(result.policyStartDate).toBe("04/08/2026");
      expect(result.policyEndDate).toBe("03/08/2029");
      expect(result.totalPremium).toBe("1,86,332.00");
      expect(result.sumInsured).toBe("20,00,000.00");
      expect(result.nomineeName).toBe("SEEMA VIJAYWARGI");
      expect(result.nomineeRelationship).toBe("Wife");
      expect(result.numberOfInsuredMembers).toBe(1);
      expect(result.insuredMembers[0]).toMatchObject({
        name: "Neeraj Vijay",
        relationship: "Self",
        gender: "Male",
        dateOfBirth: "08/07/1967",
      });
      expect(result.agentName).toBe("INSUREDESK IMF PRIVATE LIMITED");
    });

    it("extracts Rahul Kumar Bamne Optima Secure+ policy with 2 members", async () => {
      const result = await extract("Rahul Kumar Bamne_Health policy_26-27.pdf");
      expect(result.insuranceCompany).toBe("HDFC ERGO General Insurance Company Limited");
      expect(result.productName).toBe("Optima Secure");
      expect(result.policyNumber).toBe("2800000050492700000");
      expect(result.customerName).toBe("Rahul Kumar Bamne");
      expect(result.policyStartDate).toBe("08/08/2026");
      expect(result.policyEndDate).toBe("07/08/2027");
      expect(result.totalPremium).toBe("20,316.00");
      expect(result.sumInsured).toBe("10,00,000.00");
      expect(result.nomineeName).toBe("INDU MANDARAI");
      expect(result.nomineeRelationship).toBe("Wife");
      expect(result.numberOfInsuredMembers).toBe(2);
      expect(result.insuredMembers).toEqual([
        expect.objectContaining({
          name: "Rahul Kumar Bamne",
          relationship: "Self",
          gender: "Male",
          dateOfBirth: "24/02/1993",
        }),
        expect.objectContaining({
          name: "INDU MANDARAI",
          relationship: "Wife",
          gender: "Female",
          dateOfBirth: "05/10/1993",
        }),
      ]);
      expect(result.agentName).toBe("INSUREDESK IMF PRIVATE LIMITED");
    });

    it("extracts Mr Ashesh Tiwari Optima Restore policy correctly", async () => {
      const result = await extract("Mr Ashesh Tiwari_health policy-26-27.pdf");
      expect(result.insuranceCompany).toBe("HDFC ERGO General Insurance Company Limited");
      expect(result.productName).toBe("Optima Restore");
      expect(result.policyNumber).toBe("2805203567051706000");
      expect(result.customerName).toBe("ASHESH TIWARI");
      expect(result.policyStartDate).toBe("25/06/2026");
      expect(result.policyEndDate).toBe("24/06/2027");
      expect(result.totalPremium).toBe("51,523.00");
      expect(result.sumInsured).toBe("10,00,000.00");
      expect(result.nomineeName).toBe("Sulakshna Tiwari");
      expect(result.nomineeRelationship).toBe("Wife");
      expect(result.agentName).toBe("INSUREDESK IMF PRIVATE LIMITED");
    });

    it("extracts Mr Karunakar Tiwari Optima Restore policy correctly", async () => {
      const result = await extract("Mr Karunakar Tiwari_health policy-26-27.pdf");
      expect(result.insuranceCompany).toBe("HDFC ERGO General Insurance Company Limited");
      expect(result.productName).toBe("Optima Restore");
      expect(result.policyNumber).toBe("2805203583369706000");
      expect(result.customerName).toBe("KARUNAKAR TIWARI");
      expect(result.policyStartDate).toBe("24/07/2026");
      expect(result.policyEndDate).toBe("23/07/2027");
      expect(result.totalPremium).toBe("38,899.00");
      expect(result.sumInsured).toBe("5,00,000.00");
      expect(result.nomineeName).toBe("Geeta Tiwari");
      expect(result.nomineeRelationship).toBe("Wife");
      expect(result.agentName).toBe("INSUREDESK IMF PRIVATE LIMITED");
    });
  });

  describe("Care Health Policies", () => {
    it("extracts Ms Seema B Vijaywargi Care Supreme Individual policy correctly", async () => {
      const result = await extract("Ms Seema B Vijaywargi_ Health Policy_26-29.pdf");
      expect(result.insuranceCompany).toBe("Care Health Insurance Limited");
      expect(result.productName).toBe("Care Supreme");
      expect(result.policyNumber).toBe("C1563334");
      expect(result.customerName).toBe("Seema B Vijaywargi");
      expect(result.policyStartDate).toBe("08/08/2026");
      expect(result.policyEndDate).toBe("07/08/2029");
      expect(result.totalPremium).toBe("73,193.00");
      expect(result.netPremium).toBe("73,193.22");
      expect(result.sumInsured).toBe("50,00,000.00");
      expect(result.policyCoverType).toBe("Individual");
      expect(result.nomineeName).toBe("NEERAJ VIJAY");
      expect(result.nomineeRelationship).toBe("Husband");
      expect(result.numberOfInsuredMembers).toBe(1);
      expect(result.insuredMembers[0]).toMatchObject({
        name: "Seema B Vijaywargi",
        clientId: "L3397507",
        dateOfBirth: "08/09/1966",
        age: "59",
      });
      expect(result.agentName).toBe("Kunal Goswami");
      expect(result.agentCode).toBe("20982709");
      expect(result.agentMobile).toBe("9243767580");
    });

    it("extracts Yogesh Kumar Sonwani Care Supreme Floater policy with 3 members correctly", async () => {
      const result = await extract("Yogesh Kumar Sonwani_Health policy_26-27.pdf");
      expect(result.insuranceCompany).toBe("Care Health Insurance Limited");
      expect(result.productName).toBe("Care Supreme");
      expect(result.policyNumber).toBe("C1395780");
      expect(result.customerName).toBe("Yogesh Kumar Sonwani");
      expect(result.policyStartDate).toBe("14/08/2026");
      expect(result.policyEndDate).toBe("13/08/2027");
      expect(result.totalPremium).toBe("14,564.00");
      expect(result.netPremium).toBe("14,563.54");
      expect(result.sumInsured).toBe("7,00,000.00");
      expect(result.policyCoverType).toBe("Floater");
      expect(result.nomineeName).toBe("PRAGATI SONWANI");
      expect(result.nomineeRelationship).toBe("Wife");
      expect(result.numberOfInsuredMembers).toBe(3);
      expect(result.insuredMembers).toEqual([
        expect.objectContaining({
          name: "Yogesh Kumar Sonwani",
          clientId: "C4113371",
          relationship: "Self",
          dateOfBirth: "08/04/1990",
          age: "36",
        }),
        expect.objectContaining({
          name: "Hardik Sonwani",
          clientId: "C4506812",
          relationship: "Son",
          dateOfBirth: "10/05/2019",
          age: "07",
        }),
        expect.objectContaining({
          name: "Pragati Sonwani",
          clientId: "C4506811",
          relationship: "Spouse",
          dateOfBirth: "08/08/1989",
          age: "37",
        }),
      ]);
      expect(result.agentName).toBe("Nidhi Gupta");
      expect(result.agentCode).toBe("20036217");
      expect(result.agentMobile).toBe("8818889660");
    });
  });

  describe("Tata AIG Health Policies", () => {
    it("extracts Sudhir Sinha TATA AIG Medicare policy with 3 members correctly", async () => {
      const result = await extract("Sudhir Sinha_health policy_26-27.pdf");
      expect(result.insuranceCompany).toBe("Tata AIG General Insurance Company Limited");
      expect(result.productName).toBe("TATA AIG Medicare");
      expect(result.policyNumber).toBe("0238503103-06");
      expect(result.customerName).toBe("Sudhir Sinha");
      expect(result.policyStartDate).toBe("14/07/2026");
      expect(result.policyEndDate).toBe("13/07/2027");
      expect(result.totalPremium).toBe("34,189.00");
      expect(result.sumInsured).toBe("15,00,000.00");
      expect(result.policyCoverType).toBe("Floater");
      expect(result.nomineeName).toBe("POONAM SINHA");
      expect(result.nomineeRelationship).toBe("Wife");
      expect(result.numberOfInsuredMembers).toBe(3);
      expect(result.insuredMembers).toEqual([
        expect.objectContaining({
          name: "Sudhir Sinha",
          relationship: "Self",
          dateOfBirth: "02/06/1976",
          age: "50",
          memberId: "ZZZZ727127601038",
        }),
        expect.objectContaining({
          name: "Poonam Sinha",
          relationship: "Spouse",
          dateOfBirth: "03/04/1980",
          age: "46",
          memberId: "ZZZZ727127602034",
        }),
        expect.objectContaining({
          name: "Divyansha Sinha",
          relationship: "Daughter",
          dateOfBirth: "24/08/2013",
          age: "12",
          memberId: "ZZZZ727127603000",
        }),
      ]);
      expect(result.agentName).toBe("NIDHI GUPTA");
      expect(result.agentCode).toBe("00904688");
      expect(result.agentMobile).toBe("18889660");
      expect(result.newOrRenewal).toBe("Renewal");
      expect(result.customerId).toBe("0008535106");
      expect(result.proposalNumber).toBe("PPR/BT/28559/7020892440");
      expect(result.contactNumber).toBe("9713622220");
    });
  });
});
