import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { users, posts } from '../api';
import PostCard from '../components/PostCard';

export default function UserProfile() {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [postList, setPostList] = useState([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    fetchData();
  }, [username]);

  const handleLike = async (postId) => {
    const post = postList.find((p) => p.id === postId);
    if (!post) return;
    try {
      if (post.user_has_liked) {
        await posts.unlike(postId);
      } else {
        await posts.like(postId);
      }
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMark = async (postId) => {
    const post = postList.find((p) => p.id === postId);
    if (!post) return;
    try {
      if (post.user_has_marked) {
        await posts.unmark(postId);
      } else {
        await posts.mark(postId);
      }
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

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
          <h2 style={{ fontSize: 24, marginBottom: 4, color: '#2D2D2D' }}>{profile.username}</h2>
          <p style={{ color: '#999', fontSize: 13 }}>
            Joined {new Date(profile.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>

      <h3 style={{ fontSize: 18, marginBottom: 16, color: '#4A9B7F' }}>Posts</h3>
      {postList.length === 0 && <p style={{ color: '#999' }}>No posts yet.</p>}
      {postList.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          onLike={handleLike}
          onMark={handleMark}
        />
      ))}
    </div>
  );
}
