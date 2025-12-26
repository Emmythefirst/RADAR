const express = require('express');
const router = express.Router();
const Alert = require('../models/Alert');
const { sendAlertNotification } = require('../services/alertService');

// GET /api/alerts - Get all alerts for a user
router.get('/', async (req, res, next) => {
  try {
    const { userId = 'default-user' } = req.query;
    
    const alerts = await Alert.find({ userId }).sort('-createdAt');

    res.json({
      success: true,
      count: alerts.length,
      data: alerts
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/alerts/subscribe - Create a new alert
router.post('/subscribe', async (req, res, next) => {
  try {
    const { userId = 'default-user', nodeId, type, destination, conditions } = req.body;

    if (!type || !destination) {
      return res.status(400).json({
        success: false,
        error: 'Type and destination are required'
      });
    }

    const alert = await Alert.create({
      userId,
      nodeId,
      type,
      destination,
      conditions
    });

    res.status(201).json({
      success: true,
      message: 'Alert created successfully',
      data: alert
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/alerts/:alertId - Delete an alert
router.delete('/:alertId', async (req, res, next) => {
  try {
    const alert = await Alert.findByIdAndDelete(req.params.alertId);

    if (!alert) {
      return res.status(404).json({
        success: false,
        error: 'Alert not found'
      });
    }

    res.json({
      success: true,
      message: 'Alert deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/alerts/:alertId/toggle - Enable/disable an alert
router.patch('/:alertId/toggle', async (req, res, next) => {
  try {
    const alert = await Alert.findById(req.params.alertId);

    if (!alert) {
      return res.status(404).json({
        success: false,
        error: 'Alert not found'
      });
    }

    alert.enabled = !alert.enabled;
    await alert.save();

    res.json({
      success: true,
      message: `Alert ${alert.enabled ? 'enabled' : 'disabled'}`,
      data: alert
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;