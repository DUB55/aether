#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

try {
  console.log('Running AI Chat Preservation Tests...\n');
  
  const result = execSync(
    'node node_modules/jest/bin/jest.js ai-chat-preservation.test.js --verbose',
    {
      cwd: path.join(__dirname, 'aether-assets'),
      stdio: 'inherit',
      encoding: 'utf8'
    }
  );
  
  console.log('\nTests completed successfully!');
  process.exit(0);
} catch (error) {
  console.error('\nTests failed!');
  process.exit(1);
}
