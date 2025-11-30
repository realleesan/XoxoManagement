import * as workflowsService from '../services/workflows.service.js';
import db from '../utils/db.js';

/**
 * GET /api/workflows
 * Get all workflows with filters and pagination
 */
export const getAllWorkflows = async (req, res) => {
  try {
    const filters = {
      productId: req.query.productId,
      status: req.query.status,
      assignedTo: req.query.assignedTo,
    };

    const pagination = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 50,
    };

    const result = await workflowsService.getAllWorkflows(filters, pagination);
    res.json(result);
  } catch (error) {
    console.error('Error in getAllWorkflows:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * GET /api/workflows/:id
 * Get workflow by ID
 */
export const getWorkflowById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('📥 GET /api/workflows/:id - ID:', id);
    const workflow = await workflowsService.getWorkflowById(id);
    res.json({ workflow });
  } catch (error) {
    console.error('❌ Error in getWorkflowById:', error);
    console.error('   Stack:', error.stack);
    res.status(404).json({ error: error.message });
  }
};

/**
 * POST /api/workflows
 * Create a new workflow
 */
export const createWorkflow = async (req, res) => {
  try {
    const workflowData = req.body;
    const workflow = await workflowsService.createWorkflow(workflowData);
    res.status(201).json({ workflow });
  } catch (error) {
    console.error('Error in createWorkflow:', error);
    res.status(400).json({ error: error.message });
  }
};

/**
 * PUT /api/workflows/:id
 * Update workflow
 */
export const updateWorkflow = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const workflow = await workflowsService.updateWorkflow(id, updateData);
    res.json({ workflow });
  } catch (error) {
    console.error('Error in updateWorkflow:', error);
    res.status(400).json({ error: error.message });
  }
};

/**
 * DELETE /api/workflows/:id
 * Delete workflow
 */
export const deleteWorkflow = async (req, res) => {
  try {
    const { id } = req.params;
    await workflowsService.deleteWorkflow(id);
    res.json({ success: true, message: 'Workflow deleted successfully' });
  } catch (error) {
    console.error('Error in deleteWorkflow:', error);
    res.status(400).json({ error: error.message });
  }
};

/**
 * PUT /api/workflows/stages/:id/status
 * Update stage status
 */
export const updateStageStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const stage = await workflowsService.updateStageStatus(id, status);
    res.json({ stage });
  } catch (error) {
    console.error('Error in updateStageStatus:', error);
    res.status(400).json({ error: error.message });
  }
};

/**
 * PUT /api/workflows/stages/:id/assign
 * Assign stage to user
 */
export const assignStage = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    const stage = await workflowsService.assignStage(id, userId);
    res.json({ stage });
  } catch (error) {
    console.error('Error in assignStage:', error);
    res.status(400).json({ error: error.message });
  }
};

/**
 * POST /api/workflows/stages/:id/tasks
 * Add task to stage
 */
export const addTaskToStage = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const task = await workflowsService.addTaskToStage(id, name);
    res.status(201).json({ task });
  } catch (error) {
    console.error('Error in addTaskToStage:', error);
    res.status(400).json({ error: error.message });
  }
};

/**
 * PUT /api/workflows/tasks/:id
 * Update task completion
 */
export const updateTaskCompletion = async (req, res) => {
  try {
    const { id } = req.params;
    const { completed } = req.body;
    const task = await workflowsService.updateTaskCompletion(id, completed);
    res.json({ task });
  } catch (error) {
    console.error('Error in updateTaskCompletion:', error);
    res.status(400).json({ error: error.message });
  }
};

/**
 * DELETE /api/workflows/tasks/:id
 * Delete task
 */
export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    await workflowsService.deleteTask(id);
    res.json({ success: true, message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error in deleteTask:', error);
    res.status(400).json({ error: error.message });
  }
};

/**
 * GET /api/workflows/users/list
 * Get list of users for assignment dropdown
 */
export const getUsersList = async (req, res) => {
  try {
    const query = `
      SELECT id, name, email, role
      FROM users
      ORDER BY name ASC
    `;
    const result = await db.query(query);
    res.json({ users: result.rows || [] });
  } catch (error) {
    console.error('Error in getUsersList:', error);
    res.status(500).json({ error: error.message });
  }
};

