# Implementation Plan: Aether UI/UX Improvements

## Overview

This plan implements six key improvements to the Aether web-based editor: instant copy button feedback, a settings panel with link mode preferences, unified deploy button placement, deploy tab removal, deploy URL display in a custom messagebox, and AI backend integration with the `/api/chatbot` endpoint. The implementation follows a modular approach, building reusable components first, then integrating them into the existing application.

## Tasks

- [ ] 1. Create reusable UI components
  - [x] 1.1 Implement CopyButton component with state management
    - Create CopyButton class with idle/success/error states
    - Implement clipboard copy with fallback support
    - Add visual feedback transitions (icon changes)
    - Implement auto-reset after 2 seconds
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_
  
  - [ ]* 1.2 Write property test for CopyButton clipboard transfer
    - **Property 1: Copy Button Clipboard Transfer**
    - **Validates: Requirements 1.1**
  
  - [ ]* 1.3 Write property test for CopyButton visual feedback cycle
    - **Property 2: Copy Button Visual Feedback Cycle**
    - **Validates: Requirements 1.2, 1.3, 1.4**
  
  - [ ]* 1.4 Write property test for CopyButton silent operation
    - **Property 3: Copy Button Silent Operation**
    - **Validates: Requirements 1.5**
  
  - [ ]* 1.5 Write property test for CopyButton error indication
    - **Property 4: Copy Button Error Indication**
    - **Validates: Requirements 1.6**
  
  - [x] 1.6 Implement CustomMessagebox component
    - Create CustomMessagebox class with show/hide methods
    - Build modal overlay with backdrop
    - Add title, message, and optional URL field
    - Add optional copy and open buttons
    - Integrate CopyButton for URL copying
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7_
  
  - [ ]* 1.7 Write unit tests for CustomMessagebox
    - Test messagebox displays with correct content
    - Test copy button integration
    - Test open button functionality
    - Test close button dismisses dialog
    - _Requirements: 5.1, 5.2, 5.3, 5.5, 5.6_

- [ ] 2. Implement settings system
  - [x] 2.1 Create SettingsPanel component
    - Create SettingsPanel class with open/close methods
    - Build modal UI with link mode toggle
    - Add descriptive text for Safe Link and Quick Link options
    - Implement close button
    - _Requirements: 2.1, 2.2, 2.3, 2.7_
  
  - [x] 2.2 Implement settings persistence layer
    - Create loadSettings and saveSettings methods
    - Use localStorage with key 'aether-settings'
    - Implement JSON serialization/deserialization
    - Add validation for settings structure
    - Handle localStorage unavailable fallback
    - Set default linkMode to 'safe'
    - _Requirements: 2.4, 2.5, 2.6_
  
  - [ ]* 2.3 Write property test for settings persistence round trip
    - **Property 5: Settings Persistence Round Trip**
    - **Validates: Requirements 2.4, 2.5**
  
  - [ ]* 2.4 Write unit tests for settings panel
    - Test default settings when localStorage empty
    - Test invalid settings data correction
    - Test localStorage unavailable fallback
    - _Requirements: 2.4, 2.5, 2.6_

- [ ] 3. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 4. Integrate deploy button into header
  - [x] 4.1 Add deploy button to app header
    - Add deploy button HTML next to download button
    - Use rocket icon from lucide
    - Apply consistent styling with other header buttons
    - Wire up click handler to deployProject function
    - _Requirements: 3.1, 3.2, 3.5_
  
  - [x] 4.2 Implement deployProject function
    - Read link mode from settings
    - Show loading state on deploy button
    - Call appropriate deployment method based on link mode
    - Handle deployment success and error responses
    - Display CustomMessagebox with results
    - _Requirements: 2.8, 3.3, 5.1, 5.7_
  
  - [ ]* 4.3 Write property test for deploy button initiates deployment
    - **Property 7: Deploy Button Initiates Deployment**
    - **Validates: Requirements 3.3**
  
  - [ ]* 4.4 Write property test for deploy button visibility
    - **Property 8: Deploy Button Visibility Across Views**
    - **Validates: Requirements 3.4**
  
  - [ ]* 4.5 Write property test for link mode usage in share
    - **Property 6: Link Mode Usage in Share**
    - **Validates: Requirements 2.8**
  
  - [ ]* 4.6 Write unit tests for deploy button
    - Test button exists in header
    - Test button positioned next to download button
    - Test button visible on all tabs
    - _Requirements: 3.1, 3.2, 3.4_

