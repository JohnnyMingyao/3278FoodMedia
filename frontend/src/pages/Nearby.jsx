import { useState } from 'react';
import { Link } from 'react-router-dom';
import { nearby } from '../api';
import './Nearby.css';

export default function Nearby() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [locationName, setLocationName] = useState('');

  const fetchNearby = () => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported');
      return;
    }
    setLoading(true);
    setError('');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const data = await nearby.search(pos.coords.latitude, pos.coords.longitude);
          setPosts(data.posts || []);
          setLocationName(`${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      },
      () => {
        setError('Unable to get location. Please allow location access.');
        setLoading(false);
      }
    );
  };

  return (
    <div className="container nearby">
      <div className="nearby-header">
        <h2 className="nearby-title">Nearby Food (3km)</h2>
        <button
          onClick={fetchNearby}
          disabled={loading}
          className="nearby-search-btn"
        >
          {loading ? 'Searching...' : 'Find Near Me'}
        </button>
      </div>

      {locationName && (
        <p className="nearby-location">
          Location: {locationName}
        </p>
      )}
      {error && <p className="nearby-error">{error}</p>}

      {posts.length === 0 && !loading && !error && (
        <p className="nearby-empty">Click "Find Near Me" to discover marked restaurants within 3km.</p>
      )}

      <div className="nearby-list">
        {posts.map((post) => (
          <Link
            key={post.id}
            to={`/post/${post.id}`}
            className="nearby-card"
          >
            <img
              src={post.image_url}
              alt={post.restaurant_name}
              className="nearby-card-image"
              onError={(e) => { e.target.src = '/default-food.png'; }}
            />
            <div className="nearby-card-content">
              <h4 className="nearby-card-title">{post.restaurant_name}</h4>
              <p className="nearby-card-desc">{post.description}</p>
              <div className="nearby-card-meta">
                <span>❤️ {post.like_count || 0}</span>
                <span>by {post.username}</span>
                <span className="nearby-card-distance">
                  {Math.round(post.distance_meters)}m away
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
