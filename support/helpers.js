const axios = require('axios');
const fs = require('fs');
const zip = require('cross-zip');
const path = require('path');
const { getNetworkConfig } = require('./constants');

let currentNetwork = {
  networkName: 'mainnet',
  networkId: 1,
  isTestnet: false,
};

module.exports = {
  setNetwork(network) {
    const config = getNetworkConfig(network);
    currentNetwork = {
      networkName: config.networkName,
      networkId: config.networkId,
      isTestnet: config.isTestnet,
    };
  },
  getNetwork() {
    return currentNetwork;
  },
  async getMetamaskReleases(version) {
    let filename;
    let downloadUrl;

    const response = await axios.get(
      'https://api.github.com/repos/metamask/metamask-extension/releases',
    );

    if (version === 'latest' || !version) {
      filename = response.data[0].assets[0].name;
      downloadUrl = response.data[0].assets[0].browser_download_url;
    } else if (version) {
      filename = `metamask-chrome-${version}.zip`;
      downloadUrl = `https://github.com/MetaMask/metamask-extension/releases/download/v${version}/metamask-chrome-${version}.zip`;
    }

    return {
      filename,
      downloadUrl,
    };
  },
  async download(url, destination) {
    const writer = fs.createWriteStream(destination);
    const result = await axios({
      url,
      method: 'GET',
      responseType: 'stream',
    });
    await new Promise(resolve =>
      result.data.pipe(writer).on('finish', resolve),
    );
  },
  async extract(file, destination) {
    await zip.unzip(file, destination);
  },
  async prepareMetamask(version) {
    const release = await module.exports.getMetamaskReleases(version);
    const downloadsDirectory = path.resolve(__dirname, 'downloads');
    if (!fs.existsSync(downloadsDirectory)) {
      fs.mkdirSync(downloadsDirectory);
    }
    const downloadDestination = path.join(downloadsDirectory, release.filename);
    await module.exports.download(release.downloadUrl, downloadDestination);
    const metamaskDirectory = path.join(downloadsDirectory, 'metamask');
    await module.exports.extract(downloadDestination, metamaskDirectory);
    return metamaskDirectory;
  },
};