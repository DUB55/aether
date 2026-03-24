# Implementation Plan

## Bug 1: Clipboard Permissions Fallback

- [x] 1. Write bug condition exploration test for clipboard permissions
  - **Property 1: Fault Condition** - Clipboard API Blocked by Permissions Policy
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate the clipboard fallback is not triggered when Clipboard API is blocked
  - **Scoped PBT Approach**: Scope the property to the concrete failing case where navigator.clipboard.writeText throws NotAllowedError
  - Mock navigator.clipboard.writeText to throw DOMException with name "NotAllowedError"
  - Simulate user clicking copy button
  - Assert that copyFallback method is called (from Expected Behavior Property 1)
  - Assert that success feedback is shown to user (from Expected Behavior Property 1)
  - Run test on UNFIXED code
  - **EXPECTED OUTCOME**: Test FAILS (copyFallback not called, error shown instead)
  - Document counterexamples found: "When Clipboard API throws NotAllowedError, copyFallback is not triggered and user sees error message"
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 2.1, 2.4_

- [x] 2. Write preservation property tests for clipboard (BEFORE implementing fix)
  - **Property 2: Preservation** - Existing Clipboard Functionality
  - **IMPORTANT**: Follow observation-first methodology
  - Observe behavior on UNFIXED code for successful clipboard operations:
    - When Clipboard API is available and not blocked, copy succeeds
    - Success feedback is displayed correctly
    - Various text lengths and formats are handled
  - Write property-based tests capturing observed behavior patterns from Preservation Requirements:
    - For all copy actions where Clipboard API is available and not blocked, result equals successful copy with success feedback (Property 4)
    - Test with random text content of varying lengths
    - Test with different text formats (plain text, URLs, code snippets)
  - Property-based testing generates many test cases for stronger guarantees
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (confirms baseline clipboard behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1_

- [x] 3. Fix clipboard permissions fallback

  - [x] 3.1 Implement the clipboard fallback fix in CopyButton.copy()
    - Add specific error type checking for NotAllowedError and SecurityError
    - Call copyFallback when permissions errors are detected
    - Add console.warn logging for debugging
    - Keep existing try-catch structure but enhance error handling
    - _Bug_Condition: isBugCondition_Clipboard(input) where input.clipboardAPIBlocked === true AND navigator.clipboard.writeText() throws PermissionsError_
    - _Expected_Behavior: copyFallback is called AND success feedback shown (Property 1)_
    - _Preservation: Clipboard API success path unchanged (Property 4)_
    - _Requirements: 2.1, 2.4, 3.1_

  - [x] 3.2 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - Clipboard Fallback on Permissions Block
    - **IMPORTANT**: Re-run the SAME test from task 1 - do NOT write a new test
    - The test from task 1 encodes the expected behavior
    - When this test passes, it confirms copyFallback is triggered when Clipboard API is blocked
    - Run bug condition exploration test from step 1
    - **EXPECTED OUTCOME**: Test PASSES (confirms clipboard fallback works)
    - _Requirements: 2.1, 2.4_

  - [x] 3.3 Verify preservation tests still pass
    - **Property 2: Preservation** - Existing Clipboard Functionality
    - **IMPORTANT**: Re-run the SAME tests from task 2 - do NOT write new tests
    - Run preservation property tests from step 2
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions in successful clipboard operations)
    - Confirm all tests still pass after fix (no regressions)

- [x] 4. Checkpoint - Ensure clipboard tests pass
  - Verify all clipboard-related tests pass
  - Confirm copyFallback is triggered when Clipboard API is blocked
  - Confirm successful clipboard operations still work correctly

## Bug 2: AI Chat Connection Error Logging

- [x] 5. Write bug condition exploration test for AI chat errors
  - **Property 1: Fault Condition** - AI Chat Error Logging
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms insufficient logging exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate insufficient error logging when AI endpoint fails
  - **Scoped PBT Approach**: Scope the property to concrete failing cases: 500 error, network error, CORS error
  - Mock fetch to return { ok: false, status: 500, text: async () => 'Internal Server Error' }
  - Simulate user sending AI chat message
  - Assert that detailed error information is logged: endpoint URL, status, response body (from Expected Behavior Property 2)
  - Assert that helpful error message is shown to user (from Expected Behavior Property 2)
  - Run test on UNFIXED code
  - **EXPECTED OUTCOME**: Test FAILS (insufficient logging, generic error message)
  - Document counterexamples found: "When AI endpoint returns 500, only status code is logged, no endpoint URL or response body"
  - Also test network error case: Mock fetch to throw TypeError
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 2.2, 2.5_

