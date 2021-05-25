const puppeteer = require('puppeteer-core');
const fetch = require('node-fetch');

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
  async init() {
    const debuggerDetails = await fetch('http://localhost:9222/json/version'); //DevSkim: ignore DS137138
    const debuggerDetailsConfig = await debuggerDetails.json();
    const webSocketDebuggerUrl = debuggerDetailsConfig.webSocketDebuggerUrl;

    puppeteerBrowser = await puppeteer.connect({
      browserWSEndpoint: webSocketDebuggerUrl,
      ignoreHTTPSErrors: true,
      defaultViewport: null,
    });
    return puppeteerBrowser.isConnected();
  },
  async assignWindows() {
    let pages = await puppeteerBrowser.pages();
    for (const page of pages) {
      if (page.url().includes('integration')) {
        mainWindow = page;
      } else if (page.url().includes('extension')) {
        metamaskWindow = page;
      }
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
  async switchToCypressWindow() {
    await mainWindow.bringToFront();
    return true;
  },
  async switchToMetamaskWindow() {
    await metamaskWindow.bringToFront();
    return true;
  },
  async switchToMetamaskNotification() {
    let pages = await puppeteerBrowser.pages();
    for (const page of pages) {
      if (page.url().includes('notification')) {
        await page.bringToFront();
        return page;
      }
    }
  },
  async waitFor(selector, page = metamaskWindow) {
    await page.waitForFunction(
      `document.querySelector('${selector}') && document.querySelector('${selector}').clientHeight != 0`,
      { visible: true },
    );
    // puppeteer going too fast breaks metamask in corner cases
    await page.waitForTimeout(300);
  },

  async changeAccount(number, page = metamaskWindow) {
    await page.evaluate(
      ({ number }) => {
        const selector = document.querySelector('.account-menu__accounts').children[number.number - 1]
        selector.click()
      },
      { number }
    )
  },

  async waitAndClick(selector, page = metamaskWindow) {
    await module.exports.waitFor(selector, page);
    await page.evaluate(
      selector => document.querySelector(selector).click(),
      selector,
    );
  },

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