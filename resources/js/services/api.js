import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || '',
    },
    withCredentials: true,
    withXSRFToken: true,
});

api.interceptors.request.use(async (config) => {
    await axios.get('/sanctum/csrf-cookie');
    return config;
});

// Search
export const searchReports = (params) => {
    return api.get('/search', { params });
};
// Search categories
export const getSearchCategories = () => {
    return api.get('/search-categories');
};

// Reports
export const getReports = (params) => api.get('/reports', { params });
export const getMyReports = () => api.get('/user/reports');
export const getReport = (id) => api.get(`/reports/${id}`);
export const createReport = (formData) => api.post('/reports', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
});
export const updateReport = (id, data) => api.put(`/reports/${id}`, data);
export const deleteReport = (id) => api.delete(`/reports/${id}`);

// Matching
export const matchReport = (id) => api.get(`/reports/${id}/match`);

// Dashboard
export const getStats = () => api.get('/dashboard/stats');
export const getRecentReports = () => api.get('/dashboard/recent-reports');

export default api;