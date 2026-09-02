/* @vitest-environment node */
import { describe, expect, it } from 'vitest';
import { createRequire } from 'node:module';
import path from 'node:path';
import fs from 'node:fs';

const require = createRequire(import.meta.url);
const pdf = require('pdf-parse/lib/pdf-parse.js');
const { extractPolicyFromText } = require('../src/lib/policies/pdf/extractor.cjs');

describe('ICICI Lombard CPM, Marine, and Fidelity Extraction', () => {
  const dir = path.join(process.cwd(), 'storage', 'aug policy (2)', 'aug policy');

  it('extracts SMT ANSHU SINGH PARIHAR as Contractors Plant & Machinery', async () => {
    const filePath = path.join(dir, 'SMT ANSHU SINGH PARIHAR.pdf');
    if (!fs.existsSync(filePath)) return;
    const buf = fs.readFileSync(filePath);
    const parsed = await pdf(buf);
    const res = extractPolicyFromText(parsed.text, 'SMT ANSHU SINGH PARIHAR.pdf');

    expect(res.insuranceCompany).toMatch(/ICICI Lombard/i);
    expect(res.documentCategory).toBe('Contractors Plant & Machinery');
    expect(res.policyNumber).toBe('5006/451959722/00/000');
    expect(res.insuredName).toMatch(/SMT ANSHU SINGH PARIHAR/i);
    expect(res.totalPremium).toBe('44,965.08');
  }, 20000);

  it('extracts YAMUNA SOUTH FIDELITY as Fidelity Insurance', async () => {
    const filePath = path.join(dir, 'YAMUNA SOUTH_FIDELITY LION.pdf');
    if (!fs.existsSync(filePath)) return;
    const buf = fs.readFileSync(filePath);
    const parsed = await pdf(buf);
    const res = extractPolicyFromText(parsed.text, 'YAMUNA SOUTH_FIDELITY LION.pdf');

    expect(res.insuranceCompany).toMatch(/ICICI Lombard/i);
    expect(res.documentCategory).toBe('Fidelity Insurance');
    expect(res.policyNumber).toBe('4003/304003854/03/000');
    expect(res.insuredName).toMatch(/LION ENGINEERING/i);
    expect(res.totalPremium).toBe('33,969.84');
  }, 20000);

  it('extracts VAK CONSEQUIP Marine PDF as Marine Insurance', async () => {
    const filePath = path.join(dir, 'VAK CONSEQUIP_MARINE_26-27.pdf');
    if (!fs.existsSync(filePath)) return;
    const buf = fs.readFileSync(filePath);
    const parsed = await pdf(buf);
    const res = extractPolicyFromText(parsed.text, 'VAK CONSEQUIP_MARINE_26-27.pdf');

    expect(res.insuranceCompany).toMatch(/ICICI Lombard/i);
    expect(res.documentCategory).toBe('Marine Insurance');
    expect(res.policyNumber).toBe('2001/452962447/00/000');
    expect(res.insuredName).toMatch(/VAK CONSEQUIP/i);
    expect(res.startDate).toBe('26/08/2026');
    expect(res.expiryDate).toBe('25/08/2027');
    expect(res.totalPremium).toBe('1,18,000.00');
  }, 20000);
});
