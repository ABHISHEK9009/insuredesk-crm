const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');
const { extractPolicyFromText } = require('../src/lib/policies/pdf/extractor.cjs');

async function runDeepAudit() {
  const dir = path.join(process.cwd(), 'storage', 'aug policy (2)', 'aug policy');
  const files = fs.readdirSync(dir).filter(f => f.toLowerCase().endsWith('.pdf'));

  console.log(`Starting deep field-by-field audit of ${files.length} policies...\n`);

  const records = [];
  const anomalies = [];

  for (let i = 0; i < files.length; i++) {
    const f = files[i];
    try {
      const buf = fs.readFileSync(path.join(dir, f));
      const parsed = await pdf(buf);
      const res = extractPolicyFromText(parsed.text, f);

      const record = {
        index: i + 1,
        file: f,
        insurer: res.insuranceCompany || '',
        category: res.documentCategory || '',
        policyNumber: res.policyNumber || '',
        insuredName: res.insuredName || '',
        startDate: res.startDate || '',
        expiryDate: res.expiryDate || '',
        netPremium: res.netPremium || '',
        totalPremium: res.totalPremium || '',
        sumInsured: res.sumInsured || res.totalSumInsured || ''
      };

      records.push(record);

      const issues = [];
      if (!record.insurer) issues.push('MISSING_INSURER');
      if (!record.category) issues.push('MISSING_CATEGORY');
      if (['Motor Insurance', 'Health Insurance', 'Warehouse Insurance'].includes(record.category)) {
        issues.push(`SUSPICIOUS_CATEGORY: ${record.category}`);
      }
      if (!record.policyNumber || record.policyNumber.length < 5) issues.push(`SUSPICIOUS_POLICY_NO: ${record.policyNumber}`);
      if (!record.insuredName || record.insuredName.length < 3 || /^(name|insured|prop|m\/s|:|\.)+$/i.test(record.insuredName)) {
        issues.push(`SUSPICIOUS_NAME: ${record.insuredName}`);
      }
      if (!record.startDate || !/\d{1,2}[-/]\d{1,2}[-/]\d{2,4}|\d{1,2}-[A-Za-z]{3}-\d{2,4}/.test(record.startDate)) {
        issues.push(`INVALID_START_DATE: ${record.startDate}`);
      }
      if (!record.expiryDate || !/\d{1,2}[-/]\d{1,2}[-/]\d{2,4}|\d{1,2}-[A-Za-z]{3}-\d{2,4}/.test(record.expiryDate)) {
        issues.push(`INVALID_EXPIRY_DATE: ${record.expiryDate}`);
      }
      if (!record.netPremium && !record.totalPremium) {
        issues.push('MISSING_PREMIUM');
      }

      if (issues.length > 0) {
        anomalies.push({ file: f, issues, record });
      }
    } catch (err) {
      anomalies.push({ file: f, issues: [`PARSE_ERROR: ${err.message}`] });
    }
  }

  console.log(`TOTAL AUDITED: ${records.length}`);
  console.log(`ANOMALIES FOUND: ${anomalies.length}\n`);

  if (anomalies.length > 0) {
    console.log('--- ANOMALIES ---');
    console.log(JSON.stringify(anomalies, null, 2));
  } else {
    console.log('ALL 54 POLICIES ARE COMPLETELY CLEAN!');
  }

  console.log('\n--- FULL AUDIT TABLE (CSV PREVIEW) ---');
  console.log('Index | File | Insurer | Category | Policy No | Insured Name | Start Date | Expiry Date | Net Premium | Total Premium');
  records.forEach(r => {
    console.log(`${r.index} | ${r.file} | ${r.insurer} | ${r.category} | ${r.policyNumber} | ${r.insuredName} | ${r.startDate} | ${r.expiryDate} | ${r.netPremium} | ${r.totalPremium}`);
  });
}

runDeepAudit().catch(console.error);
