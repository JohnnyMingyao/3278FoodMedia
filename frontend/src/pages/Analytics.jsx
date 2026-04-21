import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { analytics } from '../api';
import './Analytics.css';

export default function Analytics() {
  const [topPosts, setTopPosts] = useState([]);
  const [topUsers, setTopUsers] = useState([]);
  const [clusters, setClusters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [postsData, usersData, clustersData] = await Promise.all([
          analytics.topPosts(10),
          analytics.topUsers(10),
          analytics.clusters(),
        ]);
        setTopPosts(postsData.posts || []);
        setTopUsers(usersData.users || []);
        setClusters(clustersData.clusters || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="container" style={{ paddingTop: 24 }}>Loading...</div>;

  return (
    <div className="container analytics">
      <h2 className="analytics-title">Analytics</h2>

      <div className="analytics-section">
        <h3 className="analytics-section-title">Top Posts</h3>
        <div className="analytics-list">
          {topPosts.map((post, idx) => (
            <Link
              key={post.id}
              to={`/post/${post.id}`}
              className="analytics-card"
            >
              <div className={`analytics-rank ${idx < 3 ? 'top' : 'normal'}`}>
                {idx + 1}
              </div>
              <img
                src={post.image_url}
                alt=""
                className="analytics-card-image"
                onError={(e) => { e.target.src = '/default-food.png'; }}
              />
              <div className="analytics-card-info">
                <div className="analytics-card-title">
                  {post.restaurant_name}
                </div>
                <div className="analytics-card-subtitle">by {post.username}</div>
              </div>
              <div className="analytics-card-stats">
                <div className="analytics-card-stat">{post.like_count} likes</div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="analytics-section">
        <h3 className="analytics-section-title">Top Users</h3>
        <div className="analytics-list">
          {topUsers.map((user, idx) => (
            <div
              key={user.user_id}
              className="analytics-card"
              style={{ textDecoration: 'none', cursor: 'default' }}
            >
              <div className={`analytics-rank ${idx < 3 ? 'top' : 'normal'}`}>
                {idx + 1}
              </div>
              <img
                src={user.avatar_url}
                alt={user.username}
                className="analytics-card-avatar"
              />
              <div className="analytics-card-info">
                <div className="analytics-card-title">
                  {user.username}
                </div>
              </div>
              <div className="analytics-user-stats">
                <span className="analytics-user-stat-likes">{user.total_likes_received} likes</span>
                <span className="analytics-user-stat-normal">{user.post_count} posts</span>
                <span className="analytics-user-stat-normal">{user.comment_count} comments</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="analytics-section-title">Hot Food Clusters (PostGIS DBSCAN)</h3>
        {clusters.length === 0 ? (
          <p className="analytics-cluster-empty">Not enough data to form clusters.</p>
        ) : (
          <div className="analytics-cluster-list">
            {clusters.map((cluster) => (
              <div
                key={cluster.cluster_id}
                className="analytics-cluster-card"
              >
                <div className="analytics-cluster-header">
                  <span className="analytics-cluster-name">
                    Cluster #{cluster.cluster_id}
                  </span>
                  <span className="analytics-cluster-count">
                    {cluster.point_count} restaurants
                  </span>
                </div>
                <div className="analytics-cluster-meta">
                  <span>Center: {cluster.center_lat?.toFixed(4)}, {cluster.center_lng?.toFixed(4)}</span>
                  <span>Avg likes: {Math.round(cluster.avg_likes || 0)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
