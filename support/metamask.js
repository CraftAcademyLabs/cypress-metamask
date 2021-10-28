const puppeteer = require('./puppeteer');

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
  walletAddress: () => {
    return walletAddress;
  },
  // workaround for metamask random blank page on first run
  async fixBlankPage() {
    await puppeteer.metamaskWindow().waitForTimeout(1000);
    for (let times = 0; times < 5; times++) {
      if (
        (await puppeteer.metamaskWindow().$(welcomePageElements.app)) === null
      ) {
        await puppeteer.metamaskWindow().reload();
        await puppeteer.metamaskWindow().waitForTimeout(2000);
      } else {
        break;
      }
    }
  },
  async changeAccount(number) {
    await puppeteer.waitAndClick(mainPageElements.accountMenu.button)
    await puppeteer.changeAccount(number)
  },

  async importMetaMaskWalletUsingPrivateKey(key) {
    await puppeteer.waitAndClick(mainPageElements.accountMenu.button);
    await puppeteer.waitAndClickByText('.account-menu__item__text', 'Import Account');
    await puppeteer.waitAndType('#private-key-box', key);
    await puppeteer.metamaskWindow().waitForTimeout(500);
    await puppeteer.waitAndClickByText(mainPageElements.accountMenu.importButton, 'Import');
    await puppeteer.metamaskWindow().waitForTimeout(2000);
    return true;
},

  async confirmWelcomePage() {
    await module.exports.fixBlankPage();
    await puppeteer.waitAndClick(welcomePageElements.confirmButton);
    return true;
  },

  async unlock(password) {
    await module.exports.fixBlankPage();
    await puppeteer.waitAndType(unlockPageElements.passwordInput, password);
    await puppeteer.waitAndClick(unlockPageElements.unlockButton);
    return true;
  },
  async importWallet(secretWords, password) {
    await puppeteer.waitAndClick(firstTimeFlowPageElements.importWalletButton);
    await puppeteer.waitAndClick(metametricsPageElements.optOutAnalyticsButton);
    await puppeteer.waitAndType(
      firstTimeFlowFormPageElements.secretWordsInput,
      secretWords,
    );
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
    await puppeteer.waitAndClick(mainPageElements.networkSwitcher.button);
    if (network === 'main' || network === 'mainnet') {
      await puppeteer.waitAndClick(
        mainPageElements.networkSwitcher.networkButton(0),
      );
    } else if (network === 'ropsten') {
      await puppeteer.waitAndClick(
        mainPageElements.networkSwitcher.networkButton(1),
      );
    } else if (network === 'kovan') {
      await puppeteer.waitAndClick(
        mainPageElements.networkSwitcher.networkButton(2),
      );
    } else if (network === 'rinkeby') {
      await puppeteer.waitAndClick(
        mainPageElements.networkSwitcher.networkButton(3),
      );
    } else if (network === 'goerli') {
      await puppeteer.waitAndClick(
        mainPageElements.networkSwitcher.networkButton(4),
      );
    } else if (network === 'localhost') {
      await puppeteer.waitAndClick(
        mainPageElements.networkSwitcher.networkButton(5),
      );
    } else if (typeof network === 'object') {
      await puppeteer.waitAndClickByText(
        mainPageElements.networkSwitcher.dropdownMenuItem,
        network.networkName,
      );
    } else {
      await puppeteer.waitAndClickByText(
        mainPageElements.networkSwitcher.dropdownMenuItem,
        network,
      );
    }

    if (typeof network === 'object') {
      await puppeteer.waitForText(
        mainPageElements.networkSwitcher.networkName,
        network.networkName,
      );
    } else {
      await puppeteer.waitForText(
        mainPageElements.networkSwitcher.networkName,
        network,
      );
    }

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
    await puppeteer.metamaskWindow().waitForTimeout(3000);
    const notificationPage = await puppeteer.switchToMetamaskNotification();
    await puppeteer.waitAndClick(
      notificationPageElements.nextButton,
      notificationPage,
    );
    await puppeteer.waitAndClick(
      permissionsPageElements.connectButton,
      notificationPage,
    );
    await puppeteer.metamaskWindow().waitForTimeout(3000);
    return true;
  },
  async signMessage() {
    await puppeteer.metamaskWindow().waitForTimeout(3000);
    const notificationPage = await puppeteer.switchToMetamaskNotification();
    await puppeteer.waitAndClick(
      notificationPageElements.signButton,
      notificationPage,
    );
    await puppeteer.metamaskWindow().waitForTimeout(3000);
    return true;
  },
  async confirmTransaction() {
    const isKovanTestnet = getNetwork().networkName === 'kovan';
    await puppeteer.metamaskWindow().waitForTimeout(3000);
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
    await puppeteer.metamaskWindow().waitForTimeout(3000);
    await puppeteer.waitAndClick(
      confirmPageElements.confirmButton,
      notificationPage,
    );
    await puppeteer.metamaskWindow().waitForTimeout(3000);
    return true;
  },
  async rejectTransaction() {
    await puppeteer.metamaskWindow().waitForTimeout(3000);
    const notificationPage = await puppeteer.switchToMetamaskNotification();
    await puppeteer.waitAndClick(
      confirmPageElements.rejectButton,
      notificationPage,
    );
    await puppeteer.metamaskWindow().waitForTimeout(3000);
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
    await puppeteer.metamaskWindow().waitForTimeout(1000);
    await puppeteer.metamaskWindow().bringToFront()
    if (
      (await puppeteer.metamaskWindow().$(unlockPageElements.unlockPage)) ===
      null
    ) {
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