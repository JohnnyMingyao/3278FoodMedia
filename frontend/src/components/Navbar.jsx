import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    height: 56,
    backgroundColor: 'rgba(0,0,0,0.9)',
    backdropFilter: 'blur(10px)',
    borderBottom: '1px solid #222',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 16px',
    zIndex: 100,
  };

  const linkStyle = {
    color: '#E5EEE4',
    fontSize: 14,
    fontWeight: 500,
    padding: '8px 12px',
    borderRadius: 8,
    textDecoration: 'none',
  };

  const activeStyle = {
    ...linkStyle,
    backgroundColor: '#C0E1D2',
    color: '#000',
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav style={navStyle}>
      <Link to="/" style={{ fontFamily: 'Helvetica', fontSize: 20, fontWeight: 700, color: '#C0E1D2', textDecoration: 'none' }}>
        Foodie Share
      </Link>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <Link to="/" style={isActive('/') ? activeStyle : linkStyle}>Home</Link>
        <Link to="/nearby" style={isActive('/nearby') ? activeStyle : linkStyle}>Nearby</Link>
        <Link to="/marked" style={isActive('/marked') ? activeStyle : linkStyle}>Marked</Link>
        <Link to="/create" style={isActive('/create') ? activeStyle : linkStyle}>Post</Link>
        <Link to="/analytics" style={isActive('/analytics') ? activeStyle : linkStyle}>Analytics</Link>
        <Link to="/profile" style={isActive('/profile') ? activeStyle : linkStyle}>{user?.username}</Link>
        <button
          onClick={logout}
          style={{ ...linkStyle, background: 'none', color: '#DC9B9B' }}
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
