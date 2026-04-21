const express = require('express');
const db = require('../db');
const router = express.Router();

router.get('/top-posts', async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const result = await db.query('SELECT * FROM get_top_posts($1)', [limit]);
    res.json({ posts: result.rows });
  } catch (err) {
    next(err);
  }
});

router.get('/top-users', async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const result = await db.query('SELECT * FROM get_top_users($1)', [limit]);
    res.json({ users: result.rows });
  } catch (err) {
    next(err);
  }
});

router.get('/clusters', async (req, res, next) => {
  try {
    const minPoints = parseInt(req.query.min_points) || 3;
    const eps = parseInt(req.query.eps) || 500;
    const result = await db.query('SELECT * FROM get_geo_clusters($1, $2)', [minPoints, eps]);
    res.json({ clusters: result.rows });
  } catch (err) {
    next(err);
  }
});

module.exports = router;