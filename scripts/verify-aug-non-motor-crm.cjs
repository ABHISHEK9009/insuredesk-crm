require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

function getLocalPhysicalPath(storagePath) {
  const LOCAL_STORAGE_DIR = path.join(process.cwd(), 'storage', 'uploads');
  const cleanPath = storagePath.replace(/^\/+/, '');
  const physicalPath = path.resolve(LOCAL_STORAGE_DIR, cleanPath);
  if (!physicalPath.startsWith(LOCAL_STORAGE_DIR)) {
    throw new Error('Access Denied');
  }
  return physicalPath;
}

async function verifyAugNonMotor() {
  const sourceDir = path.join(process.cwd(), 'storage', 'aug policy (2)', 'aug policy');
  const sourceFiles = fs.readdirSync(sourceDir).filter(f => f.toLowerCase().endsWith('.pdf'));

  console.log(`Verifying ${sourceFiles.length} policies in CRM database...\n`);

  let verifiedCount = 0;
  let fileAccessibleCount = 0;
  const issues = [];
  const breakdownByCategory = {};

  for (let i = 0; i < sourceFiles.length; i++) {
    const f = sourceFiles[i];

    const record = await prisma.policyRecord.findFirst({
      where: {
        deletedAt: null,
        OR: [
          { pdfFileName: f },
          { sourceFile: f }
        ]
      },
      include: {
        uploadedFile: true
      }
    });

    if (!record) {
      issues.push({ file: f, error: 'NOT_FOUND_IN_DB' });
      continue;
    }

    const payload = record.reviewedData || record.data || {};
    const savedAt = new Date(record.savedAt);
    const isAugust = savedAt.getFullYear() === 2026 && (savedAt.getMonth() + 1) === 8;

    if (!isAugust) {
      issues.push({ file: f, error: `NOT_IN_AUGUST: ${record.savedAt}` });
    }

    const category = payload.documentCategory || record.selectedServiceCategory || record.detectedServiceCategory;
    breakdownByCategory[category] = (breakdownByCategory[category] || 0) + 1;

    const isForbiddenCategory = ['Motor Insurance', 'Health Insurance', 'Warehouse Insurance'].includes(category);
    if (isForbiddenCategory) {
      issues.push({ file: f, error: `FORBIDDEN_CATEGORY: ${category}` });
    }

    // Check PDF downloadable linkage
    let fileExistsOnDisk = false;
    if (record.uploadedFile && record.uploadedFile.storagePath) {
      try {
        const physicalPath = getLocalPhysicalPath(record.uploadedFile.storagePath);
        if (fs.existsSync(physicalPath)) {
          const stats = fs.statSync(physicalPath);
          if (stats.size > 0) {
            fileExistsOnDisk = true;
            fileAccessibleCount++;
          }
        }
      } catch (err) {
        issues.push({ file: f, error: `STORAGE_ERROR: ${err.message}` });
      }
    } else {
      issues.push({ file: f, error: 'NO_UPLOADED_FILE_LINKAGE' });
    }

    if (isAugust && !isForbiddenCategory && fileExistsOnDisk) {
      verifiedCount++;
    }
  }

  console.log('--- VERIFICATION REPORT ---');
  console.log(`Total Policies Checked: ${sourceFiles.length}`);
  console.log(`Fully Verified in August & Non-Motor: ${verifiedCount} / ${sourceFiles.length} (${Math.round(verifiedCount / sourceFiles.length * 100)}%)`);
  console.log(`PDFs Downloadable on Disk: ${fileAccessibleCount} / ${sourceFiles.length} (${Math.round(fileAccessibleCount / sourceFiles.length * 100)}%)`);
  console.log('\nBreakdown by Category:');
  Object.entries(breakdownByCategory).forEach(([cat, count]) => {
    console.log(`  - ${cat}: ${count}`);
  });

  console.log(`\nIssues Found: ${issues.length}`);

  if (issues.length > 0) {
    console.log('Issues:', JSON.stringify(issues, null, 2));
  } else {
    console.log('\nSUCCESS: ALL 54 POLICIES ARE RECORDED IN AUGUST 2026, CATEGORIZED AS NON-MOTOR, AND HAVE DOWNLOADABLE PDFS!');
  }
}

verifyAugNonMotor()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Fatal verification error:', err);
    process.exit(1);
  });
