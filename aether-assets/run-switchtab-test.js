/**
 * Simple test runner for switchTab bug condition exploration tests
 */

// Mock DOM environment
global.DOMException = class DOMException extends Error {
  constructor(message, name) {
    super(message);
    this.name = name;
  }
};

// Mock switchTab function (copy from app.js for testing)
function switchTab(tab) {
  document.querySelectorAll('.tab').forEach(n => n.classList.toggle('active', n.dataset.tab === tab));
  document.getElementById('pane-preview').style.display = tab === 'preview' ? 'flex' : 'none';
  document.getElementById('pane-code').classList.toggle('on', tab === 'code');
  ['history','deploy'].forEach(p => document.getElementById(`pane-${p}`).classList.toggle('on', tab === p));
  refreshIcons();
}

// Mock refreshIcons function
function refreshIcons() {
  // No-op for testing
}

// Test setup
let mockElements;

function setupMockDOM() {
  mockElements = {
    'pane-preview': {
      style: { display: 'flex' }
    },
    'pane-code': {
      classList: {
        toggle: () => {}
      }
    },
    'pane-history': {
      classList: {
        toggle: () => {}
      }
    },
    'pane-deploy': {
      classList: {
        toggle: () => {}
      }
    }
  };

  global.document = {
    querySelectorAll: (selector) => {
      if (selector === '.tab') {
        return [
          { classList: { toggle: () => {} }, dataset: { tab: 'preview' } },
          { classList: { toggle: () => {} }, dataset: { tab: 'code' } },
          { classList: { toggle: () => {} }, dataset: { tab: 'history' } },
          { classList: { toggle: () => {} }, dataset: { tab: 'deploy' } }
        ];
      }
      return [];
    },
    getElementById: (id) => {
      return mockElements[id] || null;
    }
  };
}

// Test cases
console.log('\n=== Bug Condition Exploration: switchTab Null Reference Errors ===\n');
console.log('CRITICAL: These tests are EXPECTED TO FAIL on unfixed code\n');

let testsPassed = 0;
let testsFailed = 0;
let counterexamples = [];

// Test 1: Missing pane-history
console.log('Test 1: switchTab with missing pane-history');
setupMockDOM();
delete mockElements['pane-history'];
try {
  switchTab('history');
  console.log('  ✓ PASS: No TypeError thrown (UNEXPECTED - bug may not exist or already fixed)');
  testsPassed++;
} catch (error) {
  console.log('  ✗ FAIL: TypeError thrown (EXPECTED - confirms bug exists)');
  console.log(`    Error: ${error.message}`);
  counterexamples.push('When pane-history is missing, switchTab("history") throws TypeError on classList access');
  testsFailed++;
}

// Test 2: Missing pane-deploy
console.log('\nTest 2: switchTab with missing pane-deploy');
setupMockDOM();
delete mockElements['pane-deploy'];
try {
  switchTab('deploy');
  console.log('  ✓ PASS: No TypeError thrown (UNEXPECTED - bug may not exist or already fixed)');
  testsPassed++;
} catch (error) {
  console.log('  ✗ FAIL: TypeError thrown (EXPECTED - confirms bug exists)');
  console.log(`    Error: ${error.message}`);
  counterexamples.push('When pane-deploy is missing, switchTab("deploy") throws TypeError on classList access');
  testsFailed++;
}

// Test 3: Missing pane-code
console.log('\nTest 3: switchTab with missing pane-code');
setupMockDOM();
delete mockElements['pane-code'];
try {
  switchTab('code');
  console.log('  ✓ PASS: No TypeError thrown (UNEXPECTED - bug may not exist or already fixed)');
  testsPassed++;
} catch (error) {
  console.log('  ✗ FAIL: TypeError thrown (EXPECTED - confirms bug exists)');
  console.log(`    Error: ${error.message}`);
  counterexamples.push('When pane-code is missing, switchTab("code") throws TypeError on classList access');
  testsFailed++;
}

// Test 4: Missing pane-preview
console.log('\nTest 4: switchTab with missing pane-preview');
setupMockDOM();
delete mockElements['pane-preview'];
try {
  switchTab('preview');
  console.log('  ✓ PASS: No TypeError thrown (UNEXPECTED - bug may not exist or already fixed)');
  testsPassed++;
} catch (error) {
  console.log('  ✗ FAIL: TypeError thrown (EXPECTED - confirms bug exists)');
  console.log(`    Error: ${error.message}`);
  counterexamples.push('When pane-preview is missing, switchTab("preview") throws TypeError on style access');
  testsFailed++;
}

// Test 5: Multiple missing panes
console.log('\nTest 5: switchTab with multiple missing panes');
setupMockDOM();
delete mockElements['pane-history'];
delete mockElements['pane-deploy'];
try {
  switchTab('history');
  switchTab('deploy');
  console.log('  ✓ PASS: No TypeError thrown (UNEXPECTED - bug may not exist or already fixed)');
  testsPassed++;
} catch (error) {
  console.log('  ✗ FAIL: TypeError thrown (EXPECTED - confirms bug exists)');
  console.log(`    Error: ${error.message}`);
  counterexamples.push('When multiple panes are missing, switchTab throws TypeError');
  testsFailed++;
}

// Summary
console.log('\n=== Test Summary ===');
console.log(`Tests passed: ${testsPassed}`);
console.log(`Tests failed: ${testsFailed}`);

if (testsFailed > 0) {
  console.log('\n=== Counterexamples Found (Bug Confirmed) ===');
  counterexamples.forEach((example, index) => {
    console.log(`${index + 1}. ${example}`);
  });
  console.log('\nEXPECTED OUTCOME: Tests failed as expected on unfixed code.');
  console.log('This confirms the bug exists: switchTab throws TypeError when pane elements are missing.');
  console.log('\nNext step: Implement the fix by adding null checks before accessing classList/style properties.');
} else {
  console.log('\nUNEXPECTED OUTCOME: All tests passed on unfixed code.');
  console.log('This suggests either:');
  console.log('1. The bug may not exist in the current code');
  console.log('2. The bug has already been fixed');
  console.log('3. The test setup needs adjustment');
  console.log('\nPlease verify the actual switchTab implementation in app.js');
}

console.log('\n');
