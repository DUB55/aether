#!/usr/bin/env node

// Simple test runner to execute Jest tests
const { execSync } = require('child_process');
const path = require('path');

const testFile = process.argv[2] || 'clipboard-preservation.test.js';

try {
  console.log(`Running test: ${testFile}\n`);
  
  const result = execSync(
    `node node_modules/jest/bin/jest.js ${testFile} --verbose`,
    {
      cwd: __dirname,
      stdio: 'inherit',
      encoding: 'utf8'
    }
  );
  
  console.log('\nTest completed successfully!');
  process.exit(0);
} catch (error) {
  console.error('\nTest failed!');
  process.exit(1);
}
