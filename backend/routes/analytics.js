const express = require('express');
const db = require('../db');
const authMiddleware = require('../middleware/auth');
const { execute } = require('../services/queryGateway');

const router = express.Router();

// Get top posts leaderboard
router.get('/top-posts', async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const data = await execute('top_posts', { limit });
    res.json({ posts: data });
  } catch (err) {
    next(err);
  }
});

// Get top users leaderboard
router.get('/top-users', async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const data = await execute('top_users', { limit });
    res.json({ users: data });
  } catch (err) {
    next(err);
  }
});

// Get geographic clusters (creative SQL extension)
router.get('/clusters', async (req, res, next) => {
  try {
    const minPoints = parseInt(req.query.min_points) || 3;
    const eps = parseInt(req.query.eps) || 500;
    const data = await execute('clusters', { min_points: minPoints, eps });
    res.json({ clusters: data });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
