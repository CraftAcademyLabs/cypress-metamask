Cypress.Commands.add('initPuppeteer', () => {
  return cy.task('initPuppeteer');
});

Cypress.Commands.add('assignWindows', () => {
  return cy.task('assignWindows');
});

Cypress.Commands.add('confirmMetamaskWelcomePage', () => {
  return cy.task('confirmMetamaskWelcomePage');
});

Cypress.Commands.add(
  'importMetamaskWallet',
  (secretWords, password) => {
    return cy.task('importMetamaskWallet', { secretWords, password });
  },
);

Cypress.Commands.add(
  'importMetaMaskWalletUsingPrivateKey',
  (key) => {
    return cy.task('importMetaMaskWalletUsingPrivateKey', { key });
  },
);

Cypress.Commands.add('addMetamaskNetwork', network => {
  return cy.task('addMetamaskNetwork', network);
});

Cypress.Commands.add('changeMetamaskNetwork', network => {
  return cy.task('changeMetamaskNetwork', network);
});

Cypress.Commands.add('getMetamaskWalletAddress', () => {
  cy.task('getMetamaskWalletAddress').then(address => {
    return address;
  });
});

Cypress.Commands.add('switchToCypressWindow', () => {
  return cy.task('switchToCypressWindow');
});

Cypress.Commands.add('switchToMetamaskWindow', () => {
  return cy.task('switchToMetamaskWindow');
});

Cypress.Commands.add('acceptMetamaskAccess', () => {
  return cy.task('acceptMetamaskAccess');
});

Cypress.Commands.add('confirmMetamaskTransaction', () => {
  return cy.task('confirmMetamaskTransaction');
});

Cypress.Commands.add('signMetamaskMessage', () => {
  return cy.task('signMetamaskMessage');
});

Cypress.Commands.add('rejectMetamaskTransaction', () => {
  return cy.task('rejectMetamaskTransaction');
});

Cypress.Commands.add('switchToMetamaskNotification', () => {
  return cy.task('switchToMetamaskNotification');
});

Cypress.Commands.add('unlockMetamask', (password) => {
  return cy.task('unlockMetamask', password);
});

Cypress.Commands.add('fetchMetamaskWalletAddress', () => {
  cy.task('fetchMetamaskWalletAddress').then(address => {
    return address;
  });
});

Cypress.Commands.add(
  'setupMetamask',
  (secretWords, network, password) => {
    return cy.task('setupMetamask', { secretWords, network, password });
  },
);

Cypress.Commands.add('getNetwork', () => {
  return cy.task('getNetwork');
});

Cypress.Commands.add(
  'changeAccount',
  (number) => {
    return cy.task('changeAccount', { number })
  })

