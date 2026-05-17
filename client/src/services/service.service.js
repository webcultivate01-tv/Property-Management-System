import api from '@/lib/api';

export const serviceService = {
  list: (active) => api.get('/services', { params: active ? { active: true } : {} }).then((r) => r.data),
  testimonials: (active) =>
    api.get('/services/testimonials', { params: active ? { active: true } : {} }).then((r) => r.data),
  settings: () => api.get('/services/settings').then((r) => r.data),
};
