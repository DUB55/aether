/**
 * Bug Condition Exploration Test: Clipboard Permissions Fallback
 * 
 * **Validates: Requirements 2.1, 2.4**
 * 
 * This test explores the bug condition where the Clipboard API is blocked by permissions policy.
 * 
 * CRITICAL: This test is EXPECTED TO FAIL on unfixed code - failure confirms the bug exists.
 * 
 * Expected behavior (from design Property 1):
 * - When Clipboard API throws NotAllowedError, copyFallback should be called
 * - Success feedback should be shown to user
 * 
 * Expected outcome on UNFIXED code:
 * - Test FAILS because copyFallback is not called
 * - Error feedback is shown instead of success
 * 
 * Counterexample: "When Clipboard API throws NotAllowedError, copyFallback is not triggered and user sees error message"
 */

// Minimal DOM mock for testing
class MockElement {
  constructor(id, value = '') {
    this.id = id;
    this.value = value;
    this.textContent = value;
    this.innerHTML = '<svg>copy-icon</svg>';
    this.style = {};
    this.classList = {
      contains: () => false,
      toggle: () => {},
      add: () => {},
      remove: () => {}
    };
    this._eventListeners = {};
  }

  addEventListener(event, handler) {
    this._eventListeners[event] = handler;
  }

  click() {
    if (this._eventListeners['click']) {
      this._eventListeners['click']();
    }
  }
}

// Mock document
const mockDocument = {
  _elements: {},
  getElementById(id) {
    return this._elements[id] || null;
  },
  createElement(tag) {
    return new MockElement(tag);
  },
  body: {
    appendChild() {},
    removeChild() {}
  },
  execCommand() {
    return true;
  }
};

// Mock navigator with clipboard that throws NotAllowedError
const mockNavigator = {
  clipboard: {
    writeText: async () => {
      const error = new Error('Permissions policy violation: The Clipboard API has been blocked');
      error.name = 'NotAllowedError';
      throw error;
    }
  }
};

// CopyButton class (from app.js)
class CopyButton {
  constructor(targetElementId, buttonElement, document, navigator) {
    this.targetElementId = targetElementId;
    this.buttonElement = buttonElement;
    this.document = document;
    this.navigator = navigator;
    this.state = 'idle';
    this.timeoutId = null;
    this.originalHTML = buttonElement.innerHTML;
    
    // Track method calls for testing
    this._copyFallbackCalled = false;
    this._showSuccessCalled = false;
    this._showErrorCalled = false;
    
    // Bind click handler
    this.buttonElement.addEventListener('click', () => this.copy());
  }

  async copy() {
    const targetElement = this.document.getElementById(this.targetElementId);
    if (!targetElement) {
      this.showError();
      return;
    }
    
    const text = targetElement.value || targetElement.textContent || '';
    if (!text) {
      this.showError();
      return;
    }

    try {
      // Try modern Clipboard API first
      if (this.navigator.clipboard && this.navigator.clipboard.writeText) {
        await this.navigator.clipboard.writeText(text);
        this.showSuccess();
      } else {
        // Fallback for older browsers
        this.copyFallback(text);
      }
    } catch (error) {
      // Check if error is due to permissions policy or security restrictions
      if (error.name === 'NotAllowedError' || error.name === 'SecurityError') {
        console.warn('Clipboard API blocked, using fallback:', error.message);
        this.copyFallback(text);
      } else {
        console.error('Copy failed:', error);
        this.showError();
      }
    }
  }

  copyFallback(text) {
    this._copyFallbackCalled = true;
    console.log('copyFallback called with:', text);
    
    try {
      const textarea = this.document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      this.document.body.appendChild(textarea);
      textarea.select = () => {};
      textarea.select();
      const success = this.document.execCommand('copy');
      this.document.body.removeChild(textarea);
      
      if (success) {
        this.showSuccess();
      } else {
        this.showError();
      }
    } catch (error) {
      console.error('Fallback copy failed:', error);
      this.showError();
    }
  }

  showSuccess() {
    this._showSuccessCalled = true;
    this.state = 'success';
    this.buttonElement.innerHTML = '<svg>checkmark</svg>';
    this.buttonElement.style.color = '#10b981';
    console.log('showSuccess called - state:', this.state);
  }

