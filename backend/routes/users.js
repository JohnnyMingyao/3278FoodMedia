const express = require('express');
const db = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Get current user profile with stats (must come before /:username)
router.get('/me/profile', authMiddleware, async (req, res, next) => {
  try {
    const result = await db.query('SELECT * FROM get_user_profile_stats($1)', [req.user.userId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ profile: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

// Update current user's avatar
router.patch('/me/avatar', authMiddleware, async (req, res, next) => {
  try {
    const { avatar_url } = req.body;
    if (!avatar_url || avatar_url.trim() === '') {
      return res.status(400).json({ error: 'Avatar URL is required' });
    }
    const result = await db.query(
      'UPDATE users SET avatar_url = $1 WHERE id = $2 RETURNING id, username, avatar_url',
      [avatar_url.trim(), req.user.userId]
    );
    res.json({ user: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

// Get current user's marks
router.get('/me/marks', authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const result = await db.query(
      `SELECT p.*, u.username, u.avatar_url,
        EXISTS(SELECT 1 FROM likes l WHERE l.post_id = p.id AND l.user_id = $1) as user_has_liked,
        TRUE as user_has_marked
       FROM posts p
       JOIN marks m ON p.id = m.post_id AND m.user_id = $1
       JOIN users u ON p.user_id = u.id
       ORDER BY p.like_count DESC`,
      [userId]
    );
    res.json({ posts: result.rows });
  } catch (err) {
    next(err);
  }
});

// Get user by username (public profile)
router.get('/:username', async (req, res, next) => {
  try {
    const { username } = req.params;
    const result = await db.query('SELECT id, username, avatar_url, created_at FROM users WHERE username = $1', [username]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

// Get posts by username
router.get('/:username/posts', authMiddleware, async (req, res, next) => {
  try {
    const { username } = req.params;
    const viewerId = req.user.userId;

    const userResult = await db.query('SELECT id FROM users WHERE username = $1', [username]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const targetUserId = userResult.rows[0].id;
    const result = await db.query(
      `SELECT p.*, u.username, u.avatar_url,
        EXISTS(SELECT 1 FROM likes l WHERE l.post_id = p.id AND l.user_id = $2) as user_has_liked,
        EXISTS(SELECT 1 FROM marks m WHERE m.post_id = p.id AND m.user_id = $2) as user_has_marked
       FROM posts p JOIN users u ON p.user_id = u.id
       WHERE p.user_id = $1 ORDER BY p.created_at DESC`,
      [targetUserId, viewerId]
    );

    res.json({ posts: result.rows });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
