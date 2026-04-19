import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { users } from '../api';

export default function Marked() {
  const [posts, setPosts] = useState([]);
  const [sortBy, setSortBy] = useState('likes');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    users.marks()
      .then((data) => setPosts(data.posts || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const sortedPosts = [...posts].sort((a, b) => {
    if (sortBy === 'likes') return (b.like_count || 0) - (a.like_count || 0);
    return new Date(b.created_at) - new Date(a.created_at);
  });

  if (loading) return <div className="container" style={{ paddingTop: 24 }}>Loading...</div>;

  return (
    <div className="container" style={{ paddingTop: 24, paddingBottom: 48 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ fontSize: 24 }}>Marked Restaurants</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => setSortBy('likes')}
            style={{
              padding: '6px 14px',
              borderRadius: 16,
              background: sortBy === 'likes' ? '#C0E1D2' : '#1a1a1a',
              color: sortBy === 'likes' ? '#000' : '#E5EEE4',
              fontSize: 13,
            }}
          >
            By Likes
          </button>
          <button
            onClick={() => setSortBy('time')}
            style={{
              padding: '6px 14px',
              borderRadius: 16,
              background: sortBy === 'time' ? '#C0E1D2' : '#1a1a1a',
              color: sortBy === 'time' ? '#000' : '#E5EEE4',
              fontSize: 13,
            }}
          >
            By Time
          </button>
        </div>
      </div>

      {sortedPosts.length === 0 && <p style={{ color: '#666' }}>No marked restaurants yet.</p>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {sortedPosts.map((post) => (
          <Link
            key={post.id}
            to={`/post/${post.id}`}
            style={{
              display: 'flex',
              gap: 16,
              backgroundColor: '#111',
              borderRadius: 12,
              padding: 16,
              border: '1px solid #222',
              textDecoration: 'none',
            }}
          >
            <img
              src={post.image_url}
              alt={post.restaurant_name}
              style={{ width: 80, height: 80, borderRadius: 8, objectFit: 'cover' }}
              onError={(e) => { e.target.src = '/default-food.png'; }}
            />
            <div style={{ flex: 1 }}>
              <h4 style={{ color: '#F6F4E8', marginBottom: 4 }}>{post.restaurant_name}</h4>
              <p style={{ color: '#888', fontSize: 13, marginBottom: 8, lineClamp: 2, overflow: 'hidden' }}>
                {post.description}
              </p>
              <div style={{ display: 'flex', gap: 12, fontSize: 13, color: '#666' }}>
                <span>❤️ {post.like_count || 0}</span>
                <span>by {post.username}</span>
                <span>{new Date(post.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
