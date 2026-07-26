import client from './client';

export const getCart = () => client.get('/cart').then((r) => r.data);
export const addToCart = (bookId, quantity = 1) =>
  client.post('/cart', { bookId, quantity }).then((r) => r.data);
export const updateCartItem = (bookId, quantity) =>
  client.put(`/cart/${bookId}`, { quantity }).then((r) => r.data);
export const removeFromCart = (bookId) => client.delete(`/cart/${bookId}`).then((r) => r.data);
export const clearCart = () => client.delete('/cart').then((r) => r.data);
