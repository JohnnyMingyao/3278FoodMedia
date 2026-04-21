import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AvatarPicker, { DEFAULT_AVATARS } from '../components/AvatarPicker';

export default function Register() {
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [avatarUrl, setAvatarUrl] = useState(DEFAULT_AVATARS[0]);
  const [customAvatar, setCustomAvatar] = useState('');
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    try {
      const payload = { ...form, avatar_url: customAvatar.trim() || avatarUrl };
      await register(payload);
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <h1 style={{ fontSize: 32, marginBottom: 8, textAlign: 'center' }}>Foodie Share</h1>
        <p style={{ color: '#999', textAlign: 'center', marginBottom: 32 }}>Create a new account</p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <input
            type="text"
            placeholder="Username"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />

          <div style={{ backgroundColor: '#fff', borderRadius: 12, padding: 16, border: '1px solid #E8E8E0' }}>
            <AvatarPicker
              selected={avatarUrl}
              onSelect={setAvatarUrl}
              customUrl={customAvatar}
              onCustomUrlChange={setCustomAvatar}
            />
          </div>

          {error && <p style={{ color: 'red', fontSize: 14 }}>{error}</p>}
          <button
            type="submit"
            style={{
              backgroundColor: '#C0E1D2',
              color: '#1A3A2A',
              padding: '14px',
              borderRadius: 8,
              fontWeight: 600,
              fontSize: 15,
            }}
          >
            Sign Up
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 24, color: '#999', fontSize: 14 }}>
          Already have an account? <Link to="/login" style={{ color: '#4A9B7F' }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
