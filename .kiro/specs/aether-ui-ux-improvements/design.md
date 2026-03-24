# Design Document: Aether UI/UX Improvements

## Overview

This design specifies improvements to the Aether web-based editor's user experience, focusing on streamlining workflows and enhancing interaction patterns. The improvements include:

1. **Instant Copy Button Feedback** - Replace toast notifications with inline visual feedback for copy operations
2. **Settings Panel with Link Mode Toggle** - Introduce a persistent settings system for user preferences
3. **Unified Deploy Button** - Move deployment action to the header for quick access
4. **Deploy Tab Removal** - Simplify the interface by removing the dedicated deploy tab
5. **Deploy URL Display in Modal** - Show deployment results in a custom messagebox with interactive elements
6. **AI Backend Integration** - Ensure AI chat works correctly with the existing `/api/chatbot` endpoint

These changes aim to reduce friction in common workflows, eliminate unnecessary UI elements, and provide more intuitive feedback mechanisms.

## Architecture

### Component Structure

The application follows a modular architecture with these key components:

```
┌─────────────────────────────────────────────────────────┐
│                    App Header                            │
│  [Logo] [Project Name] [Download] [Deploy] [Projects]   │
└─────────────────────────────────────────────────────────┘
┌──────────────┬──────────────────────────────────────────┐
│              │         Surface (Tabs + Content)          │
│   AI Chat    │  ┌────────────────────────────────────┐  │
│              │  │  Topbar: [Tabs] [Actions]          │  │
│   Messages   │  ├────────────────────────────────────┤  │
│              │  │  Preview / Code / History          │  │
│   Composer   │  │                                    │  │
│              │  │                                    │  │
└──────────────┴──┴────────────────────────────────────┴──┘
```

### New Components

1. **Settings Panel** - A new modal dialog for user preferences
2. **Custom Messagebox** - A reusable modal component for displaying information with interactive elements
3. **Enhanced Copy Button** - Stateful button component with visual feedback

### Modified Components

1. **App Header** - Add deploy button next to download button
2. **Tab Navigation** - Remove deploy tab from the tab list
3. **AI Chat** - Update to use `/api/chatbot` endpoint with proper request/response handling

## Components and Interfaces

### 1. Copy Button Component

The copy button provides instant visual feedback without interrupting the user's workflow.

**States:**
- `idle` - Default state showing copy icon
- `success` - Checkmark icon displayed for 2 seconds after successful copy
- `error` - Error indicator displayed for 2 seconds after failed copy

**Interface:**
```javascript
class CopyButton {
  constructor(targetElementId, buttonElement)
  async copy()
  showSuccess()
  showError()
  reset()
}
```

**Behavior:**
- On click, immediately copy text to clipboard
- Change icon to checkmark on success
- Display error indicator on failure
- Auto-reset to idle state after 2 seconds
- No toast notifications

### 2. Settings Panel

A modal dialog for managing user preferences, initially containing link mode selection.

**Structure:**
```javascript
{
  linkMode: 'safe' | 'quick',  // Default: 'safe'
}
```

**Interface:**
```javascript
class SettingsPanel {
  open()
  close()
  loadSettings()
  saveSettings(settings)
  getSettings()
}
```

**Storage:**
- Settings persisted to `localStorage` under key `aether-settings`
- JSON format: `{ linkMode: 'safe' | 'quick' }`
- Loaded on application initialization
- Saved immediately on change

**UI Elements:**
- Modal overlay with backdrop blur
- Toggle control for link mode selection
- Descriptive text explaining each option:
  - **Safe Link**: Encrypted, requires backend deployment, more secure
  - **Quick Link**: Hash-based, works offline, less secure
- Close button

### 3. Deploy Button (Header)

A new button in the app header positioned next to the download button.

**Placement:**
```html
<div class="app-right">
  <button class="icon-btn" title="Download HTML">...</button>
  <button class="icon-btn" title="Deploy" onclick="deployProject()">
    <svg data-lucide="rocket"></svg>
  </button>
  <button class="icon-btn" title="Projects">...</button>
  <button class="icon-btn" title="New project">...</button>
</div>
```

