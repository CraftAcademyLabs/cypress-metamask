# Cypress MetaMask

A Cypress plugin for automated testing of Web3 applications with MetaMask wallet integration. This plugin allows you to programmatically control MetaMask during your end-to-end tests, making it easy to test dApp interactions, transactions, and wallet flows.

This plugin is based on the solutions brought by [Jakub Mucha - drptbl](https://github.com/drptbl) in [Synpress](https://github.com/Synthetixio/synpress), but with a more stripped down and (this is opinionated) simpler approach. The goal is to build a fairly straight forward solution that you can integrate into your own testing (end-to-end) flow.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- 🔐 **Wallet Management**: Import wallets, switch accounts, lock/unlock MetaMask
- 🌐 **Network Control**: Switch networks, add custom networks
- ✍️ **Transaction Handling**: Confirm/reject transactions programmatically
- 🔏 **Signature Support**: Handle signature requests including EIP-712 v4 typed data
- 🎯 **Easy Setup**: Simple configuration and straightforward API
- 📝 **TypeScript Support**: Fully typed commands for better developer experience

## Table of Contents

- [Installation](#installation)
- [Setup](#setup)
- [Configuration](#configuration)
- [Usage](#usage)
- [Available Commands](#available-commands)
- [Examples](#examples)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

## Installation

Install the package using npm or yarn:

```bash
npm install --save-dev cypress-metamask
```

or

```bash
yarn add -D cypress-metamask
```

## Setup

### 1. Import the Plugin

In your `cypress/support/index.js` (or `cypress/support/e2e.js` for Cypress 10+):

```javascript
import 'cypress-metamask'
```

### 2. Configure Plugin

In your `cypress/plugins/index.js`:

```javascript
module.exports = (on, config) => {
  require('cypress-metamask/plugins')(on)
}
```

### 3. Update Cypress Scripts

Add the remote debugging port to your Cypress scripts in `package.json`:

```json
{
  "scripts": {
    "cy:open": "CYPRESS_REMOTE_DEBUGGING_PORT=9222 cypress open",
    "cy:run": "CYPRESS_REMOTE_DEBUGGING_PORT=9222 cypress run --headed --browser chrome"
  }
}
```

**Note:** MetaMask cannot be loaded in headless Chrome, so tests must run in headed mode.

## Configuration

Create a `.env` file in your project root with the following variables:

```bash
# Required
SECRET_WORDS="test test test test test test test test test test test junk"
PASSWORD=YourSecurePassword
METAMASK_VERSION=latest

# Network Configuration (example for Hardhat local chain)
NETWORK_NAME=localhost
RPC_URL=http://127.0.0.1:8545/
CHAIN_ID=1337

# Optional
SYMBOL=ETH
BLOCK_EXPLORER=http://localhost:8545
IS_TESTNET=true
```

### Network Options

You can configure MetaMask to connect to various networks:

- **Predefined Networks**: `mainnet`, `ropsten`, `kovan`, `rinkeby`, `goerli`, `localhost`
- **Custom Networks**: Pass a network configuration object (see examples below)

## Usage

### Basic Test Example

```javascript
describe('MetaMask Integration', () => {
  before(() => {
    // Setup MetaMask with default configuration from .env
    cy.setupMetamask()
  })

  it('should connect to dApp', () => {
    cy.visit('http://localhost:3000')
    
    // Click your dApp's "Connect Wallet" button
    cy.get('#connectButton').click()
    
    // Accept MetaMask connection request
    cy.acceptMetamaskAccess()
    
    // Verify connection
    cy.get('#walletAddress').should('be.visible')
  })

  it('should confirm transaction', () => {
    // Trigger a transaction in your dApp
    cy.get('#sendButton').click()
    
    // Confirm the transaction in MetaMask
    cy.confirmMetamaskTransaction()
    
    // Verify transaction success
    cy.get('#transactionStatus').should('contain', 'Success')
  })
})
```

## Available Commands

### Wallet Setup & Management

#### `cy.setupMetamask(secretWords?, network?, password?)`
Initialize MetaMask with a wallet. Uses environment variables if parameters are not provided.

```javascript
cy.setupMetamask()
// or with custom values
cy.setupMetamask('word1 word2 ...', 'localhost', 'password123')
```

#### `cy.importMetamaskWallet(secretWords, password)`
Import a wallet using seed phrase.

```javascript
cy.importMetamaskWallet('test test test...', 'MyPassword123')
```

#### `cy.importMetaMaskWalletUsingPrivateKey(privateKey)`
Import a wallet using a private key.

```javascript
cy.importMetaMaskWalletUsingPrivateKey('0x1234...')
```

#### `cy.lockMetamask()`
Lock the MetaMask wallet.

```javascript
cy.lockMetamask()
```

#### `cy.unlockMetamask(password)`
Unlock MetaMask with password.

```javascript
cy.unlockMetamask('MyPassword123')
```

#### `cy.getMetamaskWalletAddress()`
Get the current wallet address.

```javascript
cy.getMetamaskWalletAddress().then(address => {
  console.log('Wallet address:', address)
})
```

### Account Management

#### `cy.changeAccount(accountNumber)`
Switch to a different account (1-indexed).

```javascript
cy.changeAccount(2) // Switch to second account
```

### Network Management

#### `cy.changeMetamaskNetwork(network)`
Switch to a different network.

```javascript
// Predefined networks
cy.changeMetamaskNetwork('mainnet')
cy.changeMetamaskNetwork('localhost')

// Custom network
cy.changeMetamaskNetwork({
  networkName: 'Polygon Mumbai',
  rpcUrl: 'https://rpc-mumbai.maticvigil.com',
  chainId: '80001',
  symbol: 'MATIC',
  blockExplorer: 'https://mumbai.polygonscan.com',
  isTestnet: true
})
```

#### `cy.addMetamaskNetwork(network)`
Add a custom network to MetaMask.

```javascript
cy.addMetamaskNetwork({
  networkName: 'Arbitrum One',
  rpcUrl: 'https://arb1.arbitrum.io/rpc',
  chainId: '42161',
  symbol: 'ETH',
  blockExplorer: 'https://arbiscan.io'
})
```

#### `cy.getNetwork()`
Get current network information.

```javascript
cy.getNetwork().then(network => {
  console.log('Current network:', network.networkName)
})
```

### Transaction & Signature Management

#### `cy.acceptMetamaskAccess()`
Accept a connection request from a dApp.

```javascript
cy.acceptMetamaskAccess()
```

#### `cy.confirmMetamaskTransaction()`
Confirm a pending transaction.

```javascript
cy.confirmMetamaskTransaction()
```

#### `cy.rejectMetamaskTransaction()`
Reject a pending transaction.

```javascript
cy.rejectMetamaskTransaction()
```

#### `cy.confirmMetamaskTypedV4SignatureRequest()`
Confirm an EIP-712 v4 typed data signature request.

```javascript
cy.confirmMetamaskTypedV4SignatureRequest()
```

#### `cy.rejectMetamaskTypedV4SignatureRequest()`
Reject an EIP-712 v4 typed data signature request.

```javascript
cy.rejectMetamaskTypedV4SignatureRequest()
```

### Window Management

#### `cy.switchToCypressWindow()`
Switch focus back to the Cypress test window.

```javascript
cy.switchToCypressWindow()
```

#### `cy.switchToMetamaskWindow()`
Switch focus to the MetaMask extension window.

```javascript
cy.switchToMetamaskWindow()
```

#### `cy.switchToMetamaskNotification()`
Switch to MetaMask notification popup.

```javascript
cy.switchToMetamaskNotification()
```

## Examples

### Complete Workflow Example

```javascript
describe('dApp E2E Testing', () => {
  before(() => {
    // Setup MetaMask
    cy.setupMetamask()
    cy.changeMetamaskNetwork('localhost')
  })

  it('should complete a full transaction flow', () => {
    // Visit your dApp
    cy.visit('http://localhost:3000')
    
    // Connect wallet
    cy.get('#connectWallet').click()
    cy.acceptMetamaskAccess()
    
    // Verify connection
    cy.get('#userAddress').should('exist')
    
    // Trigger a transaction
    cy.get('#transferTokens').click()
    cy.get('#amount').type('1.0')
    cy.get('#recipient').type('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb')
    cy.get('#send').click()
    
    // Confirm in MetaMask
    cy.confirmMetamaskTransaction()
    
    // Wait for transaction to complete
    cy.get('#txStatus').should('contain', 'Transaction confirmed')
  })

  it('should sign typed data', () => {
    cy.visit('http://localhost:3000')
    
    // Trigger EIP-712 signature request
    cy.get('#signTypedData').click()
    
    // Confirm signature in MetaMask
    cy.confirmMetamaskTypedV4SignatureRequest()
    
    // Verify signature was received
    cy.get('#signatureResult').should('exist')
  })
})
```

### Testing Multiple Accounts

```javascript
describe('Multi-Account Testing', () => {
  before(() => {
    cy.setupMetamask()
  })

  it('should work with different accounts', () => {
    cy.visit('http://localhost:3000')
    
    // Connect with first account
    cy.get('#connect').click()
    cy.acceptMetamaskAccess()
    
    // Get first account address
    cy.getMetamaskWalletAddress().then(address1 => {
      cy.get('#address').should('contain', address1)
    })
    
    // Switch to second account
    cy.changeAccount(2)
    
    // Reconnect with second account
    cy.get('#connect').click()
    cy.acceptMetamaskAccess()
    
    // Verify different address is displayed
    cy.getMetamaskWalletAddress().then(address2 => {
      cy.get('#address').should('contain', address2)
    })
  })
})
```

### Testing with Different Networks

```javascript
describe('Multi-Network Testing', () => {
  beforeEach(() => {
    cy.setupMetamask()
  })

  it('should work on localhost', () => {
    cy.changeMetamaskNetwork('localhost')
    cy.visit('http://localhost:3000')
    // ... test your dApp
  })

  it('should work on custom network', () => {
    cy.addMetamaskNetwork({
      networkName: 'Custom Testnet',
      rpcUrl: 'https://rpc.testnet.example.com',
      chainId: '12345',
      symbol: 'TEST'
    })
    cy.changeMetamaskNetwork('Custom Testnet')
    cy.visit('http://localhost:3000')
    // ... test your dApp
  })
})
```

## Troubleshooting

### Common Issues

#### MetaMask Extension Not Loading

Ensure Chrome is launched with the remote debugging port:

```bash
CYPRESS_REMOTE_DEBUGGING_PORT=9222 cypress open
```

#### Cannot Find MetaMask Window

The plugin needs time to initialize. Make sure `cy.setupMetamask()` completes before other commands:

```javascript
before(() => {
  cy.setupMetamask()
})
```

#### Transaction Timeouts

If transactions are timing out, you may need to adjust network conditions or gas settings in your local blockchain (e.g., Hardhat, Ganache).

#### Tests Failing Intermittently

MetaMask UI can be slow to respond. The plugin includes built-in waits, but you may need to add additional wait times for your specific use case.

### Debug Mode

To see more detailed logs, check the Cypress console output. MetaMask plugin operations are logged for debugging purposes.

## Browser Support

Currently, this plugin only supports **Chrome/Chromium** browsers because:
- MetaMask extension installation requires Chromium-based browsers
- Remote debugging protocol is most stable on Chrome

**Note:** Tests must run in **headed mode** (not headless) as MetaMask extension cannot be loaded in headless Chrome.

## Requirements

- Node.js >= 12.x
- Cypress >= 7.x
- Chrome/Chromium browser
- MetaMask extension (automatically downloaded by the plugin)

## Architecture

This plugin uses:
- **Puppeteer** for browser automation and MetaMask interaction
- **Cypress Tasks** for communication between test code and MetaMask
- **Page Object Pattern** for maintainable selectors

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Run example tests: `npm run cy:open`

## Credits

This plugin is based on the solutions brought by [Jakub Mucha - drptbl](https://github.com/drptbl) in [Synpress](https://github.com/Synthetixio/synpress), but with a more stripped down and (this is opinionated) simpler approach. The goal is to build a fairly straight forward solution that you can integrate into your own testing (end-to-end) flow.

Special thanks to the Synpress project for pioneering MetaMask automation in Cypress and providing the foundation for this work.

## License

[MIT](LICENSE.md) © 2026 Craft Academy Labs

## Support

If you encounter issues or have questions:
- Check the [Troubleshooting](#troubleshooting) section
- Open an issue on [GitHub](https://github.com/CraftAcademyLabs/cypress-metamask/issues)
- Review existing issues for solutions

---

**Happy Testing! 🧪**