import db from '../utils/db.js';
import { createId } from '@paralleldrive/cuid2';

export const getAllTransactions = async (filters = {}, pagination = {}) => {
  const {
    type,
    status,
    startDate,
    endDate,
    page = 1,
    limit = 20,
  } = { ...filters, ...pagination };

  const where = [];
  const params = [];
  let idx = 1;

  if (type) {
    where.push(`type = $${idx++}`);
    params.push(type);
  }
  if (status) {
    where.push(`status = $${idx++}`);
    params.push(status);
  }
  if (startDate) {
    where.push(`"createdAt" >= $${idx++}`);
    params.push(startDate);
  }
  if (endDate) {
    where.push(`"createdAt" <= $${idx++}`);
    params.push(endDate);
  }

  const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const countQ = `SELECT COUNT(*) as total FROM transactions ${whereClause}`;
  const offset = (page - 1) * limit;
  const dataQ = `
    SELECT * FROM transactions
    ${whereClause}
    ORDER BY "createdAt" DESC
    LIMIT $${idx++} OFFSET $${idx++}
  `;

  try {
    const countRes = await db.query(countQ, params);
    const total = parseInt(countRes.rows[0].total || 0);
    const dataParams = [...params, limit, offset];
    const dataRes = await db.query(dataQ, dataParams);

    // summary
    const summaryQ = `
      SELECT
        COALESCE(SUM(CASE WHEN type = 'REVENUE' THEN amount ELSE 0 END), 0) AS total_revenue,
        COALESCE(SUM(CASE WHEN type = 'EXPENSE' THEN amount ELSE 0 END), 0) AS total_expense
      FROM transactions
      ${whereClause}
    `;
    const summaryRes = await db.query(summaryQ, params);

    return {
      transactions: dataRes.rows || [],
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      summary: {
        totalRevenue: parseFloat(summaryRes.rows[0].total_revenue || 0),
        totalExpense: parseFloat(summaryRes.rows[0].total_expense || 0),
      },
    };
  } catch (error) {
    throw new Error('Error fetching transactions: ' + error.message);
  }
};

export const getTransactionById = async (id) => {
  const res = await db.query(`SELECT * FROM transactions WHERE id = $1`, [id]);
  if (!res.rows || res.rows.length === 0) {
    throw new Error('Transaction not found');
  }
  return res.rows[0];
};

export const createTransaction = async (data) => {
  const { type, amount, description = null, status = 'PENDING' } = data;
  if (!type || amount === undefined) {
    throw new Error('Type and amount are required');
  }
  const id = createId();
  const now = new Date().toISOString();
  const res = await db.query(
    `INSERT INTO transactions (id, type, amount, description, status, "createdAt", "updatedAt")
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
    [id, type, amount, description, status, now, now]
  );
  return res.rows[0];
};

export const updateTransaction = async (id, updateData) => {
  const fields = [];
  const values = [];
  let idx = 1;
  for (const [k, v] of Object.entries(updateData)) {
    if (['type', 'amount', 'description', 'status'].includes(k)) {
      fields.push(`${k} = $${idx++}`);
      values.push(v);
    }
  }
  if (fields.length === 0) throw new Error('No fields to update');
  fields.push(`"updatedAt" = $${idx++}`);
  values.push(new Date().toISOString());
  values.push(id);
  const q = `UPDATE transactions SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`;
  const res = await db.query(q, values);
  if (!res.rows || res.rows.length === 0) throw new Error('Transaction not found');
  return res.rows[0];
};

export const deleteTransaction = async (id) => {
  await db.query(`DELETE FROM transactions WHERE id = $1`, [id]);
  return { success: true };
};