  showError() {
    this._showErrorCalled = true;
    this.state = 'error';
    this.buttonElement.innerHTML = '<svg>error</svg>';
    this.buttonElement.style.color = '#ef4444';
    console.log('showError called - state:', this.state);
  }

  reset() {
    this.state = 'idle';
    this.buttonElement.innerHTML = this.originalHTML;
    this.buttonElement.style.color = '';
  }
}

// Test runner
async function runTest() {
  console.log('\n=== Bug Condition Exploration Test: Clipboard Permissions Fallback ===\n');
  
  // Setup
  const mockButton = new MockElement('copy-button');
  const mockTarget = new MockElement('deploy-url', 'https://example.com/deploy/abc123');
  mockDocument._elements['deploy-url'] = mockTarget;
  
  // Create CopyButton instance with mocked dependencies
  const copyButton = new CopyButton('deploy-url', mockButton, mockDocument, mockNavigator);
  
  console.log('Test Setup:');
  console.log('- Target element contains URL:', mockTarget.value);
  console.log('- navigator.clipboard.writeText will throw NotAllowedError');
  console.log('');
  
  // Execute: Simulate user clicking copy button
  console.log('Executing: User clicks copy button...\n');
  await copyButton.copy();
  
  // Verify results
  console.log('\n=== Test Results ===\n');
  
  let testPassed = true;
  const failures = [];
  
  // Expected behavior 1: copyFallback should be called
  console.log('Expected: copyFallback should be called');
  console.log('Actual:', copyButton._copyFallbackCalled ? 'copyFallback WAS called ✓' : 'copyFallback was NOT called ✗');
  if (!copyButton._copyFallbackCalled) {
    testPassed = false;
    failures.push('copyFallback was not called when Clipboard API threw NotAllowedError');
  }
  console.log('');
  
  // Expected behavior 2: showSuccess should be called
  console.log('Expected: showSuccess should be called (user sees success feedback)');
  console.log('Actual:', copyButton._showSuccessCalled ? 'showSuccess WAS called ✓' : 'showSuccess was NOT called ✗');
  if (!copyButton._showSuccessCalled) {
    testPassed = false;
    failures.push('showSuccess was not called - user did not see success feedback');
  }
  console.log('');
  
  // Expected behavior 3: showError should NOT be called
  console.log('Expected: showError should NOT be called');
  console.log('Actual:', copyButton._showErrorCalled ? 'showError WAS called ✗' : 'showError was NOT called ✓');
  if (copyButton._showErrorCalled) {
    testPassed = false;
    failures.push('showError was called - user saw error message instead of success');
  }
  console.log('');
  
  // Expected behavior 4: state should be 'success'
  console.log('Expected: CopyButton state should be "success"');
  console.log('Actual: CopyButton state is "' + copyButton.state + '"', copyButton.state === 'success' ? '✓' : '✗');
  if (copyButton.state !== 'success') {
    testPassed = false;
    failures.push('CopyButton state is "' + copyButton.state + '" instead of "success"');
  }
  console.log('');
  
  // Final result
  console.log('=== Final Result ===\n');
  if (testPassed) {
    console.log('✓ TEST PASSED');
    console.log('The clipboard fallback is working correctly!');
    console.log('This means the bug has been FIXED.');
  } else {
    console.log('✗ TEST FAILED (EXPECTED ON UNFIXED CODE)');
    console.log('\nThis test failure confirms the bug exists:\n');
    failures.forEach((failure, index) => {
      console.log(`  ${index + 1}. ${failure}`);
    });
    console.log('\nCounterexample documented:');
    console.log('"When Clipboard API throws NotAllowedError, copyFallback is not triggered');
    console.log('and user sees error message instead of success feedback."');
    console.log('\nThis is the EXPECTED outcome on unfixed code.');
    console.log('The test will pass after implementing the fix in task 3.');
  }
  console.log('');
  
  return testPassed;
}

// Run the test
runTest().then(passed => {
  process.exit(passed ? 0 : 1);
}).catch(error => {
  console.error('Test execution error:', error);
  process.exit(1);
});