**Behavior:**
- Clicking triggers `deployProject()` function
- Uses link mode from settings to determine deployment type
- Shows loading state during deployment
- Opens custom messagebox on completion

### 4. Custom Messagebox

A reusable modal component for displaying information with interactive elements.

**Interface:**
```javascript
class CustomMessagebox {
  show(config)
  hide()
}

// Config structure
{
  title: string,
  message: string,
  url?: string,           // Optional URL to display
  showCopyButton?: boolean,
  showOpenButton?: boolean,
  onClose?: () => void
}
```

**UI Elements:**
- Modal overlay with backdrop
- Title text
- Message/description text
- Read-only URL input field (if URL provided)
- Copy button with instant feedback (if enabled)
- "Open in New Tab" button (if enabled)
- Close button

**Usage for Deploy:**
```javascript
messagebox.show({
  title: 'Deployment Successful',
  message: 'Your project has been deployed and is ready to share.',
  url: deployUrl,
  showCopyButton: true,
  showOpenButton: true
});
```

### 5. AI Chat Backend Integration

The AI chat component communicates with the backend endpoint at `/api/chatbot`.

**Request Format:**
```javascript
{
  input: string,              // User's message
  personality: 'coder',       // Fixed personality
  model: 'gpt-4o',           // Model selection
  thinking_mode: 'balanced',  // Thinking mode
  session_id: string,         // Session identifier
  history: Array<{            // Conversation history
    role: 'user' | 'assistant',
    content: string
  }>
}
```

**Response Format:**
- Server-Sent Events (SSE) stream
- Each event: `data: {JSON}\n\n`
- JSON structure:
  ```javascript
  {
    type: 'content' | 'metadata' | 'ping' | 'error',
    content?: string,
    // Alternative fields for compatibility
    text?: string,
    delta?: string,
    message?: string,
    choices?: [{ delta: { content: string } }]
  }
  ```

**File Extraction:**
- Detect `BEGIN FILE: filename` markers
- Extract content until `END FILE: filename`
- Write to project files
- Show file status indicators in chat

**Error Handling:**
- Network errors: Display error message in chat
- Abort support: Cancel in-progress requests
- Timeout handling: Show appropriate error message

## Data Models

### Settings Model

```javascript
{
  linkMode: 'safe' | 'quick'
}
```

**Validation:**
- `linkMode` must be either 'safe' or 'quick'
- If invalid or missing, default to 'safe'

### Copy Button State

```javascript
{
  state: 'idle' | 'success' | 'error',
  timeoutId: number | null
}
```

### Messagebox Config

```javascript
{
  title: string,
  message: string,
  url?: string,
  showCopyButton?: boolean,
  showOpenButton?: boolean,
  onClose?: () => void
}
```

### AI Request/Response

**Request:**
```javascript
{
  input: string,
  personality: string,
  model: string,
  thinking_mode: string,
  session_id: string,
  history: Array<{
    role: 'user' | 'assistant',
    content: string
  }>
}
```

