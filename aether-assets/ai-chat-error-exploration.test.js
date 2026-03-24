/**
 * Bug Condition Exploration Test: AI Chat Error Logging
 * 
 * **Validates: Requirements 2.2, 2.5 - Property 1: Fault Condition - AI Chat Error Logging**
 * 
 * CRITICAL: This test is EXPECTED TO FAIL on unfixed code.
 * Failure confirms insufficient error logging exists.
 * 
 * GOAL: Surface counterexamples that demonstrate insufficient error logging when AI endpoint fails.
 * 
 * Test Strategy:
 * - Scope the property to concrete failing cases: 500 error, network error, CORS error
 * - Mock fetch to return error responses
 * - Simulate user sending AI chat message
 * - Assert that detailed error information is logged: endpoint URL, status, response body
 * - Assert that helpful error message is shown to user
 * 
 * Expected outcome on UNFIXED code: Tests FAIL (insufficient logging, generic error message)
 * Expected outcome after fix: Tests PASS (detailed logging, helpful error message)
 * 
 * Property 1 from design:
 * "For any AI chat message where the fetch request to the AI endpoint fails,
 * the fixed send function SHALL log detailed error information (endpoint URL,
 * response status, response body if available, and error details) to the console
 * to aid in debugging, and SHALL display an informative error message to the user."
 */

const fc = require('fast-check');

// Mock DOM and global objects for testing
class MockDocument {
  constructor() {
    this.elements = new Map();
    this.body = {
      appendChild: () => {},
      removeChild: () => {}
    };
  }

  getElementById(id) {
    if (!this.elements.has(id)) {
      const element = {
        id,
        value: '',
        textContent: '',
        innerHTML: '',
        classList: {
          add: () => {},
          remove: () => {},
          toggle: () => {}
        },
        style: {},
        appendChild: () => {},
        removeChild: () => {},
        insertAdjacentHTML: () => {},
        querySelectorAll: () => []
      };
      this.elements.set(id, element);
    }
    return this.elements.get(id);
  }

  createElement(tag) {
    return {
      tagName: tag,
      value: '',
      textContent: '',
      innerHTML: '',
      classList: {
        add: () => {},
        remove: () => {},
        toggle: () => {}
      },
      style: {},
      appendChild: () => {},
      removeChild: () => {},
      insertAdjacentHTML: () => {}
    };
  }

  querySelectorAll() {
    return [];
  }
}

// Mock console to capture logs
class MockConsole {
  constructor() {
    this.logs = [];
    this.errors = [];
    this.warns = [];
  }

  log(...args) {
    this.logs.push(args);
  }

  error(...args) {
    this.errors.push(args);
  }

  warn(...args) {
    this.warns.push(args);
  }

  clear() {
    this.logs = [];
    this.errors = [];
    this.warns = [];
  }
}

// Simplified send function extracted from app.js (UNFIXED version)
async function send_unfixed(userText, mockFetch, mockDocument, mockConsole) {
  const APP_CONFIG = {
    aiEndpoint: 'https://chatbot-beta-weld.vercel.app/api/chatbot',
    maxHistoryMessages: 10
  };

  const sessionId = 'test-session';
  const chatHist = [];
  let streaming = false;
  let ctrl = new AbortController();

  const input = mockDocument.getElementById('pinput');
  input.value = userText;

  const userTextTrimmed = (input.value || '').trim();
  if (!userTextTrimmed || streaming) return { success: false, reason: 'invalid' };

  input.value = '';
  chatHist.push({ role: 'user', content: userTextTrimmed });
  streaming = true;

  let result = { success: false, error: null, errorMessage: null };

  try {
    const response = await mockFetch(APP_CONFIG.aiEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        input: userTextTrimmed,
        personality: 'coder',
        model: 'gpt-4o',
        thinking_mode: 'balanced',
        session_id: sessionId,
        history: chatHist.slice(0,-1).slice(-APP_CONFIG.maxHistoryMessages).map(e => ({ role: e.role, content: e.content })),
      }),
      signal: ctrl.signal,
    });

    if (!response.ok) throw new Error(`AI request failed (${response.status})`);

    // Simulate successful response processing
    result.success = true;
  } catch (error) {
    if (error.name !== 'AbortError') {
      // This is the UNFIXED error handling - minimal logging
      const errorMessage = `Warning: ${error.message}`;
      result.error = error;
      result.errorMessage = errorMessage;
      result.success = false;
    }
  } finally {
    streaming = false;
    ctrl = null;
  }

  return result;
}

