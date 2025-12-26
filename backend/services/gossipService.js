const prpcService = require('./prpcService');
const PNode = require('../models/PNode');
const Metric = require('../models/Metric');

const logger = require('../utils/logger');
const { calculateReputationScore, assignBadges } = require('../utils/reputationScore');
const { getLocationFromIP } = require('../utils/geoLocation');
const { getNodeSLAPercentile } = require('../utils/slaPercentile');

// Generate readable node names
const generatedIds = new Set();

function generateUniqueNodeName() {
  let name;
  do {
    const letters = Array.from({ length: 4 }, () =>
      String.fromCharCode(65 + Math.floor(Math.random() * 26))
    ).join('');
    const digits = Math.floor(1000 + Math.random() * 9000);
    name = `pNode-${letters}-${digits}`;
  } while (generatedIds.has(name));

  generatedIds.add(name);
  return name;
}

async function fetchGossipNodes() {
  try {
    logger.info('Fetching pNodes from network...');
    const pods = await prpcService.fetchAllPNodes();

    if (!pods || pods.length === 0) {
      logger.warn('No pNodes returned from network');
      return [];
    }

    const now = Date.now();
    const processedNodes = [];

    for (const pod of pods) {
      try {
        if (!pod.pubkey) continue;

        let node = await PNode.findOne({ nodeId: pod.pubkey });

        const lastSeenTimestamp = pod.last_seen_timestamp
          ? pod.last_seen_timestamp * 1000
          : now;

        const isOnline = now - lastSeenTimestamp < 5 * 60 * 1000;

        let location = node?.location;
        if (!location && pod.address) {
          const ip = pod.address.split(':')[0];
          location = await getLocationFromIP(ip);
        }

        if (!node) {
          node = new PNode({
            nodeId: pod.pubkey,
            publicKey: pod.pubkey,
            operator: {
              name: generateUniqueNodeName(),
              verified: false
            },
            firstSeen: new Date(lastSeenTimestamp),
            reputationScore: 0
          });
        }

        // STATUS 
        node.status = isOnline ? 'online' : 'offline';
        node.lastSeen = new Date(lastSeenTimestamp);

        node.gossipAddress = pod.address || '';
        node.rpcAddress = pod.rpc_port
          ? `${pod.address?.split(':')[0]}:${pod.rpc_port}`
          : null;

        node.version = pod.version || 'unknown';
        node.location = location || {};

        node.storage = {
          total: pod.storage_committed || 0,
          used: pod.storage_used || 0,
          available:
            (pod.storage_committed || 0) - (pod.storage_used || 0)
        };

        // 🏆 SLA percentile 
        const { percentile, top1Percent } =
          await getNodeSLAPercentile(node.nodeId);

        node.performance = {
          slaPercentile: percentile,
          top1Percent
        };

        // ⭐ Reputation & badges
        node.reputationScore = calculateReputationScore(node);
        node.badges = assignBadges(node);

        await node.save();
        processedNodes.push(node);

        // 📊 Metric snapshot (THIS feeds uptimeService)
        await Metric.create({
          nodeId: node.nodeId,
          timestamp: new Date(),
          status: node.status
        });

      } catch (err) {
        logger.error(`Error processing node ${pod.pubkey}: ${err.message}`);
      }
    }

    logger.info(`Successfully processed ${processedNodes.length} pNodes`);
    return processedNodes;

  } catch (error) {
    logger.error(`Error fetching gossip nodes: ${error.message}`);
    throw error;
  }
}

module.exports = { fetchGossipNodes };
