import { useState } from 'react';
import { Link } from 'react-router-dom';
import { nearby } from '../api';

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
    <div className="container" style={{ paddingTop: 24, paddingBottom: 48 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ fontSize: 24 }}>Nearby Food (3km)</h2>
        <button
          onClick={fetchNearby}
          disabled={loading}
          style={{
            backgroundColor: '#C0E1D2',
            color: '#000',
            padding: '10px 20px',
            borderRadius: 8,
            fontWeight: 600,
            fontSize: 14,
          }}
        >
          {loading ? 'Searching...' : 'Find Near Me'}
        </button>
      </div>

      {locationName && (
        <p style={{ color: '#888', fontSize: 13, marginBottom: 16 }}>
          Location: {locationName}
        </p>
      )}
      {error && <p style={{ color: 'red', marginBottom: 16 }}>{error}</p>}

      {posts.length === 0 && !loading && !error && (
        <p style={{ color: '#666' }}>Click "Find Near Me" to discover marked restaurants within 3km.</p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {posts.map((post) => (
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
              <p style={{ color: '#888', fontSize: 13, marginBottom: 8 }}>{post.description}</p>
              <div style={{ display: 'flex', gap: 12, fontSize: 13, color: '#666' }}>
                <span>❤️ {post.like_count || 0}</span>
                <span>by {post.username}</span>
                <span style={{ color: '#C0E1D2' }}>
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
