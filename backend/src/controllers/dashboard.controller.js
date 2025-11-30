import { getDashboardStats } from '../services/dashboard.service.js';

/**
 * Get dashboard statistics
 */
export const getStats = async (req, res) => {
  try {
    console.log('Fetching dashboard stats...');
    const stats = await getDashboardStats();
    console.log('Dashboard stats fetched successfully:', stats);
    res.json(stats);
  } catch (error) {
    console.error('Error in getStats:', error);
    res.status(500).json({ error: error.message });
  }
};

