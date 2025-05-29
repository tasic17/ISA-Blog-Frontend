import axios from 'axios';

const API_URL = 'http://localhost:8080';

// Kreiraj axios instancu
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor za dodavanje tokena
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor za handle-ovanje grešaka
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refreshToken');
                const response = await api.post('/auth/refresh', null, {
                    params: { refreshToken }
                });

                const { accessToken } = response.data;
                localStorage.setItem('accessToken', accessToken);

                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                return api(originalRequest);
            } catch (refreshError) {
                // Refresh failed, redirect to login
                localStorage.clear();
                window.location.href = '/auth/signin';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    signIn: (data) => api.post('/auth/signin', data),
    signUp: (data) => api.post('/auth/signup', data),
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

export default api;