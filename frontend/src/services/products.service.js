import api from './api.js';

export const productsService = {
  // Get all products with filters and pagination
  getAllProducts: (params) => api.get('/products', { params }),
  
  // Get product by ID
  getProductById: (id) => api.get(`/products/${id}`),
  
  // Create new product
  createProduct: (data) => api.post('/products', data),
  
  // Update product
  updateProduct: (id, data) => api.put(`/products/${id}`, data),
  
  // Delete product
  deleteProduct: (id) => api.delete(`/products/${id}`),
};

