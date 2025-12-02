import api from './api.js';

export const inventoryService = {
  // Get paginated list of inventory items
  getAllItems: (params) => api.get('/inventory', { params }),

  // Get single item
  getItemById: (id) => api.get(`/inventory/${id}`),

  // Create new item
  createItem: (data) => api.post('/inventory', data),

  // Update item
  updateItem: (id, data) => api.put(`/inventory/${id}`, data),

  // Delete item
  deleteItem: (id) => api.delete(`/inventory/${id}`),
};


