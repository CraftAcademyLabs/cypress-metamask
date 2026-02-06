/**
 * Configuration constants for MetaMask automation
 */

// Timeout values in milliseconds
const TIMEOUTS = {
  SHORT: 500,
  MEDIUM: 1000,
  LONG: 2000,
  EXTRA_LONG: 3000,
  ELEMENT_WAIT: 300, // Additional wait after element detection for stability
};

// Network configurations
const NETWORKS = {
  MAINNET: {
    names: ['main', 'mainnet'],
    id: 1,
    index: 0,
    isTestnet: false,
  },
  ROPSTEN: {
    names: ['ropsten'],
    id: 3,
    index: 1,
    isTestnet: true,
  },
  KOVAN: {
    names: ['kovan'],
    id: 42,
    index: 2,
    isTestnet: true,
  },
  RINKEBY: {
    names: ['rinkeby'],
    id: 4,
    index: 3,
    isTestnet: true,
  },
  GOERLI: {
    names: ['goerli'],
    id: 5,
    index: 4,
    isTestnet: true,
  },
  LOCALHOST: {
    names: ['localhost'],
    index: 5,
    isTestnet: false,
  },
};

/**
 * Get network configuration by name or ID
 * @param {string|number|object} network - Network name, ID, or configuration object
 * @returns {object|null} Network configuration or null if custom network
 */
function getNetworkConfig(network) {
  // If already an object, it's a custom network
  if (typeof network === 'object') {
    return {
      networkName: network.networkName,
      networkId: network.chainId,
      isTestnet: network.isTestnet,
      index: null,
    };
  }

  // Search by name or ID
  for (const [key, config] of Object.entries(NETWORKS)) {
    if (config.names?.includes(network) || config.id === network) {
      return {
        networkName: config.names[0],
        networkId: config.id,
        isTestnet: config.isTestnet,
        index: config.index,
        key,
      };
    }
  }

  // Unknown network - treat as custom network name
  return {
    networkName: network,
    networkId: null,
    isTestnet: false,
    index: null,
  };
}

module.exports = {
  TIMEOUTS,
  NETWORKS,
  getNetworkConfig,
};
