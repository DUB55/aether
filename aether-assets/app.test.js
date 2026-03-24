/**
 * Unit tests for file reference resolution in viewer mode
 */

// Mock the files array and DOM elements for testing
let files = [];
let mockIframe = { srcdoc: '' };

// Mock DOM functions
global.document = {
  getElementById: (id) => {
    if (id === 'pframe') return mockIframe;
    if (id === 'prev-empty') return { style: { display: 'none' } };
    return null;
  }
};

// Import the functions we need to test (in a real scenario, these would be exported)
// For now, we'll copy the implementation here for testing

function resolveFileReferences(html) {
  if (!html) return html;

  let processedHtml = html;

  // Process CSS link tags: <link rel="stylesheet" href="style.css">
  processedHtml = processedHtml.replace(
    /<link\s+([^>]*\s)?href=["']([^"']+\.css)["']([^>]*)>/gi,
    (match, before, filename, after) => {
      const file = files.find(f => f.name === filename);
      if (file && file.content) {
        // Inline the CSS as a style tag
        return `<style>${file.content}</style>`;
      }
      return match; // Keep original if file not found
    }
  );

  // Process script tags: <script src="script.js"></script>
  processedHtml = processedHtml.replace(
    /<script\s+([^>]*\s)?src=["']([^"']+\.js)["']([^>]*)><\/script>/gi,
    (match, before, filename, after) => {
      const file = files.find(f => f.name === filename);
      if (file && file.content) {
        // Inline the JavaScript
        const attrs = (before || '') + (after || '');
        return `<script${attrs}>${file.content}</script>`;
      }
      return match; // Keep original if file not found
    }
  );

  // Process other file references (images, etc.) - convert to data URLs
  processedHtml = processedHtml.replace(
    /\b(src|href)=["']([^"':]+\.[a-zA-Z0-9]+)["']/gi,
    (match, attr, filename) => {
      // Skip if it's already a URL (http://, https://, data:, blob:, etc.)
      if (/^(https?:|data:|blob:|\/\/)/i.test(filename)) {
        return match;
      }

      const file = files.find(f => f.name === filename);
      if (file && file.content) {
        // Determine MIME type based on file extension
        const ext = filename.split('.').pop().toLowerCase();
        const mimeTypes = {
          'html': 'text/html',
          'css': 'text/css',
          'js': 'application/javascript',
          'json': 'application/json',
          'txt': 'text/plain',
          'svg': 'image/svg+xml',
          'png': 'image/png',
          'jpg': 'image/jpeg',
          'jpeg': 'image/jpeg',
          'gif': 'image/gif',
          'webp': 'image/webp',
        };
        const mimeType = mimeTypes[ext] || 'text/plain';

        // For text-based files, create data URL with base64 encoding
        try {
          const base64Content = btoa(unescape(encodeURIComponent(file.content)));
          return `${attr}="data:${mimeType};base64,${base64Content}"`;
        } catch (e) {
          console.warn(`Failed to encode ${filename}:`, e);
          return match;
        }
      }

      return match; // Keep original if file not found
    }
  );

  return processedHtml;
}

// Test cases
describe('File Reference Resolution', () => {
  beforeEach(() => {
    files = [];
    mockIframe.srcdoc = '';
  });

  test('resolves CSS link tags to inline style tags', () => {
    files = [
      { name: 'index.html', content: '<html><head><link rel="stylesheet" href="style.css"></head></html>' },
      { name: 'style.css', content: 'body { color: red; }' }
    ];

    const html = files[0].content;
    const result = resolveFileReferences(html);

    expect(result).toContain('<style>body { color: red; }</style>');
    expect(result).not.toContain('<link');
  });

  test('resolves script src tags to inline scripts', () => {
    files = [
      { name: 'index.html', content: '<html><body><script src="app.js"></script></body></html>' },
      { name: 'app.js', content: 'console.log("Hello");' }
    ];

    const html = files[0].content;
    const result = resolveFileReferences(html);

    expect(result).toContain('<script>console.log("Hello");</script>');
    expect(result).not.toContain('src="app.js"');
  });

  test('handles multiple file references', () => {
    files = [
      { 
        name: 'index.html', 
        content: '<html><head><link rel="stylesheet" href="style.css"></head><body><script src="app.js"></script></body></html>' 
      },
      { name: 'style.css', content: 'body { margin: 0; }' },
      { name: 'app.js', content: 'alert("test");' }
    ];

    const html = files[0].content;
    const result = resolveFileReferences(html);

    expect(result).toContain('<style>body { margin: 0; }</style>');
    expect(result).toContain('<script>alert("test");</script>');
  });

  test('preserves external URLs', () => {
    files = [
      { 
        name: 'index.html', 
        content: '<html><head><link rel="stylesheet" href="https://cdn.example.com/style.css"></head></html>' 
      }
    ];

    const html = files[0].content;
    const result = resolveFileReferences(html);

    expect(result).toContain('https://cdn.example.com/style.css');
  });

  test('handles missing files gracefully', () => {
    files = [
      { name: 'index.html', content: '<html><head><link rel="stylesheet" href="missing.css"></head></html>' }
    ];

    const html = files[0].content;
    const result = resolveFileReferences(html);

    // Should keep the original link tag if file not found
    expect(result).toContain('href="missing.css"');
  });

  test('returns empty string for empty input', () => {
    const result = resolveFileReferences('');
    expect(result).toBe('');
  });

  test('returns null for null input', () => {
    const result = resolveFileReferences(null);
    expect(result).toBe(null);
  });
});

