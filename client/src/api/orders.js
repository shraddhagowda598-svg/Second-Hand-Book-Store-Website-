import client from './client';

export const placeOrder = (data) => client.post('/orders', data).then((r) => r.data);
export const getMyOrders = () => client.get('/orders/my').then((r) => r.data);
export const getSellerOrders = () => client.get('/orders/seller/my').then((r) => r.data);
export const getAllOrders = () => client.get('/orders').then((r) => r.data);
export const getOrderById = (id) => client.get(`/orders/${id}`).then((r) => r.data);
export const updateOrderStatus = (id, status, note) =>
  client.put(`/orders/${id}/status`, { status, note }).then((r) => r.data);
export const cancelOrder = (id, reason) =>
  client.put(`/orders/${id}/cancel`, { reason }).then((r) => r.data);
export const requestReturn = (id, reason) =>
  client.put(`/orders/${id}/return`, { reason }).then((r) => r.data);
export const invoiceUrl = (id) => `/api/orders/${id}/invoice`;
