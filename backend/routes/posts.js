const express = require('express');
const db = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// feed
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const { sort = 'likes', limit = 20, offset = 0 } = req.query;
    const userId = req.user.userId;
    const result = await db.query(
      'SELECT * FROM get_user_feed($1, $2, $3, $4)',
      [userId, sort, parseInt(limit), parseInt(offset)]
    );
    res.json({ posts: result.rows });
  } catch (err) {
    next(err);
  }
});

router.post('/', authMiddleware, async (req, res, next) => {
  try {
    const { image_url, description, restaurant_name, lat, lng } = req.body;
    const userId = req.user.userId;

    let location = null;
    if (lat != null && lng != null) {
      location = `SRID=4326;POINT(${lng} ${lat})`;
    }

    const result = await db.query(
      `INSERT INTO posts (user_id, image_url, description, restaurant_name, location)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, user_id, image_url, description, restaurant_name, like_count, mark_count, created_at`,
      [userId, image_url || '/default-food.png', description, restaurant_name, location]
    );

    res.status(201).json({ post: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

// /:id/comments must be registered before /:id so express doesn't shadow it
router.get('/:id/comments', async (req, res, next) => {
  try {
    const postId = parseInt(req.params.id);
    const result = await db.query('SELECT * FROM get_post_comments($1)', [postId]);
    res.json({ comments: result.rows });
  } catch (err) {
    next(err);
  }
});

router.post('/:id/comments', authMiddleware, async (req, res, next) => {
  try {
    const postId = parseInt(req.params.id);
    const userId = req.user.userId;
    const { content, is_tasted } = req.body;

    if (!content || content.trim() === '') {
      return res.status(400).json({ error: 'Content is required' });
    }

    await db.query('CALL add_comment($1, $2, $3, $4)', [
      userId, postId, content.trim(), is_tasted || false,
    ]);
    res.status(201).json({ message: 'Comment added' });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', authMiddleware, async (req, res, next) => {
  try {
    const postId = parseInt(req.params.id);
    const userId = req.user.userId;

    const result = await db.query(
      `SELECT p.*, u.username, u.avatar_url,
        EXISTS(SELECT 1 FROM likes l WHERE l.post_id = p.id AND l.user_id = $2) as user_has_liked,
        EXISTS(SELECT 1 FROM marks m WHERE m.post_id = p.id AND m.user_id = $2) as user_has_marked
       FROM posts p JOIN users u ON p.user_id = u.id WHERE p.id = $1`,
      [postId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json({ post: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', authMiddleware, async (req, res, next) => {
  try {
    const postId = parseInt(req.params.id);
    const userId = req.user.userId;

    const result = await db.query(
      'DELETE FROM posts WHERE id = $1 AND user_id = $2 RETURNING id',
      [postId, userId]
    );
    if (result.rows.length === 0) {
      return res.status(403).json({ error: 'Not authorized or post not found' });
    }
    res.json({ message: 'Post deleted' });
  } catch (err) {
    next(err);
  }
});

router.post('/:id/like', authMiddleware, async (req, res, next) => {
  try {
    const postId = parseInt(req.params.id);
    await db.query('CALL like_post($1, $2)', [req.user.userId, postId]);
    res.json({ message: 'Liked' });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id/like', authMiddleware, async (req, res, next) => {
  try {
    const postId = parseInt(req.params.id);
    await db.query('CALL unlike_post($1, $2)', [req.user.userId, postId]);
    res.json({ message: 'Unliked' });
  } catch (err) {
    next(err);
  }
});

router.post('/:id/mark', authMiddleware, async (req, res, next) => {
  try {
    const postId = parseInt(req.params.id);
    await db.query('CALL mark_post($1, $2)', [req.user.userId, postId]);
    res.json({ message: 'Marked' });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id/mark', authMiddleware, async (req, res, next) => {
  try {
    const postId = parseInt(req.params.id);
    await db.query('CALL unmark_post($1, $2)', [req.user.userId, postId]);
    res.json({ message: 'Unmarked' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;