import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { users } from '../api';
import './Marked.css';

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
    <div className="container marked">
      <div className="marked-header">
        <h2 className="marked-title">Marked Restaurants</h2>
        <div className="marked-sort-btns">
          <button
            onClick={() => setSortBy('likes')}
            className={`marked-sort-btn ${sortBy === 'likes' ? 'active' : ''}`}
          >
            By Likes
          </button>
          <button
            onClick={() => setSortBy('time')}
            className={`marked-sort-btn ${sortBy === 'time' ? 'active' : ''}`}
          >
            By Time
          </button>
        </div>
      </div>

      {sortedPosts.length === 0 && <p className="marked-empty">No marked restaurants yet.</p>}

      <div className="marked-list">
        {sortedPosts.map((post) => (
          <Link
            key={post.id}
            to={`/post/${post.id}`}
            className="marked-card"
          >
            <img
              src={post.image_url}
              alt={post.restaurant_name}
              className="marked-card-image"
              onError={(e) => { e.target.src = '/default-food.png'; }}
            />
            <div className="marked-card-content">
              <h4 className="marked-card-title">{post.restaurant_name}</h4>
              <p className="marked-card-desc">
                {post.description}
              </p>
              <div className="marked-card-meta">
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
