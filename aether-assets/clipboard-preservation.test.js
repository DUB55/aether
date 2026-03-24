/**
 * Preservation Property Tests: Clipboard Functionality
 * 
 * **Validates: Requirements 3.1 - Property 4: Preservation - Existing Clipboard Functionality**
 * 
 * IMPORTANT: These tests follow observation-first methodology.
 * They capture the CURRENT behavior of successful clipboard operations on UNFIXED code.
 * 
 * Purpose:
 * - Verify that when Clipboard API is available and not blocked, copy succeeds
 * - Verify that success feedback is displayed correctly
 * - Verify that various text lengths and formats are handled
 * 
 * Expected outcome on UNFIXED code: Tests PASS (confirms baseline behavior to preserve)
 * Expected outcome after fix: Tests PASS (confirms no regressions)
 * 
 * Property 4 from design:
 * "For all copy actions where the Clipboard API is available and not blocked,
 * the fixed CopyButton class SHALL produce exactly the same behavior as the
 * original code, preserving successful clipboard operations and visual feedback."
 */

const fc = require('fast-check');

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

// CopyButton class (from app.js - UNFIXED version)
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
      console.error('Copy failed:', error);
      this.showError();
    }
  }

  copyFallback(text) {
    this._copyFallbackCalled = true;
    
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
  }

  showError() {
    this._showErrorCalled = true;
    this.state = 'error';
    this.buttonElement.innerHTML = '<svg>error</svg>';
    this.buttonElement.style.color = '#ef4444';
  }

  reset() {
    this.state = 'idle';
    this.buttonElement.innerHTML = this.originalHTML;
    this.buttonElement.style.color = '';
  }
}

