const puppeteer = require('./puppeteer');
const { TIMEOUTS, getNetworkConfig } = require('./constants');

const { pageElements } = require('../pages/metamask/page');
const {
  welcomePageElements,
  firstTimeFlowPageElements,
  metametricsPageElements,
  firstTimeFlowFormPageElements,
  endOfFlowPageElements,
} = require('../pages/metamask/first-time-flow-page');
const { mainPageElements } = require('../pages/metamask/main-page');
const { unlockPageElements } = require('../pages/metamask/unlock-page');
const {
  notificationPageElements,
  permissionsPageElements,
  confirmPageElements,
} = require('../pages/metamask/notification-page');
const { setNetwork, getNetwork } = require('./helpers');

let walletAddress;

module.exports = {
  /**
   * Get the current wallet address
   * @returns {string} The wallet address
   */
  walletAddress: () => {
    return walletAddress;
  },
  
  /**
   * Workaround for MetaMask random blank page on first run
   * Attempts to reload the page up to 5 times if the welcome page doesn't appear
   */
  async fixBlankPage() {
    await puppeteer.metamaskWindow().waitForTimeout(TIMEOUTS.MEDIUM);
    for (let times = 0; times < 5; times++) {
      if (
        (await puppeteer.metamaskWindow().$(welcomePageElements.app)) === null
      ) {
        await puppeteer.metamaskWindow().reload();
        await puppeteer.metamaskWindow().waitForTimeout(TIMEOUTS.LONG);
      } else {
        break;
      }
    }
  },
  
  /**
   * Switch to a different MetaMask account
   * @param {number} number - Account number (1-indexed)
   */
  async changeAccount(number) {
    await puppeteer.waitAndClick(mainPageElements.accountMenu.button)
    await puppeteer.changeAccount(number)
  },

  /**
   * Import a MetaMask account using a private key
   * @param {string} key - The private key to import
   * @returns {Promise<boolean>} True if successful
   */
  async importMetaMaskWalletUsingPrivateKey(key) {
    await puppeteer.waitAndClick(mainPageElements.accountMenu.button);
    await puppeteer.waitAndClickByText('.account-menu__item__text', 'Import Account');
    await puppeteer.waitAndType('#private-key-box', key);
    await puppeteer.metamaskWindow().waitForTimeout(TIMEOUTS.SHORT);
    await puppeteer.waitAndClickByText(mainPageElements.accountMenu.importButton, 'Import');
    await puppeteer.metamaskWindow().waitForTimeout(TIMEOUTS.LONG);
    return true;
},

  /**
   * Confirm the MetaMask welcome page
   * @returns {Promise<boolean>} True if successful
   */
  async confirmWelcomePage() {
    await module.exports.fixBlankPage();
    await puppeteer.waitAndClick(welcomePageElements.confirmButton);
    return true;
  },
  
  /**
   * Lock MetaMask wallet
   * @returns {Promise<boolean>} True if successful
   */
  async lock() {
    await module.exports.fixBlankPage();
    await puppeteer.waitAndClick(mainPageElements.accountMenu.button);
    await puppeteer.waitAndClick(mainPageElements.accountMenu.lockButton);
    return true;
  },

  /**
   * Unlock MetaMask with a password
   * @param {string} password - The password to unlock MetaMask
   * @returns {Promise<boolean>} True if successful
   */
  async unlock(password) {
    await module.exports.fixBlankPage();
    await puppeteer.waitAndType(unlockPageElements.passwordInput, password);
    await puppeteer.waitAndClick(unlockPageElements.unlockButton);
    return true;
  },
  /**
   * Import wallet using secret words (seed phrase)
   * @param {string} secretWords - Space-separated seed phrase
   * @param {string} password - Password for the wallet
   * @returns {Promise<boolean>} True if successful
   */
  async importWallet(secretWords, password) {
    const words = secretWords.split(' ');
    await puppeteer.waitAndClick(firstTimeFlowPageElements.importWalletButton);
    await puppeteer.waitAndClick(metametricsPageElements.optOutAnalyticsButton);
    
    // For newer MetaMask versions, seed phrase is split into individual word inputs
    for (const [index, word] of words.entries()) {
      const selector = firstTimeFlowFormPageElements.secretWordsInput.replace('%', index);
      await puppeteer.waitAndType(selector, word);
    }
    
    await puppeteer.waitAndType(
      firstTimeFlowFormPageElements.passwordInput,
      password,
    );
    await puppeteer.waitAndType(
      firstTimeFlowFormPageElements.confirmPasswordInput,
      password,
    );
    await puppeteer.waitAndClick(firstTimeFlowFormPageElements.termsCheckbox);
    await puppeteer.waitAndClick(firstTimeFlowFormPageElements.importButton);

    await puppeteer.waitFor(pageElements.loadingSpinner);
    await puppeteer.waitAndClick(endOfFlowPageElements.allDoneButton);
    await puppeteer.waitFor(mainPageElements.walletOverview);

    // close popup if present
    if (
      (await puppeteer.metamaskWindow().$(mainPageElements.popup.container)) !==
      null
    ) {
      await puppeteer.waitAndClick(mainPageElements.popup.closeButton);
    }
    return true;
  },



  async changeNetwork(network) {
    setNetwork(network);
    const networkConfig = getNetworkConfig(network);
    
    await puppeteer.waitAndClick(mainPageElements.networkSwitcher.button);
    
    // If it's a built-in network with an index, click by index
    if (networkConfig.index !== null && networkConfig.index !== undefined) {
      await puppeteer.waitAndClick(
        mainPageElements.networkSwitcher.networkButton(networkConfig.index),
      );
    } else {
      // For custom networks, click by name
      await puppeteer.waitAndClickByText(
        mainPageElements.networkSwitcher.dropdownMenuItem,
        networkConfig.networkName,
      );
    }

    // Wait for network name to appear
    await puppeteer.waitForText(
      mainPageElements.networkSwitcher.networkName,
      networkConfig.networkName,
    );

    return true;
  },
  async addNetwork(network) {
    if (
      process.env.NETWORK_NAME &&
      process.env.RPC_URL &&
      process.env.CHAIN_ID
    ) {
      network = {
        networkName: process.env.NETWORK_NAME,
        rpcUrl: process.env.RPC_URL,
        chainId: process.env.CHAIN_ID,
        symbol: process.env.SYMBOL,
        blockExplorer: process.env.BLOCK_EXPLORER,
        isTestnet: process.env.IS_TESTNET,
      };
    }
    await puppeteer.waitAndClick(mainPageElements.accountMenu.button);
    await puppeteer.waitAndClick(mainPageElements.accountMenu.settingsButton);
    await puppeteer.waitAndClick(mainPageElements.settingsPage.networksButton);
    await puppeteer.waitAndClick(
      mainPageElements.networksPage.addNetworkButton,
    );
    await puppeteer.waitAndType(
      mainPageElements.addNetworkPage.networkNameInput,
      network.networkName,
    );
    await puppeteer.waitAndType(
      mainPageElements.addNetworkPage.rpcUrlInput,
      network.rpcUrl,
    );
    await puppeteer.waitAndType(
      mainPageElements.addNetworkPage.chainIdInput,
      network.chainId,
    );

    if (network.symbol) {
      await puppeteer.waitAndType(
        mainPageElements.addNetworkPage.symbolInput,
        network.symbol,
      );
    }

    if (network.blockExplorer) {
      await puppeteer.waitAndType(
        mainPageElements.addNetworkPage.blockExplorerInput,
        network.blockExplorer,
      );
    }
    await puppeteer.waitAndClick(mainPageElements.addNetworkPage.saveButton);
    await puppeteer.waitAndClick(mainPageElements.networksPage.closeButton);
    await puppeteer.waitForText(
      mainPageElements.networkSwitcher.networkName,
      network.networkName,
    );
    return true;
  },
  async acceptAccess() {
    await puppeteer.metamaskWindow().waitForTimeout(TIMEOUTS.EXTRA_LONG);
    const notificationPage = await puppeteer.switchToMetamaskNotification();
    await puppeteer.waitAndClick(
      notificationPageElements.nextButton,
      notificationPage,
    );
    await puppeteer.waitAndClick(
      permissionsPageElements.connectButton,
      notificationPage,
    );
    await puppeteer.metamaskWindow().waitForTimeout(TIMEOUTS.EXTRA_LONG);
    return true;
  },
  async confirmTransaction() {
    const isKovanTestnet = getNetwork().networkName === 'kovan';
    await puppeteer.metamaskWindow().waitForTimeout(TIMEOUTS.EXTRA_LONG);
    const notificationPage = await puppeteer.switchToMetamaskNotification();
    const currentGasFee = await puppeteer.waitAndGetValue(
      confirmPageElements.gasFeeInput,
      notificationPage,
    );
    const newGasFee = isKovanTestnet
      ? '1'
      : (Number(currentGasFee) + 10).toString();
    await puppeteer.waitAndSetValue(
      newGasFee,
      confirmPageElements.gasFeeInput,
      notificationPage,
    );
    // metamask reloads popup after changing a fee, you have to wait for this event otherwise transaction will fail
    await puppeteer.metamaskWindow().waitForTimeout(TIMEOUTS.EXTRA_LONG);
    await puppeteer.waitAndClick(
      confirmPageElements.confirmButton,
      notificationPage,
    );
    await puppeteer.metamaskWindow().waitForTimeout(TIMEOUTS.EXTRA_LONG);
    return true;
  },
  async rejectTransaction() {
    await puppeteer.metamaskWindow().waitForTimeout(TIMEOUTS.EXTRA_LONG);
    const notificationPage = await puppeteer.switchToMetamaskNotification();
    await puppeteer.waitAndClick(
      confirmPageElements.rejectButton,
      notificationPage,
    );
    await puppeteer.metamaskWindow().waitForTimeout(TIMEOUTS.EXTRA_LONG);
    return true;
  },
  
  /**
   * Confirm EIP-712 V4 typed signature request
   * @returns {Promise<boolean>} True if successful
   */
  async confirmTypedV4SignatureRequest() {
    const { signaturePageElements } = require('../pages/metamask/notification-page');
    await puppeteer.metamaskWindow().waitForTimeout(TIMEOUTS.EXTRA_LONG);
    const notificationPage = await puppeteer.switchToMetamaskNotification();
    await puppeteer.waitAndClick(
      signaturePageElements.confirmTypedV4SignatureRequestButton,
      notificationPage,
    );
    await puppeteer.metamaskWindow().waitForTimeout(TIMEOUTS.EXTRA_LONG);
    return true;
  },
  
  /**
   * Reject EIP-712 V4 typed signature request
   * @returns {Promise<boolean>} True if successful
   */
  async rejectTypedV4SignatureRequest() {
    const { signaturePageElements } = require('../pages/metamask/notification-page');
    await puppeteer.metamaskWindow().waitForTimeout(TIMEOUTS.EXTRA_LONG);
    const notificationPage = await puppeteer.switchToMetamaskNotification();
    await puppeteer.waitAndClick(
      signaturePageElements.rejectTypedV4SignatureRequestButton,
      notificationPage,
    );
    await puppeteer.metamaskWindow().waitForTimeout(TIMEOUTS.EXTRA_LONG);
    return true;
  },
  
  async getWalletAddress() {
    await puppeteer.waitAndClick(mainPageElements.options.button);
    await puppeteer.waitAndClick(mainPageElements.options.accountDetailsButton);
    walletAddress = await puppeteer.waitAndGetValue(
      mainPageElements.accountModal.walletAddressInput,
    );
    await puppeteer.waitAndClick(mainPageElements.accountModal.closeButton);
    return walletAddress;
  },
  async initialSetup({ secretWords, network, password }) {
    const isCustomNetwork =
      process.env.NETWORK_NAME && process.env.RPC_URL && process.env.CHAIN_ID;

    await puppeteer.init();
    await puppeteer.assignWindows();
    await puppeteer.metamaskWindow().waitForTimeout(TIMEOUTS.MEDIUM);
    await puppeteer.metamaskWindow().bringToFront()
    if (
      (await puppeteer.metamaskWindow().$(unlockPageElements.unlockPage)) ===
      null
    ) {
      // Check if wallet is already set up (prevents duplicate setup errors)
      if ((await puppeteer.metamaskWindow().$(mainPageElements.walletOverview)) !== null) {
        await puppeteer.switchToCypressWindow();
        return true;
      }
      
      await module.exports.confirmWelcomePage();
      await module.exports.importWallet(secretWords, password);
      if (isCustomNetwork) {
        await module.exports.addNetwork(network);
      } else {
        await module.exports.changeNetwork(network);
      }
      walletAddress = await module.exports.getWalletAddress();
      await puppeteer.switchToCypressWindow();
      return true;
    } else {
      await module.exports.unlock(password);
      walletAddress = await module.exports.getWalletAddress();
      await puppeteer.switchToCypressWindow();
      return true;
    }
  },
};