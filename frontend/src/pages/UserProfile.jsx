import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { users } from '../api';
import PostCard from '../components/PostCard';

export default function UserProfile() {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [postList, setPostList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userData, postsData] = await Promise.all([
          users.get(username),
          users.getPosts(username),
        ]);
        setProfile(userData.user);
        setPostList(postsData.posts || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [username]);

  if (loading) return <div className="container" style={{ paddingTop: 24 }}>Loading...</div>;
  if (!profile) return <div className="container" style={{ paddingTop: 24 }}>User not found</div>;

  return (
    <div className="container" style={{ paddingTop: 24, paddingBottom: 48 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
        <img
          src={profile.avatar_url}
          alt={profile.username}
          style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', border: '2px solid #C0E1D2' }}
        />
        <div>
          <h2 style={{ fontSize: 24, marginBottom: 4 }}>{profile.username}</h2>
          <p style={{ color: '#888', fontSize: 13 }}>
            Joined {new Date(profile.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>

      <h3 style={{ fontSize: 18, marginBottom: 16, color: '#C0E1D2' }}>Posts</h3>
      {postList.length === 0 && <p style={{ color: '#666' }}>No posts yet.</p>}
      {postList.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          onLike={() => {}}
          onMark={() => {}}
        />
      ))}
    </div>
  );
}
