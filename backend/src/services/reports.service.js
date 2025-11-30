import db from '../utils/db.js';

/**
 * Get revenue report by date range
 */
export const getRevenueReport = async (startDate, endDate, groupBy = 'day') => {
  try {
    let dateFormat, groupByClause;
    
    switch (groupBy) {
      case 'day':
        dateFormat = 'YYYY-MM-DD';
        groupByClause = 'TO_CHAR("createdAt", \'YYYY-MM-DD\')';
        break;
      case 'week':
        dateFormat = 'YYYY-"W"WW';
        groupByClause = 'TO_CHAR("createdAt", \'YYYY-"W"IW\')';
        break;
      case 'month':
        dateFormat = 'YYYY-MM';
        groupByClause = 'TO_CHAR("createdAt", \'YYYY-MM\')';
        break;
      case 'year':
        dateFormat = 'YYYY';
        groupByClause = 'TO_CHAR("createdAt", \'YYYY\')';
        break;
      default:
        dateFormat = 'YYYY-MM-DD';
        groupByClause = 'TO_CHAR("createdAt", \'YYYY-MM-DD\')';
    }

    const query = `
      SELECT 
        ${groupByClause} as period,
        COALESCE(SUM("totalAmount"), 0) as revenue,
        COUNT(*) as invoiceCount
      FROM invoices
      WHERE status = 'PAID'
        AND "createdAt" >= $1
        AND "createdAt" <= $2
      GROUP BY ${groupByClause}
      ORDER BY period ASC
    `;

    const result = await db.query(query, [startDate, endDate]);
    return result.rows.map(row => ({
      period: row.period,
      revenue: parseFloat(row.revenue || 0),
      invoiceCount: parseInt(row.invoiceCount || 0),
    }));
  } catch (error) {
    throw new Error('Error fetching revenue report: ' + error.message);
  }
};

/**
 * Get top products report
 */
export const getTopProductsReport = async (startDate, endDate, limit = 10) => {
  try {
    const query = `
      SELECT 
        p.id,
        p.name,
        p.status,
        COUNT(ii.id) as usageCount,
        COALESCE(SUM(ii.price * ii.quantity), 0) as totalRevenue
      FROM products p
      INNER JOIN invoice_items ii ON p.id = ii."productId"
      INNER JOIN invoices i ON ii."invoiceId" = i.id
      WHERE i.status = 'PAID'
        AND i."createdAt" >= $1
        AND i."createdAt" <= $2
      GROUP BY p.id, p.name, p.status
      ORDER BY totalRevenue DESC
      LIMIT $3
    `;

    const result = await db.query(query, [startDate, endDate, limit]);
    return result.rows.map(row => ({
      productId: row.id,
      productName: row.name,
      status: row.status,
      usageCount: parseInt(row.usageCount || 0),
      totalRevenue: parseFloat(row.totalRevenue || 0),
    }));
  } catch (error) {
    throw new Error('Error fetching top products report: ' + error.message);
  }
};

/**
 * Get top services report
 */
export const getTopServicesReport = async (startDate, endDate, limit = 10) => {
  try {
    const query = `
      SELECT 
        s.id,
        s.name,
        s.category,
        COUNT(ii.id) as usageCount,
        COALESCE(SUM(ii.price * ii.quantity), 0) as totalRevenue
      FROM services s
      INNER JOIN invoice_items ii ON s.id = ii."serviceId"
      INNER JOIN invoices i ON ii."invoiceId" = i.id
      WHERE i.status = 'PAID'
        AND i."createdAt" >= $1
        AND i."createdAt" <= $2
      GROUP BY s.id, s.name, s.category
      ORDER BY totalRevenue DESC
      LIMIT $3
    `;

    const result = await db.query(query, [startDate, endDate, limit]);
    return result.rows.map(row => ({
      serviceId: row.id,
      serviceName: row.name,
      category: row.category,
      usageCount: parseInt(row.usageCount || 0),
      totalRevenue: parseFloat(row.totalRevenue || 0),
    }));
  } catch (error) {
    throw new Error('Error fetching top services report: ' + error.message);
  }
};

/**
 * Get top customers report
 */
export const getTopCustomersReport = async (startDate, endDate, limit = 10) => {
  try {
    const query = `
      SELECT 
        c.id,
        c.name,
        c.phone,
        c.email,
        COUNT(DISTINCT i.id) as invoiceCount,
        COALESCE(SUM(i."totalAmount"), 0) as totalSpent
      FROM customers c
      INNER JOIN invoices i ON c.id = i."customerId"
      WHERE i.status = 'PAID'
        AND i."createdAt" >= $1
        AND i."createdAt" <= $2
      GROUP BY c.id, c.name, c.phone, c.email
      ORDER BY totalSpent DESC
      LIMIT $3
    `;

    const result = await db.query(query, [startDate, endDate, limit]);
    return result.rows.map(row => ({
      customerId: row.id,
      customerName: row.name,
      phone: row.phone,
      email: row.email,
      invoiceCount: parseInt(row.invoiceCount || 0),
      totalSpent: parseFloat(row.totalSpent || 0),
    }));
  } catch (error) {
    throw new Error('Error fetching top customers report: ' + error.message);
  }
};

/**
 * Get new customers report
 */
export const getNewCustomersReport = async (startDate, endDate) => {
  try {
    const query = `
      SELECT 
        TO_CHAR("createdAt", 'YYYY-MM-DD') as date,
        COUNT(*) as count
      FROM customers
      WHERE "createdAt" >= $1
        AND "createdAt" <= $2
      GROUP BY TO_CHAR("createdAt", 'YYYY-MM-DD')
      ORDER BY date ASC
    `;

    const result = await db.query(query, [startDate, endDate]);
    return result.rows.map(row => ({
      date: row.date,
      count: parseInt(row.count || 0),
    }));
  } catch (error) {
    throw new Error('Error fetching new customers report: ' + error.message);
  }
};

/**
 * Get comprehensive report
 */
export const getComprehensiveReport = async (startDate, endDate, groupBy = 'day') => {
  try {
    const [
      revenueReport,
      topProducts,
      topServices,
      topCustomers,
      newCustomers,
    ] = await Promise.all([
      getRevenueReport(startDate, endDate, groupBy),
      getTopProductsReport(startDate, endDate, 10),
      getTopServicesReport(startDate, endDate, 10),
      getTopCustomersReport(startDate, endDate, 10),
      getNewCustomersReport(startDate, endDate),
    ]);

    // Calculate summary statistics
    const totalRevenue = revenueReport.reduce((sum, item) => sum + item.revenue, 0);
    const totalInvoices = revenueReport.reduce((sum, item) => sum + item.invoiceCount, 0);
    const totalNewCustomers = newCustomers.reduce((sum, item) => sum + item.count, 0);

    return {
      summary: {
        totalRevenue,
        totalInvoices,
        totalNewCustomers,
        averageInvoiceValue: totalInvoices > 0 ? totalRevenue / totalInvoices : 0,
      },
      revenueReport,
      topProducts,
      topServices,
      topCustomers,
      newCustomers,
    };
  } catch (error) {
    throw new Error('Error fetching comprehensive report: ' + error.message);
  }
};

