// src/services/api.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Добавляем токен к запросам
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Обработка ошибок и автоматическое обновление токена
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
            refresh: refreshToken
          });

          const { access } = response.data;
          localStorage.setItem('access_token', access);
          originalRequest.headers.Authorization = `Bearer ${access}`;

          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// API endpoints
export const authAPI = {
  login: (credentials) => api.post('/auth/login/', credentials),

  register: (userData) => {
    // Формируем данные в правильном формате для Django
    const registerData = {
      username: userData.username,
      password: userData.password,
      email: userData.email,
      first_name: userData.first_name || '',
      last_name: userData.last_name || ''
    };
    return api.post('/auth/register/', registerData);
  },

  refreshToken: (token) => api.post('/auth/token/refresh/', token),
  getProfile: () => api.get('/auth/profile/'),
  updateProfile: (profileData) => api.put('/auth/profile/update/', profileData),
};

export const matchingAPI = {
  getRecommendations: () => api.get('/matching/recommendations/'),
  getMatches: () => api.get('/matching/matches/'),
  swipe: (userId, action) => api.post(`/matching/swipe/${userId}/`, { action }),
  getSubjects: () => api.get('/matching/subjects/'),
  getUserSubjects: () => api.get('/matching/user-subjects/'),
  addUserSubject: (data) => api.post('/matching/user-subjects/', data),
  deleteUserSubject: (subjectId) => api.delete(`/matching/user-subjects/${subjectId}/`),
};

export const chatAPI = {
  getChatRooms: () => api.get('/chat/rooms/'),
  getMessages: (chatRoomId) => api.get(`/chat/messages/${chatRoomId}/`),
  sendMessage: (chatRoomId, message) => api.post(`/chat/messages/${chatRoomId}/`, message),
  createChatRoom: (userId) => api.post(`/chat/rooms/create/${userId}/`),
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