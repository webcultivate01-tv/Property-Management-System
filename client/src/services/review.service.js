import api from '@/lib/api';

export const reviewService = {
  submit: (payload) => api.post('/reviews', payload).then((r) => r.data),
  listApproved: (params = {}) => api.get('/reviews/approved', { params }).then((r) => r.data),
  list: (params = {}) => api.get('/reviews', { params }).then((r) => r.data),
  updateStatus: (id, status) => api.patch(`/reviews/${id}/status`, { status }).then((r) => r.data),
  remove: (id) => api.delete(`/reviews/${id}`).then((r) => r.data),
};
