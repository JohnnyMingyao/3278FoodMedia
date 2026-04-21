-- ============================================
-- Fix: 评论点赞改为纯计数器模式
-- 在运行中的 PostgreSQL 中直接执行此脚本
-- ============================================

-- 1. 删除旧的评论点赞关联表（如果存在）
DROP TABLE IF EXISTS comment_likes CASCADE;

-- 2. 删除旧的评论点赞相关存储过程/函数
DROP FUNCTION IF EXISTS get_post_comments(INT, INT);
DROP PROCEDURE IF EXISTS like_comment(INT, INT);
DROP PROCEDURE IF EXISTS unlike_comment(INT, INT);

-- 3. 删除旧的触发器和触发器函数
DROP TRIGGER IF EXISTS trg_comment_like_count ON comment_likes;
DROP FUNCTION IF EXISTS trg_fn_update_comment_like_count();

-- 4. 重新创建 get_post_comments（只接收 post_id，不再返回 user_has_liked）
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

-- 5. 创建新的评论点赞计数存储过程
CREATE OR REPLACE PROCEDURE increment_comment_likes(p_comment_id INT)
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE comments SET like_count = like_count + 1 WHERE id = p_comment_id;
END;
$$;

-- 验证：查看当前存储过程列表
-- \df
