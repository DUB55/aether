# Design Document: Landing Page UI Improvement

## Overview

This design separates the Aether editor into two distinct pages: a modern landing page for capturing user intent and a dedicated editor page for development work. The landing page adopts the liquid glass aesthetic from aether-standalone.html with gradient backgrounds and smooth animations, while the editor page preserves all existing functionality from the current aether.html implementation.

The key architectural change is the introduction of URL-based parameter passing to seamlessly transfer user input from the landing page to the editor, where it's automatically displayed and sent to the AI for processing.

## Architecture

### Page Structure

The application will consist of two separate HTML files:

1. **aether.html** (Landing Page)
   - Lightweight, focused on user input capture
   - Modern UI with gradient backgrounds and liquid glass effects
   - Minimal JavaScript for form handling and navigation
   - Theme toggle functionality
   - Recent projects display

2. **editor.html** (Editor Page)
   - Full editor functionality from current aether.html
   - Chat interface with AI integration
   - Code editor with file management
   - Preview pane with iframe rendering
   - Project management (save, load, export, import)
   - History and snapshot functionality
   - Share and deploy features

### Data Flow

```
Landing Page → URL Parameter → Editor Page → Chat Display → Auto-send to AI
     ↓                              ↓
User Input                    localStorage (projects)
```

1. User enters project description on landing page
2. On submit (Enter key or button click), navigate to editor.html with URL parameter
3. Editor extracts parameter, displays as user message in chat
4. Editor automatically invokes send() function to start AI processing
5. All subsequent interactions use existing editor functionality

### URL Parameter Specification

- Parameter name: `prompt`
- Encoding: URL-encoded using `encodeURIComponent()`
- Format: `editor.html?prompt=<encoded_text>`
- Maximum length: Browser-dependent (typically 2000+ characters)

## Components and Interfaces

### Landing Page Components

#### 1. Navigation Bar
- Brand logo and name
- Projects button (navigates to projects screen)
- Theme toggle button
- Responsive layout

#### 2. Hero Section
- Gradient background with liquid glass effect
- Main heading and subheading
- Input form with textarea
- Submit button with icon
- Quick action buttons (start from prompt, start blank, open recent)
- Suggestion chips for common project types

#### 3. Input Form
```javascript
interface LandingForm {
  textarea: HTMLTextAreaElement;  // Multi-line input
  submitButton: HTMLButtonElement; // Arrow up icon
  onSubmit: (text: string) => void; // Navigation handler
}
```

#### 4. Theme Toggle
```javascript
interface ThemeToggle {
  currentTheme: 'light' | 'dark';
  toggle: () => void;
  persist: () => void; // Save to localStorage
}
```

### Editor Page Components

#### 1. URL Parameter Handler
```javascript
interface URLParameterHandler {
  extractPrompt: () => string | null;
  decodePrompt: (encoded: string) => string;
  hasPrompt: () => boolean;
}
```

#### 2. Auto-send Manager
```javascript
interface AutoSendManager {
  displayUserMessage: (text: string) => void;
  triggerSend: () => Promise<void>;
  handleError: (error: Error) => void;
}
```

#### 3. Existing Editor Components
All components from current aether.html are preserved:
- Chat interface (msgs, composer, send button)
- File tree and code editor
- Preview pane with iframe
- Tab system (Preview, Code, History, Deploy)
- Project management
- Snapshot system
- Share functionality

## Data Models

### Project Data Structure (Preserved)
```javascript
interface Project {
  id: string;              // Unique identifier
  name: string;            // Project name
  files: File[];           // Array of project files
  chatHistory: Message[];  // Chat conversation history
  snapshots: Snapshot[];   // Saved snapshots
  notes: Note[];           // History notes
  createdAt: number;       // Timestamp
  updatedAt: number;       // Timestamp
}

interface File {
  name: string;            // Filename with extension
  content: string;         // File contents
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface Snapshot {
  label: string;
  files: File[];
  timestamp: number;
}

interface Note {
  text: string;
  timestamp: number;
}
```

### localStorage Keys (Preserved)
- `dub5-projects`: JSON array of all projects
- `dub5-current-project-id`: Currently active project ID
- `theme`: Current theme ('light' or 'dark')

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: URL Encoding Preservation

*For any* text input containing special characters (spaces, quotes, ampersands, Unicode), URL encoding then decoding should produce the original text.

**Validates: Requirements 5.5, 6.1**

### Property 2: Navigation Triggers

