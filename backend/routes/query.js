const express = require('express');
const authMiddleware = require('../middleware/auth');
const { execute } = require('../services/queryGateway');

const router = express.Router();

// Query Gateway: unified endpoint for all read operations
// Maps action names to stored procedures / pre-defined SQL
router.post('/', authMiddleware, async (req, res, next) => {
  try {
    const { action, params = {} } = req.body;
    if (!action) {
      return res.status(400).json({ error: 'action is required' });
    }

    // Inject viewer user_id into params for personalized queries
    const queryParams = { ...params, user_id: req.user.userId };

    const data = await execute(action, queryParams);
    res.json({ action, data });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
