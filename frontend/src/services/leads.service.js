import api from './api.js';

export const leadsService = {
  // Get all leads with filters and pagination
  getAllLeads: (params) => api.get('/leads', { params }),
  
  // Get lead by ID
  getLeadById: (id) => api.get(`/leads/${id}`),
  
  // Create new lead
  createLead: (data) => api.post('/leads', data),
  
  // Update lead
  updateLead: (id, data) => api.put(`/leads/${id}`, data),
  
  // Delete lead
  deleteLead: (id) => api.delete(`/leads/${id}`),
  
  // Get lead activities
  getLeadActivities: (id) => api.get(`/leads/${id}/activities`),
  
  // Add activity to lead
  addActivity: (id, data) => api.post(`/leads/${id}/activities`, data),
};

