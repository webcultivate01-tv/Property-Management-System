import api from '@/lib/api';

export const inquiryService = {
  submit: (payload) => api.post('/inquiries', payload).then((r) => r.data),
  list: (params = {}) => api.get('/inquiries', { params }).then((r) => r.data),
  get: (id) => api.get(`/inquiries/${id}`).then((r) => r.data),
  update: (id, payload) => api.patch(`/inquiries/${id}`, payload).then((r) => r.data),
  remove: (id) => api.delete(`/inquiries/${id}`).then((r) => r.data),
  exportCsv: () =>
    api.get('/inquiries/export', { responseType: 'blob' }).then((r) => r.data),
};
