import api from './api.js';

export const customersService = {
  // Get all customers with filters and pagination
  getAllCustomers: (params) => api.get('/customers', { params }),
  
  // Get customer by ID
  getCustomerById: (id) => api.get(`/customers/${id}`),
  
  // Create new customer
  createCustomer: (data) => api.post('/customers', data),
  
  // Update customer
  updateCustomer: (id, data) => api.put(`/customers/${id}`, data),
  
  // Delete customer
  deleteCustomer: (id) => api.delete(`/customers/${id}`),
  
  // Convert lead to customer
  convertLeadToCustomer: (leadId, data) => api.post(`/customers/convert-from-lead/${leadId}`, data),
};

