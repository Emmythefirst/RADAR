
const Metric = require('../models/Metric');
const PNode = require('../models/PNode');

/**
 * SLA thresholds (industry-standard)
 */
const SLA_TIERS = {
  GOLD: 99.9,
  SILVER: 99.5,
  BRONZE: 99.0
};

/**
 * Convert timeframe string to milliseconds
 */
function getTimeWindowMs(window) {
  const windows = {
    '1h': 60 * 60 * 1000,
    '24h': 24 * 60 * 60 * 1000,
    '7d': 7 * 24 * 60 * 60 * 1000,
    '30d': 30 * 24 * 60 * 60 * 1000
  };

  return windows[window] || windows['24h'];
}

/**
 * Calculate node uptime based on metric samples
 * ✅ FIXED: Ensures uptime never exceeds 100%
 */
async function calculateNodeUptime(nodeId, window = '24h') {
  const since = new Date(Date.now() - getTimeWindowMs(window));

  const samples = await Metric.find({
    nodeId,
    timestamp: { $gte: since }
  }).select('status');

  // ✅ FIX: If no samples, return 0 instead of calculating
  if (!samples.length) {
    return 0;
  }

  const onlineSamples = samples.filter(s => s.status === 'online').length;
  
  // ✅ FIX: Cap at 100% maximum
  const uptimePercentage = Math.min(
    100, 
    Number(((onlineSamples / samples.length) * 100).toFixed(3))
  );
  
  return uptimePercentage;
}

/**
 * PUBLIC API 
 */
async function getNodeUptime(nodeId, window = '24h') {
  return calculateNodeUptime(nodeId, window);
}

/**
 * Real-time uptime calculation for gossipService
 * ✅ FIXED: Ensures calculated uptime is capped at 100%
 */
function calculateUptime(node, isOnline, now) {
  const lastSeenAt = node.performance?.lastSeenAt
    ? new Date(node.performance.lastSeenAt).getTime()
    : now;

  const onlineDurationMs = node.performance?.onlineDurationMs || 0;
  const offlineDurationMs = node.performance?.offlineDurationMs || 0;

  const delta = now - lastSeenAt;

  const updatedOnline = isOnline ? onlineDurationMs + delta : onlineDurationMs;
  const updatedOffline = isOnline ? offlineDurationMs : offlineDurationMs + delta;

  const totalDuration = updatedOnline + updatedOffline;

  // ✅ FIX: Handle edge cases and cap at 100%
  let uptime = 0;
  
  if (totalDuration > 0) {
    uptime = Math.min(100, Number(((updatedOnline / totalDuration) * 100).toFixed(2)));
  }

  return {
    onlineDurationMs: updatedOnline,
    offlineDurationMs: updatedOffline,
    uptime
  };
}

/**
 * Determine SLA tier
 */
function getSLATier(uptimePercentage) {
  if (uptimePercentage >= SLA_TIERS.GOLD) return 'GOLD';
  if (uptimePercentage >= SLA_TIERS.SILVER) return 'SILVER';
  if (uptimePercentage >= SLA_TIERS.BRONZE) return 'BRONZE';
  return 'NONE';
}

/**
 * Get SLA bundle
 */
async function getNodeSLA(nodeId) {
  const [uptime24h, uptime7d, uptime30d] = await Promise.all([
    getNodeUptime(nodeId, '24h'),
    getNodeUptime(nodeId, '7d'),
    getNodeUptime(nodeId, '30d')
  ]);

  return {
    uptime: {
      '24h': uptime24h,
      '7d': uptime7d,
      '30d': uptime30d
    },
    slaTier: getSLATier(uptime7d)
  };
}

/**
 * Network-wide uptime
 * ✅ FIXED: Ensures network uptime is capped at 100%
 */
async function getNetworkUptime(window = '24h') {
  const since = new Date(Date.now() - getTimeWindowMs(window));

  const samples = await Metric.find({
    timestamp: { $gte: since }
  }).select('status');

  if (!samples.length) {
    return { uptimePercentage: 0, totalSamples: 0 };
  }

  const onlineSamples = samples.filter(s => s.status === 'online').length;

  // ✅ FIX: Cap at 100%
  const uptimePercentage = Math.min(
    100,
    Number(((onlineSamples / samples.length) * 100).toFixed(3))
  );

  return {
    uptimePercentage,
    totalSamples: samples.length
  };
}

/**
 * SLA distribution for charts (7d default)
 */
async function getSLADistribution(window = '7d') {
  const nodes = await PNode.find().select('nodeId');

  const distribution = {
    GOLD: 0,
    SILVER: 0,
    BRONZE: 0,
    NONE: 0
  };

  if (!nodes.length) {
    return {
      window,
      distribution,
      totalNodes: 0
    };
  }

  const uptimes = await Promise.all(
    nodes.map(node =>
      getNodeUptime(node.nodeId, window)
    )
  );

  uptimes.forEach(uptime => {
    const tier = getSLATier(uptime);
    distribution[tier]++;
  });

  return {
    window,
    distribution,
    totalNodes: nodes.length
  };
}

module.exports = {
  getNodeUptime,
  getNodeSLA,
  getNetworkUptime,
  getSLADistribution,
  getSLATier,
  SLA_TIERS,
  calculateUptime
};