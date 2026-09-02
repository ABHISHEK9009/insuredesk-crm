const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');
const { extractPolicyFromText } = require('../src/lib/policies/pdf/extractor.cjs');

async function auditAddresses() {
  const dir = path.join(process.cwd(), 'storage', 'aug policy (2)', 'aug policy');
  const files = fs.readdirSync(dir).filter(f => f.toLowerCase().endsWith('.pdf'));

  console.log(`Auditing address extraction for ${files.length} policies...\n`);

  let extractedCount = 0;

  files.forEach((f, idx) => {
    // will process async
  });

  for (let i = 0; i < files.length; i++) {
    const f = files[i];
    const buf = fs.readFileSync(path.join(dir, f));
    const d = await pdf(buf);
    const res = extractPolicyFromText(d.text, f);

    const addr = res.communicationAddress || res.address || res.insuredAddress || res.riskLocation || res.mailingAddress || '';
    if (addr && addr.trim().length > 5) {
      extractedCount++;
      console.log(`[${i + 1}/${files.length}] OK: ${f} -> "${addr.slice(0, 70)}..."`);
    } else {
      console.log(`[${i + 1}/${files.length}] MISSING ADDRESS: ${f}`);
    }
  }

  console.log(`\nAddress Extraction Rate: ${extractedCount} / ${files.length} (${Math.round(extractedCount / files.length * 100)}%)`);
}

auditAddresses().catch(console.error);
