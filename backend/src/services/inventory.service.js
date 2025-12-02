import db from '../utils/db.js';
import { createId } from '@paralleldrive/cuid2';

/**
 * Inventory service using raw SQL against `materials` table
 */
// Cache existing columns to avoid repeated information_schema queries
const _existingColumnsCache = {
  cols: new Set(),
  updatedAt: 0, // timestamp
  ttl: 60 * 1000, // 1 minute
};

async function getExistingColumns() {
  const now = Date.now();
  if (now - _existingColumnsCache.updatedAt < _existingColumnsCache.ttl && _existingColumnsCache.cols.size > 0) {
    return _existingColumnsCache.cols;
  }
  const res = await db.query(
    `SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'materials'`
  );
  const cols = new Set((res.rows || []).map((r) => r.column_name));
  _existingColumnsCache.cols = cols;
  _existingColumnsCache.updatedAt = now;
  return cols;
}

export const getAllMaterials = async (filters = {}, pagination = {}) => {
  const {
    search,
    category,
    page = 1,
    limit = 20,
  } = { ...filters, ...pagination };

  const cols = await getExistingColumns();

  const whereConditions = [];
  const params = [];
  let idx = 1;

  if (category && cols.has('category')) {
    whereConditions.push(`category = $${idx++}`);
    params.push(category);
  }
  if (search) {
    const searchConds = [];
    if (cols.has('name')) searchConds.push(`name ILIKE $${idx}`);
    if (cols.has('sku')) searchConds.push(`sku ILIKE $${idx}`);
    if (searchConds.length > 0) {
      whereConditions.push(`(${searchConds.join(' OR ')})`);
      params.push(`%${search}%`);
      idx++;
    }
  }

  const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

  const countQuery = `SELECT COUNT(*) as total FROM materials ${whereClause}`;
  const offset = (page - 1) * limit;
  const dataQuery = `
    SELECT * FROM materials
    ${whereClause}
    ORDER BY "createdAt" DESC
    LIMIT $${idx++} OFFSET $${idx++}
  `;

  try {
    const countResult = await db.query(countQuery, params);
    const total = parseInt(countResult.rows[0].total || 0);
    const dataParams = [...params, limit, offset];
    const dataResult = await db.query(dataQuery, dataParams);
    return {
      items: dataResult.rows || [],
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    throw new Error('Error fetching materials: ' + error.message);
  }
};

export const getMaterialById = async (id) => {
  const query = `SELECT * FROM materials WHERE id = $1`;
  const result = await db.query(query, [id]);
  if (!result.rows || result.rows.length === 0) {
    throw new Error('Material not found');
  }
  return result.rows[0];
};

export const createMaterial = async (data) => {
  const {
    name,
    category,
    unit,
    quantity = 0,
    minQuantity = null,
    expiryDate = null,
    sku = null,
    location = null,
    notes = null,
  } = data;

  if (!name) {
    throw new Error('Name is required');
  }

  const id = createId();
  const now = new Date().toISOString();
  // Ensure category non-null to satisfy DB NOT NULL constraint
  const safeCategory = category || 'OTHER';
  // Build insert dynamically based on existing columns
  const existing = await getExistingColumns();
  const insertCols = ['id', 'name'];
  const insertVals = [id, name];
  if (existing.has('sku')) {
    insertCols.push('sku');
    insertVals.push(sku);
  }
  if (existing.has('category')) {
    insertCols.push('category');
    insertVals.push(safeCategory);
  }
  if (existing.has('unit')) {
    insertCols.push('unit');
    insertVals.push(unit || null);
  }
  if (existing.has('quantity')) {
    insertCols.push('quantity');
    insertVals.push(quantity);
  }
  if (existing.has('minQuantity')) {
    insertCols.push('"minQuantity"');
    insertVals.push(minQuantity);
  }
  if (existing.has('expiryDate')) {
    insertCols.push('"expiryDate"');
    insertVals.push(expiryDate);
  }
  if (existing.has('location')) {
    insertCols.push('location');
    insertVals.push(location);
  }
  if (existing.has('notes')) {
    insertCols.push('notes');
    insertVals.push(notes);
  }
  // always add timestamps if columns exist
  if (existing.has('createdAt')) {
    insertCols.push('"createdAt"');
    insertVals.push(now);
  }
  if (existing.has('updatedAt')) {
    insertCols.push('"updatedAt"');
    insertVals.push(now);
  }

  const placeholders = insertVals.map((_, i) => `$${i + 1}`).join(', ');
  const query = `INSERT INTO materials (${insertCols.join(', ')}) VALUES (${placeholders}) RETURNING *`;
  const result = await db.query(query, insertVals);
  return result.rows[0];
};

export const updateMaterial = async (id, updateData) => {
  const fields = [];
  const values = [];
  let idx = 1;

  const existing = await getExistingColumns();
  for (const [key, val] of Object.entries(updateData)) {
    // allow updating only specific fields if they exist in DB
    if (['name','sku','category','unit','quantity','minQuantity','expiryDate','location','notes'].includes(key) && existing.has(key)) {
      // handle quoted camelCase column names like minQuantity/expiryDate if present
      const colName = key === 'minQuantity' || key === 'expiryDate' || key === 'createdAt' || key === 'updatedAt'
        ? `"${key}"`
        : key;
      fields.push(`${colName} = $${idx++}`);
      values.push(val);
    }
  }

  if (fields.length === 0) {
    throw new Error('No fields to update');
  }
  fields.push(`"updatedAt" = $${idx++}`);
  values.push(new Date().toISOString());
  values.push(id);

  const query = `
    UPDATE materials
    SET ${fields.join(', ')}
    WHERE id = $${idx}
    RETURNING *
  `;
  const result = await db.query(query, values);
  if (!result.rows || result.rows.length === 0) {
    throw new Error('Material not found');
  }
  return result.rows[0];
};

export const deleteMaterial = async (id) => {
  await db.query(`DELETE FROM materials WHERE id = $1`, [id]);
  return { success: true };
};


