import api, { unwrap } from './axiosInstance';

export const getPublishers = (params) => api.get('/publishers', { params }).then(unwrap);
export const getPublisher = (id) => api.get(`/publishers/${id}`).then(unwrap);
export const createPublisher = (data) => api.post('/publishers', data).then(unwrap);
export const updatePublisher = (id, data) => api.put(`/publishers/${id}`, data).then(unwrap);
export const deletePublisher = (id) => api.delete(`/publishers/${id}`).then(unwrap);
export const getPublisherAuthors = (id, params) =>
  api.get(`/publishers/${id}/authors`, { params }).then(unwrap);
