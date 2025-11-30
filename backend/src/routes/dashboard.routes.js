import express from 'express';
import { getStats } from '../controllers/dashboard.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

// Get dashboard statistics
router.get('/stats', authMiddleware, getStats);

export default router;

