import api from '@/lib/api';

export const eventService = {
  list: (params = {}) => api.get('/events', { params }).then((r) => r.data),
  listPublic: () => api.get('/events/public').then((r) => r.data),
  get: (id) => api.get(`/events/${id}`).then((r) => r.data),
  create: (payload) => api.post('/events', payload).then((r) => r.data),
  update: (id, payload) => api.patch(`/events/${id}`, payload).then((r) => r.data),
  remove: (id) => api.delete(`/events/${id}`).then((r) => r.data),
  toggle: (id) => api.patch(`/events/${id}/toggle`).then((r) => r.data),
  triggerToday: () => api.post('/events/trigger-today').then((r) => r.data),
};
