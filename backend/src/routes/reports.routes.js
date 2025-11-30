import express from 'express';
import {
  getRevenue,
  getTopProducts,
  getTopServices,
  getTopCustomers,
  getNewCustomers,
  getComprehensive,
} from '../controllers/reports.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Revenue report
router.get('/revenue', getRevenue);

// Top products report
router.get('/products', getTopProducts);

// Top services report
router.get('/services', getTopServices);

// Top customers report
router.get('/customers', getTopCustomers);

// New customers report
router.get('/new-customers', getNewCustomers);

// Comprehensive report (all reports combined)
router.get('/comprehensive', getComprehensive);

export default router;

