import express from 'express';
import * as ordersController from '../controllers/orders.controller.js';

const router = express.Router();

router.get('/', ordersController.getAll);
router.get('/:id', ordersController.getById);
router.post('/', ordersController.create);
router.put('/:id/status', ordersController.updateStatus);
router.delete('/:id', ordersController.remove);

export default router;
