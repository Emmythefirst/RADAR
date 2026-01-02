const PNode = require('../models/PNode');
const uptimeService = require('../services/uptimeService');

// Cache to avoid recalculating for every node
let percentileCache = {
  data: new Map(),
  lastUpdated: null,
  ttl: 5 * 60 * 1000 
};

/**
 * Super fast query: Calculate percentiles using stored uptime values
 */
async function calculatePercentilesFromStored() {
  const now = Date.now();
  
  // Return cache if valid
  if (
    percentileCache.lastUpdated && 
    now - percentileCache.lastUpdated < percentileCache.ttl &&
    percentileCache.data.size > 0
  ) {
    return percentileCache.data;
  }

  console.log('🔄 Calculating SLA percentiles from stored values...');

  try {
    // Get all nodes with their stored uptime
    const nodes = await PNode.find()
      .select('nodeId performance.uptime')
      .lean();

    if (!nodes.length) {
      return new Map();
    }

    // Sort by uptime (ascending)
    const sortedNodes = nodes
      .map(n => ({
        nodeId: n.nodeId,
        uptime: n.performance?.uptime || 0
      }))
      .sort((a, b) => a.uptime - b.uptime);

    const totalNodes = sortedNodes.length;
    const percentiles = new Map();

    // Calculate percentile for each node
    sortedNodes.forEach((node, index) => {
      const percentile = Math.round(((index + 1) / totalNodes) * 100);
      const top1Percent = percentile >= 99;

      percentiles.set(node.nodeId, {
        percentile,
        top1Percent,
        rank: index + 1,
        totalNodes
      });
    });

    // Update cache
    percentileCache.data = percentiles;
    percentileCache.lastUpdated = now;

    console.log(`✅ Calculated percentiles for ${totalNodes} nodes`);

    return percentiles;
  } catch (error) {
    console.error('Error calculating percentiles:', error);
    return percentileCache.data || new Map();
  }
}

/**
 * ACCURATE BUT SLOW:
 * Only use this for manual updates, not for real-time requests
 */
async function calculatePercentilesFromUptimeService(window = '7d') {
  console.log(`🔄 Calculating SLA percentiles from uptimeService (${window})...`);
  console.log('⚠️ This may take a while...');

  try {
    const nodes = await PNode.find().select('nodeId');
    
    if (!nodes.length) {
      return { percentiles: new Map(), message: 'No nodes found' };
    }

    const uptimes = [];

    // Fetch uptime for each node (SLOW)
    for (const node of nodes) {
      const uptime = await uptimeService.getNodeUptime(node.nodeId, window);
      uptimes.push({
        nodeId: node.nodeId,
        uptime
      });

      // Log progress every 10 nodes
      if (uptimes.length % 10 === 0) {
        console.log(`📊 Processed ${uptimes.length}/${nodes.length} nodes...`);
      }
    }

    // Sort by uptime (ascending)
    uptimes.sort((a, b) => a.uptime - b.uptime);

    const totalNodes = uptimes.length;
    const percentiles = new Map();

    // Calculate percentile for each node
    uptimes.forEach((node, index) => {
      const percentile = Math.round(((index + 1) / totalNodes) * 100);
      const top1Percent = percentile >= 99;

      percentiles.set(node.nodeId, {
        percentile,
        top1Percent,
        rank: index + 1,
        totalNodes,
        uptime: node.uptime
      });
    });

    console.log(`✅ Calculated accurate percentiles for ${totalNodes} nodes`);

    return {
      percentiles,
      message: `Successfully calculated percentiles for ${totalNodes} nodes`
    };
  } catch (error) {
    console.error('Error calculating percentiles from uptimeService:', error);
    return {
      percentiles: new Map(),
      message: error.message
    };
  }
}


async function getNodeSLAPercentile(nodeId) {
  try {
    // Use fast cached version
    const allPercentiles = await calculatePercentilesFromStored();
    
    const result = allPercentiles.get(nodeId);
    
    if (result) {
      return {
        percentile: result.percentile,
        top1Percent: result.top1Percent
      };
    }

    // Node not found in cache, return default
    return {
      percentile: 0,
      top1Percent: false
    };
  } catch (error) {
    console.error(`Error getting SLA percentile for ${nodeId}:`, error.message);
    return {
      percentile: 0,
      top1Percent: false
    };
  }
}

/**
 Force cache refresh
 */
function clearPercentileCache() {
  percentileCache.data.clear();
  percentileCache.lastUpdated = null;
  console.log('🗑️ SLA percentile cache cleared');
}


async function updateAllNodesWithPercentiles(window = '7d') {
  try {
    console.log('🔄 Starting ACCURATE SLA percentile update for all nodes...');
    console.log('⏳ This will take several minutes...');

    // Get accurate percentiles from uptimeService
    const { percentiles, message } = await calculatePercentilesFromUptimeService(window);

    if (percentiles.size === 0) {
      return {
        success: false,
        message: 'No percentiles calculated: ' + message
      };
    }

    let updated = 0;

    // Update each node in database
    for (const [nodeId, data] of percentiles) {
      await PNode.updateOne(
        { nodeId },
        {
          $set: {
            'performance.uptime': data.uptime, // Store the uptime value
            'performance.slaPercentile': data.percentile,
            'performance.top1Percent': data.top1Percent
          }
        }
      );

      updated++;

      if (updated % 50 === 0) {
        console.log(`✅ Updated ${updated}/${percentiles.size} nodes...`);
      }
    }

    console.log(`🎉 Successfully updated ${updated} nodes with accurate SLA percentiles!`);
    console.log(`Top 1% threshold: ${Math.ceil(percentiles.size * 0.01)} nodes`);

    // Clear cache so next requests get fresh data
    clearPercentileCache();

    return {
      success: true,
      message: `Updated ${updated} nodes with accurate data`,
      totalNodes: updated,
      top1PercentCount: Math.ceil(percentiles.size * 0.01)
    };
  } catch (error) {
    console.error('❌ Error updating SLA percentiles:', error.message);
    return {
      success: false,
      message: error.message
    };
  }
}

module.exports = { 
  getNodeSLAPercentile,             
  updateAllNodesWithPercentiles,     
  clearPercentileCache,             
  calculatePercentilesFromStored,   
  calculatePercentilesFromUptimeService 
};