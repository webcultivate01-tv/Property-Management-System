// User-service: admin manages staff + customer accounts here.
// Public signup has been removed — see notes in auth.controller.js on the server.
import api from '@/lib/api';

export const userService = {
  list: (params = {}) => api.get('/users', { params }).then((r) => r.data),
  exportAll: (params = {}) => api.get('/users/export', { params }).then((r) => r.data),
  get: (id) => api.get(`/users/${id}`).then((r) => r.data),
  create: (payload) => api.post('/users', payload).then((r) => r.data),
  update: (id, payload) => api.patch(`/users/${id}`, payload).then((r) => r.data),
  remove: (id) => api.delete(`/users/${id}`).then((r) => r.data),
  syncFromInquiries: () => api.post('/users/sync-from-inquiries').then((r) => r.data),
  updateProfile: (payload) => api.patch('/users/me', payload).then((r) => r.data),
  changePassword: (payload) => api.patch('/users/me/password', payload).then((r) => r.data),
};