**Response Event:**
```javascript
{
  type: 'content' | 'metadata' | 'ping' | 'error',
  content?: string,
  text?: string,
  delta?: string,
  message?: string,
  choices?: Array<{
    delta: {
      content: string
    }
  }>
}
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Copy Button Clipboard Transfer

*For any* copy button and any text content, when the button is clicked, the clipboard should immediately contain the exact text associated with that button.

**Validates: Requirements 1.1**

### Property 2: Copy Button Visual Feedback Cycle

*For any* copy button, clicking it should change the icon to a checkmark, maintain that checkmark for 2 seconds, then restore the original copy icon.

**Validates: Requirements 1.2, 1.3, 1.4**

### Property 3: Copy Button Silent Operation

*For any* copy button click, no toast notifications or alert dialogs should be created or displayed in the DOM.

**Validates: Requirements 1.5**

### Property 4: Copy Button Error Indication

*For any* copy button, when the clipboard operation fails, an error indicator should be displayed on the button for 2 seconds.

**Validates: Requirements 1.6**

### Property 5: Settings Persistence Round Trip

*For any* link mode selection ('safe' or 'quick'), saving the setting and then loading the application should restore the same link mode value.

**Validates: Requirements 2.4, 2.5**

### Property 6: Link Mode Usage in Share

*For any* link mode setting, when generating a share link, the system should use the selected link mode to determine the link generation method (encrypted for 'safe', hash-based for 'quick').

**Validates: Requirements 2.8**

### Property 7: Deploy Button Initiates Deployment

*For any* application state, clicking the deploy button should trigger the deployment process and show deployment status feedback.

**Validates: Requirements 3.3**

### Property 8: Deploy Button Visibility Across Views

*For any* tab or view in the editor, the deploy button should remain visible and clickable in the header.

**Validates: Requirements 3.4**

### Property 9: Deploy Tab Exclusion

*For any* tab switching operation, "Deploy" should not appear in the available tab options.

**Validates: Requirements 4.3**

### Property 10: Successful Deployment Shows Messagebox

*For any* successful deployment, a custom messagebox should be displayed containing the deployment URL in a read-only field.

**Validates: Requirements 5.1, 5.2**

### Property 11: Messagebox Copy Button Behavior

*For any* custom messagebox with a copy button, clicking the copy button should copy the displayed URL to the clipboard and show the instant feedback pattern (checkmark for 2 seconds).

**Validates: Requirements 5.3, 5.4**

### Property 12: Deployment Error Display

*For any* failed deployment, a custom messagebox should be displayed containing an error message with failure details.

**Validates: Requirements 5.7**

### Property 13: AI Request Endpoint and Format

*For any* AI chat message, the system should POST a request to `/api/chatbot` with a JSON payload containing the user input, conversation history, and required metadata fields (personality, model, thinking_mode, session_id).

**Validates: Requirements 6.1, 6.2**

### Property 14: AI Streaming Response Handling

*For any* SSE streaming response from the backend, the system should parse each event, extract content progressively, and display it in the chat interface as it arrives.

**Validates: Requirements 6.3, 6.4**

### Property 15: AI File Extraction

*For any* AI response containing BEGIN FILE and END FILE markers, the system should extract the file content between the markers and save it to the project with the specified filename.

**Validates: Requirements 6.5**

### Property 16: AI Error Message Display

*For any* error response from the backend endpoint, an error message should be displayed in the AI chat interface.

**Validates: Requirements 6.6**

### Property 17: AI Request Abort Functionality

*For any* in-progress AI request, triggering abort should cancel the network request and update the UI to reflect the stopped state.

**Validates: Requirements 6.7, 6.8**

## Error Handling

### Copy Button Errors

**Clipboard API Failure:**
- Detect when `navigator.clipboard.writeText()` fails
- Display error indicator on button (red icon or border)
- Maintain error state for 2 seconds
- Log error to console for debugging
- Do not show toast notifications

**Fallback Strategy:**
- If Clipboard API is unavailable, use fallback method (select + execCommand)
- If all methods fail, show error indicator

### Settings Panel Errors

**localStorage Unavailable:**
- Detect when localStorage is not available (private browsing, quota exceeded)
- Fall back to in-memory settings (session-only)
- Log warning to console
- Settings will not persist across sessions

**Invalid Settings Data:**
- Validate settings structure on load
- If invalid, use default values
- Log warning with details
- Save corrected settings

**Default Values:**
- `linkMode`: 'safe'

### Deployment Errors

**Network Errors:**
- Catch fetch failures
- Display error in custom messagebox
- Include error message from backend if available
- Provide "Try Again" option

**Backend Errors:**
- Parse error response from backend
- Display user-friendly error message
- Log full error details to console
- Show specific guidance for common errors (e.g., endpoint configuration)

**Timeout Handling:**
- Set reasonable timeout for deployment requests (30 seconds)
- Show timeout error in messagebox
- Allow user to retry

### AI Chat Errors

**Network Errors:**
- Catch fetch failures during AI requests
- Display error message in chat
- Update run state to "Error"
- Allow user to retry

**SSE Parsing Errors:**
- Catch JSON parse errors in SSE events
- Log error to console
- Continue processing other events
- Display partial response if available

**File Extraction Errors:**
- Validate file markers (BEGIN FILE / END FILE)
- Handle mismatched or missing markers gracefully
- Log warning for malformed file blocks
- Continue processing other content

**Abort Handling:**
- Detect AbortError specifically
- Update UI to "Stopped" state
- Do not show error message for user-initiated aborts
- Clean up streaming state

**Backend Error Responses:**
- Parse error type from backend
- Display appropriate error message
- Distinguish between user errors and system errors
- Provide actionable guidance when possible

## Testing Strategy

### Overview

This feature will be tested using a dual approach combining unit tests for specific scenarios and property-based tests for universal behaviors. The testing strategy ensures comprehensive coverage of UI interactions, state management, and backend integration.

### Unit Testing

Unit tests will focus on specific examples, edge cases, and integration points:

**Copy Button Tests:**
- Test copy button with empty text (edge case)
- Test copy button with very long text (edge case)
- Test copy button with special characters
- Test error state when clipboard API fails
- Test visual state transitions (idle → success → idle)

**Settings Panel Tests:**
- Test settings panel opens and closes
- Test default settings when localStorage is empty
- Test settings panel UI contains required elements (toggle, descriptions)
- Test invalid settings data is corrected
- Test localStorage unavailable fallback

**Deploy Button Tests:**
- Test deploy button exists in header
- Test deploy button positioned next to download button
- Test deploy button visible on all tabs (Preview, Code, History)

**Deploy Tab Removal Tests:**
- Test deploy tab not in tab list
- Test deploy tab panel not in DOM
- Test other tabs still present (Preview, Code, History)

**Custom Messagebox Tests:**
- Test messagebox displays on successful deployment
- Test messagebox contains URL field
- Test messagebox contains copy and open buttons
- Test messagebox close button dismisses dialog
- Test error messagebox displays on deployment failure

**AI Backend Integration Tests:**
- Test AI request sent to correct endpoint (`/api/chatbot`)
- Test request payload structure
- Test SSE event parsing with various formats
- Test file marker extraction (BEGIN FILE / END FILE)
- Test error response handling
- Test abort functionality

### Property-Based Testing

Property-based tests will verify universal behaviors across many generated inputs. Each test will run a minimum of 100 iterations.

**Configuration:**
- Testing library: fast-check (JavaScript)
- Minimum iterations: 100 per property
- Each test tagged with feature name and property reference

**Property Test Suite:**

1. **Copy Button Clipboard Transfer** (Property 1)
   - Generate random text strings
   - Click copy button
   - Verify clipboard contains exact text
   - Tag: `Feature: aether-ui-ux-improvements, Property 1: Copy Button Clipboard Transfer`

2. **Copy Button Visual Feedback Cycle** (Property 2)
   - Generate random copy button instances
   - Click button
   - Verify icon changes to checkmark
   - Wait 2 seconds
   - Verify icon restored to original
   - Tag: `Feature: aether-ui-ux-improvements, Property 2: Copy Button Visual Feedback Cycle`

3. **Copy Button Silent Operation** (Property 3)
   - Generate random copy operations
   - Click copy button
   - Verify no toast elements created in DOM
   - Tag: `Feature: aether-ui-ux-improvements, Property 3: Copy Button Silent Operation`

4. **Copy Button Error Indication** (Property 4)
   - Mock clipboard failures
   - Click copy button
   - Verify error indicator appears
   - Wait 2 seconds
   - Verify error indicator removed
   - Tag: `Feature: aether-ui-ux-improvements, Property 4: Copy Button Error Indication`

5. **Settings Persistence Round Trip** (Property 5)
   - Generate random link mode selections
   - Save setting
   - Reload application state
   - Verify same link mode restored
   - Tag: `Feature: aether-ui-ux-improvements, Property 5: Settings Persistence Round Trip`

6. **Link Mode Usage in Share** (Property 6)
   - Generate random link mode settings
   - Trigger share link generation
   - Verify correct link type generated (encrypted vs hash-based)
   - Tag: `Feature: aether-ui-ux-improvements, Property 6: Link Mode Usage in Share`

7. **Deploy Button Initiates Deployment** (Property 7)
   - Generate random application states
   - Click deploy button
   - Verify deployment process starts
   - Tag: `Feature: aether-ui-ux-improvements, Property 7: Deploy Button Initiates Deployment`

8. **Deploy Button Visibility Across Views** (Property 8)
   - Generate random tab selections
   - Switch to tab
   - Verify deploy button visible and clickable
   - Tag: `Feature: aether-ui-ux-improvements, Property 8: Deploy Button Visibility Across Views`

9. **Deploy Tab Exclusion** (Property 9)
   - Generate random tab switching sequences
   - Verify "Deploy" never in available tabs
   - Tag: `Feature: aether-ui-ux-improvements, Property 9: Deploy Tab Exclusion`

10. **Successful Deployment Shows Messagebox** (Property 10)
    - Generate random successful deployment responses
    - Complete deployment
    - Verify messagebox displayed with URL
    - Tag: `Feature: aether-ui-ux-improvements, Property 10: Successful Deployment Shows Messagebox`

11. **Messagebox Copy Button Behavior** (Property 11)
    - Generate random URLs in messagebox
    - Click copy button
    - Verify clipboard contains URL
    - Verify checkmark feedback shown
    - Tag: `Feature: aether-ui-ux-improvements, Property 11: Messagebox Copy Button Behavior`

12. **Deployment Error Display** (Property 12)
    - Generate random deployment errors
    - Trigger deployment failure
    - Verify error messagebox displayed with details
    - Tag: `Feature: aether-ui-ux-improvements, Property 12: Deployment Error Display`

13. **AI Request Endpoint and Format** (Property 13)
    - Generate random chat messages
    - Send message
    - Verify POST to `/api/chatbot`
    - Verify JSON structure correct
    - Tag: `Feature: aether-ui-ux-improvements, Property 13: AI Request Endpoint and Format`

14. **AI Streaming Response Handling** (Property 14)
    - Generate random SSE event streams
    - Send to AI handler
    - Verify content extracted and displayed progressively
    - Tag: `Feature: aether-ui-ux-improvements, Property 14: AI Streaming Response Handling`

15. **AI File Extraction** (Property 15)
    - Generate random file content with markers
    - Process AI response
    - Verify files created with correct content
    - Tag: `Feature: aether-ui-ux-improvements, Property 15: AI File Extraction`

16. **AI Error Message Display** (Property 16)
    - Generate random error responses
    - Process error
    - Verify error message in chat
    - Tag: `Feature: aether-ui-ux-improvements, Property 16: AI Error Message Display`

17. **AI Request Abort Functionality** (Property 17)
    - Start random AI requests
    - Trigger abort
    - Verify network request cancelled
    - Verify UI updated to stopped state
    - Tag: `Feature: aether-ui-ux-improvements, Property 17: AI Request Abort Functionality`

### Test Environment

**Browser Testing:**
- Chrome/Chromium (primary)
- Firefox
- Safari
- Edge

**Mocking Strategy:**
- Mock `navigator.clipboard` API for copy tests
- Mock `localStorage` for settings tests
- Mock `fetch` for backend integration tests
- Mock SSE streams for AI chat tests

**Test Data:**
- Generate random strings (various lengths, special characters)
- Generate random settings combinations
- Generate random SSE event sequences
- Generate random file content with markers

### Coverage Goals

- Unit test coverage: 90%+ for new code
- Property test coverage: All 17 properties implemented
- Integration test coverage: All user workflows end-to-end
- Browser compatibility: All major browsers tested
