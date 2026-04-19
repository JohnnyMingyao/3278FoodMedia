-- ============================================
-- Trigger Functions
-- ============================================

-- 1. Update posts.like_count when likes changes
CREATE OR REPLACE FUNCTION trg_fn_update_post_like_count()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE posts SET like_count = like_count + 1 WHERE id = NEW.post_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE posts SET like_count = GREATEST(like_count - 1, 0) WHERE id = OLD.post_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$;

CREATE TRIGGER trg_post_like_count
AFTER INSERT OR DELETE ON likes
FOR EACH ROW
EXECUTE FUNCTION trg_fn_update_post_like_count();

-- 2. Update posts.mark_count when marks changes
CREATE OR REPLACE FUNCTION trg_fn_update_post_mark_count()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE posts SET mark_count = mark_count + 1 WHERE id = NEW.post_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE posts SET mark_count = GREATEST(mark_count - 1, 0) WHERE id = OLD.post_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$;

CREATE TRIGGER trg_post_mark_count
AFTER INSERT OR DELETE ON marks
FOR EACH ROW
EXECUTE FUNCTION trg_fn_update_post_mark_count();

-- 3. Update comments.like_count when comment_likes changes
CREATE OR REPLACE FUNCTION trg_fn_update_comment_like_count()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE comments SET like_count = like_count + 1 WHERE id = NEW.comment_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE comments SET like_count = GREATEST(like_count - 1, 0) WHERE id = OLD.comment_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$;

CREATE TRIGGER trg_comment_like_count
AFTER INSERT OR DELETE ON comment_likes
FOR EACH ROW
EXECUTE FUNCTION trg_fn_update_comment_like_count();

-- 4. Update user_stats when posts changes
CREATE OR REPLACE FUNCTION trg_fn_update_user_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO user_stats (user_id, post_count, total_likes_received, total_marks_received)
        VALUES (NEW.user_id, 1, 0, 0)
        ON CONFLICT (user_id) DO UPDATE SET
            post_count = user_stats.post_count + 1,
            updated_at = NOW();
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE user_stats SET
            post_count = GREATEST(user_stats.post_count - 1, 0),
            total_likes_received = GREATEST(user_stats.total_likes_received - OLD.like_count, 0),
            total_marks_received = GREATEST(user_stats.total_marks_received - OLD.mark_count, 0),
            updated_at = NOW()
        WHERE user_id = OLD.user_id;
    ELSIF TG_OP = 'UPDATE' THEN
        UPDATE user_stats SET
            total_likes_received = user_stats.total_likes_received - OLD.like_count + NEW.like_count,
            total_marks_received = user_stats.total_marks_received - OLD.mark_count + NEW.mark_count,
            updated_at = NOW()
        WHERE user_id = NEW.user_id;
    END IF;
    RETURN NULL;
END;
$$;

CREATE TRIGGER trg_user_stats
AFTER INSERT OR DELETE OR UPDATE OF like_count, mark_count ON posts
FOR EACH ROW
EXECUTE FUNCTION trg_fn_update_user_stats();

-- 5. Update user_stats comment_count when comments changes
CREATE OR REPLACE FUNCTION trg_fn_update_user_comment_count()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO user_stats (user_id, comment_count)
        VALUES (NEW.user_id, 1)
        ON CONFLICT (user_id) DO UPDATE SET
            comment_count = user_stats.comment_count + 1,
            updated_at = NOW();
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE user_stats SET
            comment_count = GREATEST(user_stats.comment_count - 1, 0),
            updated_at = NOW()
        WHERE user_id = OLD.user_id;
    END IF;
    RETURN NULL;
END;
$$;

CREATE TRIGGER trg_user_comment_count
AFTER INSERT OR DELETE ON comments
FOR EACH ROW
EXECUTE FUNCTION trg_fn_update_user_comment_count();

-- 6. Refresh materialized view when posts changes
CREATE OR REPLACE FUNCTION trg_fn_refresh_mv_top_posts()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_top_posts;
    RETURN NULL;
END;
$$;

CREATE TRIGGER trg_refresh_mv_top_posts
AFTER INSERT OR DELETE OR UPDATE OF like_count ON posts
FOR EACH STATEMENT
EXECUTE FUNCTION trg_fn_refresh_mv_top_posts();
