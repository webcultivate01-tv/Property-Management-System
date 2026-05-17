import api from '@/lib/api';

export const dashboardService = {
  stats: () => api.get('/dashboard/stats').then((r) => r.data),
};
