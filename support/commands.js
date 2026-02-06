/**
 * Cypress commands for MetaMask automation
 * Commands are dynamically generated to avoid code duplication
 */

// Simple commands that just proxy to tasks with no parameters
const simpleCommands = [
  'initPuppeteer',
  'assignWindows',
  'confirmMetamaskWelcomePage',
  'switchToCypressWindow',
  'switchToMetamaskWindow',
  'acceptMetamaskAccess',
  'confirmMetamaskTransaction',
  'rejectMetamaskTransaction',
  'switchToMetamaskNotification',
  'getNetwork',
];

// Generate simple commands dynamically
simpleCommands.forEach(commandName => {
  Cypress.Commands.add(commandName, () => {
    return cy.task(commandName);
  });
});

// Commands with parameters
const parameterizedCommands = [
  { name: 'importMetamaskWallet', params: ['secretWords', 'password'] },
  { name: 'importMetaMaskWalletUsingPrivateKey', params: ['key'] },
  { name: 'addMetamaskNetwork', params: ['network'] },
  { name: 'changeMetamaskNetwork', params: ['network'] },
  { name: 'unlockMetamask', params: ['password'] },
  { name: 'setupMetamask', params: ['secretWords', 'network', 'password'] },
  { name: 'changeAccount', params: ['number'] },
];

// Generate parameterized commands dynamically
parameterizedCommands.forEach(({ name, params }) => {
  Cypress.Commands.add(name, (...args) => {
    // Map arguments to parameter object
    const paramObject = params.length === 1 && typeof args[0] === 'object' && !Array.isArray(args[0])
      ? args[0]
      : params.reduce((obj, param, index) => {
          obj[param] = args[index];
          return obj;
        }, {});
    
    return cy.task(name, paramObject);
  });
});

// Special commands that need custom logic
Cypress.Commands.add('getMetamaskWalletAddress', () => {
  cy.task('getMetamaskWalletAddress').then(address => {
    return address;
  });
});

Cypress.Commands.add('fetchMetamaskWalletAddress', () => {
  cy.task('fetchMetamaskWalletAddress').then(address => {
    return address;
  });
});


