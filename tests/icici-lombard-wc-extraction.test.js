/* @vitest-environment node */
import { describe, expect, it } from 'vitest';
import { createRequire } from 'node:module';
import path from 'node:path';
import fs from 'node:fs';

const require = createRequire(import.meta.url);
const pdf = require('pdf-parse/lib/pdf-parse.js');
const { extractPolicyFromText } = require('../src/lib/policies/pdf/extractor.cjs');

describe('ICICI Lombard Workmen Compensation Extraction (Non-Motor Isolated)', () => {
  const dir = path.join(process.cwd(), 'storage', 'aug policy (2)', 'aug policy');

  it('extracts Andhra Pradesh WC PDF as Workmen Compensation (not Motor, not Health, not Warehouse)', async () => {
    const filePath = path.join(dir, 'Andhra Pradesh_WC_LION.pdf');
    if (!fs.existsSync(filePath)) return;
    const buf = fs.readFileSync(filePath);
    const parsed = await pdf(buf);
    const res = extractPolicyFromText(parsed.text, 'Andhra Pradesh_WC_LION.pdf');

    expect(res.insuranceCompany).toMatch(/ICICI Lombard/i);
    expect(res.documentCategory).toBe('Workmen Compensation');
    expect(res.documentCategory).not.toBe('Motor Insurance');
    expect(res.documentCategory).not.toBe('Health Insurance');
    expect(res.documentCategory).not.toBe('Warehouse Insurance');
    expect(res.policyNumber).toBe('4010/451623340/00/000');
    expect(res.insuredName).toMatch(/LION ENGINEERING/i);
    expect(res.netPremium).toBe('3,455.00');
    expect(res.totalPremium).toBe('4,079.00');
  });

  it('extracts Bhusawal WC PDF correctly', async () => {
    const filePath = path.join(dir, 'Bhusawal_WC_LION.pdf');
    if (!fs.existsSync(filePath)) return;
    const buf = fs.readFileSync(filePath);
    const parsed = await pdf(buf);
    const res = extractPolicyFromText(parsed.text, 'Bhusawal_WC_LION.pdf');

    expect(res.insuranceCompany).toMatch(/ICICI Lombard/i);
    expect(res.documentCategory).toBe('Workmen Compensation');
    expect(res.policyNumber).toBe('4010/452114459/00/000');
    expect(res.insuredName).toMatch(/LION ENGINEERING/i);
    expect(res.netPremium).toBe('7,899.00');
    expect(res.totalPremium).toBe('9,325.00');
  });

  it('extracts Jalna WC PDF correctly', async () => {
    const filePath = path.join(dir, 'Jalna_wc_lion.pdf');
    if (!fs.existsSync(filePath)) return;
    const buf = fs.readFileSync(filePath);
    const parsed = await pdf(buf);
    const res = extractPolicyFromText(parsed.text, 'Jalna_wc_lion.pdf');

    expect(res.insuranceCompany).toMatch(/ICICI Lombard/i);
    expect(res.documentCategory).toBe('Workmen Compensation');
    expect(res.policyNumber).toBe('4010/406217545/01/000');
    expect(res.insuredName).toMatch(/LION ENGINEERING/i);
    expect(res.netPremium).toBe('27,823.00');
    expect(res.totalPremium).toBe('32,845.00');
  });

  it('extracts Savaii Vihar WC PDF correctly', async () => {
    const filePath = path.join(dir, 'Savaii Vihar_WC_LION.pdf');
    if (!fs.existsSync(filePath)) return;
    const buf = fs.readFileSync(filePath);
    const parsed = await pdf(buf);
    const res = extractPolicyFromText(parsed.text, 'Savaii Vihar_WC_LION.pdf');

    expect(res.insuranceCompany).toMatch(/ICICI Lombard/i);
    expect(res.documentCategory).toBe('Workmen Compensation');
    expect(res.policyNumber).toBe('4010/451626191/00/000');
    expect(res.insuredName).toMatch(/LION ENGINEERING/i);
    expect(res.netPremium).toBe('9,110.00');
    expect(res.totalPremium).toBe('10,755.00');
  });

  it('extracts Tamil Nadu WC PDF correctly', async () => {
    const filePath = path.join(dir, 'Tamil Nadu_WC_LION.pdf');
    if (!fs.existsSync(filePath)) return;
    const buf = fs.readFileSync(filePath);
    const parsed = await pdf(buf);
    const res = extractPolicyFromText(parsed.text, 'Tamil Nadu_WC_LION.pdf');

    expect(res.insuranceCompany).toMatch(/ICICI Lombard/i);
    expect(res.documentCategory).toBe('Workmen Compensation');
    expect(res.policyNumber).toBe('4010/452331345/00/000');
    expect(res.insuredName).toMatch(/LION ENGINEERING/i);
    expect(res.netPremium).toBe('17,223.00');
    expect(res.totalPremium).toBe('20,332.00');
  });

  it('extracts Yamuna South Bank WC PDF correctly', async () => {
    const filePath = path.join(dir, 'Yamuna South Bank_WC_LION.pdf');
    if (!fs.existsSync(filePath)) return;
    const buf = fs.readFileSync(filePath);
    const parsed = await pdf(buf);
    const res = extractPolicyFromText(parsed.text, 'Yamuna South Bank_WC_LION.pdf');

    expect(res.insuranceCompany).toMatch(/ICICI Lombard/i);
    expect(res.documentCategory).toBe('Workmen Compensation');
    expect(res.policyNumber).toBe('4010/303399088/03/000');
    expect(res.insuredName).toMatch(/LION ENGINEERING/i);
    expect(res.netPremium).toBe('18,115.00');
    expect(res.totalPremium).toBe('21,385.00');
  });
});
