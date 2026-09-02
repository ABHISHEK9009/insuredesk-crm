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
});
