import { useState, useEffect } from 'react';
import { posts } from '../api';
import PostCard from '../components/PostCard';

export default function Home() {
  const [postList, setPostList] = useState([]);
  const [sortBy, setSortBy] = useState('likes');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const data = await posts.list(sortBy);
      setPostList(data.posts || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [sortBy]);

  const handleLike = async (postId) => {
    const post = postList.find((p) => p.id === postId);
    if (!post) return;
    try {
      if (post.user_has_liked) {
        await posts.unlike(postId);
      } else {
        await posts.like(postId);
      }
      setPostList((prev) =>
        prev.map((p) =>
          p.id === postId
            ? {
                ...p,
                user_has_liked: !p.user_has_liked,
                like_count: p.user_has_liked ? p.like_count - 1 : p.like_count + 1,
              }
            : p
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleMark = async (postId) => {
    const post = postList.find((p) => p.id === postId);
    if (!post) return;
    try {
      if (post.user_has_marked) {
        await posts.unmark(postId);
      } else {
        await posts.mark(postId);
      }
      setPostList((prev) =>
        prev.map((p) =>
          p.id === postId
            ? {
                ...p,
                user_has_marked: !p.user_has_marked,
                mark_count: p.user_has_marked ? p.mark_count - 1 : p.mark_count + 1,
              }
            : p
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="container" style={{ paddingTop: 24, paddingBottom: 48 }}>
      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        <button
          onClick={() => setSortBy('likes')}
          style={{
            padding: '8px 16px',
            borderRadius: 20,
            background: sortBy === 'likes' ? '#C0E1D2' : '#1a1a1a',
            color: sortBy === 'likes' ? '#000' : '#E5EEE4',
            fontSize: 14,
            fontWeight: 500,
          }}
        >
          Popular
        </button>
        <button
          onClick={() => setSortBy('time')}
          style={{
            padding: '8px 16px',
            borderRadius: 20,
            background: sortBy === 'time' ? '#C0E1D2' : '#1a1a1a',
            color: sortBy === 'time' ? '#000' : '#E5EEE4',
            fontSize: 14,
            fontWeight: 500,
          }}
        >
          Latest
        </button>
      </div>

      {loading && <p style={{ textAlign: 'center', color: '#888' }}>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {postList.map((post) => (
        <PostCard key={post.id} post={post} onLike={handleLike} onMark={handleMark} />
      ))}
    </div>
  );
}
