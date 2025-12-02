import api from './api.js';

export const financeService = {
  getAllTransactions: (params) => api.get('/finance', { params }),
  getTransactionById: (id) => api.get(`/finance/${id}`),
  createTransaction: (data) => api.post('/finance', data),
  updateTransaction: (id, data) => api.put(`/finance/${id}`, data),
  deleteTransaction: (id) => api.delete(`/finance/${id}`),
};


