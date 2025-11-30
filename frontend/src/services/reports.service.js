import api from './api.js';

export const reportsService = {
  // Get revenue report
  getRevenueReport: (params) => api.get('/reports/revenue', { params }),

  // Get top products report
  getTopProducts: (params) => api.get('/reports/products', { params }),

  // Get top services report
  getTopServices: (params) => api.get('/reports/services', { params }),

  // Get top customers report
  getTopCustomers: (params) => api.get('/reports/customers', { params }),

  // Get new customers report
  getNewCustomers: (params) => api.get('/reports/new-customers', { params }),

  // Get comprehensive report
  getComprehensive: (params) => api.get('/reports/comprehensive', { params }),
};

