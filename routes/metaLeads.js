// routes/metaLeads.js
const express = require('express');
const router = express.Router();
const { syncMetaLeadsToMonday } = require('../jobs/metaToMondaySync');
const { verifyToken, isAdmin } = require('../middleware/auth');

/**
 * Manual trigger for Meta to Monday.com sync
 * POST /api/meta-leads/sync
 * Admin only
 */
router.post('/sync', verifyToken, isAdmin, async (req, res) => {
  try {
    console.log('🔄 Manual sync triggered by admin');
    
    // Run sync in background
    syncMetaLeadsToMonday()
      .then(() => {
        console.log('✅ Manual sync completed successfully');
      })
      .catch(error => {
        console.error('❌ Manual sync failed:', error);
      });

    res.json({
      success: true,
      message: 'Meta to Monday.com sync started. Check server logs for progress.'
    });
  } catch (error) {
    console.error('Error triggering sync:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to trigger sync',
      error: error.message
    });
  }
});

/**
 * Get sync status/configuration
 * GET /api/meta-leads/status
 * Admin only
 */
router.get('/status', verifyToken, isAdmin, (req, res) => {
  const config = {
    metaConfigured: !!(process.env.META_ACCESS_TOKEN && process.env.META_PAGE_ID),
    mondayConfigured: !!(process.env.MONDAY_API_TOKEN && process.env.MONDAY_BOARD_ID),
    scheduledTime: '11:50 PM CET daily',
    timezone: 'Europe/Berlin'
  };

  res.json({
    success: true,
    config: config,
    ready: config.metaConfigured && config.mondayConfigured
  });
});

module.exports = router;
