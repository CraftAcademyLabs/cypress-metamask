const app = '#app-content .app';

const welcomePage = '.welcome-page';
const confirmButton = `${welcomePage} .first-time-flow__button`;

const firstTimeFlowPage = '.first-time-flow';
const importWalletButton = `${firstTimeFlowPage} .first-time-flow__button`;

const metametricsPage = '.metametrics-opt-in';
const optOutAnalyticsButton = `${metametricsPage} [data-testid="page-container-footer-cancel"]`;

const firstTimeFlowFormPage = '.create-new-vault__form'; // Updated for newer MetaMask
const secretWordsInput = `${firstTimeFlowFormPage} .import-srp__srp-word input[data-testid="import-srp__srp-word-%"]`; // Split per word - % placeholder replaced with word index (0-based) at runtime
const passwordInput = `${firstTimeFlowFormPage} #password`;
const confirmPasswordInput = `${firstTimeFlowFormPage} #confirm-password`;
const termsCheckbox = `${firstTimeFlowFormPage} .create-new-vault__terms input`; // Updated for newer MetaMask
const importButton = `${firstTimeFlowFormPage} .create-new-vault__submit-button`; // Updated for newer MetaMask

const endOfFlowPage = '.end-of-flow';
const allDoneButton = `${endOfFlowPage} .first-time-flow__button`;

const revealSeedPage = '.reveal-seed-phrase';
const remindLaterButton = `${revealSeedPage} .first-time-flow__button`;

module.exports.welcomePageElements = {
  app,
  welcomePage,
  confirmButton,
};

module.exports.firstTimeFlowPageElements = {
  firstTimeFlowPage,
  importWalletButton,
};

module.exports.metametricsPageElements = {
  metametricsPage,
  optOutAnalyticsButton,
};

module.exports.firstTimeFlowFormPageElements = {
  firstTimeFlowFormPage,
  secretWordsInput,
  passwordInput,
  confirmPasswordInput,
  termsCheckbox,
  importButton,
};

module.exports.endOfFlowPageElements = {
  endOfFlowPage,
  allDoneButton,
};

module.exports.revealSeedPageElements = {
  revealSeedPage,
  remindLaterButton,
};