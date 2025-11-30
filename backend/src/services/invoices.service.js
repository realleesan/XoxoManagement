import db from '../utils/db.js';
import { createId } from '@paralleldrive/cuid2';

/**
 * Generate invoice number (format: INV-YYYYMMDD-XXXX)
 */
const generateInvoiceNo = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `INV-${year}${month}${day}-${random}`;
};

/**
 * Generate QR code data for invoice item
 */
const generateQRCode = (invoiceNo, productId, serviceId) => {
  return `${invoiceNo}|${productId}|${serviceId}`;
};

/**
 * Get all invoices with filters and pagination
 */
export const getAllInvoices = async (filters = {}, pagination = {}) => {
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
    whereConditions.push(`i."customerId" = $${paramIndex++}`);
    params.push(customerId);
  }
  if (status) {
    whereConditions.push(`i.status = $${paramIndex++}`);
    params.push(status);
  }
  if (search) {
    whereConditions.push(`(i."invoiceNo" ILIKE $${paramIndex} OR c.name ILIKE $${paramIndex})`);
    params.push(`%${search}%`);
    paramIndex++;
  }

  const whereClause = whereConditions.length > 0 
    ? `WHERE ${whereConditions.join(' AND ')}`
    : '';

  // Count query
  const countQuery = `
    SELECT COUNT(*) as total
    FROM invoices i
    LEFT JOIN customers c ON i."customerId" = c.id
    ${whereClause}
  `;

  // Data query
  const offset = (page - 1) * limit;
  const dataQuery = `
    SELECT 
      i.*,
      c.name as "customerName",
      c.phone as "customerPhone",
      c.email as "customerEmail",
      COUNT(ii.id) as "itemsCount"
    FROM invoices i
    LEFT JOIN customers c ON i."customerId" = c.id
    LEFT JOIN invoice_items ii ON i.id = ii."invoiceId"
    ${whereClause}
    GROUP BY i.id, c.name, c.phone, c.email
    ORDER BY i."createdAt" DESC
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
      invoices: dataResult.rows || [],
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    throw new Error('Error fetching invoices: ' + error.message);
  }
};

/**
 * Get invoice by ID with all items
 */
export const getInvoiceById = async (id) => {
  try {
    // Get invoice with customer info
    const invoiceQuery = `
      SELECT 
        i.*,
        c.name as "customerName",
        c.phone as "customerPhone",
        c.email as "customerEmail",
        c.address as "customerAddress"
      FROM invoices i
      LEFT JOIN customers c ON i."customerId" = c.id
      WHERE i.id = $1
    `;
    const invoiceResult = await db.query(invoiceQuery, [id]);

    if (!invoiceResult.rows || invoiceResult.rows.length === 0) {
      throw new Error('Invoice not found');
    }

    const invoice = invoiceResult.rows[0];

    // Get invoice items with product and service info
    const itemsQuery = `
      SELECT 
        ii.*,
        p.name as "productName",
        p.images as "productImages",
        s.name as "serviceName",
        s.category as "serviceCategory"
      FROM invoice_items ii
      LEFT JOIN products p ON ii."productId" = p.id
      LEFT JOIN services s ON ii."serviceId" = s.id
      WHERE ii."invoiceId" = $1
      ORDER BY ii.id ASC
    `;
    const itemsResult = await db.query(itemsQuery, [id]);

    // Group items by product
    const itemsByProduct = {};
    itemsResult.rows.forEach(item => {
      const productId = item.productId || 'no-product';
      if (!itemsByProduct[productId]) {
        itemsByProduct[productId] = {
          productId: item.productId,
          productName: item.productName,
          productImages: item.productImages || [],
          items: [],
        };
      }
      itemsByProduct[productId].items.push({
        id: item.id,
        serviceId: item.serviceId,
        serviceName: item.serviceName,
        serviceCategory: item.serviceCategory,
        name: item.name,
        quantity: item.quantity,
        price: parseFloat(item.price),
        notes: item.notes,
        images: item.images || [],
        qrCode: item.qrCode,
      });
    });

    return {
      ...invoice,
      items: itemsResult.rows || [],
      itemsByProduct: Object.values(itemsByProduct),
    };
  } catch (error) {
    throw new Error('Error fetching invoice: ' + error.message);
  }
};

/**
 * Create a new invoice with items
 */
export const createInvoice = async (invoiceData) => {
  const {
    customerId,
    items = [], // Array of { productId, serviceId, name, quantity, price, notes, images }
  } = invoiceData;

  // Validation
  if (!customerId || !items || items.length === 0) {
    throw new Error('Customer ID and at least one item are required');
  }

  const invoiceId = createId();
  const invoiceNo = generateInvoiceNo();
  const now = new Date().toISOString();

  const client = await db.getClient();
  try {
    await client.query('BEGIN');

    // Create invoice
    const invoiceResult = await client.query(
      `INSERT INTO invoices (id, "customerId", "invoiceNo", "totalAmount", status, "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [invoiceId, customerId, invoiceNo, 0, 'PENDING', now, now]
    );

    // Create invoice items
    for (const item of items) {
      const itemId = createId();
      const qrCode = generateQRCode(invoiceNo, item.productId || '', item.serviceId || '');
      const imagesArray = Array.isArray(item.images) ? item.images : (item.images ? [item.images] : []);

      await client.query(
        `INSERT INTO invoice_items (id, "invoiceId", "productId", "serviceId", name, quantity, price, notes, images, "qrCode")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::text[], $10)`,
        [
          itemId,
          invoiceId,
          item.productId || null,
          item.serviceId || null,
          item.name,
          item.quantity || 1,
          parseFloat(item.price),
          item.notes || null,
          imagesArray,
          qrCode,
        ]
      );
    }

    await client.query('COMMIT');
    client.release();

    // Return invoice with items (totalAmount will be auto-calculated by trigger)
    return await getInvoiceById(invoiceId);
  } catch (error) {
    try {
      await client.query('ROLLBACK');
    } catch (rollbackError) {
      console.error('Error rolling back transaction:', rollbackError);
    }
    try {
      client.release();
    } catch (releaseError) {
      console.error('Error releasing client:', releaseError);
    }
    throw new Error('Error creating invoice: ' + error.message);
  }
};

