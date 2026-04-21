const express = require('express');
const db = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// simple increment, no per-user tracking for comment likes
router.post('/:id/like', authMiddleware, async (req, res, next) => {
  try {
    const commentId = parseInt(req.params.id);
    await db.query('CALL increment_comment_likes($1)', [commentId]);
    res.json({ message: 'Comment liked' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;