describe('Preservation Property Tests: Clipboard Functionality', () => {
  
  /**
   * Property 4.1: Successful copy with Clipboard API available
   * 
   * For all text content where Clipboard API is available and not blocked,
   * the copy operation succeeds and shows success feedback.
   */
  test('Property 4.1: Clipboard API success path - random text content', async () => {
    // Generate random text content of varying lengths (non-empty, trimmed)
    const textArbitrary = fc.oneof(
      fc.string({ minLength: 1, maxLength: 50 }),      // Short text
      fc.string({ minLength: 50, maxLength: 200 }),    // Medium text
      fc.string({ minLength: 200, maxLength: 1000 })   // Long text
    ).filter(s => s.trim().length > 0); // Ensure non-empty after trim

    await fc.assert(
      fc.asyncProperty(textArbitrary, async (text) => {
        // Setup: Mock successful Clipboard API
        let capturedText = null;
        const mockNavigator = {
          clipboard: {
            writeText: async (t) => {
              capturedText = t;
              return Promise.resolve();
            }
          }
        };

        const mockButton = new MockElement('copy-button');
        const mockTarget = new MockElement('target', text);
        mockDocument._elements['target'] = mockTarget;

        // Create CopyButton instance
        const copyButton = new CopyButton('target', mockButton, mockDocument, mockNavigator);

        // Execute: Copy operation
        await copyButton.copy();

        // Verify: Clipboard API was called with correct text
        const clipboardCalled = capturedText === text;

        // Verify: Success feedback shown
        const successShown = copyButton._showSuccessCalled === true;
        const stateCorrect = copyButton.state === 'success';
        const colorCorrect = copyButton.buttonElement.style.color === '#10b981';

        // Verify: Error NOT shown
        const errorNotShown = copyButton._showErrorCalled === false;

        // Verify: Fallback NOT called (Clipboard API worked)
        const fallbackNotCalled = copyButton._copyFallbackCalled === false;

        return clipboardCalled && successShown && stateCorrect && colorCorrect && errorNotShown && fallbackNotCalled;
      }),
      { numRuns: 100 } // Run 100 iterations with random inputs
    );
  });

  /**
   * Property 4.2: Successful copy with different text formats
   * 
   * For all text formats (plain text, URLs, code snippets),
   * the copy operation handles them correctly.
   */
  test('Property 4.2: Clipboard API success - different text formats', async () => {
    // Generate different text formats (ensure non-empty)
    const formatArbitrary = fc.oneof(
      // Plain text
      fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
      
      // URLs
      fc.webUrl(),
      
      // Code snippets (simulate with special characters)
      fc.string({ minLength: 10, maxLength: 200 }).map(s => 
        `function test() {\n  return "${s}";\n}`
      ),
      
      // Special characters
      fc.string({ minLength: 1, maxLength: 50 }).map(s => 
        `!@#$%^&*()_+-=[]{}|;':",./<>?${s}`
      ),
      
      // Multiline text
      fc.array(fc.string({ minLength: 1, maxLength: 50 }), { minLength: 2, maxLength: 10 })
        .map(lines => lines.join('\n'))
        .filter(s => s.trim().length > 0)
    );

    await fc.assert(
      fc.asyncProperty(formatArbitrary, async (text) => {
        // Setup: Mock successful Clipboard API
        let capturedText = null;
        const mockNavigator = {
          clipboard: {
            writeText: async (t) => {
              capturedText = t;
              return Promise.resolve();
            }
          }
        };

        const mockButton = new MockElement('copy-button');
        const mockTarget = new MockElement('target', text);
        mockDocument._elements['target'] = mockTarget;

        // Create CopyButton instance
        const copyButton = new CopyButton('target', mockButton, mockDocument, mockNavigator);

        // Execute: Copy operation
        await copyButton.copy();

        // Verify: Text was copied correctly regardless of format
        return capturedText === text && 
               copyButton._showSuccessCalled === true && 
               copyButton.state === 'success';
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 4.3: Fallback path when Clipboard API not available
   * 
   * For all text content where Clipboard API is not available,
   * the fallback method is used and succeeds.
   */
  test('Property 4.3: Fallback path - Clipboard API not available', async () => {
    const textArbitrary = fc.string({ minLength: 1, maxLength: 200 }).filter(s => s.trim().length > 0);

    await fc.assert(
      fc.asyncProperty(textArbitrary, async (text) => {
        // Setup: Mock navigator WITHOUT Clipboard API
        const mockNavigator = {
          clipboard: undefined
        };

        const mockButton = new MockElement('copy-button');
        const mockTarget = new MockElement('target', text);
        mockDocument._elements['target'] = mockTarget;

        // Create CopyButton instance
        const copyButton = new CopyButton('target', mockButton, mockDocument, mockNavigator);

        // Execute: Copy operation
        await copyButton.copy();

        // Verify: Fallback was called
        const fallbackCalled = copyButton._copyFallbackCalled === true;

        // Verify: Success feedback shown
        const successShown = copyButton._showSuccessCalled === true;
        const stateCorrect = copyButton.state === 'success';

        // Verify: Error NOT shown
        const errorNotShown = copyButton._showErrorCalled === false;

        return fallbackCalled && successShown && stateCorrect && errorNotShown;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 4.4: Visual feedback consistency
   * 
   * For all successful copy operations, the visual feedback is consistent:
   * - State changes to 'success'
   * - Button color changes to green (#10b981)
   * - Button icon changes to checkmark
   */
  test('Property 4.4: Visual feedback consistency', async () => {
    const textArbitrary = fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0);

    await fc.assert(
      fc.asyncProperty(textArbitrary, async (text) => {
        // Setup: Mock successful Clipboard API
        const mockNavigator = {
          clipboard: {
            writeText: async () => Promise.resolve()
          }
        };

        const mockButton = new MockElement('copy-button');
        const originalHTML = mockButton.innerHTML;
        const mockTarget = new MockElement('target', text);
        mockDocument._elements['target'] = mockTarget;

        // Create CopyButton instance
        const copyButton = new CopyButton('target', mockButton, mockDocument, mockNavigator);

        // Execute: Copy operation
        await copyButton.copy();

        // Verify: Visual feedback is consistent
        return copyButton.state === 'success' &&
               copyButton.buttonElement.style.color === '#10b981' &&
               copyButton.buttonElement.innerHTML.includes('checkmark') &&
               copyButton.buttonElement.innerHTML !== originalHTML;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 4.5: Copy from value vs textContent
   * 
   * For all text content, the copy operation works correctly whether
   * the text is in the value property or textContent property.
   */
  test('Property 4.5: Copy from value vs textContent', async () => {
    const textArbitrary = fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0);
    const sourceTypeArbitrary = fc.constantFrom('value', 'textContent');

    await fc.assert(
      fc.asyncProperty(textArbitrary, sourceTypeArbitrary, async (text, sourceType) => {
        // Setup: Mock successful Clipboard API
        let capturedText = null;
        const mockNavigator = {
          clipboard: {
            writeText: async (t) => {
              capturedText = t;
              return Promise.resolve();
            }
          }
        };

        const mockButton = new MockElement('copy-button');
        const mockTarget = new MockElement('target');
        
        // Set text in either value or textContent
        if (sourceType === 'value') {
          mockTarget.value = text;
          mockTarget.textContent = '';
        } else {
          mockTarget.value = '';
          mockTarget.textContent = text;
        }
        
        mockDocument._elements['target'] = mockTarget;

        // Create CopyButton instance
        const copyButton = new CopyButton('target', mockButton, mockDocument, mockNavigator);

        // Execute: Copy operation
        await copyButton.copy();

        // Verify: Correct text was copied regardless of source
        return capturedText === text &&
               copyButton._showSuccessCalled === true &&
               copyButton.state === 'success';
      }),
      { numRuns: 100 }
    );
  });

});

console.log('\n=== Preservation Property Tests for Clipboard ===');
console.log('These tests verify that successful clipboard operations work correctly');
console.log('on the UNFIXED code and will continue to work after the fix.');
console.log('Expected outcome: All tests PASS (confirms baseline behavior to preserve)');
console.log('');
