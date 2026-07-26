import client from './client';

// Wishlist
export const getWishlist = () => client.get('/wishlist').then((r) => r.data);
export const addToWishlist = (bookId) => client.post(`/wishlist/${bookId}`).then((r) => r.data);
export const removeFromWishlist = (bookId) => client.delete(`/wishlist/${bookId}`).then((r) => r.data);

// Payments
export const createRazorpayOrder = (amount) =>
  client.post('/payments/razorpay/create-order', { amount }).then((r) => r.data);
export const verifyRazorpayPayment = (data) =>
  client.post('/payments/razorpay/verify', data).then((r) => r.data);
export const getMyPayments = () => client.get('/payments/my').then((r) => r.data);

// Users / profile
export const updateProfile = (formData) =>
  client
    .put('/users/profile', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
    .then((r) => r.data);
export const changePassword = (data) => client.put('/users/change-password', data).then((r) => r.data);
export const addAddress = (data) => client.post('/users/addresses', data).then((r) => r.data);
export const updateAddress = (addressId, data) =>
  client.put(`/users/addresses/${addressId}`, data).then((r) => r.data);
export const deleteAddress = (addressId) =>
  client.delete(`/users/addresses/${addressId}`).then((r) => r.data);
export const withdrawEarnings = (amount) => client.post('/users/withdraw', { amount }).then((r) => r.data);

// Reviews
export const getBookReviews = (bookId) => client.get(`/reviews/book/${bookId}`).then((r) => r.data);
export const addReview = (bookId, data) =>
  client.post(`/reviews/book/${bookId}`, data).then((r) => r.data);

// Notifications
export const getMyNotifications = () => client.get('/notifications').then((r) => r.data);
export const markNotificationRead = (id) => client.put(`/notifications/${id}/read`).then((r) => r.data);
export const markAllNotificationsRead = () => client.put('/notifications/read-all').then((r) => r.data);

// Admin
export const getAdminUsers = (role) => client.get('/admin/users', { params: { role } }).then((r) => r.data);
export const toggleUserActive = (id) => client.put(`/admin/users/${id}/toggle-active`).then((r) => r.data);
export const verifySeller = (id) => client.put(`/admin/users/${id}/verify-seller`).then((r) => r.data);
export const deleteUser = (id) => client.delete(`/admin/users/${id}`).then((r) => r.data);
export const getAnalytics = () => client.get('/admin/analytics').then((r) => r.data);
export const exportOrdersCsvUrl = () => '/api/admin/export/orders';
