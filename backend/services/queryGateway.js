const db = require('../db');

// Maps action names to stored procedures or raw SQL.
// All read operations go through here so route handlers stay clean.

const QUERY_MAP = {
  feed: {
    type: 'function',
    sql: 'SELECT * FROM get_user_feed($1, $2, $3, $4)',
    params: ['user_id', 'sort_by', 'limit', 'offset'],
  },
  post_detail: {
    type: 'raw',
    sql: `SELECT p.*, u.username, u.avatar_url,
            EXISTS(SELECT 1 FROM likes l WHERE l.post_id = p.id AND l.user_id = $2) as user_has_liked,
            EXISTS(SELECT 1 FROM marks m WHERE m.post_id = p.id AND m.user_id = $2) as user_has_marked
          FROM posts p JOIN users u ON p.user_id = u.id WHERE p.id = $1`,
    params: ['post_id', 'user_id'],
  },
  nearby: {
    type: 'function',
    sql: 'SELECT * FROM get_nearby_marks($1, $2, $3, $4)',
    params: ['user_id', 'lat', 'lng', 'radius'],
  },
  comments: {
    type: 'function',
    sql: 'SELECT * FROM get_post_comments($1)',
    params: ['post_id'],
  },
  profile: {
    type: 'function',
    sql: 'SELECT * FROM get_user_profile_stats($1)',
    params: ['user_id'],
  },
  user_posts: {
    type: 'raw',
    sql: `SELECT p.*, u.username, u.avatar_url,
            EXISTS(SELECT 1 FROM likes l WHERE l.post_id = p.id AND l.user_id = $2) as user_has_liked,
            EXISTS(SELECT 1 FROM marks m WHERE m.post_id = p.id AND m.user_id = $2) as user_has_marked
          FROM posts p JOIN users u ON p.user_id = u.id
          WHERE p.user_id = $1 ORDER BY p.created_at DESC`,
    params: ['target_user_id', 'viewer_user_id'],
  },
  marks: {
    type: 'raw',
    sql: `SELECT p.*, u.username, u.avatar_url,
            EXISTS(SELECT 1 FROM likes l WHERE l.post_id = p.id AND l.user_id = $1) as user_has_liked,
            TRUE as user_has_marked
          FROM posts p
          JOIN marks m ON p.id = m.post_id AND m.user_id = $1
          JOIN users u ON p.user_id = u.id
          ORDER BY p.like_count DESC`,
    params: ['user_id'],
  },
  top_posts: {
    type: 'function',
    sql: 'SELECT * FROM get_top_posts($1)',
    params: ['limit'],
  },
  top_users: {
    type: 'function',
    sql: 'SELECT * FROM get_top_users($1)',
    params: ['limit'],
  },
  clusters: {
    type: 'function',
    sql: 'SELECT * FROM get_geo_clusters($1, $2)',
    params: ['min_points', 'eps'],
  },
};

async function execute(action, params = {}) {
  const queryDef = QUERY_MAP[action];
  if (!queryDef) {
    throw new Error(`Unknown query action: ${action}`);
  }

  const values = queryDef.params.map((key) => params[key]);
  const result = await db.query(queryDef.sql, values);
  return result.rows;
}

module.exports = { execute, QUERY_MAP };