const express = require('express');
const router = express.Router();

const PNode = require('../models/PNode');
const uptimeService = require('../services/uptimeService');
const { fetchGossipNodes } = require('../services/gossipService');
const { calculateReputationScore } = require('../utils/reputationScore');
const { getNodeSLAPercentile } = require('../utils/slaPercentile');

const authMiddleware = require('../middleware/authMiddleware');

/**
 * Health band helper
 */
function getHealthBand(score) {
  if (score >= 85) return 'excellent';
  if (score >= 70) return 'good';
  if (score >= 50) return 'degraded';
  return 'unhealthy';
}

/**
 * GET /api/pnodes
 */
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const { status, limit = 100, skip = 0, sort = '-reputationScore' } = req.query;

    const query = {};
    if (status && status !== 'all') {
      query.status = status;
    }

    const nodes = await PNode.find(query)
      .sort(sort)
      .limit(Number(limit))
      .skip(Number(skip));

    const total = await PNode.countDocuments(query);

    console.log(`📊 Query: ${JSON.stringify(query)}, Found: ${nodes.length}, Total: ${total}`);

    const enriched = await Promise.all(
      nodes.map(async node => {
        const [uptime24h, uptime7d] = await Promise.all([
          uptimeService.getNodeUptime(node.nodeId, '24h'),
          uptimeService.getNodeUptime(node.nodeId, '7d')
        ]);

        return {
          ...node.toObject(),
          uptime: {
            uptime24h,
            uptime7d
          },
          reputationScore: calculateReputationScore(node)
        };
      })
    );

    res.json({
      success: true,
      count: enriched.length,
      total,
      data: enriched,
      query
    });
  } catch (error) {
    next(error);
  }
});


/**
 * GET /api/pnodes/map/data
 */
