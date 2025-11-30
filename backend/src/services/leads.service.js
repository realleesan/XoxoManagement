import supabase from '../utils/supabase.js';
import db from '../utils/db.js';
import { createId } from '@paralleldrive/cuid2';

/**
 * Get all leads with filters and pagination
 */
export const getAllLeads = async (filters = {}, pagination = {}) => {
  const {
    status,
    source,
    assignedTo,
    search,
    page = 1,
    limit = 20,
  } = { ...filters, ...pagination };

  // Build WHERE clause
  const whereConditions = [];
  const params = [];
  let paramIndex = 1;

  if (status) {
    whereConditions.push(`l.status = $${paramIndex++}`);
    params.push(status);
  }
  if (source) {
    whereConditions.push(`l.source = $${paramIndex++}`);
    params.push(source);
  }
  if (assignedTo) {
    whereConditions.push(`l."assignedTo" = $${paramIndex++}`);
    params.push(assignedTo);
  }
  if (search) {
    whereConditions.push(`(l.name ILIKE $${paramIndex} OR l.phone ILIKE $${paramIndex} OR l.email ILIKE $${paramIndex})`);
    params.push(`%${search}%`);
    paramIndex++;
  }

  const whereClause = whereConditions.length > 0 
    ? `WHERE ${whereConditions.join(' AND ')}`
    : '';

  // Count query
  const countQuery = `
    SELECT COUNT(*) as total
    FROM leads l
    ${whereClause}
  `;

  // Data query with join to users
  const offset = (page - 1) * limit;
  const dataQuery = `
    SELECT 
      l.*,
      CASE 
        WHEN u.id IS NOT NULL THEN json_build_object('id', u.id, 'name', u.name, 'email', u.email)
        ELSE NULL
      END as "assignedUser"
    FROM leads l
    LEFT JOIN users u ON l."assignedTo" = u.id
    ${whereClause}
    ORDER BY l."createdAt" DESC
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
      leads: dataResult.rows || [],
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    throw new Error('Error fetching leads: ' + error.message);
  }
};

/**
 * Get lead by ID with activities
 */
export const getLeadById = async (id) => {
  try {
    // Get lead with assigned user info using raw SQL
    const leadQuery = `
      SELECT 
        l.*,
        CASE 
          WHEN u.id IS NOT NULL THEN json_build_object('id', u.id, 'name', u.name, 'email', u.email)
          ELSE NULL
        END as "assignedUser"
      FROM leads l
      LEFT JOIN users u ON l."assignedTo" = u.id
      WHERE l.id = $1
    `;

    const leadResult = await db.query(leadQuery, [id]);

    if (!leadResult.rows || leadResult.rows.length === 0) {
      throw new Error('Lead not found');
    }

    const lead = leadResult.rows[0];

    // Get activities
    const activitiesQuery = `
      SELECT *
      FROM lead_activities
      WHERE "leadId" = $1
      ORDER BY "createdAt" DESC
    `;

    const activitiesResult = await db.query(activitiesQuery, [id]);

    return {
      ...lead,
      activities: activitiesResult.rows || [],
    };
  } catch (error) {
    throw new Error('Error fetching lead: ' + error.message);
  }
};

/**
 * Create a new lead
 */
export const createLead = async (leadData) => {
  const {
    name,
    phone,
    email,
    source,
    status = 'CAN_NHAC',
    assignedTo,
    notes,
  } = leadData;

  // Validation
  if (!name || !phone || !source) {
    throw new Error('Name, phone, and source are required');
  }

  const leadId = createId();
  const now = new Date().toISOString();

  // Use raw SQL để đảm bảo consistency
  const result = await db.query(
    `INSERT INTO leads (id, name, phone, email, source, status, "assignedTo", notes, "createdAt", "updatedAt")
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING *`,
    [leadId, name, phone, email || null, source, status, assignedTo || null, notes || null, now, now]
  );

  if (!result.rows || result.rows.length === 0) {
    throw new Error('Error creating lead: No data returned');
  }

  return result.rows[0];
};

/**
 * Update a lead
 */
export const updateLead = async (id, updateData) => {
  const {
    name,
    phone,
    email,
    source,
    status,
    assignedTo,
    notes,
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
  if (source !== undefined) {
    updates.push(`source = $${paramIndex++}`);
    values.push(source);
  }
  if (status !== undefined) {
    updates.push(`status = $${paramIndex++}`);
    values.push(status);
  }
  if (assignedTo !== undefined) {
    updates.push(`"assignedTo" = $${paramIndex++}`);
    values.push(assignedTo);
  }
  if (notes !== undefined) {
    updates.push(`notes = $${paramIndex++}`);
    values.push(notes);
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
    UPDATE leads
    SET ${updates.join(', ')}
    WHERE id = $${paramIndex}
    RETURNING *
  `;

  const result = await db.query(query, values);

  if (!result.rows || result.rows.length === 0) {
    throw new Error('Lead not found');
  }

  return result.rows[0];
};

/**
 * Delete a lead
 */
export const deleteLead = async (id) => {
  const { error } = await supabase
    .from('leads')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error('Error deleting lead: ' + error.message);
  }

  return { success: true };
};

/**
 * Get activities for a lead
 */
export const getLeadActivities = async (leadId) => {
  const { data, error } = await supabase
    .from('lead_activities')
    .select('*')
    .eq('leadId', leadId)
    .order('createdAt', { ascending: false });

  if (error) {
    throw new Error('Error fetching activities: ' + error.message);
  }

  return data || [];
};

/**
 * Add activity to a lead
 */
export const addActivity = async (leadId, activityData) => {
  const { type, content } = activityData;

  if (!type || !content) {
    throw new Error('Type and content are required');
  }

  const activityId = createId();
  const now = new Date().toISOString();

  const result = await db.query(
    `INSERT INTO lead_activities (id, "leadId", type, content, "createdAt")
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [activityId, leadId, type, content, now]
  );

  if (!result.rows || result.rows.length === 0) {
    throw new Error('Error creating activity: No data returned');
  }

  return result.rows[0];
};

