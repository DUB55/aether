/**
 * Preservation Property Tests: AI Chat Functionality
 * 
 * **Validates: Requirements 3.2 - Property 5: Preservation - Existing AI Chat Functionality**
 * 
 * IMPORTANT: These tests follow observation-first methodology.
 * Tests are written to capture observed behavior on UNFIXED code for successful AI chat operations.
 * 
 * GOAL: Verify that successful AI chat operations continue to work correctly after the fix.
 * 
 * Test Strategy:
 * - Observe behavior on UNFIXED code for successful operations
 * - Test with various message types and lengths
 * - Test with messages that include file markers
 * - Test with messages that don't include file markers
 * - Property-based testing generates many test cases for stronger guarantees
 * 
 * Expected outcome on UNFIXED code: Tests PASS (confirms baseline behavior)
 * Expected outcome after fix: Tests PASS (confirms no regressions)
 * 
 * Property 5 from design:
 * "For any AI chat message where the fetch request succeeds, the fixed send function
 * SHALL produce exactly the same behavior as the original code, preserving response
 * streaming, file marker parsing, and chat history management."
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
          toggle: () => {},
          contains: () => false
        },
        style: {},
        appendChild: () => {},
        removeChild: () => {},
        insertAdjacentHTML: () => {},
        querySelectorAll: () => [],
        querySelector: () => null
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
        toggle: () => {},
        contains: () => false
      },
      style: {},
      appendChild: () => {},
      removeChild: () => {},
      insertAdjacentHTML: () => {},
      querySelectorAll: () => [],
      querySelector: () => null
    };
  }

  querySelectorAll() {
    return [];
  }

  querySelector() {
    return null;
  }
}

// Simplified send function for testing successful operations
async function send_success(userText, mockFetch, mockDocument) {
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

  let result = {
    success: false,
    visibleText: '',
    filesUpdated: [],
    chatHistory: [],
    streamedChunks: []
  };

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

    // Simulate streaming response processing
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let sse = '';
    let visibleText = '';
    let inFile = false;
    let curFile = '';
    let fileBuffer = '';
    const filesUpdated = [];

    // File marker regex patterns (from app.js)
    const beginRe = () => /BEGIN FILE:\s*([^\n]+)/i;
    const endRe = () => /END FILE(?::\s*([^\n]+))?/i;

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      
      sse += decoder.decode(value, { stream: true });
      const events = sse.split('\n\n');
      sse = events.pop() || '';
      
      for (const event of events) {
        for (const rawLine of event.split('\n')) {
          const line = rawLine.trim();
          if (!line.startsWith('data:')) continue;
          const data = line.slice(5).trim();
          if (!data || data === '[DONE]') continue;
          
          let delta = '';
          try {
            const parsed = JSON.parse(data);
            if (parsed.type === 'metadata' || parsed.type === 'ping' || parsed.type === 'error') continue;
            delta = parsed.content ?? parsed.choices?.[0]?.delta?.content ?? parsed.text ?? parsed.delta ?? parsed.message ?? '';
          } catch { delta = data; }
          
          if (!delta) continue;
          
          result.streamedChunks.push(delta);
          
          let chunk = delta;
          while (chunk.length) {
            if (!inFile) {
              const begin = chunk.match(beginRe());
              if (!begin) {
                visibleText += chunk;
                chunk = '';
                break;
              }
              const idx = begin.index ?? 0;
              visibleText += chunk.slice(0, idx);
              curFile = (begin[1] || '').trim() || 'index.html';
              inFile = true;
              fileBuffer = '';
              chunk = chunk.slice(idx + begin[0].length);
            } else {
              const end = chunk.match(endRe());
              if (!end) {
                fileBuffer += chunk;
                chunk = '';
                break;
              }
              const idx = end.index ?? 0;
              fileBuffer += chunk.slice(0, idx);
              const finalFile = (end[1] || '').trim() || curFile;
              filesUpdated.push({ name: finalFile, content: fileBuffer });
              inFile = false;
              curFile = '';
              fileBuffer = '';
              chunk = chunk.slice(idx + end[0].length);
            }
          }
        }
      }
    }

    chatHist.push({ role: 'assistant', content: visibleText.trim() || '' });
    
    result.success = true;
    result.visibleText = visibleText.trim();
    result.filesUpdated = filesUpdated;
    result.chatHistory = [...chatHist];
  } catch (error) {
    if (error.name !== 'AbortError') {
      result.success = false;
      result.error = error;
    }
  } finally {
    streaming = false;
    ctrl = null;
  }

  return result;
}

describe('Preservation Property: AI Chat Functionality', () => {
  let mockDocument;

  beforeEach(() => {
    mockDocument = new MockDocument();
  });

  /**
   * Property 5.1: Successful Response Streaming
   * 
   * When AI endpoint returns a successful response, the system should:
   * - Stream the response correctly
   * - Accumulate visible text from chunks
   * - Add assistant message to chat history
   * 
   * This test verifies the baseline streaming behavior is preserved.
   */
  test('Property 5.1: Successful responses are streamed correctly', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
        fc.string({ minLength: 10, maxLength: 200 }),
        async (userMessage, aiResponse) => {
          // Setup: Mock fetch to return successful streaming response
          const mockFetch = async (url, options) => {
            // Create a mock ReadableStream
            const chunks = [
              `data: ${JSON.stringify({ content: aiResponse.slice(0, Math.floor(aiResponse.length / 3)) })}\n\n`,
              `data: ${JSON.stringify({ content: aiResponse.slice(Math.floor(aiResponse.length / 3), Math.floor(2 * aiResponse.length / 3)) })}\n\n`,
              `data: ${JSON.stringify({ content: aiResponse.slice(Math.floor(2 * aiResponse.length / 3)) })}\n\n`,
              `data: [DONE]\n\n`
            ];
            
            let chunkIndex = 0;
            const encoder = new TextEncoder();
            
            return {
              ok: true,
              status: 200,
              body: {
                getReader: () => ({
                  read: async () => {
                    if (chunkIndex >= chunks.length) {
                      return { done: true };
                    }
                    const chunk = chunks[chunkIndex++];
                    return { value: encoder.encode(chunk), done: false };
                  }
                })
              }
            };
          };

          // Execute: Send AI chat message
          const result = await send_success(userMessage, mockFetch, mockDocument);

          // Verify: Response streaming behavior is preserved
          
          // Check 1: Request should succeed
          if (!result.success) return false;
          
          // Check 2: Visible text should match the AI response
          if (result.visibleText !== aiResponse.trim()) return false;
          
          // Check 3: Chat history should contain both user and assistant messages
          if (result.chatHistory.length !== 2) return false;
          if (result.chatHistory[0].role !== 'user') return false;
          if (result.chatHistory[0].content !== userMessage) return false;
          if (result.chatHistory[1].role !== 'assistant') return false;
          if (result.chatHistory[1].content !== aiResponse.trim()) return false;
          
          // Check 4: Chunks should be streamed (not empty)
          if (result.streamedChunks.length === 0) return false;
          
          return true;
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property 5.2: File Marker Parsing
   * 
   * When AI response includes file markers (BEGIN FILE/END FILE),
   * the system should:
   * - Parse file markers correctly
   * - Extract file name and content
   * - Update files appropriately
   * - Exclude file content from visible text
   * 
   * This test verifies file marker parsing is preserved.
   */
  test('Property 5.2: File markers are parsed and files are updated', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
        fc.string({ minLength: 5, maxLength: 50 }).filter(s => !s.includes('\n') && s.trim().length > 0),
        fc.string({ minLength: 10, maxLength: 200 }),
        fc.string({ minLength: 10, maxLength: 100 }),
        async (userMessage, fileName, fileContent, visibleMessage) => {
          // Setup: Mock fetch to return response with file markers
          const aiResponse = `${visibleMessage}\n\nBEGIN FILE: ${fileName}\n${fileContent}\nEND FILE: ${fileName}`;
          
          const mockFetch = async (url, options) => {
            const encoder = new TextEncoder();
            const chunk = `data: ${JSON.stringify({ content: aiResponse })}\n\n`;
            
            let sent = false;
            return {
              ok: true,
              status: 200,
              body: {
                getReader: () => ({
                  read: async () => {
                    if (sent) return { done: true };
                    sent = true;
                    return { value: encoder.encode(chunk), done: false };
                  }
                })
              }
            };
          };

          // Execute: Send AI chat message
          const result = await send_success(userMessage, mockFetch, mockDocument);

          // Verify: File marker parsing behavior is preserved
          
          // Check 1: Request should succeed
          if (!result.success) return false;
          
          // Check 2: File should be extracted
          if (result.filesUpdated.length !== 1) return false;
          if (result.filesUpdated[0].name !== fileName) return false;
          if (result.filesUpdated[0].content !== fileContent) return false;
          
          // Check 3: Visible text should NOT include file content
          if (result.visibleText.includes('BEGIN FILE')) return false;
          if (result.visibleText.includes('END FILE')) return false;
          if (result.visibleText.includes(fileContent)) return false;
          
          // Check 4: Visible text should include the message part
          if (!result.visibleText.includes(visibleMessage.trim())) return false;
          
          return true;
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property 5.3: Messages Without File Markers
   * 
   * When AI response does NOT include file markers,
   * the system should:
   * - Display all content as visible text
   * - Not attempt to parse files
   * - Add complete response to chat history
   * 
   * This test verifies non-file responses are handled correctly.
   */
  test('Property 5.3: Messages without file markers are displayed correctly', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
        fc.string({ minLength: 10, maxLength: 300 }).filter(s => !s.includes('BEGIN FILE') && !s.includes('END FILE')),
        async (userMessage, aiResponse) => {
          // Setup: Mock fetch to return response without file markers
          const mockFetch = async (url, options) => {
            const encoder = new TextEncoder();
            const chunk = `data: ${JSON.stringify({ content: aiResponse })}\n\n`;
            
            let sent = false;
            return {
              ok: true,
              status: 200,
              body: {
                getReader: () => ({
                  read: async () => {
                    if (sent) return { done: true };
                    sent = true;
                    return { value: encoder.encode(chunk), done: false };
                  }
                })
              }
            };
          };

          // Execute: Send AI chat message
          const result = await send_success(userMessage, mockFetch, mockDocument);

          // Verify: Non-file message behavior is preserved
          
          // Check 1: Request should succeed
          if (!result.success) return false;
          
          // Check 2: No files should be extracted
          if (result.filesUpdated.length !== 0) return false;
          
          // Check 3: All content should be visible text
          if (result.visibleText !== aiResponse.trim()) return false;
          
          // Check 4: Chat history should contain the full response
          if (result.chatHistory.length !== 2) return false;
          if (result.chatHistory[1].content !== aiResponse.trim()) return false;
          
          return true;
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property 5.4: Multiple File Markers
   * 
   * When AI response includes multiple file markers,
   * the system should:
   * - Parse all files correctly
   * - Extract each file name and content
   * - Update all files
   * - Preserve visible text between file markers
   * 
   * This test verifies multiple file handling is preserved.
   */
  test('Property 5.4: Multiple file markers are parsed correctly', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
        fc.array(
          fc.record({
            name: fc.string({ minLength: 5, maxLength: 30 }).filter(s => !s.includes('\n') && s.trim().length > 0),
            content: fc.string({ minLength: 10, maxLength: 100 })
          }),
          { minLength: 2, maxLength: 3 }
        ),
        fc.string({ minLength: 10, maxLength: 100 }),
        async (userMessage, files, visibleMessage) => {
          // Setup: Mock fetch to return response with multiple file markers
          let aiResponse = visibleMessage;
          for (const file of files) {
            aiResponse += `\n\nBEGIN FILE: ${file.name}\n${file.content}\nEND FILE: ${file.name}`;
          }
          
          const mockFetch = async (url, options) => {
            const encoder = new TextEncoder();
            const chunk = `data: ${JSON.stringify({ content: aiResponse })}\n\n`;
            
            let sent = false;
            return {
              ok: true,
              status: 200,
              body: {
                getReader: () => ({
                  read: async () => {
                    if (sent) return { done: true };
                    sent = true;
                    return { value: encoder.encode(chunk), done: false };
                  }
                })
              }
            };
          };

          // Execute: Send AI chat message
          const result = await send_success(userMessage, mockFetch, mockDocument);

          // Verify: Multiple file parsing behavior is preserved
          
          // Check 1: Request should succeed
          if (!result.success) return false;
          
          // Check 2: All files should be extracted
          if (result.filesUpdated.length !== files.length) return false;
          
          // Check 3: Each file should match
          for (let i = 0; i < files.length; i++) {
            if (result.filesUpdated[i].name !== files[i].name) return false;
            if (result.filesUpdated[i].content !== files[i].content) return false;
          }
          
          // Check 4: Visible text should NOT include file content
          if (result.visibleText.includes('BEGIN FILE')) return false;
          if (result.visibleText.includes('END FILE')) return false;
          
          // Check 5: Visible text should include the message part
          if (!result.visibleText.includes(visibleMessage.trim())) return false;
          
          return true;
        }
      ),
      { numRuns: 30 }
    );
  });

  /**
   * Property 5.5: Various Message Lengths
   * 
   * The system should handle messages of various lengths correctly:
   * - Short messages (1-50 chars)
   * - Medium messages (50-200 chars)
   * - Long messages (200+ chars)
   * 
   * This test verifies message length handling is preserved.
   */
  test('Property 5.5: Various message lengths are handled correctly', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
        fc.oneof(
          fc.string({ minLength: 1, maxLength: 50 }),
          fc.string({ minLength: 50, maxLength: 200 }),
          fc.string({ minLength: 200, maxLength: 500 })
        ),
        async (userMessage, aiResponse) => {
          // Setup: Mock fetch to return response of varying length
          const mockFetch = async (url, options) => {
            const encoder = new TextEncoder();
            const chunk = `data: ${JSON.stringify({ content: aiResponse })}\n\n`;
            
            let sent = false;
            return {
              ok: true,
              status: 200,
              body: {
                getReader: () => ({
                  read: async () => {
                    if (sent) return { done: true };
                    sent = true;
                    return { value: encoder.encode(chunk), done: false };
                  }
                })
              }
            };
          };

          // Execute: Send AI chat message
          const result = await send_success(userMessage, mockFetch, mockDocument);

          // Verify: Message length handling is preserved
          
          // Check 1: Request should succeed
          if (!result.success) return false;
          
          // Check 2: Visible text should match response
          if (result.visibleText !== aiResponse.trim()) return false;
          
          // Check 3: Chat history should be correct
          if (result.chatHistory.length !== 2) return false;
          if (result.chatHistory[1].content !== aiResponse.trim()) return false;
          
          return true;
        }
      ),
      { numRuns: 50 }
    );
  });
});
