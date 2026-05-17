import api from '@/lib/api';

export const propertyService = {
  list: (params = {}) => api.get('/properties', { params }).then((r) => r.data),
  get: (id) => api.get(`/properties/${id}`).then((r) => r.data),
  similar: (id) => api.get(`/properties/${id}/similar`).then((r) => r.data),
  create: (formData) =>
    api.post('/properties', formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data),
  update: (id, formData) =>
    api.patch(`/properties/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data),
  remove: (id) => api.delete(`/properties/${id}`).then((r) => r.data),
  toggleFeatured: (id) => api.patch(`/properties/${id}/featured`).then((r) => r.data),
};
