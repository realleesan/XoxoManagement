import supabase from '../utils/supabase.js';
import db from '../utils/db.js';
import { createId } from '@paralleldrive/cuid2';

/**
 * Get all products with filters and pagination
 */
export const getAllProducts = async (filters = {}, pagination = {}) => {
  const {
    customerId,
    status,
    search,
    page = 1,
    limit = 20,
  } = { ...filters, ...pagination };

  // Build WHERE clause
  const whereConditions = [];
  const params = [];
  let paramIndex = 1;

  if (customerId) {
    whereConditions.push(`p."customerId" = $${paramIndex++}`);
    params.push(customerId);
  }
  if (status) {
    whereConditions.push(`p.status = $${paramIndex++}`);
    params.push(status);
  }
  if (search) {
    whereConditions.push(`(p.name ILIKE $${paramIndex} OR p.description ILIKE $${paramIndex})`);
    params.push(`%${search}%`);
    paramIndex++;
  }

  const whereClause = whereConditions.length > 0 
    ? `WHERE ${whereConditions.join(' AND ')}`
    : '';

  // Count query
  const countQuery = `
    SELECT COUNT(*) as total
    FROM products p
    ${whereClause}
  `;

  // Data query with join to customers
  const offset = (page - 1) * limit;
  const dataQuery = `
    SELECT 
      p.*,
      json_build_object('id', c.id, 'name', c.name, 'phone', c.phone) as customer
    FROM products p
    LEFT JOIN customers c ON p."customerId" = c.id
    ${whereClause}
    ORDER BY p."createdAt" DESC
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
      products: dataResult.rows || [],
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    throw new Error('Error fetching products: ' + error.message);
  }
};

/**
 * Get product by ID with related data
 */
export const getProductById = async (id) => {
  try {
    // Get product with customer info
    const productQuery = `
      SELECT 
        p.*,
        json_build_object('id', c.id, 'name', c.name, 'phone', c.phone, 'email', c.email) as customer
      FROM products p
      LEFT JOIN customers c ON p."customerId" = c.id
      WHERE p.id = $1
    `;

    const productResult = await db.query(productQuery, [id]);

    if (!productResult.rows || productResult.rows.length === 0) {
      throw new Error('Product not found');
    }

    const product = productResult.rows[0];

    // Get workflows count (will be implemented later)
    const workflowsCountQuery = `
      SELECT COUNT(*) as count
      FROM workflows
      WHERE "productId" = $1
    `;
    const workflowsResult = await db.query(workflowsCountQuery, [id]);
    product.workflowsCount = parseInt(workflowsResult.rows[0].count || 0);

    return product;
  } catch (error) {
    throw new Error('Error fetching product: ' + error.message);
  }
};

/**
 * Create a new product
 */
export const createProduct = async (productData) => {
  const {
    customerId,
    name,
    description,
    status = 'DANG_LAM',
    images = [],
  } = productData;

  // Validation
  if (!customerId || !name) {
    throw new Error('Customer ID and name are required');
  }

  const productId = createId();
  const now = new Date().toISOString();

  // Use raw SQL - images is TEXT[] array in PostgreSQL
  const imagesArray = Array.isArray(images) && images.length > 0 ? images : [];
  
  const result = await db.query(
    `INSERT INTO products (id, "customerId", name, description, status, images, "createdAt", "updatedAt")
     VALUES ($1, $2, $3, $4, $5, $6::text[], $7, $8)
     RETURNING *`,
    [productId, customerId, name, description || null, status, imagesArray, now, now]
  );

  if (!result.rows || result.rows.length === 0) {
    throw new Error('Error creating product: No data returned');
  }

  // Parse images array
  const product = result.rows[0];
  if (typeof product.images === 'string') {
    try {
      product.images = JSON.parse(product.images);
    } catch (e) {
      product.images = [];
    }
  }

  return product;
};

/**
 * Update a product
 */
export const updateProduct = async (id, updateData) => {
  const {
    name,
    description,
    status,
    images,
  } = updateData;

  // Build update query dynamically
  const updates = [];
  const values = [];
  let paramIndex = 1;

  if (name !== undefined) {
    updates.push(`name = $${paramIndex++}`);
    values.push(name);
  }
  if (description !== undefined) {
    updates.push(`description = $${paramIndex++}`);
    values.push(description);
  }
  if (status !== undefined) {
    updates.push(`status = $${paramIndex++}`);
    values.push(status);
  }
  if (images !== undefined) {
    const imagesArray = Array.isArray(images) ? images : [];
    updates.push(`images = $${paramIndex++}::text[]`);
    values.push(imagesArray);
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
    UPDATE products
    SET ${updates.join(', ')}
    WHERE id = $${paramIndex}
    RETURNING *
  `;

  const result = await db.query(query, values);

  if (!result.rows || result.rows.length === 0) {
    throw new Error('Product not found');
  }

  // Parse images array
  const product = result.rows[0];
  if (typeof product.images === 'string') {
    try {
      product.images = JSON.parse(product.images);
    } catch (e) {
      product.images = [];
    }
  }

  return product;
};

/**
 * Delete a product
 */
export const deleteProduct = async (id) => {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error('Error deleting product: ' + error.message);
  }

  return { success: true };
};

