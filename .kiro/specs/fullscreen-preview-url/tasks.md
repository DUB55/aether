# Implementation Plan: Fullscreen Preview URL

## Overview

This implementation plan breaks down the fullscreen preview URL feature into discrete coding tasks. The feature extends Aether's existing share functionality to support a viewer-only mode that displays webpage content without editor UI elements. The implementation reuses existing encryption, compression, and URL generation utilities while adding minimal new code for viewer mode detection and rendering.

## Tasks

- [ ] 1. Extend URL generator with viewer mode support
  - [x] 1.1 Add createQuickLinkViewer function to share-crypto.js
    - Implement function that calls existing createQuickLink() and appends ?mode=viewer parameter
    - Return fullscreen preview URL string
    - _Requirements: 1.1, 1.2, 1.3, 5.1, 5.2_
  
  - [x] 1.2 Add createViewerUrls function to share-crypto.js
    - Implement function that generates both editor and viewer URLs
    - Return object with editorUrl and viewerUrl properties
    - Support both quick link and secure (GitHub-based) formats
    - _Requirements: 1.1, 1.2, 1.3, 3.1, 3.2_
  
  - [ ]* 1.3 Write property test for URL data completeness
    - **Property 1: Fullscreen URL Data Completeness**
    - **Validates: Requirements 1.2**
    - Generate random project files, create viewer URL, extract and decode data, verify equivalence to original
  
  - [ ]* 1.4 Write property test for URL format consistency
    - **Property 6: URL Format Consistency**
    - **Validates: Requirements 5.1, 5.2, 5.3**
    - Generate random project, create both editor and viewer URLs, verify same encryption/compression used, verify only difference is mode parameter

- [ ] 2. Implement viewer mode detection and initialization
  - [x] 2.1 Add isViewerMode function to app.js
    - Check for mode=viewer query parameter using URLSearchParams
    - Return boolean indicating viewer mode
    - _Requirements: 2.1, 5.3_
  
  - [x] 2.2 Add initViewer function to app.js
    - Add viewer-mode class to body element
    - Hide all editor UI elements (chat, code editor, tabs, toolbars, file tree)
    - Configure preview iframe to occupy full viewport
    - Disable editor interactions
    - _Requirements: 2.1, 2.2, 2.3_
  
  - [x] 2.3 Integrate viewer mode check into app initialization
    - Call isViewerMode() during app startup
    - If true, call initViewer() instead of normal editor initialization
    - Ensure viewer mode bypasses editor setup code
    - _Requirements: 2.1, 2.2, 2.3_
  
  - [ ]* 2.4 Write unit tests for viewer mode initialization
    - Test isViewerMode returns true when mode=viewer parameter present
    - Test isViewerMode returns false when parameter absent
    - Test initViewer adds viewer-mode class to body
    - _Requirements: 2.1, 2.2, 2.3_

- [ ] 3. Add viewer mode styling
  - [x] 3.1 Add CSS rules for viewer mode to editor.html
    - Hide editor UI elements when body has viewer-mode class
    - Make preview iframe fullscreen (100% width and height)
    - Remove borders and padding from preview container
    - Ensure no scrollbars on body in viewer mode
    - _Requirements: 2.2, 2.3_
  
  - [ ]* 3.2 Write property test for UI isolation
    - **Property 2: Viewer Mode UI Isolation**
    - **Validates: Requirements 2.1, 2.2, 2.3**
    - Generate random viewer URLs, render in DOM, verify no editor UI elements visible, verify only iframe present

- [ ] 4. Checkpoint - Verify viewer mode renders correctly
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 5. Update deploy panel UI with viewer URLs
  - [x] 5.1 Add HTML elements for viewer URLs to editor.html deploy section
    - Add card section with "Fullscreen Preview URL" heading
    - Add input fields for quick link and secure viewer URLs
    - Add copy buttons for each URL type
    - Include descriptive text explaining viewer URL purpose
    - _Requirements: 1.4, 4.1_
  
  - [x] 5.2 Implement generateViewerUrls function in app.js
    - Call createViewerUrls() from share-crypto.js
    - Populate viewer URL input fields with generated URLs
    - Handle both quick link and secure formats
    - _Requirements: 1.1, 1.4_
  
  - [x] 5.3 Implement copyViewerQuickUrl function in app.js
    - Copy quick link viewer URL to clipboard using navigator.clipboard.writeText()
    - Display success toast on successful copy
    - Display error toast on clipboard failure
    - _Requirements: 4.1, 4.2, 4.3, 4.4_
  
  - [x] 5.4 Implement copyViewerSecureUrl function in app.js
    - Copy secure viewer URL to clipboard using navigator.clipboard.writeText()
    - Display success toast on successful copy
    - Display error toast on clipboard failure
    - _Requirements: 4.1, 4.2, 4.3, 4.4_
  
  - [x] 5.5 Integrate viewer URL generation into deploy workflow
    - Call generateViewerUrls() when deploy completes
    - Ensure viewer URLs update when project data changes
    - _Requirements: 1.1, 5.4_
  
  - [ ]* 5.6 Write unit tests for copy functionality
    - Test copyViewerQuickUrl copies correct URL to clipboard
    - Test copyViewerSecureUrl copies correct URL to clipboard
    - Test error toast displays when clipboard operation fails
    - _Requirements: 4.1, 4.2, 4.3, 4.4_
  
  - [ ]* 5.7 Write property test for URL synchronization
    - **Property 7: URL Synchronization**
    - **Validates: Requirements 5.4**
    - Generate random project, update data, regenerate URLs, verify both contain updated data

