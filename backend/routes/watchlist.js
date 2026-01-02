const express = require('express');
const router = express.Router();
const User = require('../models/User');
const PNode = require('../models/PNode');
const authMiddleware = require('../middleware/authMiddleware');

//Add node to watchlist
router.post('/', authMiddleware, async (req, res, next) => {
  try {
    console.log('📝 POST /watchlist - Adding node to watchlist');
    console.log('User ID:', req.userId);
    console.log('Request body:', req.body);

    const { nodeId } = req.body;

    if (!nodeId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Node ID is required' 
      });
    }

    // Verify node exists
    const node = await PNode.findOne({ nodeId });
    if (!node) {
      console.log('❌ Node not found:', nodeId);
      return res.status(404).json({ 
        success: false, 
        error: 'Node not found' 
      });
    }

    // Get user
    const user = await User.findById(req.userId);
    
    if (!user) {
      console.log('❌ User not found:', req.userId);
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
    }

    if (!Array.isArray(user.watchlist)) {
      user.watchlist = [];
    }

    // Check if already in watchlist
    if (user.watchlist.includes(nodeId)) {
      console.log('⚠️ Node already in watchlist:', nodeId);
      return res.status(400).json({ 
        success: false, 
        error: 'Node already in watchlist' 
      });
    }

    // Add to watchlist
    user.watchlist.push(nodeId);
    await user.save();

    console.log('✅ Node added to watchlist:', nodeId);
    console.log('Updated watchlist:', user.watchlist);

    res.json({
      success: true,
      message: 'Node added to watchlist',
      watchlist: user.watchlist
    });
  } catch (error) {
    console.error('❌ Error adding to watchlist:', error);
    next(error);
  }
});

//Remove node from watchlist
router.delete('/', authMiddleware, async (req, res, next) => {
  try {
    console.log('🗑️ DELETE /watchlist - Removing node from watchlist');
    console.log('User ID:', req.userId);
    console.log('Request body:', req.body);

    const { nodeId } = req.body;

    if (!nodeId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Node ID is required' 
      });
    }

    const user = await User.findById(req.userId);
    
    if (!user) {
      console.log('❌ User not found:', req.userId);
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
    }

    if (!Array.isArray(user.watchlist)) {
      user.watchlist = [];
    }

    if (!user.watchlist.includes(nodeId)) {
      console.log('⚠️ Node not in watchlist:', nodeId);
      return res.status(400).json({ 
        success: false, 
        error: 'Node not in watchlist' 
      });
    }

    user.watchlist = user.watchlist.filter(id => id !== nodeId);
    await user.save();

    console.log('✅ Node removed from watchlist:', nodeId);
    console.log('Updated watchlist:', user.watchlist);

    res.json({
      success: true,
      message: 'Node removed from watchlist',
      watchlist: user.watchlist
    });
  } catch (error) {
    console.error('❌ Error removing from watchlist:', error);
    next(error);
  }
});

//Get user's watchlist with node details
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    console.log('📋 GET /watchlist - Fetching watchlist');
    console.log('User ID:', req.userId);

    const user = await User.findById(req.userId);
    
    if (!user) {
      console.log('❌ User not found:', req.userId);
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
    }

    // Ensure watchlist is an array
    const watchlistIds = Array.isArray(user.watchlist) ? user.watchlist : [];

    console.log('Watchlist IDs:', watchlistIds);

    if (watchlistIds.length === 0) {
      return res.json({
        success: true,
        watchlist: []
      });
    }

    const nodes = await PNode.find({ nodeId: { $in: watchlistIds } });

    console.log('✅ Found nodes:', nodes.length);

    res.json({
      success: true,
      watchlist: nodes
    });
  } catch (error) {
    console.error('❌ Error fetching watchlist:', error);
    next(error);
  }
});

module.exports = router;