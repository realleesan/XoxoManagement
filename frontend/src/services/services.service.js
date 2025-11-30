import api from './api.js';

export const servicesService = {
  // Get all services with filters and pagination
  getAllServices: (params) => api.get('/services', { params }),
  
  // Get all categories
  getCategories: () => api.get('/services/categories'),
  
  // Get services by category
  getServicesByCategory: (category) => api.get(`/services/category/${category}`),
  
  // Get service by ID
  getServiceById: (id) => api.get(`/services/${id}`),
  
  // Create new service
  createService: (data) => api.post('/services', data),
  
  // Update service
  updateService: (id, data) => api.put(`/services/${id}`, data),
  
  // Delete service
  deleteService: (id) => api.delete(`/services/${id}`),
};