*For any* valid user input, both Enter key press and submit button click should navigate to the editor page with the correct URL parameter.

**Validates: Requirements 5.1, 5.2, 5.3**

### Property 3: Message Display and Auto-send

*For any* URL parameter present on editor load, the text should be displayed as a user message in the chat and the send() function should be automatically invoked after display.

**Validates: Requirements 6.1, 6.2, 6.3, 7.1, 7.2, 7.3**

### Property 4: Conditional Auto-send

*For any* editor page load without a URL parameter, no automatic message should be displayed and no auto-send should occur.

**Validates: Requirements 6.5**

### Property 5: Theme Toggle Persistence

*For any* theme state (light or dark), toggling the theme should change the visual state and persist the preference to localStorage for future sessions.

**Validates: Requirements 2.5**

### Property 6: File Operations Preservation

*For any* file operation (create, edit, delete, rename) performed in the editor, the operation should complete successfully and update the project state correctly.

**Validates: Requirements 8.1**

### Property 7: Project Export-Import Round Trip

*For any* project, exporting to JSON then importing should produce an equivalent project with all files, metadata, and history preserved.

**Validates: Requirements 8.5, 9.3, 9.5**

### Property 8: Snapshot Round Trip

*For any* project state, creating a snapshot then restoring it should return the project to the exact same file state.

**Validates: Requirements 8.6**

### Property 9: localStorage Integration

*For any* project modifications, changes should be persisted to localStorage using the same keys and data structure as the current implementation.

**Validates: Requirements 3.6, 8.9, 9.2**

### Property 10: Existing Project Loading

*For any* existing project in localStorage, loading the project should restore all files, chat history, snapshots, and metadata correctly.

**Validates: Requirements 9.1, 9.4**

### Property 11: Preview Update

*For any* change to index.html content, the preview iframe should update to reflect the new content.

**Validates: Requirements 8.2**

### Property 12: Error Handling

*For any* send() function failure, an error message should be displayed to the user in the chat interface.

**Validates: Requirements 7.5**

### Property 13: Keyboard Shortcuts

*For any* registered keyboard shortcut, pressing the key combination should trigger the associated action.

**Validates: Requirements 8.8**

### Property 14: Share Functionality

*For any* project, generating a share link should create a valid URL that can be used to load the project on another device.

**Validates: Requirements 8.7**

## Error Handling

### Landing Page Errors

1. **Empty Input Submission**
   - Behavior: Prevent navigation if textarea is empty or contains only whitespace
   - User feedback: Visual indication (border highlight or shake animation)

2. **Navigation Failure**
   - Behavior: Catch navigation errors
   - User feedback: Display error message in toast notification

### Editor Page Errors

1. **URL Parameter Parsing Errors**
   - Behavior: If parameter is malformed, load editor normally without auto-send
   - Logging: Console warning with details

2. **Auto-send Failures**
   - Behavior: Display error message in chat as assistant message
   - User feedback: "Failed to send message automatically. Please try sending manually."
   - Recovery: User can manually resend the message

3. **localStorage Errors**
   - Behavior: Catch quota exceeded or access denied errors
   - User feedback: Display warning toast
   - Fallback: Continue with in-memory state only

4. **File Operation Errors**
   - Behavior: Validate file names and content before operations
   - User feedback: Display error dialog with specific issue
   - Recovery: Revert to previous state

5. **Preview Rendering Errors**
   - Behavior: Catch iframe errors and CSP violations
   - User feedback: Display error message in preview pane
   - Fallback: Show "Preview unavailable" message

## Testing Strategy

### Dual Testing Approach

This feature requires both unit tests and property-based tests for comprehensive coverage:

- **Unit tests**: Verify specific examples, edge cases, and error conditions
- **Property tests**: Verify universal properties across all inputs

Both approaches are complementary and necessary. Unit tests catch concrete bugs in specific scenarios, while property tests verify general correctness across a wide range of inputs.

### Unit Testing Focus

Unit tests should focus on:
- Specific examples that demonstrate correct behavior (e.g., submitting "Hello World" navigates correctly)
- Edge cases (empty input, very long input, special characters)
- Error conditions (network failures, localStorage quota exceeded)
- Integration points (URL parameter extraction, send() function invocation)

Avoid writing too many unit tests for scenarios that property tests can cover. For example, instead of testing 20 different text inputs individually, use property tests to verify the behavior holds for all inputs.

### Property-Based Testing

**Library Selection**: Use fast-check for JavaScript/TypeScript property-based testing