console.log('File reference resolution tests defined. Run with a test runner like Jest to execute.');

/**
 * Unit tests for CopyButton component
 */

// Mock CopyButton class for testing
class CopyButton {
  constructor(targetElementId, buttonElement) {
    this.targetElementId = targetElementId;
    this.buttonElement = buttonElement;
    this.state = 'idle';
    this.timeoutId = null;
    this.originalHTML = buttonElement.innerHTML;
    
    // Bind click handler
    this.buttonElement.addEventListener('click', () => this.copy());
  }

  async copy() {
    const targetElement = document.getElementById(this.targetElementId);
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
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        this.showSuccess();
      } else {
        this.copyFallback(text);
      }
    } catch (error) {
      console.error('Copy failed:', error);
      this.showError();
    }
  }

  copyFallback(text) {
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textarea);
      
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
    this.clearTimeout();
    this.state = 'success';
    this.buttonElement.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
    this.buttonElement.style.color = '#10b981';
    this.timeoutId = setTimeout(() => this.reset(), 2000);
  }

  showError() {
    this.clearTimeout();
    this.state = 'error';
    this.buttonElement.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>';
    this.buttonElement.style.color = '#ef4444';
    this.timeoutId = setTimeout(() => this.reset(), 2000);
  }

  reset() {
    this.clearTimeout();
    this.state = 'idle';
    this.buttonElement.innerHTML = this.originalHTML;
    this.buttonElement.style.color = '';
  }

  clearTimeout() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }
}

