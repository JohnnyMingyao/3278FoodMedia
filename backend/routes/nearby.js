const express = require('express');
const db = require('../db');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const { lat, lng, radius = 3000 } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json({ error: 'lat and lng are required' });
    }

    const result = await db.query(
      'SELECT * FROM get_nearby_marks($1, $2, $3, $4)',
      [req.user.userId, parseFloat(lat), parseFloat(lng), parseInt(radius)]
    );
    
    res.json({ posts: result.rows });
  } catch (err) {
    next(err);
  }
});

module.exports = router;