router.get('/map/data', authMiddleware, async (req, res, next) => {
  try {
    const nodes = await PNode.find({
      'location.latitude': { $exists: true },
      'location.longitude': { $exists: true }
    });

    const mapData = nodes.map(node => {
      const score = calculateReputationScore(node);

      return {
        id: node.nodeId,
        latitude: node.location.latitude,
        longitude: node.location.longitude,
        status: node.status,
        capacity: node.storage.total,
        health: score,
        healthBand: getHealthBand(score),
        city: node.location.city,
        country: node.location.country
      };
    });

    res.json({ success: true, data: mapData });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/pnodes/leaderboard/top
 */
router.get('/leaderboard/top', authMiddleware, async (req, res, next) => {
  try {
    const limit = Number(req.query.limit || 50);
    const window = req.query.window || '7d';

    const nodes = await PNode.find({ status: 'online' }).limit(limit);

    const leaderboard = await Promise.all(
      nodes.map(async node => {
        const uptime7d = await uptimeService.getNodeUptime(
          node.nodeId,
          window
        );

        const reputation = calculateReputationScore(node);

        return {
          nodeId: node.nodeId,
          operator: node.operator?.name || 'Anonymous',
          reputationScore: reputation,
          uptime7d, // ✅ fixed
          slaTier:
            node.performance?.slaPercentile >= 99
              ? 'GOLD'
              : node.performance?.slaPercentile >= 95
              ? 'SILVER'
              : 'BRONZE',
          badges: node.badges || [], // ✅ fixed
          joinDate: node.firstSeen,
          rankScore: uptime7d * 0.6 + reputation * 0.4
        };
      })
    );

    leaderboard
      .sort((a, b) => b.rankScore - a.rankScore)
      .forEach((n, i) => (n.rank = i + 1));

    res.json({ success: true, data: leaderboard });
  } catch (error) {
    next(error);
  }
});


/**
 * GET /api/pnodes/stats/network
 */
router.get('/stats/network', authMiddleware, async (req, res, next) => {
  try {
    const nodes = await PNode.find();

    let totalStorage = 0;
    let usedStorage = 0;
    let availableStorage = 0;
    let scoreSum = 0;

    const healthDistribution = {
      excellent: 0,
      good: 0,
      degraded: 0,
      unhealthy: 0
    };

    nodes.forEach(node => {
      totalStorage += node.storage?.total || 0;
      usedStorage += node.storage?.used || 0;
      availableStorage += node.storage?.available || 0;

      const score = calculateReputationScore(node);
      scoreSum += score;

      healthDistribution[getHealthBand(score)]++;
    });

    const uptime24h = await uptimeService.getNetworkUptime('24h');
    const uptime7d = await uptimeService.getNetworkUptime('7d');

    res.json({
      success: true,
      data: {
        totalNodes: nodes.length,
        onlineNodes: nodes.filter(n => n.status === 'online').length,
        offlineNodes: nodes.filter(n => n.status === 'offline').length,

        sla: {
          uptime24h: uptime24h.uptimePercentage,
          uptime7d: uptime7d.uptimePercentage
        },

        avgScore:
          nodes.length > 0
            ? Number((scoreSum / nodes.length).toFixed(2))
            : 0,

        healthDistribution,

        storage: {
          totalStorage: totalStorage,
          usedStorage: usedStorage,
          availableStorage: availableStorage,
          utilizationPercentage:
            totalStorage > 0
              ? Number(((usedStorage / totalStorage) * 100).toFixed(2))
              : 0
        }
      }
    });
  } catch (error) {
    next(error);
  }
});


/**
 * POST /api/pnodes/refresh
 */
router.post('/refresh', authMiddleware, async (req, res, next) => {
  try {
    const nodes = await fetchGossipNodes();

    res.json({
      success: true,
      message: 'Gossip refreshed',
      count: nodes.length
    });
  } catch (error) {
    next(error);
  }
});


/**
 * GET /api/pnodes/:nodeId 
 */
router.get('/:nodeId', authMiddleware, async (req, res, next) => {
  try {
    const { nodeId } = req.params;
    
    console.log(`🔍 Fetching node: ${nodeId}`);
    
    // Find node (fast, indexed query)
    const node = await PNode.findOne({ nodeId }).lean(); // .lean() for better performance

    if (!node) {
      console.log(`❌ Node not found: ${nodeId}`);
      return res.status(404).json({
        success: false,
        error: 'Node not found'
      });
    }

    console.log(`✅ Node found: ${nodeId}`);

    // Fetch uptime data with timeout protection
    const uptimePromises = [
      uptimeService.getNodeUptime(node.nodeId, '24h').catch(err => {
        console.error(`Uptime 24h error: ${err.message}`);
        return 0;
      }),
      uptimeService.getNodeUptime(node.nodeId, '7d').catch(err => {
        console.error(`Uptime 7d error: ${err.message}`);
        return 0;
      })
    ];

    
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Uptime calculation timeout')), 5000)
    );

    let uptime24h = 0;
    let uptime7d = 0;

    try {
      [uptime24h, uptime7d] = await Promise.race([
        Promise.all(uptimePromises),
        timeoutPromise
      ]);
    } catch (err) {
      console.error(`⚠️ Uptime calculation timeout, using defaults`);
      
      uptime24h = node.performance?.uptime || 0;
      uptime7d = node.performance?.uptime || 0;
    }

    let percentile = 0;
    let top1Percent = false;

    try {
      const slaData = await Promise.race([
        getNodeSLAPercentile(node.nodeId),
        new Promise((_, reject) => setTimeout(() => reject(new Error('SLA timeout')), 3000))
      ]);
      percentile = slaData.percentile;
      top1Percent = slaData.top1Percent;
    } catch (err) {
      console.error(`⚠️ SLA calculation timeout, using stored values`);
      percentile = node.performance?.slaPercentile || 0;
      top1Percent = node.performance?.top1Percent || false;
    }

    const response = {
      ...node,
      reputationScore: calculateReputationScore(node),
      sla: {
        uptime24h,
        uptime7d,
        uptime30d: node.performance?.uptime || 0, 
        percentile,
        top1Percent
      }
    };

    console.log(`✅ Response prepared for: ${nodeId}`);

    res.json({
      success: true,
      data: response
    });
  } catch (error) {
    console.error(`❌ Error fetching node ${req.params.nodeId}:`, error.message);
    next(error);
  }
});


module.exports = router;
