import api, { unwrap } from './axiosInstance';

export const getAuthors = (params) => api.get('/authors', { params }).then(unwrap);
export const getAuthor = (id) => api.get(`/authors/${id}`).then(unwrap);
export const createAuthor = (data) => api.post('/authors', data).then(unwrap);
export const updateAuthor = (id, data) => api.put(`/authors/${id}`, data).then(unwrap);
export const deleteAuthor = (id) => api.delete(`/authors/${id}`).then(unwrap);
export const getAuthorBooks = (id, params) => api.get(`/authors/${id}/books`, { params }).then(unwrap);
