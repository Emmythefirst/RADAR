const dotenv = require('dotenv');
const axios = require('axios');
const logger = require('../utils/logger');

dotenv.config();

class PRPCService {
  constructor() {
    // Load known pNodes from env
    const pNodesString = process.env.KNOWN_PNODES || '';
    this.knownPNodes = pNodesString
      .split(',')
      .map(url => url.trim())
      .filter(url => url.length > 0)
      .map(url => (url.startsWith('http') ? url : `http://${url}`));

    this.timeout = 5000; 
    this.cache = {
      data: [],
      ttl: 60000, 
      lastUpdated: null
    };

    logger.info(`pRPC service initialized with ${this.knownPNodes.length} known pNodes`);
  }

  async makeRequest(nodeEndpoint, method, params = {}) {
    try {
      const response = await axios.post(
        `${nodeEndpoint}/rpc`,
        { jsonrpc: '2.0', method, params, id: 1 },
        { timeout: this.timeout, headers: { 'Content-Type': 'application/json' } }
      );

      if (response.data.error) {
        throw new Error(`pRPC error from ${nodeEndpoint}: ${response.data.error.message}`);
      }

      return response.data.result;
    } catch (error) {
      logger.warn(`pRPC request failed for ${nodeEndpoint}: ${error.message}`);
      return null; 
    }
  }

  async fetchAllPNodes() {
    const now = Date.now();

    // Return cache if valid
    if (this.cache.lastUpdated && now - this.cache.lastUpdated < this.cache.ttl) {
      logger.info('Returning cached pNodes data');
      return this.cache.data;
    }

    if (this.knownPNodes.length === 0) {
      logger.warn('No known pNodes configured. Set KNOWN_PNODES in .env');
      return [];
    }

    const allPNodes = [];

    for (const nodeEndpoint of this.knownPNodes) {
      const result = await this.makeRequest(nodeEndpoint, 'get-pods-with-stats');
      if (result && result.pods && Array.isArray(result.pods)) {
        allPNodes.push(...result.pods);
        logger.info(`Fetched ${result.pods.length} pNodes from ${nodeEndpoint}`);
      } else {
        logger.warn(`No pNodes returned from ${nodeEndpoint}`);
      }
    }

    if (allPNodes.length === 0) {
      logger.error('No pNodes fetched from any known node. Check connectivity and node status.');
      return [];
    }

    // Remove duplicates by pubkey
    const uniquePNodes = Array.from(
      new Map(
        allPNodes
          .filter(node => node.pubkey)
          .map(node => [node.pubkey, node])
      ).values()
    );

    this.cache = { data: uniquePNodes, ttl: 60000, lastUpdated: now };

    logger.info(`Total of ${uniquePNodes.length} unique pNodes fetched`);
    return uniquePNodes;
  }

  async getNodeStats(pubkey) {
    for (const nodeEndpoint of this.knownPNodes) {
      const result = await this.makeRequest(nodeEndpoint, 'get-pod-stats', { pubkey });
      if (result) return result;
    }
    logger.warn(`No stats found for node ${pubkey}`);
    return null;
  }

  clearCache() {
    this.cache = { data: [], ttl: 60000, lastUpdated: null };
    logger.info('pRPC cache cleared');
  }
}

module.exports = new PRPCService();
