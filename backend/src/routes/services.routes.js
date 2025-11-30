import express from 'express';
import * as servicesController from '../controllers/services.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// GET /api/services/categories - Get all categories
router.get('/categories', servicesController.getCategories);

// GET /api/services/category/:category - Get services by category
router.get('/category/:category', servicesController.getServicesByCategory);

// GET /api/services - Get all services
router.get('/', servicesController.getAllServices);

// GET /api/services/:id - Get service by ID
router.get('/:id', servicesController.getServiceById);

// POST /api/services - Create new service
router.post('/', servicesController.createService);

// PUT /api/services/:id - Update service
router.put('/:id', servicesController.updateService);

// DELETE /api/services/:id - Delete service
router.delete('/:id', servicesController.deleteService);

export default router;

