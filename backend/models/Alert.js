const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  nodeId: {
    type: String,
    index: true
  },
  type: {
    type: String,
    required: true,
    enum: ['node_offline', 'capacity_warning', 'new_node', 'performance_degradation', 'network_health']
  },
  destination: {
    email: String,
    webhook: String,
    discord: String
  },
  enabled: {
    type: Boolean,
    default: true
  },
  conditions: {
    threshold: Number,
    duration: Number
  },
  lastTriggered: Date,
  triggerCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

alertSchema.index({ userId: 1, enabled: 1 });

module.exports = mongoose.model('Alert', alertSchema);