describe('Bug Condition Exploration: AI Chat Error Logging', () => {
  let mockDocument;
  let mockConsole;

  beforeEach(() => {
    mockDocument = new MockDocument();
    mockConsole = new MockConsole();
  });

  /**
   * Property 1.1: HTTP 500 Error - Detailed Logging
   * 
   * CRITICAL: This test MUST FAIL on unfixed code.
   * 
   * When AI endpoint returns 500 error, the system should log:
   * - Endpoint URL being called
   * - Response status code
   * - Response body/error details
   * 
   * Expected on UNFIXED code: FAILS - only status code in error message, no detailed logging
   * Expected on FIXED code: PASSES - detailed error logged with all information
   */
  test('Property 1.1: HTTP 500 error should log detailed error information', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
        async (userMessage) => {
          // Setup: Mock fetch to return 500 error
          const mockFetch = async (url, options) => {
            return {
              ok: false,
              status: 500,
              statusText: 'Internal Server Error',
              text: async () => 'Internal Server Error: Database connection failed'
            };
          };

          // Execute: Send AI chat message
          const result = await send_unfixed(userMessage, mockFetch, mockDocument, mockConsole);

          // Verify: Detailed error information should be logged
          // On UNFIXED code, these assertions will FAIL
          
          // Check 1: Endpoint URL should be logged
          const endpointLogged = mockConsole.logs.some(log => 
            log.some(arg => typeof arg === 'string' && arg.includes('chatbot-beta-weld.vercel.app'))
          ) || mockConsole.errors.some(log => 
            log.some(arg => typeof arg === 'string' && arg.includes('chatbot-beta-weld.vercel.app'))
          );

          // Check 2: Response status should be logged (not just in error message)
          const statusLogged = mockConsole.errors.some(log => 
            log.some(arg => 
              (typeof arg === 'object' && arg !== null && 'status' in arg) ||
              (typeof arg === 'string' && arg.includes('status: 500'))
            )
          );

          // Check 3: Response body should be logged
          const bodyLogged = mockConsole.errors.some(log => 
            log.some(arg => 
              (typeof arg === 'object' && arg !== null && 'body' in arg) ||
              (typeof arg === 'string' && arg.includes('Database connection failed'))
            )
          );

          // Check 4: Error message should be helpful (not just generic)
          const helpfulMessage = result.errorMessage && 
            result.errorMessage.includes('network') || 
            result.errorMessage.includes('try again');

          // EXPECTED TO FAIL on unfixed code:
          // - endpointLogged will be false (no endpoint logging)
          // - statusLogged will be false (status only in error message, not logged separately)
          // - bodyLogged will be false (response body not logged)
          // - helpfulMessage will be false (generic "Warning: AI request failed (500)")
          
          return endpointLogged && statusLogged && bodyLogged && helpfulMessage;
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * Property 1.2: Network Error - Detailed Logging
   * 
   * CRITICAL: This test MUST FAIL on unfixed code.
   * 
   * When fetch throws a network error (TypeError), the system should:
   * - Log the endpoint URL
   * - Log the error type (network error)
   * - Show helpful message to user
   * 
   * Expected on UNFIXED code: FAILS - generic error handling, no network-specific logging
   * Expected on FIXED code: PASSES - network error detected and logged with details
   */
  test('Property 1.2: Network error should log detailed error information', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
        async (userMessage) => {
          // Setup: Mock fetch to throw network error
          const mockFetch = async (url, options) => {
            throw new TypeError('Failed to fetch');
          };

          // Execute: Send AI chat message
          const result = await send_unfixed(userMessage, mockFetch, mockDocument, mockConsole);

          // Verify: Network error should be logged with details
          // On UNFIXED code, these assertions will FAIL

          // Check 1: Endpoint URL should be logged
          const endpointLogged = mockConsole.logs.some(log => 
            log.some(arg => typeof arg === 'string' && arg.includes('chatbot-beta-weld.vercel.app'))
          ) || mockConsole.errors.some(log => 
            log.some(arg => typeof arg === 'string' && arg.includes('chatbot-beta-weld.vercel.app'))
          );

          // Check 2: Error should be logged with context
          const errorLogged = mockConsole.errors.some(log => 
            log.some(arg => 
              (typeof arg === 'object' && arg !== null && 'endpoint' in arg) ||
              (typeof arg === 'string' && arg.includes('endpoint'))
            )
          );

          // Check 3: Error message should mention network issue
          const networkMentioned = result.errorMessage && 
            (result.errorMessage.toLowerCase().includes('network') ||
             result.errorMessage.toLowerCase().includes('connection'));

          // EXPECTED TO FAIL on unfixed code:
          // - endpointLogged will be false
          // - errorLogged will be false (no structured error logging)
          // - networkMentioned will be false (generic "Warning: Failed to fetch")

          return endpointLogged && errorLogged && networkMentioned;
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * Property 1.3: Different HTTP Error Codes - Consistent Logging
   * 
   * CRITICAL: This test MUST FAIL on unfixed code.
   * 
   * For various HTTP error codes (400, 401, 403, 500, 502, 503),
   * the system should consistently log detailed information.
   * 
   * Expected on UNFIXED code: FAILS - only status code in error message
   * Expected on FIXED code: PASSES - all error codes logged with full details
   */
  test('Property 1.3: Various HTTP errors should have consistent detailed logging', async () => {
    const errorCodes = [400, 401, 403, 500, 502, 503];
    
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
        fc.constantFrom(...errorCodes),
        async (userMessage, statusCode) => {
          // Setup: Mock fetch to return specific error code
          const mockFetch = async (url, options) => {
            return {
              ok: false,
              status: statusCode,
              statusText: `Error ${statusCode}`,
              text: async () => `Error details for ${statusCode}`
            };
          };

          // Execute: Send AI chat message
          const result = await send_unfixed(userMessage, mockFetch, mockDocument, mockConsole);

          // Verify: Detailed logging should be consistent across error codes
          // On UNFIXED code, these assertions will FAIL

          // Check 1: Status code should be logged in structured way
          const statusLogged = mockConsole.errors.some(log => 
            log.some(arg => 
              typeof arg === 'object' && arg !== null && arg.status === statusCode
            )
          );

          // Check 2: Response body should be logged
          const bodyLogged = mockConsole.errors.some(log => 
            log.some(arg => 
              (typeof arg === 'object' && arg !== null && 'body' in arg) ||
              (typeof arg === 'string' && arg.includes(`Error details for ${statusCode}`))
            )
          );

          // Check 3: Endpoint should be logged
          const endpointLogged = mockConsole.errors.some(log => 
            log.some(arg => 
              (typeof arg === 'object' && arg !== null && 'endpoint' in arg) ||
              (typeof arg === 'string' && arg.includes('endpoint'))
            )
          );

          // EXPECTED TO FAIL on unfixed code:
          // - statusLogged will be false (status only in error message string)
          // - bodyLogged will be false (response body not accessed or logged)
          // - endpointLogged will be false (endpoint URL not logged)

          return statusLogged && bodyLogged && endpointLogged;
        }
      ),
      { numRuns: 30 }
    );
  });
});
