import client from './client';

export const getBooks = (params) => client.get('/books', { params }).then((r) => r.data);
export const getBookById = (id) => client.get(`/books/${id}`).then((r) => r.data);
export const getFeaturedBooks = () => client.get('/books/featured/list').then((r) => r.data);
export const getTrendingBooks = () => client.get('/books/trending/list').then((r) => r.data);
export const getRecentBooks = () => client.get('/books/recent/list').then((r) => r.data);

export const createBook = (formData) =>
  client
    .post('/books', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
    .then((r) => r.data);

export const updateBook = (id, formData) =>
  client
    .put(`/books/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
    .then((r) => r.data);

export const deleteBook = (id) => client.delete(`/books/${id}`).then((r) => r.data);
export const approveBook = (id) => client.put(`/books/${id}/approve`).then((r) => r.data);
export const rejectBook = (id, reason) =>
  client.put(`/books/${id}/reject`, { reason }).then((r) => r.data);
