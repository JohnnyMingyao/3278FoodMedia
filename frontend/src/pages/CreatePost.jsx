import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { posts } from '../api';
import './CreatePost.css';

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
    <div className="container create-post">
      <h2 className="create-post-title">Create Post</h2>

      <form onSubmit={handleSubmit} className="create-post-form">
        <div className="create-post-field">
          <label className="create-post-label">Image URL</label>
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
              className="create-post-preview"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          )}
        </div>

        <div className="create-post-field">
          <label className="create-post-label">Restaurant Name</label>
          <input
            type="text"
            placeholder="Where did you eat?"
            value={form.restaurant_name}
            onChange={(e) => setForm({ ...form, restaurant_name: e.target.value })}
            required
          />
        </div>

        <div className="create-post-field">
          <label className="create-post-label">Description</label>
          <textarea
            placeholder="Tell us about your experience..."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            required
          />
        </div>

        <div className="create-post-field">
          <label className="create-post-label">Location</label>
          <div className="create-post-location-row">
            <input type="text" placeholder="Latitude" value={form.lat} onChange={(e) => setForm({ ...form, lat: e.target.value })} />
            <input type="text" placeholder="Longitude" value={form.lng} onChange={(e) => setForm({ ...form, lng: e.target.value })} />
          </div>
          <button
            type="button"
            onClick={useCurrentLocation}
            className="create-post-location-btn"
          >
            Use current location
          </button>
        </div>

        {error && <p className="create-post-error">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="create-post-submit"
          style={{ opacity: submitting ? 0.7 : 1 }}
        >
          {submitting ? 'Posting...' : 'Publish Post'}
        </button>
      </form>
    </div>
  );
}
