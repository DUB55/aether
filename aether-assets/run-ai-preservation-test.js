const { spawn } = require('child_process');
const path = require('path');

console.log('Running AI Chat Preservation Tests...\n');
console.log('Working directory:', __dirname);
console.log('Test file: ai-chat-preservation.test.js\n');

const jestPath = path.join(__dirname, 'node_modules', 'jest', 'bin', 'jest.js');
const testFile = 'ai-chat-preservation.test.js';

const child = spawn('node', [jestPath, testFile, '--verbose', '--no-coverage'], {
  cwd: __dirname,
  stdio: 'inherit',
  shell: false
});

child.on('exit', (code) => {
  if (code === 0) {
    console.log('\n✓ Tests completed successfully!');
  } else {
    console.log('\n✗ Tests failed with exit code:', code);
  }
  process.exit(code);
});

child.on('error', (err) => {
  console.error('Failed to start test process:', err);
  process.exit(1);
});
