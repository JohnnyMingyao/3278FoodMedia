import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { posts } from '../api';

export default function CreatePost() {
  const [form, setForm] = useState({
    image_url: '',
    description: '',
    restaurant_name: '',
    lat: '',
    lng: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const body = {
        image_url: form.image_url || undefined,
        description: form.description,
        restaurant_name: form.restaurant_name,
      };
      if (form.lat && form.lng) {
        body.lat = parseFloat(form.lat);
        body.lng = parseFloat(form.lng);
      }
      await posts.create(body);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm({
          ...form,
          lat: pos.coords.latitude.toFixed(6),
          lng: pos.coords.longitude.toFixed(6),
        });
      },
      () => setError('Unable to retrieve your location')
    );
  };

  return (
    <div className="container" style={{ paddingTop: 24, paddingBottom: 48 }}>
      <h2 style={{ fontSize: 24, marginBottom: 24 }}>Create Post</h2>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 600 }}>
        <div>
          <label style={{ display: 'block', fontSize: 14, color: '#888', marginBottom: 6 }}>Image URL</label>
          <input
            type="text"
            placeholder="https://example.com/food.jpg (optional)"
            value={form.image_url}
            onChange={(e) => setForm({ ...form, image_url: e.target.value })}
          />
          {form.image_url && (
            <img
              src={form.image_url}
              alt="Preview"
              style={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: 8, marginTop: 8 }}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          )}
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 14, color: '#888', marginBottom: 6 }}>Restaurant Name</label>
          <input
            type="text"
            placeholder="Where did you eat?"
            value={form.restaurant_name}
            onChange={(e) => setForm({ ...form, restaurant_name: e.target.value })}
            required
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 14, color: '#888', marginBottom: 6 }}>Description</label>
          <textarea
            placeholder="Tell us about your experience..."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            required
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 14, color: '#888', marginBottom: 6 }}>Location</label>
          <div style={{ display: 'flex', gap: 12 }}>
            <input type="text" placeholder="Latitude" value={form.lat} onChange={(e) => setForm({ ...form, lat: e.target.value })} />
            <input type="text" placeholder="Longitude" value={form.lng} onChange={(e) => setForm({ ...form, lng: e.target.value })} />
          </div>
          <button
            type="button"
            onClick={useCurrentLocation}
            style={{
              marginTop: 8,
              background: 'none',
              color: '#C0E1D2',
              fontSize: 13,
              textDecoration: 'underline',
            }}
          >
            Use current location
          </button>
        </div>

        {error && <p style={{ color: 'red', fontSize: 14 }}>{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          style={{
            backgroundColor: '#C0E1D2',
            color: '#000',
            padding: '14px',
            borderRadius: 8,
            fontWeight: 600,
            fontSize: 15,
            opacity: submitting ? 0.7 : 1,
          }}
        >
          {submitting ? 'Posting...' : 'Publish Post'}
        </button>
      </form>
    </div>
  );
}
