const express = require('express');
const router = express.Router();
const Metric = require('../models/Metric');
const logger = require('../utils/logger');

// GET /api/metrics/:nodeId - Get metrics for a specific node
router.get('/:nodeId', async (req, res, next) => {
  try {
    const { nodeId } = req.params;
    const { timeframe = '24h', limit = 100 } = req.query;

    // Calculate time range
    const now = new Date();
    const timeRanges = {
      '1h': 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000
    };

    const startTime = new Date(now - (timeRanges[timeframe] || timeRanges['24h']));

    const metrics = await Metric.find({
      nodeId,
      timestamp: { $gte: startTime }
    })
      .sort('-timestamp')
      .limit(parseInt(limit));

    res.json({
      success: true,
      nodeId,
      timeframe,
      count: metrics.length,
      data: metrics
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/metrics/network/aggregate - Get aggregated network metrics
router.get('/network/aggregate', async (req, res, next) => {
  try {
    const { timeframe = '24h' } = req.query;

    const now = new Date();
    const timeRanges = {
      '1h': 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000
    };

    const startTime = new Date(now - (timeRanges[timeframe] || timeRanges['24h']));

    const aggregated = await Metric.aggregate([
      { $match: { timestamp: { $gte: startTime } } },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d %H:00',
              date: '$timestamp'
            }
          },
          avgResponseTime: { $avg: '$metrics.responseTime' },
          totalStorage: { $sum: '$metrics.storageUsed' },
          avgUptime: { $avg: '$metrics.uptimePercentage' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      timeframe,
      data: aggregated
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;