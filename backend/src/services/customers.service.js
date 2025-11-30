import supabase from '../utils/supabase.js';
import db from '../utils/db.js';
import { createId } from '@paralleldrive/cuid2';

/**
 * Get all customers with filters and pagination
 */
export const getAllCustomers = async (filters = {}, pagination = {}) => {
  const {
    search,
    page = 1,
    limit = 20,
  } = { ...filters, ...pagination };

  // Build WHERE clause
  const whereConditions = [];
  const params = [];
  let paramIndex = 1;

  if (search) {
    whereConditions.push(`(c.name ILIKE $${paramIndex} OR c.phone ILIKE $${paramIndex} OR c.email ILIKE $${paramIndex})`);
    params.push(`%${search}%`);
    paramIndex++;
  }

  const whereClause = whereConditions.length > 0 
    ? `WHERE ${whereConditions.join(' AND ')}`
    : '';

  // Count query
  const countQuery = `
    SELECT COUNT(*) as total
    FROM customers c
    ${whereClause}
  `;

  // Data query with join to leads
  const offset = (page - 1) * limit;
  const dataQuery = `
    SELECT 
      c.*,
      CASE 
        WHEN l.id IS NOT NULL THEN json_build_object('id', l.id, 'name', l.name, 'status', l.status)
        ELSE NULL
      END as "lead"
    FROM customers c
    LEFT JOIN leads l ON c."leadId" = l.id
    ${whereClause}
    ORDER BY c."createdAt" DESC
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
      customers: dataResult.rows || [],
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    throw new Error('Error fetching customers: ' + error.message);
  }
};

/**
 * Get customer by ID with related data
 */
export const getCustomerById = async (id) => {
  try {
    // Get customer with lead info
    const customerQuery = `
      SELECT 
        c.*,
        CASE 
          WHEN l.id IS NOT NULL THEN json_build_object('id', l.id, 'name', l.name, 'status', l.status)
          ELSE NULL
        END as "lead"
      FROM customers c
      LEFT JOIN leads l ON c."leadId" = l.id
      WHERE c.id = $1
    `;

    const customerResult = await db.query(customerQuery, [id]);

    if (!customerResult.rows || customerResult.rows.length === 0) {
      throw new Error('Customer not found');
    }

    const customer = customerResult.rows[0];

    // Get products count (will be implemented later)
    const productsCountQuery = `
      SELECT COUNT(*) as count
      FROM products
      WHERE "customerId" = $1
    `;
    const productsResult = await db.query(productsCountQuery, [id]);
    customer.productsCount = parseInt(productsResult.rows[0].count || 0);

    // Get invoices count (will be implemented later)
    const invoicesCountQuery = `
      SELECT COUNT(*) as count
      FROM invoices
      WHERE "customerId" = $1
    `;
    const invoicesResult = await db.query(invoicesCountQuery, [id]);
    customer.invoicesCount = parseInt(invoicesResult.rows[0].count || 0);

    return customer;
  } catch (error) {
    throw new Error('Error fetching customer: ' + error.message);
  }
};

/**
 * Create a new customer
 */
export const createCustomer = async (customerData) => {
  const {
    name,
    phone,
    email,
    address,
    leadId,
  } = customerData;

  // Validation
  if (!name || !phone) {
    throw new Error('Name and phone are required');
  }

  const customerId = createId();
  const now = new Date().toISOString();

  // Use raw SQL
  const result = await db.query(
    `INSERT INTO customers (id, name, phone, email, address, "leadId", "createdAt", "updatedAt")
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [customerId, name, phone, email || null, address || null, leadId || null, now, now]
  );

  if (!result.rows || result.rows.length === 0) {
    throw new Error('Error creating customer: No data returned');
  }

  return result.rows[0];
};

/**
 * Update a customer
 */
export const updateCustomer = async (id, updateData) => {
  const {
    name,
    phone,
    email,
    address,
  } = updateData;

  // Build update query dynamically
  const updates = [];
  const values = [];
  let paramIndex = 1;

  if (name !== undefined) {
    updates.push(`name = $${paramIndex++}`);
    values.push(name);
  }
  if (phone !== undefined) {
    updates.push(`phone = $${paramIndex++}`);
    values.push(phone);
  }
  if (email !== undefined) {
    updates.push(`email = $${paramIndex++}`);
    values.push(email);
  }
  if (address !== undefined) {
    updates.push(`address = $${paramIndex++}`);
    values.push(address);
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
    UPDATE customers
    SET ${updates.join(', ')}
    WHERE id = $${paramIndex}
    RETURNING *
  `;

  const result = await db.query(query, values);

  if (!result.rows || result.rows.length === 0) {
    throw new Error('Customer not found');
  }

  return result.rows[0];
};

/**
 * Delete a customer
 */
export const deleteCustomer = async (id) => {
  const { error } = await supabase
    .from('customers')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error('Error deleting customer: ' + error.message);
  }

  return { success: true };
};

/**
 * Convert lead to customer
 */
export const convertLeadToCustomer = async (leadId, customerData = {}) => {
  try {
    // Get lead info
    const leadQuery = `
      SELECT id, name, phone, email
      FROM leads
      WHERE id = $1
    `;
    const leadResult = await db.query(leadQuery, [leadId]);

    if (!leadResult.rows || leadResult.rows.length === 0) {
      throw new Error('Lead not found');
    }

    const lead = leadResult.rows[0];

    // Check if customer already exists for this lead
    const existingCustomerQuery = `
      SELECT id
      FROM customers
      WHERE "leadId" = $1
    `;
    const existingResult = await db.query(existingCustomerQuery, [leadId]);

    if (existingResult.rows && existingResult.rows.length > 0) {
      throw new Error('Customer already exists for this lead');
    }

    // Create customer from lead data
    const customerId = createId();
    const now = new Date().toISOString();

    const createQuery = `
      INSERT INTO customers (id, name, phone, email, address, "leadId", "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;

    const result = await db.query(createQuery, [
      customerId,
      customerData.name || lead.name,
      customerData.phone || lead.phone,
      customerData.email || lead.email || null,
      customerData.address || null,
      leadId,
      now,
      now,
    ]);

    if (!result.rows || result.rows.length === 0) {
      throw new Error('Error creating customer: No data returned');
    }

    return result.rows[0];
  } catch (error) {
    throw new Error('Error converting lead to customer: ' + error.message);
  }
};

