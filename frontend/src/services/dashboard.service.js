import api from './api.js';

/**
 * Get dashboard statistics
 */
export const getDashboardStats = async () => {
  // api interceptor already returns response.data
  const data = await api.get('/dashboard/stats');
  return data;
};