describe('CopyButton Component', () => {
  let mockButton;
  let mockTargetElement;
  let copyButton;

  beforeEach(() => {
    // Reset mocks
    mockButton = {
      innerHTML: '<svg>copy-icon</svg>',
      style: {},
      addEventListener: jest.fn((event, handler) => {
        mockButton._clickHandler = handler;
      }),
      click: function() {
        if (this._clickHandler) this._clickHandler();
      }
    };

    mockTargetElement = {
      id: 'test-target',
      value: 'Test content to copy'
    };

    // Mock document.getElementById
    global.document.getElementById = jest.fn((id) => {
      if (id === 'test-target') return mockTargetElement;
      return null;
    });

    // Mock navigator.clipboard
    global.navigator.clipboard = {
      writeText: jest.fn().mockResolvedValue(undefined)
    };

    // Mock setTimeout and clearTimeout
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('initializes with idle state', () => {
    copyButton = new CopyButton('test-target', mockButton);
    expect(copyButton.state).toBe('idle');
    expect(copyButton.timeoutId).toBe(null);
  });

  test('copies text to clipboard on click', async () => {
    copyButton = new CopyButton('test-target', mockButton);
    await copyButton.copy();
    
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('Test content to copy');
    expect(copyButton.state).toBe('success');
  });

  test('shows success state with checkmark icon', async () => {
    copyButton = new CopyButton('test-target', mockButton);
    await copyButton.copy();
    
    expect(copyButton.state).toBe('success');
    expect(mockButton.innerHTML).toContain('polyline');
    expect(mockButton.style.color).toBe('#10b981');
  });

  test('auto-resets to idle state after 2 seconds', async () => {
    copyButton = new CopyButton('test-target', mockButton);
    const originalHTML = mockButton.innerHTML;
    
    await copyButton.copy();
    expect(copyButton.state).toBe('success');
    
    jest.advanceTimersByTime(2000);
    expect(copyButton.state).toBe('idle');
    expect(mockButton.innerHTML).toBe(originalHTML);
    expect(mockButton.style.color).toBe('');
  });

  test('shows error state when target element not found', async () => {
    global.document.getElementById = jest.fn(() => null);
    copyButton = new CopyButton('missing-target', mockButton);
    
    await copyButton.copy();
    
    expect(copyButton.state).toBe('error');
    expect(mockButton.style.color).toBe('#ef4444');
  });

  test('shows error state when text is empty', async () => {
    mockTargetElement.value = '';
    mockTargetElement.textContent = '';
    copyButton = new CopyButton('test-target', mockButton);
    
    await copyButton.copy();
    
    expect(copyButton.state).toBe('error');
  });

  test('shows error state when clipboard API fails', async () => {
    global.navigator.clipboard.writeText = jest.fn().mockRejectedValue(new Error('Clipboard error'));
    copyButton = new CopyButton('test-target', mockButton);
    
    await copyButton.copy();
    
    expect(copyButton.state).toBe('error');
  });

  test('uses fallback when clipboard API is not available', async () => {
    global.navigator.clipboard = undefined;
    global.document.execCommand = jest.fn().mockReturnValue(true);
    global.document.createElement = jest.fn((tag) => {
      if (tag === 'textarea') {
        return {
          value: '',
          style: {},
          select: jest.fn(),
          remove: jest.fn()
        };
      }
      return null;
    });
    global.document.body = {
      appendChild: jest.fn(),
      removeChild: jest.fn()
    };

    copyButton = new CopyButton('test-target', mockButton);
    await copyButton.copy();
    
    expect(copyButton.state).toBe('success');
  });

  test('clears previous timeout when showing new state', async () => {
    copyButton = new CopyButton('test-target', mockButton);
    
    // First copy
    await copyButton.copy();
    const firstTimeoutId = copyButton.timeoutId;
    
    // Second copy before timeout
    await copyButton.copy();
    const secondTimeoutId = copyButton.timeoutId;
    
    expect(firstTimeoutId).not.toBe(secondTimeoutId);
  });

  test('handles textContent when value is not available', async () => {
    mockTargetElement = {
      id: 'test-target',
      textContent: 'Text content to copy'
    };
    global.document.getElementById = jest.fn(() => mockTargetElement);
    
    copyButton = new CopyButton('test-target', mockButton);
    await copyButton.copy();
    
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('Text content to copy');
  });
});

console.log('CopyButton component tests defined. Run with a test runner like Jest to execute.');

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
describe('Bug Condition Exploration: Clipboard Permissions Fallback', () => {
  let mockButton;
  let mockTargetElement;
  let copyButton;
  let copyFallbackSpy;
  let showSuccessSpy;
  let showErrorSpy;

  beforeEach(() => {
    // Reset mocks
    mockButton = {
      innerHTML: '<svg>copy-icon</svg>',
      style: {},
      addEventListener: jest.fn((event, handler) => {
        mockButton._clickHandler = handler;
      }),
      click: function() {
        if (this._clickHandler) this._clickHandler();
      }
    };

    mockTargetElement = {
      id: 'test-target',
      value: 'Test URL to copy'
    };

    // Mock document.getElementById
    global.document.getElementById = jest.fn((id) => {
      if (id === 'test-target') return mockTargetElement;
      return null;
    });

    // Mock document.createElement for fallback
    global.document.createElement = jest.fn((tag) => {
      if (tag === 'textarea') {
        return {
          value: '',
          style: {},
          select: jest.fn(),
          remove: jest.fn()
        };
      }
      return null;
    });

    // Mock document.body for fallback
    global.document.body = {
      appendChild: jest.fn(),
      removeChild: jest.fn()
    };

    // Mock execCommand for fallback
    global.document.execCommand = jest.fn().mockReturnValue(true);

    // Mock setTimeout and clearTimeout
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('EXPLORATION: Clipboard API blocked by permissions policy should trigger fallback', async () => {
    // Mock navigator.clipboard.writeText to throw NotAllowedError (permissions policy violation)
    const notAllowedError = new DOMException(
      'Permissions policy violation: The Clipboard API has been blocked',
      'NotAllowedError'
    );
    
    global.navigator.clipboard = {
      writeText: jest.fn().mockRejectedValue(notAllowedError)
    };

    // Create CopyButton instance
    copyButton = new CopyButton('test-target', mockButton);

    // Spy on copyFallback method
    copyFallbackSpy = jest.spyOn(copyButton, 'copyFallback');
    showSuccessSpy = jest.spyOn(copyButton, 'showSuccess');
    showErrorSpy = jest.spyOn(copyButton, 'showError');

    // Simulate user clicking copy button
    await copyButton.copy();

    // EXPECTED BEHAVIOR (from Property 1):
    // When Clipboard API throws NotAllowedError, copyFallback should be called
    expect(copyFallbackSpy).toHaveBeenCalledWith('Test URL to copy');
    
    // Success feedback should be shown to user
    expect(showSuccessSpy).toHaveBeenCalled();
    expect(copyButton.state).toBe('success');
    
    // Error should NOT be shown
    expect(showErrorSpy).not.toHaveBeenCalled();

    // EXPECTED OUTCOME ON UNFIXED CODE:
    // This test will FAIL because:
    // - copyFallback is NOT called (the catch block shows error instead)
    // - showError IS called instead of showSuccess
    // - copyButton.state is 'error' instead of 'success'
    //
    // Counterexample documented: "When Clipboard API throws NotAllowedError, 
    // copyFallback is not triggered and user sees error message"
  });

  test('EXPLORATION: Clipboard API blocked by SecurityError should trigger fallback', async () => {
    // Mock navigator.clipboard.writeText to throw SecurityError (another permissions-related error)
    const securityError = new DOMException(
      'Security error: Clipboard access denied',
      'SecurityError'
    );
    
    global.navigator.clipboard = {
      writeText: jest.fn().mockRejectedValue(securityError)
    };

    // Create CopyButton instance
    copyButton = new CopyButton('test-target', mockButton);

    // Spy on copyFallback method
    copyFallbackSpy = jest.spyOn(copyButton, 'copyFallback');
    showSuccessSpy = jest.spyOn(copyButton, 'showSuccess');
    showErrorSpy = jest.spyOn(copyButton, 'showError');

    // Simulate user clicking copy button
    await copyButton.copy();

    // EXPECTED BEHAVIOR (from Property 1):
    // When Clipboard API throws SecurityError, copyFallback should be called
    expect(copyFallbackSpy).toHaveBeenCalledWith('Test URL to copy');
    
    // Success feedback should be shown to user
    expect(showSuccessSpy).toHaveBeenCalled();
    expect(copyButton.state).toBe('success');
    
    // Error should NOT be shown
    expect(showErrorSpy).not.toHaveBeenCalled();

    // EXPECTED OUTCOME ON UNFIXED CODE:
    // This test will FAIL for the same reasons as the NotAllowedError test
  });
});

console.log('Bug condition exploration tests for clipboard permissions defined.');

/**
 * Bug Condition Exploration Test: switchTab Null Reference Errors
 * 
 * **Validates: Requirements 2.3**
 * 
 * This test explores the bug condition where switchTab attempts to access classList
 * on DOM elements that don't exist, causing "Cannot read properties of null" errors.
 * 
 * CRITICAL: This test is EXPECTED TO FAIL on unfixed code - failure confirms the bug exists.
 * 
 * Expected behavior (from design Property 3):
 * - When pane elements are missing from DOM, no TypeError should be thrown
 * - Existing elements should still be updated correctly
 * 
 * Expected outcome on UNFIXED code:
 * - Test FAILS with TypeError: Cannot read properties of null (reading 'classList')
 * 
 * Counterexamples:
 * - "When pane-history is missing, switchTab('history') throws TypeError on classList access"
 * - "When pane-deploy is missing, switchTab('deploy') throws TypeError on classList access"
 * - "When pane-code is missing, switchTab('code') throws TypeError on classList access"
 */

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

describe('Bug Condition Exploration: switchTab Null Reference Errors', () => {
  let mockElements;

  beforeEach(() => {
    // Reset mock elements
    mockElements = {
      'pane-preview': {
        style: { display: 'flex' }
      },
      'pane-code': {
        classList: {
          toggle: jest.fn()
        }
      },
      'pane-history': {
        classList: {
          toggle: jest.fn()
        }
      },
      'pane-deploy': {
        classList: {
          toggle: jest.fn()
        }
      }
    };

    // Mock querySelectorAll for tab elements
    global.document.querySelectorAll = jest.fn((selector) => {
      if (selector === '.tab') {
        return [
          { classList: { toggle: jest.fn() }, dataset: { tab: 'preview' } },
          { classList: { toggle: jest.fn() }, dataset: { tab: 'code' } },
          { classList: { toggle: jest.fn() }, dataset: { tab: 'history' } },
          { classList: { toggle: jest.fn() }, dataset: { tab: 'deploy' } }
        ];
      }
      return [];
    });

    // Mock document.getElementById
    global.document.getElementById = jest.fn((id) => {
      return mockElements[id] || null;
    });
  });

  test('EXPLORATION: switchTab with missing pane-history should not throw TypeError', () => {
    // Remove pane-history element from DOM (simulate missing element)
    delete mockElements['pane-history'];

    // EXPECTED BEHAVIOR (from Property 3):
    // No TypeError should be thrown when pane-history is missing
    expect(() => {
      switchTab('history');
    }).not.toThrow();

    // Existing elements should still be updated correctly
    expect(mockElements['pane-preview'].style.display).toBe('none');
    expect(mockElements['pane-code'].classList.toggle).toHaveBeenCalledWith('on', false);

    // EXPECTED OUTCOME ON UNFIXED CODE:
    // This test will FAIL with:
    // TypeError: Cannot read properties of null (reading 'classList')
    // at line: document.getElementById(`pane-${p}`).classList.toggle('on', tab === p)
    //
    // Counterexample documented: "When pane-history is missing, 
    // switchTab('history') throws TypeError on classList access"
  });

  test('EXPLORATION: switchTab with missing pane-deploy should not throw TypeError', () => {
    // Remove pane-deploy element from DOM (simulate missing element)
    delete mockElements['pane-deploy'];

    // EXPECTED BEHAVIOR (from Property 3):
    // No TypeError should be thrown when pane-deploy is missing
    expect(() => {
      switchTab('deploy');
    }).not.toThrow();

    // Existing elements should still be updated correctly
    expect(mockElements['pane-preview'].style.display).toBe('none');
    expect(mockElements['pane-code'].classList.toggle).toHaveBeenCalledWith('on', false);

    // EXPECTED OUTCOME ON UNFIXED CODE:
    // This test will FAIL with:
    // TypeError: Cannot read properties of null (reading 'classList')
    //
    // Counterexample documented: "When pane-deploy is missing, 
    // switchTab('deploy') throws TypeError on classList access"
  });

  test('EXPLORATION: switchTab with missing pane-code should not throw TypeError', () => {
    // Remove pane-code element from DOM (simulate missing element)
    delete mockElements['pane-code'];

    // EXPECTED BEHAVIOR (from Property 3):
    // No TypeError should be thrown when pane-code is missing
    expect(() => {
      switchTab('code');
    }).not.toThrow();

    // Existing elements should still be updated correctly
    expect(mockElements['pane-preview'].style.display).toBe('none');

    // EXPECTED OUTCOME ON UNFIXED CODE:
    // This test will FAIL with:
    // TypeError: Cannot read properties of null (reading 'classList')
    // at line: document.getElementById('pane-code').classList.toggle('on', tab === 'code')
    //
    // Counterexample documented: "When pane-code is missing, 
    // switchTab('code') throws TypeError on classList access"
  });

  test('EXPLORATION: switchTab with missing pane-preview should not throw TypeError', () => {
    // Remove pane-preview element from DOM (simulate missing element)
    delete mockElements['pane-preview'];

    // EXPECTED BEHAVIOR (from Property 3):
    // No TypeError should be thrown when pane-preview is missing
    expect(() => {
      switchTab('preview');
    }).not.toThrow();

    // Existing elements should still be updated correctly
    expect(mockElements['pane-code'].classList.toggle).toHaveBeenCalledWith('on', false);

    // EXPECTED OUTCOME ON UNFIXED CODE:
    // This test will FAIL with:
    // TypeError: Cannot read properties of null (reading 'style')
    // at line: document.getElementById('pane-preview').style.display = ...
    //
    // Counterexample documented: "When pane-preview is missing, 
    // switchTab('preview') throws TypeError on style access"
  });

  test('EXPLORATION: switchTab with multiple missing panes should not throw TypeError', () => {
    // Remove multiple pane elements from DOM (simulate missing elements)
    delete mockElements['pane-history'];
    delete mockElements['pane-deploy'];

    // EXPECTED BEHAVIOR (from Property 3):
    // No TypeError should be thrown when multiple panes are missing
    expect(() => {
      switchTab('history');
    }).not.toThrow();

    expect(() => {
      switchTab('deploy');
    }).not.toThrow();

    // Existing elements should still be updated correctly
    expect(mockElements['pane-preview'].style.display).toBe('none');
    expect(mockElements['pane-code'].classList.toggle).toHaveBeenCalled();

    // EXPECTED OUTCOME ON UNFIXED CODE:
    // This test will FAIL with TypeError for each missing pane
  });
});

console.log('Bug condition exploration tests for switchTab null references defined.');
