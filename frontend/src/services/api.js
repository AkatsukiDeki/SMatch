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
  getUniversities: () => api.get('/auth/universities/'),
};

export const matchingAPI = {
  getSubjects: () => api.get('/matching/subjects/'),
  getTestRecommendations: () => api.get('/matching/test-recommendations/'),
  getUserSubjects: () => api.get('/matching/user-subjects/'),
  addUserSubject: (data) => api.post('/matching/user-subjects/', data),
  deleteUserSubject: (subjectId) => api.delete(`/matching/user-subjects/${subjectId}/`),
  getRecommendations: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.faculty) params.append('faculty', filters.faculty);
    if (filters.year) params.append('year', filters.year);
    if (filters.subject_id) params.append('subject_id', filters.subject_id);

    return api.get(`/matching/recommendations/?${params.toString()}`);
  },
  getMatches: () => api.get('/matching/matches/'),
  swipe: (userId, action) => api.post(`/matching/swipe/${userId}/`, { action }),
  getMutualLikes: () => api.get('/matching/mutual-likes/'),
};

export const chatAPI = {
  getChatRooms: () => api.get('/chat/rooms/'),
  getMessages: (chatRoomId) => api.get(`/chat/messages/${chatRoomId}/`),
  sendMessage: (chatRoomId, message) => api.post(`/chat/messages/${chatRoomId}/`, message),
  createChatRoom: (userId) => api.post(`/chat/rooms/create/${userId}/`),
};

export const studySessionsAPI = {
  // Сессии
  createSession: (sessionData) => api.post('/study-sessions/', sessionData),
  getSessions: (params = {}) => api.get('/study-sessions/', { params }),
  getSession: (id) => api.get(`/study-sessions/${id}/`),
  getMySessions: () => api.get('/study-sessions/my-sessions/'),
  joinSession: (sessionId) => api.post(`/study-sessions/join/${sessionId}/`),
  leaveSession: (sessionId) => api.post(`/study-sessions/leave/${sessionId}/`),
  deleteSession: (sessionId) => api.delete(`/study-sessions/delete/${sessionId}/`),

  // Приглашения
  sendInvitation: (sessionId, userId) =>
    api.post(`/study-sessions/${sessionId}/invitations/`, { user_id: userId }),

  getInvitations: () =>
    api.get('/study-session-invitations/'),

  respondToInvitation: (invitationId, response) =>
    api.post(`/study-session-invitations/${invitationId}/respond/`, { response }),

  getSessionParticipants: (sessionId) =>
    api.get(`/study-sessions/${sessionId}/participants/`),
};

export default api;