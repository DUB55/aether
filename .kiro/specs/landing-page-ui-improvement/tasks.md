# Implementation Plan: Landing Page UI Improvement

## Overview

This implementation separates the Aether editor into two pages: a modern landing page (aether.html) for capturing user input, and a dedicated editor page (editor.html) with all existing functionality. The landing page uses the liquid glass design from aether-standalone.html, and passes user input to the editor via URL parameters for automatic AI processing.

## Tasks

- [x] 1. Create backup of current landing page
  - Create Backup-LandingPage.html as exact copy of current aether.html
  - Verify backup file matches original
  - _Requirements: 1.1, 1.2, 1.3_

- [ ] 2. Create new landing page with modern design
  - [ ] 2.1 Extract and adapt design from aether-standalone.html
    - Copy HTML structure for hero section and input form
    - Extract liquid glass CSS styles and gradient backgrounds
    - Include navigation bar with theme toggle
    - Add responsive design styles for mobile and desktop
    - _Requirements: 2.1, 2.2, 2.3, 2.4_
  
  - [ ] 2.2 Implement input form and submission logic
    - Create textarea for project description with placeholder text
    - Add submit button with icon
    - Implement Enter key handler for form submission
    - Implement button click handler for form submission
    - Add empty input validation
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 5.1, 5.2_
  
  - [ ] 2.3 Implement navigation with URL parameter passing
    - URL-encode user input using encodeURIComponent()
    - Navigate to editor.html with prompt parameter
    - Handle navigation errors gracefully
    - _Requirements: 5.3, 5.4, 5.5_
  
  - [ ] 2.4 Implement theme toggle functionality
    - Add theme toggle button to navigation
    - Implement toggle logic for light/dark mode
    - Persist theme preference to localStorage
    - _Requirements: 2.5_
  
  - [ ]* 2.5 Write property test for URL encoding preservation
    - **Property 1: URL Encoding Preservation**
    - **Validates: Requirements 5.5, 6.1**
  
  - [ ]* 2.6 Write property test for navigation triggers
    - **Property 2: Navigation Triggers**
    - **Validates: Requirements 5.1, 5.2, 5.3**
  
  - [ ]* 2.7 Write unit tests for landing page
    - Test empty input validation
    - Test form submission with various inputs
    - Test theme toggle functionality
    - _Requirements: 4.1, 4.5, 5.1, 5.2, 2.5_

- [ ] 3. Checkpoint - Verify landing page functionality
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 4. Create separate editor page
  - [ ] 4.1 Create editor.html with existing editor functionality
    - Copy all editor HTML structure from current aether.html
    - Include chat interface, code editor, preview pane, and all tabs
    - Reference /aether-assets/app.js for functionality
    - Preserve all existing CSS styles for editor
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_
  
  - [ ] 4.2 Implement URL parameter extraction
    - Extract prompt parameter from URL using URLSearchParams
    - Decode URL parameter using decodeURIComponent()
    - Handle missing or malformed parameters gracefully
    - _Requirements: 6.1, 5.5_
  
  - [ ] 4.3 Implement message display in chat
    - Display decoded prompt as user message in chat
    - Use existing chat message styling
    - Add message to chatHist array
    - Only display if URL parameter is present
    - _Requirements: 6.2, 6.3, 6.4, 6.5_
  
  - [ ] 4.4 Implement automatic send functionality
    - Invoke send() function after message display
    - Add delay to ensure UI is ready (100ms)
    - Handle send() failures with error message display
    - Only auto-send if URL parameter is present
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_
  
  - [ ]* 4.5 Write property test for message display and auto-send
    - **Property 3: Message Display and Auto-send**
    - **Validates: Requirements 6.1, 6.2, 6.3, 7.1, 7.2, 7.3**
  
  - [ ]* 4.6 Write property test for conditional auto-send
    - **Property 4: Conditional Auto-send**
    - **Validates: Requirements 6.5**
  
  - [ ]* 4.7 Write unit tests for URL parameter handling
    - Test parameter extraction with various inputs
    - Test behavior with missing parameter
    - Test error handling for malformed parameters
    - _Requirements: 6.1, 6.5_

