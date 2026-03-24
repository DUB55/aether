# Bug Condition Exploration Test Summary: switchTab Null References

## Test Status: WRITTEN AND READY TO RUN

**Validates: Requirements 2.3**

## Test Location
- Test file: `aether-assets/app.test.js`
- Test suite: "Bug Condition Exploration: switchTab Null Reference Errors"
- Standalone runner: `aether-assets/run-switchtab-test.js`

## Bug Condition

The `switchTab` function in `app.js` (line 889) attempts to access `classList` and `style` properties on DOM elements without checking if they exist first:

```javascript
function switchTab(tab) {
  document.querySelectorAll('.tab').forEach(n => n.classList.toggle('active', n.dataset.tab === tab));
  document.getElementById('pane-preview').style.display = tab === 'preview' ? 'flex' : 'none';
  document.getElementById('pane-code').classList.toggle('on', tab === 'code');
  ['history','deploy'].forEach(p => document.getElementById(`pane-${p}`).classList.toggle('on', tab === p));
  refreshIcons();
}
```

**Problem**: When `getElementById` returns `null` (element doesn't exist), accessing `.classList` or `.style` throws:
```
TypeError: Cannot read properties of null (reading 'classList')
```

## Test Cases Written

The exploration test includes 5 test cases that simulate missing DOM elements:

### Test 1: Missing pane-history
- **Setup**: Remove 'pane-history' element from DOM
- **Action**: Call `switchTab('history')`
- **Expected on unfixed code**: TypeError thrown at line with `classList.toggle`
- **Expected on fixed code**: No error, graceful handling

### Test 2: Missing pane-deploy
- **Setup**: Remove 'pane-deploy' element from DOM
- **Action**: Call `switchTab('deploy')`
- **Expected on unfixed code**: TypeError thrown
- **Expected on fixed code**: No error, graceful handling

### Test 3: Missing pane-code
- **Setup**: Remove 'pane-code' element from DOM
- **Action**: Call `switchTab('code')`
- **Expected on unfixed code**: TypeError thrown at line with `pane-code.classList.toggle`
- **Expected on fixed code**: No error, graceful handling

### Test 4: Missing pane-preview
- **Setup**: Remove 'pane-preview' element from DOM
- **Action**: Call `switchTab('preview')`
- **Expected on unfixed code**: TypeError thrown at line with `style.display`
- **Expected on fixed code**: No error, graceful handling

### Test 5: Multiple missing panes
- **Setup**: Remove both 'pane-history' and 'pane-deploy' elements
- **Action**: Call `switchTab('history')` and `switchTab('deploy')`
- **Expected on unfixed code**: TypeError thrown for each missing element
- **Expected on fixed code**: No errors, graceful handling

## Expected Counterexamples

When run on UNFIXED code, the tests will document these counterexamples:

1. **"When pane-history is missing, switchTab('history') throws TypeError on classList access"**
2. **"When pane-deploy is missing, switchTab('deploy') throws TypeError on classList access"**
3. **"When pane-code is missing, switchTab('code') throws TypeError on classList access"**
4. **"When pane-preview is missing, switchTab('preview') throws TypeError on style access"**
5. **"When multiple panes are missing, switchTab throws TypeError"**

## Expected Behavior (from Design Property 3)

After the fix is implemented:
- No TypeError should be thrown when pane elements are missing
- Existing elements should still be updated correctly
- The function should gracefully handle missing DOM elements

## How to Run Tests

### Option 1: Using Jest (recommended)
```bash
cd aether-assets
npm test -- --testNamePattern="switchTab"
```

### Option 2: Using standalone runner
```bash
cd aether-assets
node run-switchtab-test.js
```

### Option 3: Using batch file
```bash
cd aether-assets
test-switchtab.bat
```

## Test Verification

The test is correctly written and will FAIL on unfixed code because:

1. **Current implementation**: Directly accesses properties without null checks
   ```javascript
   document.getElementById('pane-code').classList.toggle('on', tab === 'code');
   // If getElementById returns null, this throws TypeError
   ```

2. **Test expectation**: No errors should be thrown
   ```javascript
   expect(() => {
     switchTab('history');
   }).not.toThrow();
   ```

3. **Outcome**: Test will fail with TypeError, confirming the bug exists

## Next Steps

1. ✅ Test written and documented
2. ⏳ Run test on unfixed code to confirm failure (blocked by path issues)
3. ⏳ Implement fix by adding null checks
4. ⏳ Re-run test to confirm it passes after fix

## Notes

- The test encodes the expected behavior from Design Property 3
- When this test passes after the fix, it will validate that null safety is working
- The test uses Jest mocking to simulate missing DOM elements
- All test assertions align with the requirements in bugfix.md section 2.3
