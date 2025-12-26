const mongoose = require('mongoose');

const metricSchema = new mongoose.Schema({
  nodeId: {
    type: String,
    required: true,
    index: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  metrics: {
    responseTime: Number,
    storageUsed: Number,
    storageAvailable: Number,
    networkLatency: Number,
    uptimePercentage: Number,
    requestCount: Number
  },
  status: {
    type: String,
    enum: ['online', 'offline', 'degraded']
  }
}, {
  timestamps: true
});

// TTL index to automatically delete old metrics after 30 days
metricSchema.index({ timestamp: 1 }, { expireAfterSeconds: 2592000 });
metricSchema.index({ nodeId: 1, timestamp: -1 });

module.exports = mongoose.model('Metric', metricSchema);
