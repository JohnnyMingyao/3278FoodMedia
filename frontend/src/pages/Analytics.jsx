import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { analytics } from '../api';

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
    <div className="container" style={{ paddingTop: 24, paddingBottom: 48 }}>
      <h2 style={{ fontSize: 24, marginBottom: 32 }}>Analytics</h2>

      <div style={{ marginBottom: 48 }}>
        <h3 style={{ fontSize: 18, marginBottom: 16, color: '#C0E1D2' }}>Top Posts</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {topPosts.map((post, idx) => (
            <Link
              key={post.id}
              to={`/post/${post.id}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                backgroundColor: '#111',
                borderRadius: 12,
                padding: 12,
                border: '1px solid #222',
                textDecoration: 'none',
              }}
            >
              <div style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                backgroundColor: idx < 3 ? '#C0E1D2' : '#222',
                color: idx < 3 ? '#000' : '#888',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: 14,
              }}>
                {idx + 1}
              </div>
              <img
                src={post.image_url}
                alt=""
                style={{ width: 60, height: 60, borderRadius: 8, objectFit: 'cover' }}
                onError={(e) => { e.target.src = '/default-food.png'; }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ color: '#F6F4E8', fontWeight: 600, fontSize: 14 }}>
                  {post.restaurant_name}
                </div>
                <div style={{ color: '#888', fontSize: 12 }}>by {post.username}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: '#DC9B9B', fontWeight: 700 }}>{post.like_count} likes</div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 48 }}>
        <h3 style={{ fontSize: 18, marginBottom: 16, color: '#C0E1D2' }}>Top Users</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {topUsers.map((user, idx) => (
            <div
              key={user.user_id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                backgroundColor: '#111',
                borderRadius: 12,
                padding: 12,
                border: '1px solid #222',
              }}
            >
              <div style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                backgroundColor: idx < 3 ? '#C0E1D2' : '#222',
                color: idx < 3 ? '#000' : '#888',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: 14,
              }}>
                {idx + 1}
              </div>
              <img
                src={user.avatar_url}
                alt={user.username}
                style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ color: '#F6F4E8', fontWeight: 600, fontSize: 14 }}>
                  {user.username}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 16, fontSize: 13 }}>
                <span style={{ color: '#DC9B9B' }}>{user.total_likes_received} likes</span>
                <span style={{ color: '#888' }}>{user.post_count} posts</span>
                <span style={{ color: '#888' }}>{user.comment_count} comments</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 style={{ fontSize: 18, marginBottom: 16, color: '#C0E1D2' }}>Hot Food Clusters (PostGIS DBSCAN)</h3>
        {clusters.length === 0 ? (
          <p style={{ color: '#666' }}>Not enough data to form clusters.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {clusters.map((cluster) => (
              <div
                key={cluster.cluster_id}
                style={{
                  backgroundColor: '#111',
                  borderRadius: 12,
                  padding: 16,
                  border: '1px solid #222',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ color: '#C0E1D2', fontWeight: 600 }}>
                    Cluster #{cluster.cluster_id}
                  </span>
                  <span style={{ color: '#DC9B9B', fontSize: 14 }}>
                    {cluster.point_count} restaurants
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 16, fontSize: 13, color: '#888' }}>
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
