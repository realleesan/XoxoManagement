import db from '../utils/db.js';

/**
 * Get dashboard statistics
 */
export const getDashboardStats = async () => {
  try {
    // Get total leads count
    const leadsCountQuery = `SELECT COUNT(*) as count FROM leads`;
    const leadsResult = await db.query(leadsCountQuery);
    const totalLeads = parseInt(leadsResult.rows[0].count || 0);

    // Get total customers count
    const customersCountQuery = `SELECT COUNT(*) as count FROM customers`;
    const customersResult = await db.query(customersCountQuery);
    const totalCustomers = parseInt(customersResult.rows[0].count || 0);

    // Get products in progress (status = 'DANG_LAM')
    const productsInProgressQuery = `
      SELECT COUNT(*) as count 
      FROM products 
      WHERE status = 'DANG_LAM'
    `;
    const productsResult = await db.query(productsInProgressQuery);
    const productsInProgress = parseInt(productsResult.rows[0].count || 0);

    // Get monthly revenue (current month)
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();
    
    const monthlyRevenueQuery = `
      SELECT COALESCE(SUM("totalAmount"), 0) as revenue
      FROM invoices
      WHERE status = 'PAID'
        AND "createdAt" >= $1
        AND "createdAt" <= $2
    `;
    const revenueResult = await db.query(monthlyRevenueQuery, [startOfMonth, endOfMonth]);
    const monthlyRevenue = parseFloat(revenueResult.rows[0].revenue || 0);

    // Get yearly revenue (current year)
    const startOfYear = new Date(now.getFullYear(), 0, 1).toISOString();
    const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59).toISOString();
    
    const yearlyRevenueQuery = `
      SELECT COALESCE(SUM("totalAmount"), 0) as revenue
      FROM invoices
      WHERE status = 'PAID'
        AND "createdAt" >= $1
        AND "createdAt" <= $2
    `;
    const yearlyRevenueResult = await db.query(yearlyRevenueQuery, [startOfYear, endOfYear]);
    const yearlyRevenue = parseFloat(yearlyRevenueResult.rows[0].revenue || 0);

    // Get pending invoices count
    const pendingInvoicesQuery = `
      SELECT COUNT(*) as count 
      FROM invoices 
      WHERE status = 'PENDING'
    `;
    const pendingInvoicesResult = await db.query(pendingInvoicesQuery);
    const pendingInvoices = parseInt(pendingInvoicesResult.rows[0].count || 0);

    // Get active workflows count
    const activeWorkflowsQuery = `
      SELECT COUNT(*) as count 
      FROM workflows 
      WHERE status IN ('IN_PROGRESS', 'PENDING')
    `;
    const activeWorkflowsResult = await db.query(activeWorkflowsQuery);
    const activeWorkflows = parseInt(activeWorkflowsResult.rows[0].count || 0);

    // Get recent leads (last 7 days)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const recentLeadsQuery = `
      SELECT COUNT(*) as count 
      FROM leads 
      WHERE "createdAt" >= $1
    `;
    const recentLeadsResult = await db.query(recentLeadsQuery, [sevenDaysAgo]);
    const recentLeads = parseInt(recentLeadsResult.rows[0].count || 0);

    // Get leads by status
    const leadsByStatusQuery = `
      SELECT status, COUNT(*) as count
      FROM leads
      GROUP BY status
    `;
    const leadsByStatusResult = await db.query(leadsByStatusQuery);
    const leadsByStatus = {};
    leadsByStatusResult.rows.forEach(row => {
      leadsByStatus[row.status] = parseInt(row.count || 0);
    });

    // Get revenue by month (last 6 months)
    const sixMonthsAgo = new Date(now.getTime() - 6 * 30 * 24 * 60 * 60 * 1000).toISOString();
    const revenueByMonthQuery = `
      SELECT 
        TO_CHAR("createdAt", 'YYYY-MM') as month,
        COALESCE(SUM("totalAmount"), 0) as revenue
      FROM invoices
      WHERE status = 'PAID'
        AND "createdAt" >= $1
      GROUP BY TO_CHAR("createdAt", 'YYYY-MM')
      ORDER BY month ASC
    `;
    const revenueByMonthResult = await db.query(revenueByMonthQuery, [sixMonthsAgo]);
    const revenueByMonth = revenueByMonthResult.rows.map(row => ({
      month: row.month,
      revenue: parseFloat(row.revenue || 0),
    }));

    return {
      overview: {
        totalLeads,
        totalCustomers,
        productsInProgress,
        monthlyRevenue,
        yearlyRevenue,
        pendingInvoices,
        activeWorkflows,
        recentLeads,
      },
      leadsByStatus,
      revenueByMonth,
    };
  } catch (error) {
    throw new Error('Error fetching dashboard statistics: ' + error.message);
  }
};

