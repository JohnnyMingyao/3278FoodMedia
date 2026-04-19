-- ============================================
-- Stored Procedures for Business Logic
-- ============================================

-- 1. Like a post
CREATE OR REPLACE PROCEDURE like_post(p_user_id INT, p_post_id INT)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO likes (user_id, post_id) VALUES (p_user_id, p_post_id)
    ON CONFLICT (user_id, post_id) DO NOTHING;
END;
$$;

-- 2. Unlike a post
CREATE OR REPLACE PROCEDURE unlike_post(p_user_id INT, p_post_id INT)
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM likes WHERE user_id = p_user_id AND post_id = p_post_id;
END;
$$;

-- 3. Mark a post
CREATE OR REPLACE PROCEDURE mark_post(p_user_id INT, p_post_id INT)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO marks (user_id, post_id) VALUES (p_user_id, p_post_id)
    ON CONFLICT (user_id, post_id) DO NOTHING;
END;
$$;

-- 4. Unmark a post
CREATE OR REPLACE PROCEDURE unmark_post(p_user_id INT, p_post_id INT)
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM marks WHERE user_id = p_user_id AND post_id = p_post_id;
END;
$$;

-- 5. Add a comment
CREATE OR REPLACE PROCEDURE add_comment(
    p_user_id INT,
    p_post_id INT,
    p_content TEXT,
    p_is_tasted BOOLEAN DEFAULT FALSE
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO comments (post_id, user_id, content, is_tasted)
    VALUES (p_post_id, p_user_id, p_content, p_is_tasted);
END;
$$;

-- 6. Like a comment
CREATE OR REPLACE PROCEDURE like_comment(p_user_id INT, p_comment_id INT)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO comment_likes (comment_id, user_id) VALUES (p_comment_id, p_user_id)
    ON CONFLICT (comment_id, user_id) DO NOTHING;
END;
$$;

-- 7. Unlike a comment
CREATE OR REPLACE PROCEDURE unlike_comment(p_user_id INT, p_comment_id INT)
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM comment_likes WHERE user_id = p_user_id AND comment_id = p_comment_id;
END;
$$;

-- 8. Get user feed with like/mark status
CREATE OR REPLACE FUNCTION get_user_feed(
    p_user_id INT,
    p_sort_by VARCHAR DEFAULT 'likes',
    p_limit INT DEFAULT 20,
    p_offset INT DEFAULT 0
)
RETURNS TABLE (
    id INT,
    user_id INT,
    username VARCHAR,
    avatar_url TEXT,
    image_url TEXT,
    description TEXT,
    restaurant_name VARCHAR,
    like_count INT,
    mark_count INT,
    user_has_liked BOOLEAN,
    user_has_marked BOOLEAN,
    created_at TIMESTAMP
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
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
        EXISTS(SELECT 1 FROM likes l WHERE l.post_id = p.id AND l.user_id = p_user_id) AS user_has_liked,
        EXISTS(SELECT 1 FROM marks m WHERE m.post_id = p.id AND m.user_id = p_user_id) AS user_has_marked,
        p.created_at
    FROM posts p
    JOIN users u ON p.user_id = u.id
    ORDER BY
        CASE WHEN p_sort_by = 'likes' THEN p.like_count END DESC,
        CASE WHEN p_sort_by = 'time' THEN p.created_at END DESC,
        p.created_at DESC
    LIMIT p_limit OFFSET p_offset;
END;
$$;

-- 9. Get nearby marked posts
CREATE OR REPLACE FUNCTION get_nearby_marks(
    p_user_id INT,
    p_lat DOUBLE PRECISION,
    p_lng DOUBLE PRECISION,
    p_radius_meters INT DEFAULT 3000
)
RETURNS TABLE (
    id INT,
    user_id INT,
    username VARCHAR,
    avatar_url TEXT,
    image_url TEXT,
    description TEXT,
    restaurant_name VARCHAR,
    like_count INT,
    mark_count INT,
    distance_meters DOUBLE PRECISION,
    created_at TIMESTAMP
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
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
        ST_Distance(
            p.location::geography,
            ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography
        ) AS distance_meters,
        p.created_at
    FROM posts p
    JOIN marks m ON p.id = m.post_id AND m.user_id = p_user_id
    JOIN users u ON p.user_id = u.id
    WHERE ST_DWithin(
        p.location::geography,
        ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography,
        p_radius_meters
    )
    ORDER BY p.like_count DESC, distance_meters ASC;
END;
$$;

-- 10. Get post comments with author info
CREATE OR REPLACE FUNCTION get_post_comments(p_post_id INT)
RETURNS TABLE (
    id INT,
    post_id INT,
    user_id INT,
    username VARCHAR,
    avatar_url TEXT,
    content TEXT,
    is_tasted BOOLEAN,
    like_count INT,
    created_at TIMESTAMP
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        c.id,
        c.post_id,
        c.user_id,
        u.username,
        u.avatar_url,
        c.content,
        c.is_tasted,
        c.like_count,
        c.created_at
    FROM comments c
    JOIN users u ON c.user_id = u.id
    WHERE c.post_id = p_post_id
    ORDER BY c.created_at DESC;
END;
$$;

-- 11. Get user profile stats
CREATE OR REPLACE FUNCTION get_user_profile_stats(p_user_id INT)
RETURNS TABLE (
    user_id INT,
    username VARCHAR,
    avatar_url TEXT,
    post_count BIGINT,
    total_likes_received BIGINT,
    total_marks_received BIGINT,
    total_comments_made BIGINT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        u.id,
        u.username,
        u.avatar_url,
        COALESCE(us.post_count, 0)::BIGINT,
        COALESCE(us.total_likes_received, 0)::BIGINT,
        COALESCE(us.total_marks_received, 0)::BIGINT,
        COALESCE(us.comment_count, 0)::BIGINT
    FROM users u
    LEFT JOIN user_stats us ON u.id = us.user_id
    WHERE u.id = p_user_id;
END;
$$;

-- 12. Get top posts leaderboard
CREATE OR REPLACE FUNCTION get_top_posts(p_limit INT DEFAULT 10)
RETURNS TABLE (
    id INT,
    user_id INT,
    username VARCHAR,
    avatar_url TEXT,
    image_url TEXT,
    description TEXT,
    restaurant_name VARCHAR,
    like_count INT,
    created_at TIMESTAMP
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.id,
        p.user_id,
        u.username,
        u.avatar_url,
        p.image_url,
        p.description,
        p.restaurant_name,
        p.like_count,
        p.created_at
    FROM posts p
    JOIN users u ON p.user_id = u.id
    ORDER BY p.like_count DESC, p.created_at DESC
    LIMIT p_limit;
END;
$$;

-- 13. Get top users leaderboard
CREATE OR REPLACE FUNCTION get_top_users(p_limit INT DEFAULT 10)
RETURNS TABLE (
    user_id INT,
    username VARCHAR,
    avatar_url TEXT,
    post_count INT,
    total_likes_received INT,
    total_marks_received INT,
    comment_count INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        us.user_id,
        u.username,
        u.avatar_url,
        us.post_count,
        us.total_likes_received,
        us.total_marks_received,
        us.comment_count
    FROM user_stats us
    JOIN users u ON us.user_id = u.id
    ORDER BY us.total_likes_received DESC, us.post_count DESC
    LIMIT p_limit;
END;
$$;

-- 14. Get geographic clusters of marked posts using DBSCAN
CREATE OR REPLACE FUNCTION get_geo_clusters(
    p_min_points INT DEFAULT 3,
    p_eps_meters INT DEFAULT 500
)
RETURNS TABLE (
    cluster_id INT,
    center_lat DOUBLE PRECISION,
    center_lng DOUBLE PRECISION,
    point_count BIGINT,
    avg_likes NUMERIC
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    WITH clustered AS (
        SELECT
            p.id,
            p.like_count,
            ST_Y(p.location::geometry) AS lat,
            ST_X(p.location::geometry) AS lng,
            ST_ClusterDBSCAN(p.location::geometry, p_eps_meters, p_min_points)
                OVER () AS cid
        FROM posts p
        WHERE p.location IS NOT NULL
    )
    SELECT
        c.cid::INT AS cluster_id,
        AVG(c.lat)::DOUBLE PRECISION AS center_lat,
        AVG(c.lng)::DOUBLE PRECISION AS center_lng,
        COUNT(*)::BIGINT AS point_count,
        AVG(c.like_count)::NUMERIC AS avg_likes
    FROM clustered c
    WHERE c.cid IS NOT NULL
    GROUP BY c.cid
    ORDER BY point_count DESC;
END;
$$;
