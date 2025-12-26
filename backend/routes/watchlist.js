const express = require('express');
const router = express.Router();
const User = require('../models/User');
const PNode = require('../models/PNode');
const authMiddleware = require('../middleware/authMiddleware'); // centralized auth

// Add node to watchlist
router.post('/', authMiddleware, async (req, res, next) => {
  try {
    const { nodeId } = req.body;

    if (!nodeId) {
      return res.status(400).json({ success: false, error: 'Node ID is required' });
    }

    // Verify node exists
    const node = await PNode.findOne({ nodeId });
    if (!node) {
      return res.status(404).json({ success: false, error: 'Node not found' });
    }

    // Add to user's watchlist
    const user = await User.findById(req.userId);

    if (!user.watchlist) user.watchlist = []; 
    if (user.watchlist.includes(nodeId)) {
      return res.status(400).json({ success: false, error: 'Node already in watchlist' });
    }

    user.watchlist.push(nodeId);
    await user.save();

    res.json({
      success: true,
      message: 'Node added to watchlist',
      watchlist: user.watchlist
    });
  } catch (error) {
    next(error);
  }
});

// Remove node from watchlist
router.delete('/', authMiddleware, async (req, res, next) => {
  try {
    const { nodeId } = req.body;

    if (!nodeId) {
      return res.status(400).json({ success: false, error: 'Node ID is required' });
    }

    const user = await User.findById(req.userId);

    if (!user.watchlist || !user.watchlist.includes(nodeId)) {
      return res.status(400).json({ success: false, error: 'Node not in watchlist' });
    }

    user.watchlist = user.watchlist.filter(id => id !== nodeId);
    await user.save();

    res.json({
      success: true,
      message: 'Node removed from watchlist',
      watchlist: user.watchlist
    });
  } catch (error) {
    next(error);
  }
});

//Get user's watchlist with node details
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);

    const nodes = await PNode.find({ nodeId: { $in: user.watchlist || [] } });

    res.json({
      success: true,
      watchlist: nodes
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