- [ ] 5. Verify editor functionality preservation
  - [ ] 5.1 Verify file operations work correctly
    - Test create, edit, delete, rename operations
    - Verify file tree updates correctly
    - _Requirements: 8.1_
  
  - [ ] 5.2 Verify preview functionality
    - Test preview iframe rendering
    - Verify preview updates on file changes
    - _Requirements: 8.2_
  
  - [ ] 5.3 Verify code editor functionality
    - Test syntax highlighting
    - Verify code editing and saving
    - _Requirements: 8.3_
  
  - [ ] 5.4 Verify all tabs work correctly
    - Test Preview, Code, History, Deploy tabs
    - Verify tab switching and content display
    - _Requirements: 8.4_
  
  - [ ] 5.5 Verify project management features
    - Test project export and import
    - Verify snapshot creation and restoration
    - Test project save and load from localStorage
    - _Requirements: 8.5, 8.6, 8.9_
  
  - [ ] 5.6 Verify share functionality
    - Test share link generation
    - Verify share links work correctly
    - _Requirements: 8.7_
  
  - [ ] 5.7 Verify keyboard shortcuts
    - Test all registered keyboard shortcuts
    - Verify shortcuts trigger correct actions
    - _Requirements: 8.8_
  
  - [ ]* 5.8 Write property test for file operations preservation
    - **Property 6: File Operations Preservation**
    - **Validates: Requirements 8.1**
  
  - [ ]* 5.9 Write property test for preview updates
    - **Property 11: Preview Update**
    - **Validates: Requirements 8.2**
  
  - [ ]* 5.10 Write property test for keyboard shortcuts
    - **Property 13: Keyboard Shortcuts**
    - **Validates: Requirements 8.8**
  
  - [ ]* 5.11 Write property test for share functionality
    - **Property 14: Share Functionality**
    - **Validates: Requirements 8.7**

- [ ] 6. Checkpoint - Verify all editor features work
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 7. Verify backward compatibility
  - [ ] 7.1 Verify localStorage integration
    - Test reading existing projects from localStorage
    - Verify same localStorage keys are used
    - Test project data structure compatibility
    - _Requirements: 9.1, 9.2, 9.3_
  
  - [ ] 7.2 Test with existing project data
    - Load existing projects and verify all files appear
    - Verify project metadata is preserved
    - Test that modifications save correctly
    - _Requirements: 9.4, 9.5_
  
  - [ ]* 7.3 Write property test for localStorage integration
    - **Property 9: localStorage Integration**
    - **Validates: Requirements 3.6, 8.9, 9.2**
  
  - [ ]* 7.4 Write property test for existing project loading
    - **Property 10: Existing Project Loading**
    - **Validates: Requirements 9.1, 9.4**
  
  - [ ]* 7.5 Write property test for project export-import round trip
    - **Property 7: Project Export-Import Round Trip**
    - **Validates: Requirements 8.5, 9.3, 9.5**
  
  - [ ]* 7.6 Write property test for snapshot round trip
    - **Property 8: Snapshot Round Trip**
    - **Validates: Requirements 8.6**

- [ ] 8. Final integration and testing
  - [ ] 8.1 Test complete user flow
    - Test landing page → editor → AI interaction flow
    - Verify theme persists across navigation
    - Test with various project descriptions
    - _Requirements: All_
  
  - [ ] 8.2 Verify error handling
    - Test empty input submission on landing page
    - Test auto-send failure scenarios
    - Test localStorage error handling
    - _Requirements: 7.5_
  
  - [ ]* 8.3 Write property test for error handling
    - **Property 12: Error Handling**
    - **Validates: Requirements 7.5**
  
  - [ ]* 8.4 Write property test for theme toggle persistence
    - **Property 5: Theme Toggle Persistence**
    - **Validates: Requirements 2.5**

- [ ] 9. Final checkpoint - Complete verification
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at key milestones
- Property tests validate universal correctness properties using fast-check library
- Unit tests validate specific examples and edge cases
- The backup file (Backup-LandingPage.html) preserves the original implementation
- All editor functionality must work exactly as before to maintain backward compatibility
- Theme preference persists across both pages using localStorage
