import express from 'express';
import * as leadsController from '../controllers/leads.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// GET /api/leads - Get all leads
router.get('/', leadsController.getAllLeads);

// GET /api/leads/:id - Get lead by ID
router.get('/:id', leadsController.getLeadById);

// POST /api/leads - Create new lead
router.post('/', leadsController.createLead);

// PUT /api/leads/:id - Update lead
router.put('/:id', leadsController.updateLead);

// DELETE /api/leads/:id - Delete lead
router.delete('/:id', leadsController.deleteLead);

// GET /api/leads/:id/activities - Get lead activities
router.get('/:id/activities', leadsController.getLeadActivities);

// POST /api/leads/:id/activities - Add activity to lead
router.post('/:id/activities', leadsController.addActivity);

export default router;

