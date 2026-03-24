# Implementation Plan: Browser File Navigation

## Overview

This plan implements a browser-like file navigation feature for the Aether editor. The file navigator will be added to the topbar, allowing users to type file names and navigate between HTML files in their project. The implementation integrates with the existing file management system and preview rendering mechanism.

## Tasks

- [x] 1. Add file navigator HTML structure to topbar
  - Add the file navigator div with forward slash prefix and input field to the topbar in editor.html
  - Position it between the tabs and actions sections
  - Include error message span for displaying validation errors
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 2. Add file navigator CSS styling
  - Add styles for .file-navigator, .file-nav-prefix, .file-nav-input, and .file-nav-error classes
  - Use consistent styling with existing topbar elements (#0a0a0a background, var(--ed-border) borders)
  - Style error messages with red color (#ef4444) and appropriate sizing
  - _Requirements: 1.4_

- [x] 3. Implement core file navigation functions
  - [x] 3.1 Implement validateFileName(fileName) function
    - Check for .html extension
    - Check if file exists in files array
    - Return validation result object with valid boolean and error message
    - _Requirements: 4.1, 4.2_

  - [ ]* 3.2 Write property test for validateFileName
    - **Property 4: Invalid Format Error**
    - **Validates: Requirements 4.2**

  - [x] 3.3 Implement loadFileByName(fileName) function
    - Trim whitespace from input
    - Default to "index.html" for empty input
    - Call validateFileName to check validity
    - Load file content and call renderPrev on success
    - Call showFileError on failure
    - _Requirements: 2.1, 2.2, 2.4, 3.1, 3.2_

  - [ ]* 3.4 Write property test for loadFileByName
    - **Property 1: Valid File Loading**
    - **Validates: Requirements 2.1, 2.2, 2.4**

  - [ ]* 3.5 Write property test for default file behavior
    - **Property 3: Non-Existent File Error**
    - **Validates: Requirements 4.1**

- [x] 4. Implement error handling functions
  - [x] 4.1 Implement showFileError(message) function
    - Display error message in the error span element
    - Set 3-second auto-clear timeout
    - Store timeout ID for potential early clearing
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - [x] 4.2 Implement clearFileError() function
    - Clear any active timeout
    - Hide error message
    - Clear error span text content
    - _Requirements: 4.4_

  - [ ]* 4.3 Write property test for error display
    - **Property 5: Input Preservation After Error**
    - **Validates: Requirements 4.3**

  - [ ]* 4.4 Write property test for error auto-clear
    - **Property 6: Error Auto-Clear Timing**
    - **Validates: Requirements 4.4**

- [x] 5. Implement event handlers
  - [x] 5.1 Implement handleFileNavigation(event) function
    - Check for Enter key press
    - Get input value from file-nav-input element
    - Clear any existing errors
    - Call loadFileByName with input value
    - _Requirements: 2.3_

  - [ ]* 5.2 Write property test for Enter key trigger
    - **Property 2: Enter Key Triggers Navigation**
    - **Validates: Requirements 2.3**

  - [x] 5.3 Add input event handler to clear errors on typing
    - Bind to file-nav-input input event
    - Call clearFileError when user types
    - _Requirements: 4.4_

- [x] 6. Wire up event listeners in bindEvents()
  - Add keydown event listener to file-nav-input for Enter key
  - Add input event listener to file-nav-input for error clearing
  - Ensure event listeners are bound during initialization
  - _Requirements: 2.3, 6.1, 6.2, 6.3, 6.4_

- [x] 7. Initialize file navigator on page load
  - Set initial value to "index.html" or empty
  - Ensure preview pane displays index.html on initialization
  - Verify integration with existing initEditor() function
  - _Requirements: 3.3_

- [x] 8. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ]* 9. Integration testing
  - [ ]* 9.1 Write property test for refresh button integration
    - **Property 7: Refresh Button Integration**
    - **Validates: Requirements 5.1, 5.3**

  - [ ]* 9.2 Write property test for preview rendering integration
    - **Property 8: Preview Rendering Integration**
    - **Validates: Requirements 5.2**

  - [ ]* 9.3 Write property test for dynamic file list access
    - **Property 9: Dynamic File List Access**
    - **Validates: Requirements 5.4**

  - [ ]* 9.4 Write property test for valid character input
    - **Property 10: Valid Character Input**
    - **Validates: Requirements 6.1**

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property tests should use fast-check library with minimum 100 iterations
- All property tests must include comment tags: `// Feature: browser-file-navigation, Property {number}: {property_text}`
- The file navigator integrates with existing functions: renderPrev(), getFileContent(), and the files array
- Error handling preserves user input and provides clear feedback
- The implementation maintains consistency with existing editor UI patterns
