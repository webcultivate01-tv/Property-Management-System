// Thin wrapper around the /events endpoints.
// All admin endpoints accept a plain object OR a FormData
// (FormData is required when uploading an image).
import api from '@/lib/api';

export const eventService = {
  list: (params = {}) => api.get('/events', { params }).then((r) => r.data),
  listPublic: () => api.get('/events/public').then((r) => r.data),
  popup: () => api.get('/events/popup').then((r) => r.data),
  get: (id) => api.get(`/events/${id}`).then((r) => r.data),
  create: (payload) =>
    api
      .post('/events', payload, {
        headers: payload instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
      })
      .then((r) => r.data),
  update: (id, payload) =>
    api
      .patch(`/events/${id}`, payload, {
        headers: payload instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
      })
      .then((r) => r.data),
  remove: (id) => api.delete(`/events/${id}`).then((r) => r.data),
  toggle: (id) => api.patch(`/events/${id}/toggle`).then((r) => r.data),
  triggerToday: () => api.post('/events/trigger-today').then((r) => r.data),
};