- [ ] 5. Remove deploy tab
  - [x] 5.1 Remove deploy tab from navigation
    - Remove deploy tab from tab list array
    - Remove deploy tab panel HTML/component
    - Verify other tabs remain (Preview, Code, History)
    - _Requirements: 4.1, 4.2, 4.3, 4.4_
  
  - [ ]* 5.2 Write property test for deploy tab exclusion
    - **Property 9: Deploy Tab Exclusion**
    - **Validates: Requirements 4.3**
  
  - [ ]* 5.3 Write unit tests for deploy tab removal
    - Test deploy tab not in tab list
    - Test deploy tab panel not in DOM
    - Test other tabs still present
    - _Requirements: 4.1, 4.2, 4.4_

- [ ] 6. Implement deployment result display
  - [x] 6.1 Update deployment success handler
    - Call CustomMessagebox.show with deployment URL
    - Include copy button and open button
    - Set appropriate title and message
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.6_
  
  - [x] 6.2 Update deployment error handler
    - Call CustomMessagebox.show with error details
    - Set appropriate error title and message
    - _Requirements: 5.7_
  
  - [ ]* 6.3 Write property test for successful deployment messagebox
    - **Property 10: Successful Deployment Shows Messagebox**
    - **Validates: Requirements 5.1, 5.2**
  
  - [ ]* 6.4 Write property test for messagebox copy button behavior
    - **Property 11: Messagebox Copy Button Behavior**
    - **Validates: Requirements 5.3, 5.4**
  
  - [ ]* 6.5 Write property test for deployment error display
    - **Property 12: Deployment Error Display**
    - **Validates: Requirements 5.7**

- [ ] 7. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 8. Implement AI backend integration
  - [x] 8.1 Create AI request handler
    - Implement POST request to /api/chatbot endpoint
    - Build JSON payload with input, personality, model, thinking_mode, session_id, history
    - Set up SSE event stream handling
    - Implement abort controller for request cancellation
    - _Requirements: 6.1, 6.2, 6.4, 6.7_
  
  - [x] 8.2 Implement SSE response parser
    - Parse SSE data events
    - Extract content from multiple response formats (content, text, delta, message, choices)
    - Handle different event types (content, metadata, ping, error)
    - Display content progressively in chat UI
    - _Requirements: 6.3, 6.4_
  
  - [x] 8.3 Implement file extraction from AI responses
    - Detect BEGIN FILE and END FILE markers
    - Extract filename and content between markers
    - Write extracted files to project
    - Show file status indicators in chat
    - Handle malformed file blocks gracefully
    - _Requirements: 6.5_
  
  - [ ] 8.4 Implement AI error handling
    - Catch network errors and display in chat
    - Parse backend error responses
    - Display appropriate error messages
    - Handle abort errors separately (no error message)
    - Update UI to error/stopped state
    - _Requirements: 6.6, 6.8_
  
  - [ ]* 8.5 Write property test for AI request endpoint and format
    - **Property 13: AI Request Endpoint and Format**
    - **Validates: Requirements 6.1, 6.2**
  
  - [ ]* 8.6 Write property test for AI streaming response handling
    - **Property 14: AI Streaming Response Handling**
    - **Validates: Requirements 6.3, 6.4**
  
  - [ ]* 8.7 Write property test for AI file extraction
    - **Property 15: AI File Extraction**
    - **Validates: Requirements 6.5**
  
  - [ ]* 8.8 Write property test for AI error message display
    - **Property 16: AI Error Message Display**
    - **Validates: Requirements 6.6**
  
  - [ ]* 8.9 Write property test for AI request abort functionality
    - **Property 17: AI Request Abort Functionality**
    - **Validates: Requirements 6.7, 6.8**
  
  - [ ]* 8.10 Write unit tests for AI backend integration
    - Test request payload structure
    - Test SSE event parsing with various formats
    - Test file marker extraction
    - Test error response handling
    - Test abort functionality
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8_

- [ ] 9. Replace existing copy buttons with new CopyButton component
  - [x] 9.1 Update all copy buttons in the application
    - Identify all existing copy button instances
    - Replace with CopyButton component
    - Remove any existing toast notification code
    - Verify instant feedback works for all instances
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_

- [ ] 10. Wire settings panel to UI
  - [x] 10.1 Add settings panel trigger to UI
    - Add settings button/icon to appropriate location
    - Wire up click handler to open settings panel
    - Ensure settings panel accessible from main interface
    - _Requirements: 2.1_
  
  - [x] 10.2 Initialize settings on application load
    - Call loadSettings on app initialization
    - Apply loaded settings to application state
    - Ensure default values used when no settings exist
    - _Requirements: 2.5, 2.6_

- [ ] 11. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at key milestones
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- All components are built to be reusable and modular
- The implementation uses JavaScript as specified in the design document
