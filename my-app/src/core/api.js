import axios from 'axios';

const API_URL = 'http://localhost:8080';

// Kreiraj axios instancu
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    withCredentials: false,
});

// Flag to prevent multiple refresh attempts
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });

    failedQueue = [];
};

// Request interceptor za dodavanje tokena
api.interceptors.request.use(
    (config) => {
        console.log('Making request to:', config.url, 'with data:', config.data);
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('accessToken');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => {
        console.error('Request error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor za handle-ovanje grešaka i automatski refresh
api.interceptors.response.use(
    (response) => {
        console.log('Response received:', response.status, response.data);
        return response;
    },
    async (error) => {
        console.error('Response error:', error);
        console.error('Error details:', error.response?.data || 'No response data');
        console.error('Error status:', error.response?.status || 'No status code');

        const originalRequest = error.config;

        // Check if it's a 401 or JWT expired error
        if (error.response?.status === 401 ||
            (error.response?.status === 500 &&
                error.response?.data?.detail?.includes('JWT expired'))) {

            if (originalRequest._retry) {
                // Already tried to refresh, redirect to login
                if (typeof window !== 'undefined') {
                    localStorage.clear();
                    window.location.href = '/auth/signin';
                }
                return Promise.reject(error);
            }

            if (isRefreshing) {
                // Another request is already refreshing the token
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return api(originalRequest);
                }).catch(err => {
                    return Promise.reject(err);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const refreshToken = localStorage.getItem('refreshToken');
                if (!refreshToken) {
                    throw new Error('No refresh token available');
                }

                console.log('Attempting to refresh token...');

                // Make refresh request without interceptors to avoid infinite loop
                const refreshResponse = await axios.post(
                    `${API_URL}/auth/refresh`,
                    null,
                    {
                        params: { refreshToken },
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json',
                        }
                    }
                );

                const { accessToken, user } = refreshResponse.data;

                // Update tokens in localStorage
                localStorage.setItem('accessToken', accessToken);
                if (user) {
                    localStorage.setItem('user', JSON.stringify(user));
                }

                console.log('Token refreshed successfully');

                // Update the original request with new token
                originalRequest.headers.Authorization = `Bearer ${accessToken}`;

                // Process any queued requests
                processQueue(null, accessToken);

                isRefreshing = false;

                // Retry the original request
                return api(originalRequest);

            } catch (refreshError) {
                console.error('Token refresh failed:', refreshError);

                // Process queue with error
                processQueue(refreshError, null);
                isRefreshing = false;

                // Clear storage and redirect to login
                if (typeof window !== 'undefined') {
                    localStorage.clear();
                    window.location.href = '/auth/signin';
                }
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    signIn: (data) => api.post('/auth/signin', data),
    signUp: (data) => {
        console.log('Sending signup data:', data);
        return api.post('/auth/signup', data);
    },
    refresh: (refreshToken) => api.post('/auth/refresh', null, { params: { refreshToken } }),
};

// Posts API
export const postsAPI = {
    getAll: (params) => api.get('/api/posts', { params }),
    getBySlug: (slug) => api.get(`/api/posts/slug/${slug}`),
    getById: (id) => api.get(`/api/posts/${id}`),
    getByCategory: (categoryId, params) => api.get(`/api/posts/category/${categoryId}`, { params }),
    getByTag: (tagId, params) => api.get(`/api/posts/tag/${tagId}`, { params }),
    getMyPosts: (params) => api.get('/api/posts/my-posts', { params }),
    search: (q, params) => api.get('/api/posts/search', { params: { q, ...params } }),
    create: (data) => api.post('/api/posts', data),
    update: (id, data) => api.put(`/api/posts/${id}`, data),
    delete: (id) => api.delete(`/api/posts/${id}`),
    toggleLike: (id) => api.post(`/api/posts/${id}/like`),
};

// Comments API
export const commentsAPI = {
    getByPost: (postId) => api.get(`/api/comments/post/${postId}`),
    create: (data) => api.post('/api/comments', data),
    update: (id, content) => api.put(`/api/comments/${id}`, null, { params: { content } }),
    delete: (id) => api.delete(`/api/comments/${id}`),
};

// Categories API
export const categoriesAPI = {
    getAll: () => api.get('/api/categories'),
    getById: (id) => api.get(`/api/categories/${id}`),
};

// Tags API
export const tagsAPI = {
    getAll: () => api.get('/api/tags'),
    getById: (id) => api.get(`/api/tags/${id}`),
};

// Admin API
export const adminAPI = {
    posts: {
        getAll: (params) => api.get('/api/admin/posts', { params }),
        getById: (id) => api.get(`/api/admin/posts/${id}`),
        updateStatus: (id, status) => api.put(`/api/admin/posts/${id}/status`, null, { params: { status } }),
        delete: (id) => api.delete(`/api/admin/posts/${id}`),
        getStats: () => api.get('/api/admin/posts/stats'),
        getRecent: (limit = 10) => api.get('/api/admin/posts/recent', { params: { limit } }),
    },
    users: {
        getAll: (params) => api.get('/api/admin/users', { params }),
        getById: (id) => api.get(`/api/admin/users/${id}`),
        assignRole: (id, roleName) => api.post(`/api/admin/users/${id}/roles`, null, { params: { roleName } }),
        removeRole: (id, roleName) => api.delete(`/api/admin/users/${id}/roles`, { params: { roleName } }),
        delete: (id) => api.delete(`/api/admin/users/${id}`),
        search: (query) => api.get('/api/admin/users/search', { params: { query } }),
    }
};

export default api;