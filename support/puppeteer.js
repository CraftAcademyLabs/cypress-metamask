const puppeteer = require('puppeteer-core');
const fetch = require('node-fetch');
const { TIMEOUTS } = require('./constants');

let puppeteerBrowser;
let mainWindow;
let metamaskWindow;

module.exports = {
  puppeteerBrowser() {
    return puppeteerBrowser;
  },
  mainWindow() {
    return mainWindow;
  },
  metamaskWindow() {
    return metamaskWindow;
  },
  /**
   * Initialize Puppeteer connection to Chrome debugging port
   * @returns {Promise<boolean>} True if connection successful
   * @throws {Error} If unable to connect to Chrome
   */
  async init() {
    try {
      const debuggerDetails = await fetch('http://localhost:9222/json/version'); //DevSkim: ignore DS137138
      const debuggerDetailsConfig = await debuggerDetails.json();
      const webSocketDebuggerUrl = debuggerDetailsConfig.webSocketDebuggerUrl;

      puppeteerBrowser = await puppeteer.connect({
        browserWSEndpoint: webSocketDebuggerUrl,
        ignoreHTTPSErrors: true,
        defaultViewport: null,
      });
      return puppeteerBrowser.isConnected();
    } catch (error) {
      throw new Error(`Failed to initialize Puppeteer: ${error.message}. Make sure Chrome is running with --remote-debugging-port=9222`);
    }
  },
  /**
   * Assign windows to mainWindow and metamaskWindow variables
   * Identifies windows by URL patterns (integration for main, extension for metamask)
   * @returns {Promise<boolean>} Always returns true; logs warning if windows not found
   * @note This function returns true even when windows aren't fully assigned to allow
   *       graceful degradation. Check console warnings if experiencing issues.
   */
  async assignWindows() {
    let pages = await puppeteerBrowser.pages();
    for (const page of pages) {
      if (page.url().includes('integration')) {
        mainWindow = page;
      } else if (page.url().includes('extension')) {
        metamaskWindow = page;
      }
    }
    
    if (!mainWindow || !metamaskWindow) {
      console.warn('Warning: Could not find all required windows. Main:', !!mainWindow, 'MetaMask:', !!metamaskWindow);
    }
    
    return true;
  },
  async getBrowser() {
    return {
      puppeteerBrowser,
    };
  },
  async getWindows() {
    return {
      mainWindow,
      metamaskWindow,
    };
  },
  
  /**
   * Switch focus to the Cypress test window
   * @returns {Promise<boolean>} True if successful
   */
  async switchToCypressWindow() {
    await mainWindow.bringToFront();
    return true;
  },
  
  /**
   * Switch focus to the MetaMask extension window
   * @returns {Promise<boolean>} True if successful
   */
  async switchToMetamaskWindow() {
    await metamaskWindow.bringToFront();
    return true;
  },
  
  /**
   * Switch to MetaMask notification popup window
   * @returns {Promise<Page|undefined>} The notification page if found
   */
  async switchToMetamaskNotification() {
    let pages = await puppeteerBrowser.pages();
    for (const page of pages) {
      if (page.url().includes('notification')) {
        await page.bringToFront();
        return page;
      }
    }
  },
  
  /**
   * Wait for an element to be visible and ready
   * @param {string} selector - CSS selector for the element
   * @param {Page} page - Puppeteer page object (defaults to metamaskWindow)
   */
  async waitFor(selector, page = metamaskWindow) {
    await page.waitForFunction(
      `document.querySelector('${selector}') && document.querySelector('${selector}').clientHeight != 0`,
      { visible: true },
    );
    // puppeteer going too fast breaks metamask in corner cases
    await page.waitForTimeout(TIMEOUTS.ELEMENT_WAIT);
  },

  /**
   * Change to a specific account in MetaMask
   * @param {number} number - Account number to switch to
   * @param {Page} page - Puppeteer page object (defaults to metamaskWindow)
   */
  async changeAccount(number, page = metamaskWindow) {
    await page.evaluate(
      ({ number }) => {
        const selector = document.querySelector('.account-menu__accounts').children[number.number - 1]
        selector.click()
      },
      { number }
    )
  },

  /**
   * Wait for an element and click it
   * @param {string} selector - CSS selector for the element
   * @param {Page} page - Puppeteer page object (defaults to metamaskWindow)
   */
  async waitAndClick(selector, page = metamaskWindow) {
    await module.exports.waitFor(selector, page);
    await page.evaluate(
      selector => document.querySelector(selector).click(),
      selector,
    );
  },

  /**
   * Wait for an element and click it by matching text content
   * @param {string} selector - CSS selector for the elements to search
   * @param {string} elementText - Text content to match
   * @param {Page} page - Puppeteer page object (defaults to metamaskWindow)
   */
  async waitAndClickByText(selector, elementText, page = metamaskWindow) {
    await module.exports.waitFor(selector, page);
    await page.evaluate(
      ({ elementText, selector }) => {
        const selectors = document.querySelectorAll(selector);
        const importNode = Array.from(selectors).find(
          (selector) => selector.innerText === elementText
        );
        importNode.click();
      },
      { elementText, selector }
    );
  },

  async waitAndType(selector, value, page = metamaskWindow) {
    await module.exports.waitFor(selector, page);
    const element = await page.$(selector);
    await element.type(value);
  },
  async waitAndGetValue(selector, page = metamaskWindow) {
    await module.exports.waitFor(selector, page);
    const element = await page.$(selector);
    const property = await element.getProperty('value');
    const value = await property.jsonValue();
    return value;
  },
  async waitAndSetValue(text, selector, page = metamaskWindow) {
    await module.exports.waitFor(selector, page);
    await page.evaluate(
      selector => (document.querySelector(selector).value = ''),
      selector,
    );
    await page.focus(selector);
    await page.keyboard.type(text);
  },
  async waitForText(selector, text, page = metamaskWindow) {
    await module.exports.waitFor(selector, page);
    await page.waitForFunction(
      `document.querySelector('${selector}').innerText.toLowerCase().includes('${text}')`,
    );
  },
};