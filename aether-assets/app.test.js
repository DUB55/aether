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
