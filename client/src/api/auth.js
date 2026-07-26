import client from './client';

export const register = (data) => client.post('/auth/register', data).then((r) => r.data);
export const verifyOtp = (data) => client.post('/auth/verify-otp', data).then((r) => r.data);
export const resendOtp = (data) => client.post('/auth/resend-otp', data).then((r) => r.data);
export const login = (data) => client.post('/auth/login', data).then((r) => r.data);
export const getMe = () => client.get('/auth/me').then((r) => r.data);
export const forgotPassword = (data) => client.post('/auth/forgot-password', data).then((r) => r.data);
export const resetPassword = (token, data) =>
  client.put(`/auth/reset-password/${token}`, data).then((r) => r.data);
