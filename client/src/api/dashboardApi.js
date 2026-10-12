import api, { unwrap } from './axiosInstance';

export const getDashboardStats = (params) => api.get('/dashboard/stats', { params }).then(unwrap);
export const getRecentBooks = (params) => api.get('/dashboard/recent-books', { params }).then(unwrap);
