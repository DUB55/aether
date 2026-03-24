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
