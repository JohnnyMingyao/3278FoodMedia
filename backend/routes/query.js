const express = require('express');
const authMiddleware = require('../middleware/auth');
const { execute } = require('../services/queryGateway');

const router = express.Router();

// unified read endpoint — maps action names to predefined queries
router.post('/', authMiddleware, async (req, res, next) => {
  try {
    const { action, params = {} } = req.body;
    if (!action) {
      return res.status(400).json({ error: 'action is required' });
    }

    // always inject the authenticated user's id
    const queryParams = { ...params, user_id: req.user.userId };
    const data = await execute(action, queryParams);
    res.json({ action, data });
  } catch (err) {
    next(err);
  }
});

module.exports = router;