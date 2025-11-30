import express from 'express';
import * as invoicesController from '../controllers/invoices.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// GET /api/invoices - Get all invoices
router.get('/', invoicesController.getAllInvoices);

// GET /api/invoices/:id - Get invoice by ID
router.get('/:id', invoicesController.getInvoiceById);

// POST /api/invoices - Create new invoice
router.post('/', invoicesController.createInvoice);

// PUT /api/invoices/:id - Update invoice
router.put('/:id', invoicesController.updateInvoice);

// DELETE /api/invoices/:id - Delete invoice
router.delete('/:id', invoicesController.deleteInvoice);

// POST /api/invoices/:id/items - Add item to invoice
router.post('/:id/items', invoicesController.addInvoiceItem);

// PUT /api/invoices/items/:id - Update invoice item
router.put('/items/:id', invoicesController.updateInvoiceItem);

// DELETE /api/invoices/items/:id - Delete invoice item
router.delete('/items/:id', invoicesController.deleteInvoiceItem);

export default router;

