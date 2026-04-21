const API_BASE = import.meta.env.VITE_API_URL || '';

async function api(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include',
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `HTTP ${res.status}`);
  }
  return data;
}

export const auth = {
  register: (body) => api('/api/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => api('/api/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  logout: () => api('/api/auth/logout', { method: 'POST' }),
  me: () => api('/api/auth/me'),
};

export const posts = {
  list: (sort = 'likes', limit = 20, offset = 0) =>
    api(`/api/posts?sort=${sort}&limit=${limit}&offset=${offset}`),
  get: (id) => api(`/api/posts/${id}`),
  create: (body) => api('/api/posts', { method: 'POST', body: JSON.stringify(body) }),
  delete: (id) => api(`/api/posts/${id}`, { method: 'DELETE' }),
  like: (id) => api(`/api/posts/${id}/like`, { method: 'POST' }),
  unlike: (id) => api(`/api/posts/${id}/like`, { method: 'DELETE' }),
  mark: (id) => api(`/api/posts/${id}/mark`, { method: 'POST' }),
  unmark: (id) => api(`/api/posts/${id}/mark`, { method: 'DELETE' }),
  comments: (id) => api(`/api/posts/${id}/comments`),
  addComment: (id, body) => api(`/api/posts/${id}/comments`, { method: 'POST', body: JSON.stringify(body) }),
};

export const commentLikes = {
  like: (commentId) => api(`/api/comments/${commentId}/like`, { method: 'POST' }),
};

export const users = {
  get: (username) => api(`/api/users/${username}`),
  getPosts: (username) => api(`/api/users/${username}/posts`),
  profile: () => api('/api/users/me/profile'),
  marks: () => api('/api/users/me/marks'),
  updateAvatar: (avatar_url) => api('/api/users/me/avatar', { method: 'PATCH', body: JSON.stringify({ avatar_url }) }),
};

export const nearby = {
  search: (lat, lng, radius = 3000) =>
    api(`/api/nearby?lat=${lat}&lng=${lng}&radius=${radius}`),
};

export const analytics = {
  topPosts: (limit = 10) => api(`/api/analytics/top-posts?limit=${limit}`),
  topUsers: (limit = 10) => api(`/api/analytics/top-users?limit=${limit}`),
  clusters: () => api('/api/analytics/clusters'),
};

export const queryGateway = {
  execute: (action, params) =>
    api('/api/query', { method: 'POST', body: JSON.stringify({ action, params }) }),
};

export default api;
