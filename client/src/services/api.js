import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor
api.interceptors.request.use(
    (config) => {
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
        console.error('API Error:', error.response?.data || error.message);
        return Promise.reject(error);
    }
);

// API methods
export const executeTest = (data) => {
    return api.post('/execute', data);
};

export const getReport = (sessionId) => {
    return api.get(`/report/${sessionId}`);
};

export const getAllReports = (page = 1, limit = 20) => {
    return api.get('/reports', { params: { page, limit } });
};

export default api;
