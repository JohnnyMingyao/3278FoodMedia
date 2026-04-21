import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(form);
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <h1 style={{ fontSize: 32, marginBottom: 8, textAlign: 'center' }}>Foodie Share</h1>
        <p style={{ color: '#999', textAlign: 'center', marginBottom: 32 }}>Sign in to your account</p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <input
            type="text"
            placeholder="Username"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
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
            Sign In
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 24, color: '#999', fontSize: 14 }}>
          Don't have an account? <Link to="/register" style={{ color: '#4A9B7F' }}>Sign up</Link>
        </p>
      </div>
    </div>
  );
}
