import supabase from '../utils/supabase.js';
import db from '../utils/db.js';
import { createId } from '@paralleldrive/cuid2';

/**
 * Get all services with filters and pagination
 */
export const getAllServices = async (filters = {}, pagination = {}) => {
  const {
    category,
    search,
    page = 1,
    limit = 100, // Services thường không nhiều, limit cao hơn
  } = { ...filters, ...pagination };

  // Build WHERE clause
  const whereConditions = [];
  const params = [];
  let paramIndex = 1;

  if (category) {
    whereConditions.push(`category = $${paramIndex++}`);
    params.push(category);
  }
  if (search) {
    whereConditions.push(`(name ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`);
    params.push(`%${search}%`);
    paramIndex++;
  }

  const whereClause = whereConditions.length > 0 
    ? `WHERE ${whereConditions.join(' AND ')}`
    : '';

  // Count query
  const countQuery = `
    SELECT COUNT(*) as total
    FROM services
    ${whereClause}
  `;

  // Data query
  const offset = (page - 1) * limit;
  const dataQuery = `
    SELECT *
    FROM services
    ${whereClause}
    ORDER BY category, name
    LIMIT $${paramIndex++} OFFSET $${paramIndex++}
  `;

  try {
    // Get count
    const countResult = await db.query(countQuery, params);
    const total = parseInt(countResult.rows[0].total);

    // Get data
    const dataParams = [...params, limit, offset];
    const dataResult = await db.query(dataQuery, dataParams);

    return {
      services: dataResult.rows || [],
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    throw new Error('Error fetching services: ' + error.message);
  }
};

/**
 * Get service by ID
 */
export const getServiceById = async (id) => {
  try {
    const query = `
      SELECT *
      FROM services
      WHERE id = $1
    `;

    const result = await db.query(query, [id]);

    if (!result.rows || result.rows.length === 0) {
      throw new Error('Service not found');
    }

    return result.rows[0];
  } catch (error) {
    throw new Error('Error fetching service: ' + error.message);
  }
};

/**
 * Create a new service
 */
export const createService = async (serviceData) => {
  const {
    name,
    category,
    price,
    description,
  } = serviceData;

  // Validation
  if (!name || !category || price === undefined || price === null) {
    throw new Error('Name, category, and price are required');
  }

  const serviceId = createId();
  const now = new Date().toISOString();

  // Use raw SQL
  const result = await db.query(
    `INSERT INTO services (id, name, category, price, description, "createdAt", "updatedAt")
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [serviceId, name, category, parseFloat(price), description || null, now, now]
  );

  if (!result.rows || result.rows.length === 0) {
    throw new Error('Error creating service: No data returned');
  }

  return result.rows[0];
};

/**
 * Update a service
 */
export const updateService = async (id, updateData) => {
  const {
    name,
    category,
    price,
    description,
  } = updateData;

  // Build update query dynamically
  const updates = [];
  const values = [];
  let paramIndex = 1;

  if (name !== undefined) {
    updates.push(`name = $${paramIndex++}`);
    values.push(name);
  }
  if (category !== undefined) {
    updates.push(`category = $${paramIndex++}`);
    values.push(category);
  }
  if (price !== undefined && price !== null) {
    updates.push(`price = $${paramIndex++}`);
    values.push(parseFloat(price));
  }
  if (description !== undefined) {
    updates.push(`description = $${paramIndex++}`);
    values.push(description);
  }

  if (updates.length === 0) {
    throw new Error('No fields to update');
  }

  // Add updatedAt
  updates.push(`"updatedAt" = $${paramIndex++}`);
  values.push(new Date().toISOString());

  // Add id for WHERE clause
  values.push(id);

  const query = `
    UPDATE services
    SET ${updates.join(', ')}
    WHERE id = $${paramIndex}
    RETURNING *
  `;

  const result = await db.query(query, values);

  if (!result.rows || result.rows.length === 0) {
    throw new Error('Service not found');
  }

  return result.rows[0];
};

/**
 * Delete a service
 */
export const deleteService = async (id) => {
  try {
    const query = `DELETE FROM services WHERE id = $1 RETURNING id`;
    const result = await db.query(query, [id]);

    if (!result.rows || result.rows.length === 0) {
      throw new Error('Service not found');
    }

    return { success: true };
  } catch (error) {
    throw new Error('Error deleting service: ' + error.message);
  }
};

/**
 * Get services by category
 */
export const getServicesByCategory = async (category) => {
  try {
    const query = `
      SELECT *
      FROM services
      WHERE category = $1
      ORDER BY name
    `;

    const result = await db.query(query, [category]);

    return result.rows || [];
  } catch (error) {
    throw new Error('Error fetching services by category: ' + error.message);
  }
};

/**
 * Get all categories
 */
export const getCategories = async () => {
  try {
    const query = `
      SELECT DISTINCT category
      FROM services
      ORDER BY category
    `;

    const result = await db.query(query);

    return result.rows.map(row => row.category) || [];
  } catch (error) {
    throw new Error('Error fetching categories: ' + error.message);
  }
};