/**
 * Update invoice
 */
export const updateInvoice = async (id, updateData) => {
  const {
    status,
  } = updateData;

  // Build update query dynamically
  const updates = [];
  const values = [];
  let paramIndex = 1;

  if (status !== undefined) {
    updates.push(`status = $${paramIndex++}`);
    values.push(status);
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
    UPDATE invoices
    SET ${updates.join(', ')}
    WHERE id = $${paramIndex}
    RETURNING *
  `;

  const result = await db.query(query, values);

  if (!result.rows || result.rows.length === 0) {
    throw new Error('Invoice not found');
  }

  return await getInvoiceById(id);
};

/**
 * Add item to invoice
 */
export const addInvoiceItem = async (invoiceId, itemData) => {
  const {
    productId,
    serviceId,
    name,
    quantity,
    price,
    notes,
    images,
  } = itemData;

  const itemId = createId();
  const invoice = await getInvoiceById(invoiceId);
  const qrCode = generateQRCode(invoice.invoiceNo, productId || '', serviceId || '');
  const imagesArray = Array.isArray(images) ? images : (images ? [images] : []);

  const query = `
    INSERT INTO invoice_items (id, "invoiceId", "productId", "serviceId", name, quantity, price, notes, images, "qrCode")
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::text[], $10)
    RETURNING *
  `;

  const result = await db.query(query, [
    itemId,
    invoiceId,
    productId || null,
    serviceId || null,
    name,
    quantity || 1,
    parseFloat(price),
    notes || null,
    imagesArray,
    qrCode,
  ]);

  // Return updated invoice
  return await getInvoiceById(invoiceId);
};

/**
 * Update invoice item
 */
export const updateInvoiceItem = async (itemId, updateData) => {
  const {
    quantity,
    price,
    notes,
    images,
  } = updateData;

  // Build update query dynamically
  const updates = [];
  const values = [];
  let paramIndex = 1;

  if (quantity !== undefined) {
    updates.push(`quantity = $${paramIndex++}`);
    values.push(quantity);
  }
  if (price !== undefined) {
    updates.push(`price = $${paramIndex++}`);
    values.push(parseFloat(price));
  }
  if (notes !== undefined) {
    updates.push(`notes = $${paramIndex++}`);
    values.push(notes);
  }
  if (images !== undefined) {
    const imagesArray = Array.isArray(images) ? images : (images ? [images] : []);
    updates.push(`images = $${paramIndex++}::text[]`);
    values.push(imagesArray);
  }

  if (updates.length === 0) {
    throw new Error('No fields to update');
  }

  // Add id for WHERE clause
  values.push(itemId);

  const query = `
    UPDATE invoice_items
    SET ${updates.join(', ')}
    WHERE id = $${paramIndex}
    RETURNING *
  `;

  const result = await db.query(query, values);

  if (!result.rows || result.rows.length === 0) {
    throw new Error('Invoice item not found');
  }

  // Return updated invoice
  const item = result.rows[0];
  return await getInvoiceById(item.invoiceId);
};

/**
 * Delete invoice item
 */
export const deleteInvoiceItem = async (itemId) => {
  // Get invoice ID first
  const itemQuery = `SELECT "invoiceId" FROM invoice_items WHERE id = $1`;
  const itemResult = await db.query(itemQuery, [itemId]);

  if (!itemResult.rows || itemResult.rows.length === 0) {
    throw new Error('Invoice item not found');
  }

  const invoiceId = itemResult.rows[0].invoiceId;

  // Delete item
  const deleteQuery = `DELETE FROM invoice_items WHERE id = $1 RETURNING id`;
  const deleteResult = await db.query(deleteQuery, [itemId]);

  if (!deleteResult.rows || deleteResult.rows.length === 0) {
    throw new Error('Invoice item not found');
  }

  // Return updated invoice
  return await getInvoiceById(invoiceId);
};

/**
 * Delete invoice (cascade deletes items)
 */
export const deleteInvoice = async (id) => {
  try {
    const query = `DELETE FROM invoices WHERE id = $1 RETURNING id`;
    const result = await db.query(query, [id]);

    if (!result.rows || result.rows.length === 0) {
      throw new Error('Invoice not found');
    }

    return { success: true };
  } catch (error) {
    throw new Error('Error deleting invoice: ' + error.message);
  }
};

