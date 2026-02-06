# Configuration Guide

## Timeout Configuration

The library now uses centralized timeout constants defined in `support/constants.js`. You can adjust these values if needed:

```javascript
const TIMEOUTS = {
  SHORT: 500,        // Quick operations (form input delays)
  MEDIUM: 1000,      // Standard waits (window switches, page loads)
  LONG: 2000,        // Longer operations (wallet imports, account switches)
  EXTRA_LONG: 3000,  // Complex operations (transaction confirmations, network changes)
  ELEMENT_WAIT: 300, // Stability wait after element detection
};
```

### When to Adjust Timeouts

**Increase timeouts if**:
- Running on slower hardware
- Network is slower than expected
- MetaMask version is slower to respond
- Tests are flaky due to timing

**Decrease timeouts if**:
- Running on fast hardware
- Want faster test execution
- MetaMask responds quickly in your environment

## Network Configuration

Predefined networks in `support/constants.js`:

```javascript
const NETWORKS = {
  MAINNET: { names: ['main', 'mainnet'], id: 1, index: 0 },
  ROPSTEN: { names: ['ropsten'], id: 3, index: 1 },
  KOVAN: { names: ['kovan'], id: 42, index: 2 },
  RINKEBY: { names: ['rinkeby'], id: 4, index: 3 },
  GOERLI: { names: ['goerli'], id: 5, index: 4 },
  LOCALHOST: { names: ['localhost'], index: 5 },
};
```

### Custom Networks

You can still use custom networks by passing an object:

```javascript
cy.changeMetamaskNetwork({
  networkName: 'Polygon Mumbai',
  rpcUrl: 'https://rpc-mumbai.maticvigil.com',
  chainId: '80001',
  symbol: 'MATIC',
  blockExplorer: 'https://mumbai.polygonscan.com',
  isTestnet: true,
});
```

Or via environment variables:

```bash
NETWORK_NAME=localhost
RPC_URL=http://127.0.0.1:8545/
CHAIN_ID=1337
SYMBOL=ETH  # Optional
BLOCK_EXPLORER=http://localhost:8545  # Optional
IS_TESTNET=true  # Optional
```

## Available Commands

All Cypress commands are dynamically generated for consistency:

### Simple Commands (no parameters)
```javascript
cy.initPuppeteer()
cy.assignWindows()
cy.confirmMetamaskWelcomePage()
cy.switchToCypressWindow()
cy.switchToMetamaskWindow()
cy.acceptMetamaskAccess()
cy.confirmMetamaskTransaction()
cy.rejectMetamaskTransaction()
cy.switchToMetamaskNotification()
cy.getNetwork()
```

### Parameterized Commands
```javascript
// Import wallet with seed phrase
cy.importMetamaskWallet(secretWords, password)

// Import wallet with private key
cy.importMetaMaskWalletUsingPrivateKey(key)

// Add custom network
cy.addMetamaskNetwork(network)

// Change network
cy.changeMetamaskNetwork('localhost')
cy.changeMetamaskNetwork('mainnet')
cy.changeMetamaskNetwork({ networkName: 'Custom', ... })

// Unlock MetaMask
cy.unlockMetamask(password)

// Complete setup
cy.setupMetamask(secretWords, network, password)

// Change account
cy.changeAccount(2)  // Switch to account #2

// Get wallet address
cy.getMetamaskWalletAddress()
cy.fetchMetamaskWalletAddress()
```

## Environment Variables

Required for most operations:

```bash
SECRET_WORDS="test test test test test test test test test test test junk"
PASSWORD=TestMetaMask
METAMASK_VERSION=latest
NETWORK_NAME=localhost
RPC_URL=http://127.0.0.1:8545/
CHAIN_ID=1337
```

Optional:

```bash
SYMBOL=ETH
BLOCK_EXPLORER=http://localhost:8545
IS_TESTNET=true
```

## Troubleshooting

### "Failed to initialize Puppeteer"
- Ensure Chrome is launched with `--remote-debugging-port=9222`
- Check that port 9222 is not blocked by firewall
- Verify CYPRESS_REMOTE_DEBUGGING_PORT environment variable is set

### Window Assignment Warnings
If you see "Could not find all required windows":
- Ensure MetaMask extension loaded properly
- Check browser console for extension errors
- Try increasing TIMEOUTS.MEDIUM if timing issue

### Network Switch Failures
- Verify network name matches exactly (case-sensitive)
- For custom networks, ensure all required fields provided
- Check MetaMask UI manually to confirm network availability

### Timeout Issues
If operations timeout frequently:
- Increase relevant timeout in `support/constants.js`
- Check system performance (CPU, memory)
- Try running tests with `--headed` to observe behavior
- Verify MetaMask version compatibility
