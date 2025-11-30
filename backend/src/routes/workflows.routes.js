import express from 'express';
import * as workflowsController from '../controllers/workflows.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// GET /api/workflows/users/list - Get users list for assignment
router.get('/users/list', workflowsController.getUsersList);

// GET /api/workflows - Get all workflows
router.get('/', workflowsController.getAllWorkflows);

// GET /api/workflows/:id - Get workflow by ID
router.get('/:id', workflowsController.getWorkflowById);

// POST /api/workflows - Create new workflow
router.post('/', workflowsController.createWorkflow);

// PUT /api/workflows/:id - Update workflow
router.put('/:id', workflowsController.updateWorkflow);

// DELETE /api/workflows/:id - Delete workflow
router.delete('/:id', workflowsController.deleteWorkflow);

// PUT /api/workflows/stages/:id/status - Update stage status
router.put('/stages/:id/status', workflowsController.updateStageStatus);

// PUT /api/workflows/stages/:id/assign - Assign stage to user
router.put('/stages/:id/assign', workflowsController.assignStage);

// POST /api/workflows/stages/:id/tasks - Add task to stage
router.post('/stages/:id/tasks', workflowsController.addTaskToStage);

// PUT /api/workflows/tasks/:id - Update task completion
router.put('/tasks/:id', workflowsController.updateTaskCompletion);

// DELETE /api/workflows/tasks/:id - Delete task
router.delete('/tasks/:id', workflowsController.deleteTask);

export default router;

