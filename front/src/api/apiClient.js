import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Inscription endpoints
export const inscriptionAPI = {
  getAll: () => api.get('/inscriptions'),
  getById: (id) => api.get(`/inscriptions/${id}`),
  create: (data) => api.post('/inscriptions', data),
  update: (id, data) => api.put(`/inscriptions/${id}`, data),
  delete: (id) => api.delete(`/inscriptions/${id}`),
  search: (params) => api.get('/inscriptions/search', { params }),
};

// Document endpoints
export const documentAPI = {
  getByInscription: (inscriptionId) => api.get(`/documents/inscription/${inscriptionId}`),
  upload: (inscriptionId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/documents/inscription/${inscriptionId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  verify: (documentId) => api.put(`/documents/${documentId}/verify`),
  validate: (documentId) => api.put(`/documents/${documentId}/validate`),
  delete: (documentId) => api.delete(`/documents/${documentId}`),
  download: (documentId) => api.get(`/documents/${documentId}/download`, { responseType: 'blob' }),
};

// PDF endpoints
export const pdfAPI = {
  generate: (inscriptionId) => api.get(`/pdf/inscription/${inscriptionId}`, { responseType: 'blob' }),
  generateBordereau: (bordereau) => api.post(`/pdf/bordereau`, bordereau, { responseType: 'blob' }),
};

// Mail endpoints
export const mailAPI = {
  sendConfirmation: (inscriptionId) => api.post(`/mail/confirmation/${inscriptionId}`),
  sendRejection: (inscriptionId, reason) => api.post(`/mail/rejection/${inscriptionId}`, { reason }),
  sendNotification: (inscriptionId, message) => api.post(`/mail/notification/${inscriptionId}`, { message }),
};

// Gemini AI endpoints
export const geminiAPI = {
  analyzeDocument: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/gemini/analyze', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  classifyStudent: (studentData) => api.post('/gemini/classify-student', studentData),
  deliberate: (deliberationData) => api.post('/gemini/deliberate', deliberationData),
};

export default api;
