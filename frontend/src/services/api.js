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
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) throw new Error('No refresh token');

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

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login/', credentials),
  register: (userData) => api.post('/auth/register/', userData),
  getProfile: () => api.get('/auth/profile/'),
  updateProfile: (profileData) => api.put('/auth/profile/update/', profileData),
  getUniversities: () => api.get('/auth/universities/'),
  uploadAvatar: (formData) => api.post('/auth/upload-avatar/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteAvatar: () => api.delete('/auth/delete-avatar/'),
};

// Matching API
export const matchingAPI = {
  getSubjects: () => api.get('/matching/subjects/'),
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
  swipe: (userId, action) => api.post(`/matching/swipe/${userId}/`, { action }),
  getMutualLikes: () => api.get('/matching/mutual-likes/'),
};

// Chat API
export const chatAPI = {
  getChatRooms: () => api.get('/chat/rooms/'),
  getMessages: (chatRoomId) => api.get(`/chat/messages/${chatRoomId}/`),
  sendMessage: (chatRoomId, message) => api.post(`/chat/messages/${chatRoomId}/`, message),
  createChatRoom: (userId) => api.post(`/chat/rooms/create/${userId}/`),
};

// Study Sessions API
export const studySessionsAPI = {
  createSession: (sessionData) => api.post('/study-sessions/create/', sessionData),
  getSessions: () => api.get('/study-sessions/sessions/'),
  getMySessions: () => api.get('/study-sessions/my-sessions/'),
  joinSession: (sessionId) => api.post(`/study-sessions/join/${sessionId}/`),
  leaveSession: (sessionId) => api.post(`/study-sessions/leave/${sessionId}/`),
  deleteSession: (sessionId) => api.delete(`/study-sessions/delete/${sessionId}/`),
  sendInvitation: (sessionId, userId) => api.post('/study-sessions/invitations/send/', {
    session_id: sessionId,
    user_id: userId
  }),
  getInvitations: () => api.get('/study-sessions/invitations/'),
  respondToInvitation: (invitationId, response) =>
    api.post(`/study-sessions/invitations/${invitationId}/respond/`, { response }),
};

export default api;