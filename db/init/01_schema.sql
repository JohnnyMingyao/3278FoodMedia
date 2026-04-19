-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- ============================================
-- Users table
-- ============================================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    avatar_url TEXT DEFAULT '/default-avatar.png',
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- Posts table with PostGIS location
-- ============================================
CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    image_url TEXT NOT NULL DEFAULT '/default-food.png',
    description TEXT,
    restaurant_name VARCHAR(255),
    location GEOGRAPHY(POINT, 4326),
    like_count INTEGER DEFAULT 0,
    mark_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- Likes table (many-to-many: users <-> posts)
-- ============================================
CREATE TABLE likes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, post_id)
);

-- ============================================
-- Marks table (many-to-many: users <-> posts)
-- ============================================
CREATE TABLE marks (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, post_id)
);

-- ============================================
-- Comments table
-- ============================================
CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    is_tasted BOOLEAN DEFAULT FALSE,
    like_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- Comment likes table
-- ============================================
CREATE TABLE comment_likes (
    id SERIAL PRIMARY KEY,
    comment_id INTEGER REFERENCES comments(id) ON DELETE CASCADE NOT NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(comment_id, user_id)
);

-- ============================================
-- User stats table (maintained by triggers)
-- ============================================
CREATE TABLE user_stats (
    user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    post_count INTEGER DEFAULT 0,
    total_likes_received INTEGER DEFAULT 0,
    total_marks_received INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- Materialized view: Top posts leaderboard
-- ============================================
CREATE MATERIALIZED VIEW mv_top_posts AS
SELECT
    p.id,
    p.user_id,
    u.username,
    u.avatar_url,
    p.image_url,
    p.description,
    p.restaurant_name,
    p.like_count,
    p.mark_count,
    p.created_at
FROM posts p
JOIN users u ON p.user_id = u.id
ORDER BY p.like_count DESC, p.created_at DESC;

CREATE UNIQUE INDEX idx_mv_top_posts_id ON mv_top_posts(id);

-- ============================================
-- Indexes for performance
-- ============================================
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_posts_like_count ON posts(like_count DESC);
CREATE INDEX idx_likes_post_id ON likes(post_id);
CREATE INDEX idx_likes_user_id ON likes(user_id);
CREATE INDEX idx_marks_user_id ON marks(user_id);
CREATE INDEX idx_marks_post_id ON marks(post_id);
CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);
CREATE INDEX idx_comment_likes_comment_id ON comment_likes(comment_id);

-- PostGIS spatial index
CREATE INDEX idx_posts_location ON posts USING GIST(location);