- [ ] 6. Implement data loading for viewer mode
  - [x] 6.1 Add viewer data loading logic to app.js
    - Detect URL format (quick link vs secure)
    - For quick link: decompress hash data using existing utilities
    - For secure link: fetch from GitHub URL and decrypt using existing utilities
    - Parse JSON to extract project files
    - _Requirements: 2.4, 3.1, 3.2, 3.3, 3.4_
  
  - [x] 6.2 Implement file reference resolution for viewer mode
    - Ensure CSS links, script tags, and other file references resolve correctly
    - Use existing preview iframe file resolution logic
    - _Requirements: 2.4_
  
  - [ ]* 6.3 Write property test for multi-file reference resolution
    - **Property 3: Multi-file Reference Resolution**
    - **Validates: Requirements 2.4**
    - Generate random projects with cross-file references, render in viewer mode, verify all references resolve
  
  - [ ]* 6.4 Write property test for quick link round-trip
    - **Property 4: Quick Link Round-trip Preservation**
    - **Validates: Requirements 3.1, 3.3**
    - Generate random project, create hash-based viewer URL, load and render, verify content equivalent to original
  
  - [ ]* 6.5 Write property test for secure link round-trip
    - **Property 5: Secure Link Round-trip Preservation**
    - **Validates: Requirements 3.2, 3.4**
    - Generate random project, create GitHub-based viewer URL, load and render, verify content equivalent to original

- [ ] 7. Implement error handling for viewer mode
  - [x] 7.1 Add viewer error display component to editor.html
    - Create error container with icon, title, message, and return link
    - Style error display to be centered and prominent
    - Hide by default, show only when error occurs
    - _Requirements: 6.1, 6.2, 6.3, 6.4_
  
  - [x] 7.2 Add error handling for corrupted URL data
    - Catch decompression and JSON parsing errors
    - Display error message: "Unable to load preview. The URL may be corrupted or incomplete."
    - Show return link to main Aether application
    - _Requirements: 6.1, 6.4_
  
  - [x] 7.3 Add error handling for missing GitHub resources
    - Catch HTTP 404 errors when fetching from GitHub
    - Display error message: "Preview not found. The shared resource may have been deleted."
    - Show return link to main Aether application
    - _Requirements: 6.2, 6.4_
  
  - [x] 7.4 Add error handling for decryption failures
    - Catch crypto operation errors and missing key errors
    - Display error message: "Unable to decrypt preview. The URL may be incomplete or invalid."
    - Show return link to main Aether application
    - _Requirements: 6.3, 6.4_
  
  - [ ]* 7.5 Write unit tests for error scenarios
    - Test corrupted URL data displays appropriate error
    - Test missing GitHub resource displays 404 error
    - Test invalid decryption key displays decryption error
    - Test error display includes return link
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [ ] 8. Ensure webpage functionality in viewer mode
  - [x] 8.1 Configure iframe sandbox for viewer mode
    - Apply same sandbox restrictions as editor preview iframe
    - Enable JavaScript execution
    - Allow form submissions and user interactions
    - Support modal dialogs and popups
    - _Requirements: 7.1, 7.2, 7.3, 7.4_
  
  - [ ]* 8.2 Write property test for sandbox security consistency
    - **Property 8: Sandbox Security Consistency**
    - **Validates: Requirements 7.4**
    - Generate random webpage content, render in viewer mode, verify sandbox restrictions match editor preview
  
  - [ ]* 8.3 Write unit tests for webpage functionality
    - Test JavaScript executes in viewer mode iframe
    - Test form submissions work in viewer mode
    - Test user interactions (clicks, inputs) work in viewer mode
    - _Requirements: 7.1, 7.2, 7.3_

- [ ] 9. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- The implementation reuses existing share-crypto.js utilities for encryption, compression, and URL generation
- Viewer mode is implemented as a conditional rendering mode within editor.html rather than a separate page
- Property tests validate universal correctness properties across all inputs
- Unit tests validate specific examples, edge cases, and error conditions
