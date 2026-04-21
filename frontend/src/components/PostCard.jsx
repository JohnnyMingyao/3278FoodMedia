import { Link } from 'react-router-dom';
import './PostCard.css';

export default function PostCard({ post, onLike, onMark }) {
  return (
    <div className="post-card">
      <img
        src={post.image_url}
        alt={post.restaurant_name || 'Food post'}
        className="post-card-image"
        onError={(e) => { e.target.src = '/default-food.png'; }}
      />
      <div className="post-card-content">
        <div className="post-card-author">
          <img
            src={post.avatar_url}
            alt={post.username}
            className="post-card-avatar"
          />
          <Link to={`/user/${post.username}`} className="post-card-username">
            {post.username}
          </Link>
        </div>

        {post.restaurant_name && (
          <div className="post-card-restaurant">
            {post.restaurant_name}
          </div>
        )}

        {post.description && (
          <p className="post-card-description">
            {post.description}
          </p>
        )}

        <div className="post-card-actions">
          <button
            onClick={() => onLike(post.id)}
            className="post-card-action-btn"
            style={{ color: post.user_has_liked ? '#D47373' : '#666' }}
          >
            <span className="post-card-action-icon">{post.user_has_liked ? '❤️' : '🤍'}</span>
            <span>{post.like_count || 0}</span>
          </button>

          <button
            onClick={() => onMark(post.id)}
            className="post-card-action-btn"
            style={{ color: post.user_has_marked ? '#4A9B7F' : '#666' }}
          >
            <span className="post-card-action-icon">🔖</span>
            <span>{post.user_has_marked ? 'Marked' : 'Mark'}</span>
          </button>

          <Link to={`/post/${post.id}`} className="post-card-comments-link">
            Comments
          </Link>

          <span className="post-card-date">
            {new Date(post.created_at).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );
}
