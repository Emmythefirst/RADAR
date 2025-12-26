const PNode = require('../models/PNode');
const uptimeService = require('../services/uptimeService');

/**
 * SLA percentile based on 7-day uptime
 */
async function getNodeSLAPercentile(nodeId) {
  const targetUptime =
    await uptimeService.getNodeUptime(nodeId, '7d');

  const nodes = await PNode.find().select('nodeId');
  if (!nodes.length) {
    return { percentile: 0, top1Percent: false };
  }

  const uptimes = [];

  for (const node of nodes) {
    const uptime =
      await uptimeService.getNodeUptime(node.nodeId, '7d');
    uptimes.push(uptime);
  }

  uptimes.sort((a, b) => a - b);

  const below = uptimes.filter(u => u <= targetUptime).length;
  const percentile = Number(((below / uptimes.length) * 100).toFixed(2));

  return {
    percentile,
    top1Percent: percentile >= 99
  };
}

module.exports = { getNodeSLAPercentile };
