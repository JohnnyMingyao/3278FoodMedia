import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { posts } from '../api';

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
        setPost({ ...post, user_has_liked: false, like_count: post.like_count - 1 });
      } else {
        await posts.like(post.id);
        setPost({ ...post, user_has_liked: true, like_count: post.like_count + 1 });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMark = async () => {
    if (!post) return;
    try {
      if (post.user_has_marked) {
        await posts.unmark(post.id);
        setPost({ ...post, user_has_marked: false, mark_count: post.mark_count - 1 });
      } else {
        await posts.mark(post.id);
        setPost({ ...post, user_has_marked: true, mark_count: post.mark_count + 1 });
      }
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

  if (loading) return <div className="container" style={{ paddingTop: 24 }}>Loading...</div>;
  if (!post) return <div className="container" style={{ paddingTop: 24 }}>Post not found</div>;

  return (
    <div className="container" style={{ paddingTop: 24, paddingBottom: 48 }}>
      <div style={{ backgroundColor: '#111', borderRadius: 16, overflow: 'hidden', border: '1px solid #222' }}>
        <img
          src={post.image_url}
          alt={post.restaurant_name}
          style={{ width: '100%', height: 400, objectFit: 'cover' }}
          onError={(e) => { e.target.src = '/default-food.png'; }}
        />
        <div style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <img src={post.avatar_url} alt={post.username} style={{ width: 40, height: 40, borderRadius: '50%' }} />
            <span style={{ fontWeight: 600, color: '#C0E1D2' }}>{post.username}</span>
          </div>

          {post.restaurant_name && (
            <h2 style={{ fontSize: 20, color: '#F6F4E8', marginBottom: 8 }}>{post.restaurant_name}</h2>
          )}
          <p style={{ color: '#E5EEE4', fontSize: 15, lineHeight: 1.6, marginBottom: 16 }}>{post.description}</p>

          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <button onClick={handleLike} style={{ background: 'none', display: 'flex', alignItems: 'center', gap: 6, color: post.user_has_liked ? '#DC9B9B' : '#E5EEE4' }}>
              <span style={{ fontSize: 20 }}>{post.user_has_liked ? '❤️' : '🤍'}</span>
              <span>{post.like_count}</span>
            </button>
            <button onClick={handleMark} style={{ background: 'none', display: 'flex', alignItems: 'center', gap: 6, color: post.user_has_marked ? '#C0E1D2' : '#E5EEE4' }}>
              <span style={{ fontSize: 20 }}>🔖</span>
              <span>{post.user_has_marked ? 'Marked' : 'Mark'}</span>
            </button>
            <span style={{ color: '#666', fontSize: 13, marginLeft: 'auto' }}>
              {new Date(post.created_at).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 32 }}>
        <h3 style={{ fontSize: 18, marginBottom: 16, color: '#C0E1D2' }}>Comments</h3>

        <form onSubmit={handleAddComment} style={{ marginBottom: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <textarea
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            required
          />
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: '#E5EEE4' }}>
            <input type="checkbox" checked={isTasted} onChange={(e) => setIsTasted(e.target.checked)} />
            I have tasted this (已品尝)
          </label>
          <button
            type="submit"
            style={{
              alignSelf: 'flex-start',
              backgroundColor: '#C0E1D2',
              color: '#000',
              padding: '10px 24px',
              borderRadius: 8,
              fontWeight: 600,
            }}
          >
            Post Comment
          </button>
        </form>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {comments.map((comment) => (
            <div key={comment.id} style={{ backgroundColor: '#111', borderRadius: 12, padding: 16, border: '1px solid #222' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <img src={comment.avatar_url} alt={comment.username} style={{ width: 32, height: 32, borderRadius: '50%' }} />
                <span style={{ fontWeight: 600, fontSize: 14, color: '#C0E1D2' }}>{comment.username}</span>
                {comment.is_tasted && (
                  <span style={{ fontSize: 12, backgroundColor: '#C0E1D2', color: '#000', padding: '2px 8px', borderRadius: 12 }}>
                    Tasted
                  </span>
                )}
              </div>
              <p style={{ color: '#E5EEE4', fontSize: 14, lineHeight: 1.5 }}>{comment.content}</p>
              <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 13, color: '#DC9B9B' }}>❤️ {comment.like_count}</span>
                <span style={{ fontSize: 12, color: '#666', marginLeft: 'auto' }}>
                  {new Date(comment.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
          {comments.length === 0 && <p style={{ color: '#666', fontSize: 14 }}>No comments yet. Be the first!</p>}
        </div>
      </div>
    </div>
  );
}
