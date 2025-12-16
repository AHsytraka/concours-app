import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
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
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth services
export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  registerStudent: (data) => api.post('/auth/register/student', data),
  registerUniversity: (data) => api.post('/auth/register/university', data),
  getCurrentUser: () => api.get('/auth/me'),
  refreshToken: () => api.post('/auth/refresh'),
  logout: () => api.post('/auth/logout'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data) => api.post('/auth/reset-password', data),
};

// Event services
export const eventService = {
  getAll: (params) => api.get('/events', { params }),
  getById: (id) => api.get(`/institution/events/${id}`),
  create: (data) => api.post('/institution/events', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  update: (id, data) => api.put(`/institution/events/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  delete: (id) => api.delete(`/institution/events/${id}`),
  getRegistrations: (eventId) => api.get(`/institution/events/${eventId}/registrations`),
  publishResults: (eventId, results) => api.post(`/institution/events/${eventId}/results`, results),
  getMyEvents: () => api.get('/institution/events'),
  toggleRegistrations: (eventId) => api.put(`/institution/events/${eventId}/toggle-registrations`),
};

// Registration services
export const registrationService = {
  register: (eventId, data) => api.post(`/events/${eventId}/register`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getMyRegistrations: () => api.get('/registrations/me'),
  getRegistration: (id) => api.get(`/registrations/${id}`),
  cancelRegistration: (id) => api.delete(`/registrations/${id}`),
  downloadConvocation: (registrationId) => api.get(`/registrations/${registrationId}/convocation`, {
    responseType: 'blob'
  }),
};

// Document services
export const documentService = {
  upload: (file, type) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    return api.post('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  // Upload simple sans extraction IA
  uploadSimple: (formData) => {
    return api.post('/documents/upload-simple', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  verify: (documentId) => api.post(`/documents/${documentId}/verify`),
  getById: (id) => api.get(`/documents/${id}`),
  classify: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/documents/classify', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
};

// Institution services
export const institutionService = {
  getProfile: () => api.get('/institution/profile'),
  updateProfile: (data) => api.put('/institution/profile', data),
  getSubAccounts: () => api.get('/institution/subaccounts'),
  createSubAccount: (data) => api.post('/institution/subaccounts', data),
  updateSubAccount: (id, data) => api.put(`/institution/subaccounts/${id}`, data),
  deleteSubAccount: (id) => api.delete(`/institution/subaccounts/${id}`),
  getStatistics: () => api.get('/institution/statistics'),
};

// Results services
export const resultsService = {
  getEventResults: (eventId) => api.get(`/institution/events/${eventId}/results`),
  enterGrades: (eventId, grades) => api.post(`/institution/events/${eventId}/grades`, grades),
  deliberate: (eventId) => api.post(`/institution/events/${eventId}/deliberate`),
  publishResults: (eventId) => api.post(`/institution/events/${eventId}/publish`),
};

// Student services
export const studentService = {
  getProfile: () => api.get('/students/profile'),
  updateProfile: (data) => api.put('/students/profile', data),
  getTranscript: () => api.get('/students/transcript'),
};

export default api;
