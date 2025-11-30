import {
  getRevenueReport,
  getTopProductsReport,
  getTopServicesReport,
  getTopCustomersReport,
  getNewCustomersReport,
  getComprehensiveReport,
} from '../services/reports.service.js';

/**
 * Get revenue report
 */
export const getRevenue = async (req, res) => {
  try {
    const { startDate, endDate, groupBy = 'day' } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'startDate and endDate are required' });
    }

    const report = await getRevenueReport(startDate, endDate, groupBy);
    res.json(report);
  } catch (error) {
    console.error('Error in getRevenue:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get top products report
 */
export const getTopProducts = async (req, res) => {
  try {
    const { startDate, endDate, limit = 10 } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'startDate and endDate are required' });
    }

    const report = await getTopProductsReport(startDate, endDate, parseInt(limit));
    res.json(report);
  } catch (error) {
    console.error('Error in getTopProducts:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get top services report
 */
export const getTopServices = async (req, res) => {
  try {
    const { startDate, endDate, limit = 10 } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'startDate and endDate are required' });
    }

    const report = await getTopServicesReport(startDate, endDate, parseInt(limit));
    res.json(report);
  } catch (error) {
    console.error('Error in getTopServices:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get top customers report
 */
export const getTopCustomers = async (req, res) => {
  try {
    const { startDate, endDate, limit = 10 } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'startDate and endDate are required' });
    }

    const report = await getTopCustomersReport(startDate, endDate, parseInt(limit));
    res.json(report);
  } catch (error) {
    console.error('Error in getTopCustomers:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get new customers report
 */
export const getNewCustomers = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'startDate and endDate are required' });
    }

    const report = await getNewCustomersReport(startDate, endDate);
    res.json(report);
  } catch (error) {
    console.error('Error in getNewCustomers:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get comprehensive report
 */
export const getComprehensive = async (req, res) => {
  try {
    const { startDate, endDate, groupBy = 'day' } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'startDate and endDate are required' });
    }

    const report = await getComprehensiveReport(startDate, endDate, groupBy);
    res.json(report);
  } catch (error) {
    console.error('Error in getComprehensive:', error);
    res.status(500).json({ error: error.message });
  }
};

