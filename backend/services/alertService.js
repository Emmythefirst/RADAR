const Alert = require('../models/Alert');
const PNode = require('../models/PNode');
const logger = require('../utils/logger');
const nodemailer = require('nodemailer'); 

const emailTransporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

async function checkAlerts(io) {
  try {
    const alerts = await Alert.find({ enabled: true });

    for (const alert of alerts) {
      let shouldTrigger = false;
      let message = '';

      switch (alert.type) {
        case 'node_offline':
          if (alert.nodeId) {
            const node = await PNode.findOne({ nodeId: alert.nodeId });
            if (node && node.status === 'offline') {
              shouldTrigger = true;
              message = `Node ${alert.nodeId} is offline`;
            }
          }
          break;

        case 'capacity_warning':
          const stats = await PNode.aggregate([
            { $match: { status: 'online' } },
            {
              $group: {
                _id: null,
                totalStorage: { $sum: '$storage.total' },
                usedStorage: { $sum: '$storage.used' }
              }
            }
          ]);

          if (stats.length > 0) {
            const usagePercent = (stats[0].usedStorage / stats[0].totalStorage) * 100;
            if (usagePercent > (alert.conditions?.threshold || 80)) {
              shouldTrigger = true;
              message = `Network storage capacity at ${usagePercent.toFixed(2)}%`;
            }
          }
          break;

        case 'new_node':
          const recentNodes = await PNode.find({
            firstSeen: { $gte: new Date(Date.now() - 60000) } // Last minute
          });

          if (recentNodes.length > 0) {
            shouldTrigger = true;
            message = `${recentNodes.length} new node(s) joined the network`;
          }
          break;

        case 'performance_degradation':
          if (alert.nodeId) {
            const node = await PNode.findOne({ nodeId: alert.nodeId });
            if (node && node.performance.responseTime > (alert.conditions?.threshold || 1000)) {
              shouldTrigger = true;
              message = `Node ${alert.nodeId} response time: ${node.performance.responseTime}ms`;
            }
          }
          break;
      }

      if (shouldTrigger) {
        await sendAlertNotification(alert, message, io);
        
        // Update alert
        alert.lastTriggered = new Date();
        alert.triggerCount += 1;
        await alert.save();
      }
    }
  } catch (error) {
    logger.error(`Error checking alerts: ${error.message}`);
  }
}

async function sendAlertNotification(alert, message, io) {
  try {
    // Send email notification
    if (alert.destination.email) {
      await emailTransporter.sendMail({
        from: process.env.EMAIL_USER,
        to: alert.destination.email,
        subject: `Xandeum Alert: ${alert.type}`,
        text: message,
        html: `<p>${message}</p>`
      });
      logger.info(`Email alert sent to ${alert.destination.email}`);
    }

    // Send webhook notification
    if (alert.destination.webhook) {
      const axios = require('axios');
      await axios.post(alert.destination.webhook, {
        type: alert.type,
        message,
        timestamp: new Date().toISOString(),
        nodeId: alert.nodeId
      });
      logger.info(`Webhook alert sent to ${alert.destination.webhook}`);
    }

    // Send WebSocket notification
    if (io) {
      io.emit('alert', {
        type: alert.type,
        message,
        timestamp: new Date().toISOString(),
        nodeId: alert.nodeId
      });
      logger.info('WebSocket alert sent');
    }

  } catch (error) {
    logger.error(`Error sending alert notification: ${error.message}`);
  }
}

module.exports = { checkAlerts, sendAlertNotification };
