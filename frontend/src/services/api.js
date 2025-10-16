// src/services/api.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        const response = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
          refresh: refreshToken
        });

        const { access } = response.data;
        localStorage.setItem('access_token', access);
        originalRequest.headers.Authorization = `Bearer ${access}`;

        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => api.post('/auth/login/', credentials),
  register: (userData) => api.post('/auth/register/', userData),
  refreshToken: (token) => api.post('/auth/token/refresh/', token),
  getProfile: () => api.get('/auth/profile/'),
  updateProfile: (profileData) => api.put('/auth/profile/update/', profileData),
};

// Остальные API остаются без изменений...
export const matchingAPI = {
  getRecommendations: () => api.get('/matching/recommendations/'),
  swipe: (userId, action) => api.post(`/matching/swipe/${userId}/`, { action }),
};

export const chatAPI = {
  getChatRooms: () => api.get('/chat/rooms/'),
  getMessages: (chatRoomId) => api.get(`/chat/messages/${chatRoomId}/`),
  sendMessage: (chatRoomId, message) => api.post(`/chat/messages/${chatRoomId}/`, message),
};

export const studySessionsAPI = {
  getSessions: () => api.get('/study-sessions/sessions/'),
  getMySessions: () => api.get('/study-sessions/my-sessions/'),
  createSession: (sessionData) => api.post('/study-sessions/create/', sessionData),
  joinSession: (sessionId) => api.post(`/study-sessions/join/${sessionId}/`),
  leaveSession: (sessionId) => api.post(`/study-sessions/leave/${sessionId}/`),
  deleteSession: (sessionId) => api.delete(`/study-sessions/delete/${sessionId}/`),
};

export default api;