**Configuration**:
- Minimum 100 iterations per property test (due to randomization)
- Each test must reference its design document property
- Tag format: `// Feature: landing-page-ui-improvement, Property {number}: {property_text}`

**Property Test Implementation**:

Each correctness property listed above must be implemented as a single property-based test. For example:

```javascript
// Feature: landing-page-ui-improvement, Property 1: URL Encoding Preservation
test('URL encoding preserves all text', () => {
  fc.assert(
    fc.property(fc.string(), (text) => {
      const encoded = encodeURIComponent(text);
      const decoded = decodeURIComponent(encoded);
      expect(decoded).toBe(text);
    }),
    { numRuns: 100 }
  );
});
```

### Test Coverage Areas

1. **Landing Page**
   - Form submission with various inputs
   - Theme toggle functionality
   - Navigation to editor with URL parameters
   - Keyboard event handling (Enter key)
   - Empty input validation

2. **Editor Page**
   - URL parameter extraction and decoding
   - Auto-send trigger and timing
   - Message display in chat
   - Conditional behavior (with/without parameter)
   - Error handling for failed sends

3. **Data Persistence**
   - localStorage read/write operations
   - Project data structure validation
   - Backward compatibility with existing projects
   - Export/import round-trip

4. **Editor Functionality**
   - File operations (create, edit, delete, rename)
   - Preview updates
   - Snapshot creation and restoration
   - Share link generation
   - Keyboard shortcuts

### Integration Testing

- Test complete flow: landing page → editor → AI interaction
- Test with real localStorage data from current implementation
- Test theme persistence across page navigation
- Test project loading from existing localStorage data

### Manual Testing Checklist

- Visual verification of liquid glass effects and gradients
- Responsive design on mobile and desktop viewports
- Theme toggle visual changes
- Preview rendering of various HTML/CSS/JS combinations
- Share functionality with generated URLs
- Accessibility (keyboard navigation, screen reader compatibility)

## Implementation Notes

### Backup Strategy

Before any modifications:
1. Create `Backup-LandingPage.html` as exact copy of current `aether.html`
2. Verify backup file exists and matches original
3. Proceed with modifications only after successful backup

### CSS and Styling

- Extract liquid glass styles from aether-standalone.html
- Maintain existing editor styles from current aether.html
- Ensure theme variables work across both pages
- Use CSS custom properties for consistency

### JavaScript Organization

**Landing Page (aether.html)**:
- Inline JavaScript for form handling (minimal)
- Theme toggle logic
- Navigation function
- No external dependencies except Lucide icons

**Editor Page (editor.html)**:
- Reference existing `/aether-assets/app.js`
- Add initialization code for URL parameter handling
- Add auto-send logic in initialization
- Preserve all existing functionality

### Initialization Sequence (Editor Page)

```javascript
// 1. Extract URL parameter
const urlParams = new URLSearchParams(window.location.search);
const prompt = urlParams.get('prompt');

// 2. Initialize editor (existing code)
initEditor();

// 3. If prompt exists, display and auto-send
if (prompt) {
  const decodedPrompt = decodeURIComponent(prompt);
  addUserMsg(decodedPrompt);
  chatHist.push({ role: 'user', content: decodedPrompt });
  
  // Auto-send after a brief delay to ensure UI is ready
  setTimeout(() => {
    send().catch(error => {
      console.error('Auto-send failed:', error);
      const aiMsg = ensureAiMsg();
      aiMsg.textContent = 'Failed to send message automatically. Please try sending manually.';
    });
  }, 100);
}
```

### Browser Compatibility

- Target modern browsers (Chrome, Firefox, Safari, Edge)
- Use standard Web APIs (URLSearchParams, localStorage, fetch)
- Graceful degradation for older browsers
- No polyfills required for target browsers

### Performance Considerations

- Landing page should load quickly (minimal JavaScript)
- Lazy load editor functionality only when needed
- Use CSS animations for smooth transitions
- Optimize gradient rendering for performance
- Debounce textarea input if needed for large text

### Security Considerations

- Sanitize URL parameters before display (use textContent, not innerHTML)
- Maintain existing iframe sandbox attributes for preview
- Preserve existing CSP policies
- No additional XSS vulnerabilities introduced
- localStorage data remains client-side only

### Accessibility

- Maintain keyboard navigation throughout
- Ensure theme toggle is keyboard accessible
- Preserve existing ARIA labels and roles
- Test with screen readers
- Maintain focus management during navigation
- Ensure sufficient color contrast in both themes
