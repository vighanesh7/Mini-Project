import api, { unwrap } from './axiosInstance';

export const searchBooks = (params) => api.get('/books/search', { params }).then(unwrap);
export const getLowStock = (params) => api.get('/books/low-stock', { params }).then(unwrap);
export const getGenres = () => api.get('/books/genres').then(unwrap);
export const getBook = (id) => api.get(`/books/${id}`).then(unwrap);
export const createBook = (data) => api.post('/books', data).then(unwrap);
export const updateBook = (id, data) => api.put(`/books/${id}`, data).then(unwrap);
export const deleteBook = (id) => api.delete(`/books/${id}`).then(unwrap);
export const setBookAuthors = (id, authorIds) => api.put(`/books/${id}/authors`, { authorIds }).then(unwrap);
export const updateBookStock = (id, stock) => api.patch(`/books/${id}/stock`, { stock }).then(unwrap);
