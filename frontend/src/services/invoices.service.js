import api from './api.js';

export const invoicesService = {
  // Get all invoices with filters and pagination
  getAllInvoices: (params) => api.get('/invoices', { params }),
  
  // Get invoice by ID
  getInvoiceById: (id) => api.get(`/invoices/${id}`),
  
  // Create new invoice
  createInvoice: (data) => api.post('/invoices', data),
  
  // Update invoice
  updateInvoice: (id, data) => api.put(`/invoices/${id}`, data),
  
  // Delete invoice
  deleteInvoice: (id) => api.delete(`/invoices/${id}`),
  
  // Add item to invoice
  addInvoiceItem: (invoiceId, data) => api.post(`/invoices/${invoiceId}/items`, data),
  
  // Update invoice item
  updateInvoiceItem: (itemId, data) => api.put(`/invoices/items/${itemId}`, data),
  
  // Delete invoice item
  deleteInvoiceItem: (itemId) => api.delete(`/invoices/items/${itemId}`),
};

