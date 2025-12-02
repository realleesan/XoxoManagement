import express from 'express';
import * as financeController from '../controllers/finance.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', financeController.getAll);
router.get('/:id', financeController.getById);
router.post('/', financeController.create);
router.put('/:id', financeController.update);
router.delete('/:id', financeController.remove);

export default router;


