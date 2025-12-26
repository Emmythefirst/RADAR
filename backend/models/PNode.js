const mongoose = require('mongoose');

const pNodeSchema = new mongoose.Schema({
  nodeId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  publicKey: {
    type: String,
    required: true
  },
  gossipAddress: {
    type: String,
    required: true
  },
  rpcAddress: {
    type: String
  },
  version: {
    type: String
  },
  location: {
    country: String,
    city: String,
    latitude: Number,
    longitude: Number
  },
  status: {
    type: String,
    enum: ['online', 'offline', 'degraded'],
    default: 'online'
  },
  lastSeen: {
    type: Date,
    default: Date.now
  },
  firstSeen: {
    type: Date,
    default: Date.now
  },
  storage: {
    total: { type: Number, default: 0 },
    used: { type: Number, default: 0 },
    available: { type: Number, default: 0 }
  },
  performance: {
    responseTime: { type: Number, default: 0 },
    uptime: { type: Number, default: 100 },
    onlineDurationMs: { type: Number, default: 0 },
    offlineDurationMs: { type: Number, default: 0 },
    lastSeenAt: { type: Date }
  },
  reputationScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  badges: [{
    type: String,
    enum: ['highReputation', 'top_1_percent', 'trustedNode']
  }],
  operator: {
    name: String,
    contact: String,
    verified: { type: Boolean, default: false }
  }
}, {
  timestamps: true
});

// Indexes for performance
pNodeSchema.index({ status: 1, lastSeen: -1 });
pNodeSchema.index({ reputationScore: -1 });
pNodeSchema.index({ 'location.latitude': 1, 'location.longitude': 1 });

module.exports = mongoose.model('PNode', pNodeSchema);
