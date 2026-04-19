import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { users } from '../api';
import PostCard from '../components/PostCard';

export default function MyProfile() {
  const [profile, setProfile] = useState(null);
  const [postList, setPostList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingAvatar, setEditingAvatar] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profileData = await users.profile();
        setProfile(profileData.profile);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!profile?.username) return;
    users.getPosts(profile.username)
      .then((data) => setPostList(data.posts || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [profile]);

  const handleAvatarUpdate = async () => {
    if (!avatarUrl.trim()) return;
    try {
      const data = await users.updateAvatar(avatarUrl.trim());
      setProfile({ ...profile, avatar_url: data.user.avatar_url });
      setEditingAvatar(false);
      setAvatarUrl('');
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div className="container" style={{ paddingTop: 24 }}>Loading...</div>;
  if (!profile) return <div className="container" style={{ paddingTop: 24 }}>Error loading profile</div>;

  return (
    <div className="container" style={{ paddingTop: 24, paddingBottom: 48 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, backgroundColor: '#111', padding: 24, borderRadius: 16, border: '1px solid #222' }}>
        <div style={{ position: 'relative' }}>
          <img
            src={profile.avatar_url}
            alt={profile.username}
            style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', border: '2px solid #C0E1D2' }}
          />
          <button
            onClick={() => { setEditingAvatar(!editingAvatar); setAvatarUrl(profile.avatar_url || ''); }}
            style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              width: 28,
              height: 28,
              borderRadius: '50%',
              backgroundColor: '#C0E1D2',
              color: '#000',
              border: '2px solid #111',
              fontSize: 12,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title="Edit avatar"
          >
            ✎
          </button>
        </div>
        <div>
          <h2 style={{ fontSize: 24, marginBottom: 4 }}>{profile.username}</h2>
          <div style={{ display: 'flex', gap: 20, marginTop: 8 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#C0E1D2' }}>{profile.post_count || 0}</div>
              <div style={{ fontSize: 12, color: '#888' }}>Posts</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#C0E1D2' }}>{profile.total_likes_received || 0}</div>
              <div style={{ fontSize: 12, color: '#888' }}>Likes</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#C0E1D2' }}>{profile.comment_count || 0}</div>
              <div style={{ fontSize: 12, color: '#888' }}>Comments</div>
            </div>
          </div>
        </div>
      </div>

      {editingAvatar && (
        <div style={{ marginBottom: 24, backgroundColor: '#111', padding: 16, borderRadius: 12, border: '1px solid #222' }}>
          <label style={{ display: 'block', fontSize: 14, color: '#888', marginBottom: 8 }}>Avatar URL</label>
          <div style={{ display: 'flex', gap: 12 }}>
            <input
              type="text"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://example.com/avatar.jpg"
              style={{ flex: 1 }}
            />
            <button
              onClick={handleAvatarUpdate}
              style={{
                backgroundColor: '#C0E1D2',
                color: '#000',
                padding: '10px 20px',
                borderRadius: 8,
                fontWeight: 600,
                fontSize: 14,
              }}
            >
              Save
            </button>
            <button
              onClick={() => setEditingAvatar(false)}
              style={{
                backgroundColor: '#222',
                color: '#E5EEE4',
                padding: '10px 20px',
                borderRadius: 8,
                fontSize: 14,
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <h3 style={{ fontSize: 18, marginBottom: 16, color: '#C0E1D2' }}>My Posts</h3>
      {postList.length === 0 && <p style={{ color: '#666' }}>No posts yet.</p>}
      {postList.map((post) => (
        <PostCard key={post.id} post={post} onLike={() => {}} onMark={() => {}} />
      ))}
    </div>
  );
}
