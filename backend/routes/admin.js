const express = require('express');
const router = express.Router();
const { updateAllNodesWithPercentiles } = require('../utils/slaPercentile');
const authMiddleware = require('../middleware/authMiddleware');

//Manually trigger SLA percentile update for all nodes

router.post('/update-percentiles', authMiddleware, async (req, res, next) => {
  try {
    console.log('🔧 Admin: Triggering SLA percentile update...');
    
    const result = await updateAllNodesWithPercentiles();
    
    if (result.success) {
      res.json({
        success: true,
        message: result.message,
        data: {
          totalNodes: result.totalNodes,
          top1PercentCount: result.top1PercentCount
        }
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.message
      });
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;