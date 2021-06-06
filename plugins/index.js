/// <reference types="cypress" />
// import helpers from "../support/helpers";
require('dotenv').config()
const helpers = require('../support/helpers')
const puppeteer = require('../support/puppeteer');
const metamask = require('../support/metamask');
/**
 * @type {Cypress.PluginConfig}
 */
// eslint-disable-next-line no-unused-vars
module.exports = (on, config) => {
  on('before:browser:launch', async (browser = {}, arguments_) => {
    console.log('Loading MetaMask Extension')
    if (browser.name === 'chrome' && browser.isHeadless) {
      console.log('TRUE'); // required by cypress ¯\_(ツ)_/¯
      arguments_.args.push('--window-size=1920,1080');
      return arguments_;
    }

    if (browser.name === 'electron') {
      arguments_['width'] = 1920;
      arguments_['height'] = 1080;
      arguments_['resizable'] = false;
      return arguments_;
    }

    // metamask welcome screen blocks cypress from loading
    if (browser.name === 'chrome') {
      arguments_.args.push(
        // '--auto-open-devtools-for-tabs',
        '--remote-debugging-port=9222',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding',
      );
    }

    // NOTE: extensions cannot be loaded in headless Chrome
    const metamaskPath = await helpers.prepareMetamask(
      process.env.METAMASK_VERSION || '9.4.0',
    );
    arguments_.extensions.push(metamaskPath);
    return arguments_;
  });


  on('task', {
    error(message) {
      console.error('\u001B[31m', 'ERROR:', message, '\u001B[0m');
      return true;
    },
    warn(message) {
      console.warn('\u001B[33m', 'WARNING:', message, '\u001B[0m');
      return true;
    },
    async initPuppeteer() {
      const connected = await puppeteer.init();
      return connected;
    },
    async assignWindows() {
      const assigned = await puppeteer.assignWindows();
      return assigned;
    },
    async switchToCypressWindow() {
      const switched = await puppeteer.switchToCypressWindow();
      return switched;
    },
    async switchToMetamaskWindow() {
      const switched = await puppeteer.switchToMetamaskWindow();
      return switched;
    },
    async switchToMetamaskNotification() {
      const notificationPage = await puppeteer.switchToMetamaskNotification();
      return notificationPage;
    },
    async confirmMetamaskWelcomePage() {
      const confirmed = await metamask.confirmWelcomePage();
      return confirmed;
    },
    async unlockMetamask(password) {
      if (process.env.PASSWORD) {
        password = process.env.PASSWORD;
      }
      const unlocked = await metamask.unlock(password);
      return unlocked;
    },
    async importMetamaskWallet({ secretWords, password }) {
      if (process.env.SECRET_WORDS) {
        secretWords = process.env.SECRET_WORDS;
      }
      if (process.env.PASSWORD) {
        password = process.env.PASSWORD;
      }
      const imported = await metamask.importWallet(secretWords, password);
      return imported;
    },
    async importMetaMaskWalletUsingPrivateKey({ key }) {
      await puppeteer.switchToMetamaskWindow();
      const imported = await metamask.importMetaMaskWalletUsingPrivateKey(key);
      await puppeteer.switchToMetamaskWindow();
      return imported
    },
    
    async addMetamaskNetwork(network) {
      const networkAdded = await metamask.addNetwork(network);
      return networkAdded;
    },
    async changeMetamaskNetwork(network) {
      if (process.env.NETWORK_NAME) {
        network = process.env.NETWORK_NAME;
      } else {
        network = 'kovan';
      }
      const networkChanged = await metamask.changeNetwork(network);
      return networkChanged;
    },
    async acceptMetamaskAccess() {
      const accepted = await metamask.acceptAccess();
      return accepted;
    },
    async confirmMetamaskTransaction() {
      const confirmed = await metamask.confirmTransaction();
      return confirmed;
    },
    async rejectMetamaskTransaction() {
      const rejected = await metamask.rejectTransaction();
      return rejected;
    },
    async getMetamaskWalletAddress() {
      const walletAddress = await metamask.getWalletAddress();
      return walletAddress;
    },
    async fetchMetamaskWalletAddress() {
      return metamask.walletAddress();
    },
    async setupMetamask({ secretWords, network, password }) {
      if (puppeteer.metamaskWindow()) {
        await puppeteer.switchToCypressWindow();
        return true
      } else {
        if (process.env.NETWORK_NAME) {
          network = process.env.NETWORK_NAME;
        }
        if (process.env.SECRET_WORDS) {
          secretWords = process.env.SECRET_WORDS;
        }
        if (process.env.PASSWORD) {
          password = process.env.PASSWORD;
        }
        await metamask.initialSetup({ secretWords, network, password });
        return true;
      }
    },

    async changeAccount(number) {
      await puppeteer.switchToMetamaskWindow();
      await metamask.changeAccount(number);
      await puppeteer.switchToCypressWindow();
      return null
    },

    getNetwork() {
      const network = helpers.getNetwork();
      return network;
    },
    async addNetwork() {
      const network = metamask.addNetwork();
      return network;
    }
  });

  return config;
}
