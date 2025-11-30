import express from 'express';
import * as productsController from '../controllers/products.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// GET /api/products - Get all products
router.get('/', productsController.getAllProducts);

// GET /api/products/:id - Get product by ID
router.get('/:id', productsController.getProductById);

// POST /api/products - Create new product
router.post('/', productsController.createProduct);

// PUT /api/products/:id - Update product
router.put('/:id', productsController.updateProduct);

// DELETE /api/products/:id - Delete product
router.delete('/:id', productsController.deleteProduct);

export default router;

