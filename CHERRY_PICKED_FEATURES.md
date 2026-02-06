# Cherry-Picked Features from cypress-metamask-v2

This document describes features cherry-picked from the forked repository at https://github.com/saxenashivang/cypress-metamask-v2 and adapted to work with our modernized architecture.

## Features Added

### 1. Lock MetaMask Command
**Source:** Commit b20f1bd from fork  
**New Command:** `cy.lockMetamask()`

Allows tests to lock the MetaMask wallet, useful for testing lock/unlock flows.

```javascript
// Example usage
cy.lockMetamask();
cy.unlockMetamask('password');
```

**Files Modified:**
- `pages/metamask/main-page.js`: Added `lockButton` selector
- `support/metamask.js`: Added `lock()` function
- `support/commands.js`: Added to simple commands array
- `plugins/index.js`: Added `lockMetamask` task handler

### 2. EIP-712 V4 Typed Signature Support
**Source:** Commit ea05122 from fork  
**New Commands:** 
- `cy.confirmMetamaskTypedV4SignatureRequest()`
- `cy.rejectMetamaskTypedV4SignatureRequest()`

Essential for testing modern dApps that use EIP-712 typed data signatures (v4).

```javascript
// Example usage
cy.get('#signTypedDataV4').click();
cy.confirmMetamaskTypedV4SignatureRequest();
```

**Files Modified:**
- `pages/metamask/notification-page.js`: Added signature page elements and V4 button selectors
- `support/metamask.js`: Added `confirmTypedV4SignatureRequest()` and `rejectTypedV4SignatureRequest()` functions
- `support/commands.js`: Added to simple commands array
- `plugins/index.js`: Added task handlers for both commands

### 3. Duplicate Setup Protection
**Source:** Commit 014a1e1 from fork

Prevents errors when `setupMetamask()` is called multiple times. Now checks if wallet is already set up and returns early instead of failing.

```javascript
// Can now be called multiple times safely
cy.setupMetamask();
// ... later in tests
cy.setupMetamask(); // Won't fail
```

**Files Modified:**
- `support/metamask.js`: Added wallet overview check in `initialSetup()`

### 4. MetaMask UI Selector Updates
**Source:** Commit 62315b2 from fork

Critical updates for newer MetaMask versions that changed their UI structure.

**Changes:**
- **Network button indices:** Changed from `nth-child(3 + number)` to `nth-child(1 + number)`
- **Wallet address selector:** Changed from `.account-modal input` to `.account-modal .qr-code__address`
- **Seed phrase input:** Now handles split word inputs (one input per word) instead of single textarea
- **Form selectors:** Updated to `.create-new-vault__form` and related classes

**Files Modified:**
- `pages/metamask/main-page.js`: Updated `networkButton()` formula and `walletAddressInput` selector
- `pages/metamask/first-time-flow-page.js`: Updated to split seed phrase input pattern
- `support/metamask.js`: Updated `importWallet()` to iterate through words individually

## Adaptation to Our Architecture

All cherry-picked features were adapted to work with our modernized codebase:

### 1. Dynamic Command Generation
Instead of manually adding commands as in the fork:
```javascript
// Fork approach (explicit)
Cypress.Commands.add('lockMetamask', () => {
  return cy.task('lockMetamask');
});
```

We added them to our dynamic generation:
```javascript
// Our approach (dynamic)
const simpleCommands = [
  // ...
  'lockMetamask',
  'confirmMetamaskTypedV4SignatureRequest',
  'rejectMetamaskTypedV4SignatureRequest',
];
```

### 2. Timeout Constants
All hardcoded timeouts in cherry-picked code were replaced with our constants:
```javascript
// Fork: await page.waitForTimeout(3000);
// Ours: await page.waitForTimeout(TIMEOUTS.EXTRA_LONG);
```

### 3. JSDoc Documentation
All new functions received comprehensive JSDoc comments:
```javascript
/**
 * Lock MetaMask wallet
 * @returns {Promise<boolean>} True if successful
 */
async lock() {
  // ...
}
```

## Testing

To test the new features:

1. **Lock/Unlock:**
   ```javascript
   cy.lockMetamask();
   cy.unlockMetamask('Tester@1234');
   ```

2. **V4 Signatures:**
   ```javascript
   cy.get('#signTypedDataV4').click();
   cy.confirmMetamaskTypedV4SignatureRequest();
   ```

3. **Duplicate Setup:**
   ```javascript
   cy.setupMetamask(secretWords, network, password);
   cy.setupMetamask(secretWords, network, password); // Should not fail
   ```

## Compatibility

These changes are designed to work with:
- **Newer MetaMask versions** (with updated UI)
- **Older MetaMask versions** (fallback selectors where possible)
- **Our modernized architecture** (constants, dynamic commands, JSDoc)

## Future Considerations

### Not Cherry-Picked (Yet)
- **Playwright Migration (da7e03e):** Massive breaking change, conflicts with current architecture
- **Full Cypress 10 Migration:** Requires major restructuring, should be separate PR

### Recommendations
1. Test with multiple MetaMask versions to ensure compatibility
2. Consider adding integration tests for new commands
3. Monitor fork for additional useful features
4. Plan Cypress 10 migration as separate major version upgrade
