const PNode = require('../models/PNode');
const Metric = require('../models/Metric');
const prpcService = require('./prpcService');
const logger = require('../utils/logger');

class MetricsCollector {
  constructor() {
    this.isCollecting = false;
    this.collectionInterval = null;
  }

  async collectNodeMetrics(nodeId) {
    try {
      const metrics = await prpcService.getNodeStats(nodeId);
      
      // Find the node
      const node = await PNode.findOne({ nodeId });
      if (!node) {
        logger.warn(`Node ${nodeId} not found, skipping metrics collection`);
        return null;
      }

      // Create metric record
      const metricRecord = await Metric.create({
        nodeId,
        timestamp: new Date(),
        metrics: {
          responseTime: metrics.responseTime || node.performance?.responseTime || 0,
          storageUsed: metrics.storageUsed || node.storage?.used || 0,
          storageAvailable: metrics.storageAvailable || node.storage?.available || 0,
          networkLatency: metrics.networkLatency || 0,
          uptimePercentage: node.performance?.uptime || 100,
          requestCount: metrics.requestCount || 0
        },
        status: node.status
      });

      return metricRecord;
    } catch (error) {
      logger.error(`Error collecting metrics for node ${nodeId}: ${error.message}`);
      return null;
    }
  }

  async collectAllMetrics() {
    if (this.isCollecting) {
      logger.warn('Metrics collection already in progress, skipping...');
      return;
    }

    try {
      this.isCollecting = true;
      logger.info('Starting metrics collection for all nodes...');

      // Get all online nodes
      const nodes = await PNode.find({ status: 'online' });
      
      if (nodes.length === 0) {
        logger.warn('No online nodes found for metrics collection');
        return;
      }

      // Collect metrics for each node with rate limiting to avoid overwhelming the network
      const batchSize = 10;
      for (let i = 0; i < nodes.length; i += batchSize) {
        const batch = nodes.slice(i, i + batchSize);
        
        await Promise.allSettled(
          batch.map(node => this.collectNodeMetrics(node.nodeId))
        );

        // Wait 1 second between batches to avoid rate limiting
        if (i + batchSize < nodes.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      logger.info(`Metrics collection completed for ${nodes.length} nodes`);
    } catch (error) {
      logger.error(`Error in metrics collection: ${error.message}`);
    } finally {
      this.isCollecting = false;
    }
  }

  async getNodeMetricsHistory(nodeId, timeframe = '24h') {
    try {
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
      }).sort('timestamp');

      return metrics;
    } catch (error) {
      logger.error(`Error getting metrics history for ${nodeId}: ${error.message}`);
      throw error;
    }
  }

  async getNetworkMetricsAggregate(timeframe = '24h') {
    try {
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
            totalStorageUsed: { $sum: '$metrics.storageUsed' },
            totalStorageAvailable: { $sum: '$metrics.storageAvailable' },
            avgUptime: { $avg: '$metrics.uptimePercentage' },
            avgNetworkLatency: { $avg: '$metrics.networkLatency' },
            totalRequests: { $sum: '$metrics.requestCount' },
            nodeCount: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]);

      return aggregated;
    } catch (error) {
      logger.error(`Error getting network metrics aggregate: ${error.message}`);
      throw error;
    }
  }

  startPeriodicCollection(intervalMs = 5 * 60 * 1000) {
    if (this.collectionInterval) {
      logger.warn('Periodic metrics collection already running');
      return;
    }

    logger.info(`Starting periodic metrics collection (every ${intervalMs}ms)`);
    
    this.collectAllMetrics();

    this.collectionInterval = setInterval(() => {
      this.collectAllMetrics();
    }, intervalMs);
  }

  stopPeriodicCollection() {
    if (this.collectionInterval) {
      clearInterval(this.collectionInterval);
      this.collectionInterval = null;
      logger.info('Stopped periodic metrics collection');
    }
  }
}

module.exports = new MetricsCollector();