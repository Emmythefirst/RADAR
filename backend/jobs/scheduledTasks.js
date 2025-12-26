const cron = require('node-cron');
const { fetchGossipNodes } = require('../services/gossipService');
const { checkAlerts } = require('../services/alertService');
const logger = require('../utils/logger');

function startMetricsCollector(io) {
  logger.info('Starting scheduled tasks...');

  // Fetch gossip data every 30 seconds
  cron.schedule('*/30 * * * * *', async () => {
    try {
      const nodes = await fetchGossipNodes();
      
      // Emit update to connected clients
      if (nodes.length > 0) {
        io.emit('nodes-updated', {
          count: nodes.length,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      logger.error(`Scheduled gossip fetch failed: ${error.message}`);
    }
  });

  // Check alerts every minute
  cron.schedule('* * * * *', async () => {
    try {
      await checkAlerts(io);
    } catch (error) {
      logger.error(`Scheduled alert check failed: ${error.message}`);
    }
  });

  logger.info('Scheduled tasks started successfully');
}

module.exports = { startMetricsCollector };