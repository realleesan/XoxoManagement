import api from './api.js';

export const workflowsService = {
  // Get all workflows with filters and pagination
  getAllWorkflows: (params) => api.get('/workflows', { params }),
  
  // Get workflow by ID
  getWorkflowById: (id) => api.get(`/workflows/${id}`),
  
  // Create new workflow
  createWorkflow: (data) => api.post('/workflows', data),
  
  // Update workflow
  updateWorkflow: (id, data) => api.put(`/workflows/${id}`, data),
  
  // Delete workflow
  deleteWorkflow: (id) => api.delete(`/workflows/${id}`),
  
  // Update stage status
  updateStageStatus: (stageId, status) => api.put(`/workflows/stages/${stageId}/status`, { status }),
  
  // Assign stage to user
  assignStage: (stageId, userId) => api.put(`/workflows/stages/${stageId}/assign`, { userId }),
  
  // Add task to stage
  addTaskToStage: (stageId, name) => api.post(`/workflows/stages/${stageId}/tasks`, { name }),
  
  // Update task completion
  updateTaskCompletion: (taskId, completed) => api.put(`/workflows/tasks/${taskId}`, { completed }),
  
  // Delete task
  deleteTask: (taskId) => api.delete(`/workflows/tasks/${taskId}`),
  
  // Get users list for assignment
  getUsersList: () => api.get('/workflows/users/list'),
};

