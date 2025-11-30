import express from 'express';
import * as customersController from '../controllers/customers.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// GET /api/customers - Get all customers
router.get('/', customersController.getAllCustomers);

// GET /api/customers/:id - Get customer by ID
router.get('/:id', customersController.getCustomerById);

// POST /api/customers - Create new customer
router.post('/', customersController.createCustomer);

// PUT /api/customers/:id - Update customer
router.put('/:id', customersController.updateCustomer);

// DELETE /api/customers/:id - Delete customer
router.delete('/:id', customersController.deleteCustomer);

// POST /api/customers/convert-from-lead/:leadId - Convert lead to customer
router.post('/convert-from-lead/:leadId', customersController.convertLeadToCustomer);

export default router;

