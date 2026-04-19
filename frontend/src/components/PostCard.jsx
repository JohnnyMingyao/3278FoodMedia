import { Link } from 'react-router-dom';

export default function PostCard({ post, onLike, onMark }) {
  return (
    <div style={{
      backgroundColor: '#111',
      borderRadius: 16,
      overflow: 'hidden',
      marginBottom: 24,
      border: '1px solid #222',
    }}>
      <img
        src={post.image_url}
        alt={post.restaurant_name || 'Food post'}
        style={{ width: '100%', height: 320, objectFit: 'cover' }}
        onError={(e) => { e.target.src = '/default-food.png'; }}
      />
      <div style={{ padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <img
            src={post.avatar_url}
            alt={post.username}
            style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }}
          />
          <Link to={`/user/${post.username}`} style={{ fontWeight: 600, color: '#C0E1D2' }}>
            {post.username}
          </Link>
        </div>

        {post.restaurant_name && (
          <div style={{ fontSize: 16, fontWeight: 600, color: '#F6F4E8', marginBottom: 8 }}>
            {post.restaurant_name}
          </div>
        )}

        {post.description && (
          <p style={{ color: '#E5EEE4', fontSize: 14, marginBottom: 12, lineHeight: 1.5 }}>
            {post.description}
          </p>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 12 }}>
          <button
            onClick={() => onLike(post.id)}
            style={{
              background: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 14,
              color: post.user_has_liked ? '#DC9B9B' : '#E5EEE4',
            }}
          >
            <span style={{ fontSize: 18 }}>{post.user_has_liked ? '❤️' : '🤍'}</span>
            <span>{post.like_count || 0}</span>
          </button>

          <button
            onClick={() => onMark(post.id)}
            style={{
              background: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 14,
              color: post.user_has_marked ? '#C0E1D2' : '#E5EEE4',
            }}
          >
            <span style={{ fontSize: 18 }}>{post.user_has_marked ? '🔖' : '🔖'}</span>
            <span>{post.user_has_marked ? 'Marked' : 'Mark'}</span>
          </button>

          <Link to={`/post/${post.id}`} style={{ fontSize: 14, color: '#888' }}>
            Comments
          </Link>

          <span style={{ fontSize: 12, color: '#666', marginLeft: 'auto' }}>
            {new Date(post.created_at).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );
}
