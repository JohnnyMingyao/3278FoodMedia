import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { posts, commentLikes } from '../api';
import './PostDetail.css';

export default function PostDetail() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isTasted, setIsTasted] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [postData, commentsData] = await Promise.all([
        posts.get(id),
        posts.comments(id),
      ]);
      setPost(postData.post);
      setComments(commentsData.comments || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleLike = async () => {
    if (!post) return;
    try {
      if (post.user_has_liked) {
        await posts.unlike(post.id);
      } else {
        await posts.like(post.id);
      }
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMark = async () => {
    if (!post) return;
    try {
      if (post.user_has_marked) {
        await posts.unmark(post.id);
      } else {
        await posts.mark(post.id);
      }
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      await posts.addComment(id, { content: newComment, is_tasted: isTasted });
      setNewComment('');
      setIsTasted(false);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCommentLike = async (commentId) => {
    try {
      await commentLikes.like(commentId);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="container" style={{ paddingTop: 24 }}>Loading...</div>;
  if (!post) return <div className="container" style={{ paddingTop: 24 }}>Post not found</div>;

  return (
    <div className="container post-detail">
      <div className="post-detail-card">
        <img
          src={post.image_url}
          alt={post.restaurant_name}
          className="post-detail-image"
          onError={(e) => { e.target.src = '/default-food.png'; }}
        />
        <div className="post-detail-content">
          <div className="post-detail-author">
            <img src={post.avatar_url} alt={post.username} className="post-detail-author-avatar" />
            <span className="post-detail-author-name">{post.username}</span>
          </div>

          {post.restaurant_name && (
            <h2 className="post-detail-restaurant">{post.restaurant_name}</h2>
          )}
          <p className="post-detail-description">{post.description}</p>

          <div className="post-detail-actions">
            <button onClick={handleLike} className="post-detail-action-btn" style={{ color: post.user_has_liked ? '#D47373' : '#666' }}>
              <span className="post-detail-action-icon">{post.user_has_liked ? '❤️' : '🤍'}</span>
              <span>{post.like_count}</span>
            </button>
            <button onClick={handleMark} className="post-detail-action-btn" style={{ color: post.user_has_marked ? '#4A9B7F' : '#666' }}>
              <span className="post-detail-action-icon">🔖</span>
              <span>{post.user_has_marked ? 'Marked' : 'Mark'}</span>
            </button>
            <span className="post-detail-date">
              {new Date(post.created_at).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      <div className="post-detail-comments">
        <h3 className="post-detail-comments-title">Comments</h3>

        <form onSubmit={handleAddComment} className="post-detail-comment-form">
          <textarea
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            required
          />
          <label className="post-detail-tasted-label">
            <input type="checkbox" checked={isTasted} onChange={(e) => setIsTasted(e.target.checked)} />
            I have tasted this (已品尝)
          </label>
          <button type="submit" className="post-detail-submit-btn">
            Post Comment
          </button>
        </form>

        <div className="post-detail-comment-list">
          {comments.map((comment) => (
            <div key={comment.id} className="post-detail-comment">
              <div className="post-detail-comment-header">
                <img src={comment.avatar_url} alt={comment.username} className="post-detail-comment-avatar" />
                <span className="post-detail-comment-username">{comment.username}</span>
                {comment.is_tasted && (
                  <span className="post-detail-comment-badge">Tasted</span>
                )}
              </div>
              <p className="post-detail-comment-content">{comment.content}</p>
              <div className="post-detail-comment-actions">
                <button
                  onClick={() => handleCommentLike(comment.id)}
                  className="post-detail-comment-like-btn"
                >
                  <span>👍</span>
                  <span>{comment.like_count}</span>
                </button>
                <span className="post-detail-comment-date">
                  {new Date(comment.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
          {comments.length === 0 && <p className="post-detail-empty">No comments yet. Be the first!</p>}
        </div>
      </div>
    </div>
  );
}
