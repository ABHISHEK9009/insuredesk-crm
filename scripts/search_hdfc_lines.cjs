const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');

async function main() {
  const dir = path.resolve('storage/health');
  const files = [
    'MISS. SHWETA KETKAR_Health Policy-26-27.pdf',
    'MR NAND SINGH_health policy-26-27.pdf',
    'MR. SOURABH ANANT_Health Policy- 26-27.pdf',
    'RAVI GAUTAM_health policy_26-27.pdf',
    'Neeraj vijay_health policy- 26-29.pdf',
    'Mr Gaurav Singh_health policy- 26-27.pdf',
    'Mr. Hemant Deolekar_Health Policy-26-27.pdf',
  ];

  for (const file of files) {
    const filePath = path.join(dir, file);
    if (!fs.existsSync(filePath)) {
      console.log(`File not found: ${file}`);
      continue;
    }
    const buffer = fs.readFileSync(filePath);
    const data = await pdf(buffer);
    console.log(`\n================== ${file} ==================`);
    const text = data.text;
    const lines = text.split('\n');
    lines.forEach((l, idx) => {
      if (/Premium|received|Total|Schedule|Rs\.|Period|From|To|Sum\s*Insured|Payable/i.test(l)) {
        console.log(`L${idx}: ${l.trim()}`);
      }
    });
  }
}

main();