- [x] 6. Write preservation property tests for AI chat (BEFORE implementing fix)
  - **Property 2: Preservation** - Existing AI Chat Functionality
  - **IMPORTANT**: Follow observation-first methodology
  - Observe behavior on UNFIXED code for successful AI chat operations:
    - When fetch succeeds, response is streamed correctly
    - File markers are parsed and files are updated
    - Chat history is managed correctly
    - Typing indicators work as expected
  - Write property-based tests capturing observed behavior patterns from Preservation Requirements:
    - For all AI messages where fetch succeeds, result equals successful streaming with file updates (Property 5)
    - Test with various message types and lengths
    - Test with messages that include file markers
    - Test with messages that don't include file markers
  - Property-based testing generates many test cases for stronger guarantees
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (confirms baseline AI chat behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.2_

- [ ] 7. Fix AI chat error logging

  - [x] 7.1 Implement enhanced error logging in send()
    - Add console.log before fetch to log endpoint URL
    - Enhance error handling to log response status, statusText, and body
    - Try to read response body when available for error details
    - Distinguish between network errors and HTTP errors
    - Improve user-facing error messages with status codes and suggestions
    - _Bug_Condition: isBugCondition_AIChat(input) where fetch(input.endpoint) fails_
    - _Expected_Behavior: detailed error logged with endpoint, status, and body (Property 2)_
    - _Preservation: Successful AI chat streaming unchanged (Property 5)_
    - _Requirements: 2.2, 2.5, 3.2_

  - [x] 7.2 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - AI Chat Error Logging
    - **IMPORTANT**: Re-run the SAME test from task 5 - do NOT write a new test
    - The test from task 5 encodes the expected behavior
    - When this test passes, it confirms detailed error logging is working
    - Run bug condition exploration test from step 5
    - **EXPECTED OUTCOME**: Test PASSES (confirms detailed error logging works)
    - _Requirements: 2.2, 2.5_

  - [x] 7.3 Verify preservation tests still pass
    - **Property 2: Preservation** - Existing AI Chat Functionality
    - **IMPORTANT**: Re-run the SAME tests from task 6 - do NOT write new tests
    - Run preservation property tests from step 6
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions in successful AI chat operations)
    - Confirm all tests still pass after fix (no regressions)

- [x] 8. Checkpoint - Ensure AI chat tests pass
  - Verify all AI chat-related tests pass
  - Confirm detailed error logging works for failed requests
  - Confirm successful AI chat operations still work correctly

## Bug 3: switchTab Null Reference Errors

- [x] 9. Write bug condition exploration test for switchTab null references
  - **Property 1: Fault Condition** - switchTab Null Safety
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms null reference errors exist
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate null reference errors when pane elements are missing
  - **Scoped PBT Approach**: Scope the property to concrete failing cases where specific pane elements are missing
  - Remove 'pane-history' element from DOM
  - Call switchTab('history')
  - Assert that no TypeError is thrown (from Expected Behavior Property 3)
  - Assert that existing elements are still updated correctly (from Expected Behavior Property 3)
  - Run test on UNFIXED code
  - **EXPECTED OUTCOME**: Test FAILS (TypeError: Cannot read properties of null)
  - Document counterexamples found: "When pane-history is missing, switchTab('history') throws TypeError on classList access"
  - Also test with missing 'pane-deploy' and 'pane-code' elements
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 2.3_

- [x] 10. Write preservation property tests for switchTab (BEFORE implementing fix)
  - **Property 2: Preservation** - Existing Tab Switching Functionality
  - **IMPORTANT**: Follow observation-first methodology
  - Observe behavior on UNFIXED code when all pane elements exist:
    - Tab styling is updated correctly
    - Pane visibility is toggled correctly
    - Preview pane display is set correctly
    - refreshIcons is called
  - Write property-based tests capturing observed behavior patterns from Preservation Requirements:
    - For all tab switches where all elements exist, result equals correct styling and visibility updates (Property 6)
    - Test switching between all tab types: 'preview', 'code', 'history', 'deploy'
    - Test that classList.toggle is called with correct parameters
    - Test that preview pane display is set correctly
  - Property-based testing generates many test cases for stronger guarantees
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (confirms baseline tab switching behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.3, 3.4, 3.5_

- [ ] 11. Fix switchTab null reference errors

  - [x] 11.1 Implement null checks in switchTab()
    - Add null check for previewPane before accessing style.display
    - Add null check for codePane before accessing classList
    - Add null checks for history and deploy panes before accessing classList
    - Use explicit if statements or optional chaining for safety
    - Preserve existing logic for elements that do exist
    - _Bug_Condition: isBugCondition_SwitchTab(input) where pane elements are null_
    - _Expected_Behavior: no TypeError thrown AND existing elements updated (Property 3)_
    - _Preservation: Tab switching with all elements present unchanged (Property 6)_
    - _Requirements: 2.3, 3.3, 3.4, 3.5_

  - [x] 11.2 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - switchTab Null Safety
    - **IMPORTANT**: Re-run the SAME test from task 9 - do NOT write a new test
    - The test from task 9 encodes the expected behavior
    - When this test passes, it confirms null checks prevent errors
    - Run bug condition exploration test from step 9
    - **EXPECTED OUTCOME**: Test PASSES (confirms null safety works)
    - _Requirements: 2.3_

  - [x] 11.3 Verify preservation tests still pass
    - **Property 2: Preservation** - Existing Tab Switching Functionality
    - **IMPORTANT**: Re-run the SAME tests from task 10 - do NOT write new tests
    - Run preservation property tests from step 10
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions in tab switching with all elements present)
    - Confirm all tests still pass after fix (no regressions)

- [x] 12. Checkpoint - Ensure switchTab tests pass
  - Verify all switchTab-related tests pass
  - Confirm null checks prevent errors when elements are missing
  - Confirm tab switching still works correctly when all elements exist

## Final Validation

- [x] 13. Run all tests together
  - Run all exploration tests (should all pass after fixes)
  - Run all preservation tests (should all pass after fixes)
  - Verify no regressions across all three bug fixes
  - Confirm all requirements are satisfied

- [x] 14. Manual testing in browser
  - Test clipboard copy with permissions blocked (should use fallback)
  - Test clipboard copy with permissions granted (should work normally)
  - Test AI chat with endpoint unavailable (should show detailed errors)
  - Test AI chat with endpoint available (should work normally)
  - Test tab switching with missing panes (should not throw errors)
  - Test tab switching with all panes present (should work normally)

- [x] 15. Final checkpoint
  - Ensure all tests pass
  - Ensure no console errors in browser
  - Ask user if any questions arise or if additional testing is needed
