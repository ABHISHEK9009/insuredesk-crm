/* @vitest-environment node */
import { describe, expect, it } from 'vitest';
import { createRequire } from 'node:module';
import path from 'node:path';
import fs from 'node:fs';

const require = createRequire(import.meta.url);
const pdf = require('pdf-parse/lib/pdf-parse.js');
const { extractPolicyFromText } = require('../src/lib/policies/pdf/extractor.cjs');

describe('ICICI Lombard Fire Extraction (Non-Motor Isolated)', () => {
  const dir = path.join(process.cwd(), 'storage', 'aug policy (2)', 'aug policy');

  it('extracts Andhra Pradesh Fire PDF as Fire Insurance (not Motor, not Health, not Warehouse)', async () => {
    const filePath = path.join(dir, 'ANDHRA PRADESH_FIRE BURG_LION.pdf');
    if (!fs.existsSync(filePath)) return;
    const buf = fs.readFileSync(filePath);
    const parsed = await pdf(buf);
    const res = extractPolicyFromText(parsed.text, 'ANDHRA PRADESH_FIRE BURG_LION.pdf');

    expect(res.insuranceCompany).toMatch(/ICICI Lombard/i);
    expect(res.documentCategory).toBe('Fire Insurance');
    expect(res.documentCategory).not.toBe('Motor Insurance');
    expect(res.documentCategory).not.toBe('Health Insurance');
    expect(res.documentCategory).not.toBe('Warehouse Insurance');
    expect(res.policyNumber).toBe('1030/451607784/00/000');
    expect(res.insuredName).toMatch(/LION ENGINEERING/i);
    expect(res.netPremium).toBe('1,000.00');
    expect(res.totalPremium).toBe('1,180.00');
  });

  it('extracts EMKAY India Shop PDF correctly', async () => {
    const filePath = path.join(dir, 'EMKAY INDIA SHOP_26-27.pdf');
    if (!fs.existsSync(filePath)) return;
    const buf = fs.readFileSync(filePath);
    const parsed = await pdf(buf);
    const res = extractPolicyFromText(parsed.text, 'EMKAY INDIA SHOP_26-27.pdf');

    expect(res.insuranceCompany).toMatch(/ICICI Lombard/i);
    expect(res.documentCategory).toBe('Fire Insurance');
    expect(res.policyNumber).toBe('1030/453367674/00/000');
    expect(res.insuredName).toMatch(/EMKAY INDIA/i);
    expect(res.netPremium).toBe('9,889.00');
    expect(res.totalPremium).toBe('11,669.02');
  });

  it('extracts Varsham Ventures PDF correctly', async () => {
    const filePath = path.join(dir, 'VARSHAM VENTURES PRIVATE LIMITED_26-27.pdf');
    if (!fs.existsSync(filePath)) return;
    const buf = fs.readFileSync(filePath);
    const parsed = await pdf(buf);
    const res = extractPolicyFromText(parsed.text, 'VARSHAM VENTURES PRIVATE LIMITED_26-27.pdf');

    expect(res.insuranceCompany).toMatch(/ICICI Lombard/i);
    expect(res.documentCategory).toBe('Fire Insurance');
    expect(res.policyNumber).toBe('1030/453016976/00/000');
    expect(res.insuredName).toMatch(/VARSHAM VENTURES/i);
    expect(res.netPremium).toBe('10,182.00');
    expect(res.totalPremium).toBe('12,014.76');
  });

  it('extracts Raghuveer Rice Mill PDF correctly', async () => {
    const filePath = path.join(dir, 'RAGHUVEER SHRI RICE MILL AVAM DHARMKANTA POLICY.pdf');
    if (!fs.existsSync(filePath)) return;
    const buf = fs.readFileSync(filePath);
    const parsed = await pdf(buf);
    const res = extractPolicyFromText(parsed.text, 'RAGHUVEER SHRI RICE MILL AVAM DHARMKANTA POLICY.pdf');

    expect(res.insuranceCompany).toMatch(/ICICI Lombard/i);
    expect(res.documentCategory).toBe('Fire Insurance');
    expect(res.policyNumber).toBe('1030/451483364/00/000');
    expect(res.insuredName).toMatch(/RAGHUVEER SHRI RICE MILL/i);
    expect(res.netPremium).toBe('37,703.00');
    expect(res.totalPremium).toBe('44,489.54');
  });

  it('extracts Kishan Warehousing Corporation policy correctly (MSME Suraksha Kavach)', async () => {
    const filePath = path.join(process.cwd(), 'storage', 'KISHAN WAREHOUSING CORPORATION POLICY.pdf');
    if (!fs.existsSync(filePath)) return;
    const buf = fs.readFileSync(filePath);
    const parsed = await pdf(buf);
    const res = extractPolicyFromText(parsed.text, 'KISHAN WAREHOUSING CORPORATION POLICY.pdf');

    expect(res.insuranceCompany).toMatch(/ICICI Lombard/i);
    expect(res.documentCategory).toBe('Fire Insurance');
    expect(res.documentCategory).not.toBe('Motor Insurance');
    expect(res.documentCategory).not.toBe('Health Insurance');
    expect(res.policyNumber).toBe('1030/454254554/00/000');
    expect(res.insuredName).toBe('KISHAN WAREHOUSING CORPORATION');
    expect(res.contactPerson).toBe('SURAJ SINGH RAJPUT');
    expect(res.startDate).toBe('05/09/2026');
    expect(res.expiryDate).toBe('04/09/2027');
    expect(res.netPremium).toBe('3,625.00');
    expect(res.cgst).toBe('326.25');
    expect(res.sgst).toBe('326.25');
    expect(res.igst).toBe('0.00');
    expect(res.taxAmount).toBe('652.50');
    expect(res.totalPremium).toBe('4,277.50');
    expect(res.sumInsured).toBe('1,25,00,000.00');
    expect(res.buildingSumInsured).toBe('25,00,000.00');
    expect(res.contentsSumInsured).toBe('1,00,00,000.00');
    expect(res.burglarySumInsured).toBe('1,00,00,000.00');
    expect(res.fidelitySumInsured).toBe('10,00,000.00');
    expect(res.brokerCode).toBe('2021477077928594');
    expect(res.brokerName).toBe('INSUREDESK');
    expect(res.brokerMobile).toBe('8818889660');
    expect(res.brokerEmail).toBe('anand.soni10@gmai.com');
    expect(res.invoiceNumber).toBe('100926500752');
    expect(res.invoiceDate).toBe('05/09/2026');
  });
});

