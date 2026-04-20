const express = require('express');
const authMiddleware = require('../middleware/auth');
const { execute } = require('../services/queryGateway');

const router = express.Router();

router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const { lat, lng, radius = 3000 } = req.query;
    if (lat == null || lng == null) {
      return res.status(400).json({ error: 'lat and lng are required' });
    }

    const posts = await execute('nearby', {
      user_id: req.user.userId,
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      radius: parseInt(radius),
    });
    res.json({ posts });
  } catch (err) {
    next(err);
  }
});

module.exports = router;