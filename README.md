# Cypress MetaMask

Interacting with you MetaMask made "easy". (Depending on how you define "easy" of course...)

This plugin is based on the solutions brought by [Jakub Mucha - drptbl](https://github.com/drptbl) in [Synpress](https://github.com/Synthetixio/synpress), but with a more stripped down and (this is opinionated) simpler approach. The goal is to build a fairly straight forward solution that you can integrate into your own testing (end-to-end) flow.

### Setup

**Note:** This plugin is in development mode. You might encounter bugs and you will have to tweak your implementation a bit before you get it to work. But it is worth your effort in my opinon. Being able to run automated tests of your application is a good thing. ;-)

Install the package using `yarn` or `npm`:

```bash
$ yarn add -D cypress-metamask
// or 
$ npm i -D cypress-metamask
```

Import the plugin in `cypress/support/index.js` 

```js
// Import commands.js using ES2015 syntax:
import './commands'
import 'cypress-metamask'
```

Modify your `cypress/plugins/index.js` to include the plugin:

```js
module.exports = (on, config) => {
  require('cypress-metamask/plugins')(on)
}
```

Add an `.env` file to your project root:

**These settings are for a [Hardhat](https://hardhat.org/) development environment**. You will need to tweak those setting depending on the enviroment you use.

```
SECRET_WORDS="test test test test test test test test test test test junk"
PASSWORD=TestMetaMask
METAMASK_VERSION=latest 
NETWORK_NAME=localhost 
RPC_URL=http://127.0.0.1:8545/ 
CHAIN_ID=1337
```

Add these scripts to your `package.json` (or modify your existing scripts): 

```json
"cy:open": "CYPRESS_REMOTE_DEBUGGING_PORT=9222 cypress open"
```

**You should be ready to go.** 

## Example

There is a small html/javascript (src/index.html) example that requires you to run a local chain to work. It uses the connected wallet to display its address and balance. 

Once you have configured your setup and if you spin up a local chain, start a server and run your tests, you should be able to have the test pass.

Step-by-step

1. Start your local chain
2. Start a local web server (`yarn start`) and navitate to `http://localhost:3473`
3. Run Cypress (`yarn cy:open`) 

```js
describe('User can load page', () => {
  before(() => {
    cy.setupMetamask();
    cy.changeMetamaskNetwork('localhost')
    cy.visit('/')
  });
  it('is expected to display a sussess message', () => {
    cy.get('[data-cy=title]').should('contain.text', 'MetaMask Detected')
  });
  
  it('is expected to display the local wallet address', () => {
    cy.get('[data-cy=address').should('contain.text', 'Your address is: 0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266')
  });
  
  it('is expected to display the local wallet  balance', () => {
    cy.get('[data-cy=balance').should('contain.text', 'Balance: 10000000000000000000000')
  });
})
```



