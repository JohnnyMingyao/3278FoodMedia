import { useState, useEffect } from 'react';
import { users, posts } from '../api';
import PostCard from '../components/PostCard';
import AvatarPicker, { DEFAULT_AVATARS } from '../components/AvatarPicker';
import './MyProfile.css';

export default function MyProfile() {
  const [profile, setProfile] = useState(null);
  const [postList, setPostList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingAvatar, setEditingAvatar] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState('');
  const [customAvatar, setCustomAvatar] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profileData = await users.profile();
        setProfile(profileData.profile);
        setSelectedAvatar(profileData.profile?.avatar_url || DEFAULT_AVATARS[0]);
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

  const fetchPosts = async () => {
    if (!profile?.username) return;
    try {
      const data = await users.getPosts(profile.username);
      setPostList(data.posts || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLike = async (postId) => {
    const post = postList.find((p) => p.id === postId);
    if (!post) return;
    try {
      if (post.user_has_liked) {
        await posts.unlike(postId);
      } else {
        await posts.like(postId);
      }
      fetchPosts();
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
      fetchPosts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAvatarUpdate = async () => {
    const url = customAvatar.trim() || selectedAvatar;
    if (!url) return;
    try {
      const data = await users.updateAvatar(url);
      setProfile({ ...profile, avatar_url: data.user.avatar_url });
      setEditingAvatar(false);
      setCustomAvatar('');
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div className="container" style={{ paddingTop: 24 }}>Loading...</div>;
  if (!profile) return <div className="container" style={{ paddingTop: 24 }}>Error loading profile</div>;

  return (
    <div className="container my-profile">
      <div className="my-profile-header">
        <div className="my-profile-avatar-wrapper">
          <img
            src={profile.avatar_url}
            alt={profile.username}
            className="my-profile-avatar"
          />
          <button
            onClick={() => {
              setEditingAvatar(!editingAvatar);
              setSelectedAvatar(profile.avatar_url || DEFAULT_AVATARS[0]);
              setCustomAvatar('');
            }}
            className="my-profile-edit-btn"
            title="Edit avatar"
          >
            ✎
          </button>
        </div>
        <div className="my-profile-info">
          <h2 className="my-profile-username">{profile.username}</h2>
          <div className="my-profile-stats">
            <div className="my-profile-stat">
              <div className="my-profile-stat-value">{profile.post_count || 0}</div>
              <div className="my-profile-stat-label">Posts</div>
            </div>
            <div className="my-profile-stat">
              <div className="my-profile-stat-value">{profile.total_likes_received || 0}</div>
              <div className="my-profile-stat-label">Likes</div>
            </div>
            <div className="my-profile-stat">
              <div className="my-profile-stat-value">{profile.comment_count || 0}</div>
              <div className="my-profile-stat-label">Comments</div>
            </div>
          </div>
        </div>
      </div>

      {editingAvatar && (
        <div className="my-profile-avatar-editor">
          <AvatarPicker
            selected={selectedAvatar}
            onSelect={setSelectedAvatar}
            customUrl={customAvatar}
            onCustomUrlChange={setCustomAvatar}
            onSave={handleAvatarUpdate}
            showSave
          />
          <button
            onClick={() => setEditingAvatar(false)}
            className="my-profile-cancel-btn"
          >
            Cancel
          </button>
        </div>
      )}

      <h3 className="my-profile-section-title">My Posts</h3>
      {postList.length === 0 && <p className="my-profile-posts-empty">No posts yet.</p>}
      {postList.map((post) => (
        <PostCard key={post.id} post={post} onLike={handleLike} onMark={handleMark} />
      ))}
    </div>
  );
}
