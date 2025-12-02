import db from '../utils/db.js';
import { createId } from '@paralleldrive/cuid2';

export const getAllOrders = async (filters = {}, pagination = {}) => {
    const {
        status,
        customerId,
        startDate,
        endDate,
        page = 1,
        limit = 20,
    } = { ...filters, ...pagination };

    const where = [];
    const params = [];
    let idx = 1;

    if (status) {
        where.push(`o.status = $${idx++}`);
        params.push(status);
    }
    if (customerId) {
        where.push(`o."customerId" = $${idx++}`);
        params.push(customerId);
    }
    if (startDate) {
        where.push(`o."createdAt" >= $${idx++}`);
        params.push(startDate);
    }
    if (endDate) {
        where.push(`o."createdAt" <= $${idx++}`);
        params.push(endDate);
    }

    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const offset = (page - 1) * limit;

    const countQ = `SELECT COUNT(*) as total FROM orders o ${whereClause}`;

    const dataQ = `
    SELECT 
      o.*,
      c.name as "customerName",
      c.phone as "customerPhone",
      (SELECT COUNT(*) FROM order_items WHERE "orderId" = o.id) as "itemsCount"
    FROM orders o
    LEFT JOIN customers c ON o."customerId" = c.id
    ${whereClause}
    ORDER BY o."createdAt" DESC
    LIMIT $${idx++} OFFSET $${idx++}
  `;

    try {
        const countRes = await db.query(countQ, params);
        const total = parseInt(countRes.rows[0].total || 0);

        const dataParams = [...params, limit, offset];
        const dataRes = await db.query(dataQ, dataParams);

        return {
            orders: dataRes.rows || [],
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    } catch (error) {
        throw new Error('Error fetching orders: ' + error.message);
    }
};

export const getOrderById = async (id) => {
    const orderQ = `
    SELECT 
      o.*,
      c.name as "customerName",
      c.phone as "customerPhone",
      c.address as "customerAddress",
      c.email as "customerEmail"
    FROM orders o
    LEFT JOIN customers c ON o."customerId" = c.id
    WHERE o.id = $1
  `;

    const itemsQ = `
    SELECT 
      oi.*,
      p.name as "productName",
      s.name as "serviceName",
      m.name as "materialName"
    FROM order_items oi
    LEFT JOIN products p ON oi."productId" = p.id
    LEFT JOIN services s ON oi."serviceId" = s.id
    LEFT JOIN materials m ON oi."materialId" = m.id
    WHERE oi."orderId" = $1
  `;

    try {
        const orderRes = await db.query(orderQ, [id]);
        if (!orderRes.rows.length) throw new Error('Order not found');

        const itemsRes = await db.query(itemsQ, [id]);

        return {
            ...orderRes.rows[0],
            items: itemsRes.rows || [],
        };
    } catch (error) {
        throw new Error('Error fetching order details: ' + error.message);
    }
};

export const createOrder = async (data) => {
    const { customerId, items, depositAmount = 0, notes, type = 'SERVICE' } = data;

    if (!customerId || !items || !items.length) {
        throw new Error('Customer and items are required');
    }

    const client = await db.getClient();

    try {
        await client.query('BEGIN');

        // Calculate total amount
        const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        const orderId = createId();
        const now = new Date().toISOString();

        // Create Order
        const orderQ = `
      INSERT INTO orders (id, "customerId", "totalAmount", "depositAmount", status, type, notes, "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
        const status = depositAmount > 0 ? 'DEPOSITED' : 'PENDING';

        const orderRes = await client.query(orderQ, [
            orderId, customerId, totalAmount, depositAmount, status, type, notes, now, now
        ]);

        // Create Order Items
        for (const item of items) {
            const itemId = createId();
            const itemQ = `
        INSERT INTO order_items (id, "orderId", "productId", "serviceId", "materialId", quantity, price, notes, "createdAt")
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `;
            await client.query(itemQ, [
                itemId,
                orderId,
                item.productId || null,
                item.serviceId || null,
                item.materialId || null,
                item.quantity || 1,
                item.price || 0,
                item.notes || null,
                now
            ]);

            // If retail item, update inventory (optional, can be implemented later)
            // If service item, we might want to trigger workflow creation (optional)
        }

        await client.query('COMMIT');
        return orderRes.rows[0];
    } catch (error) {
        await client.query('ROLLBACK');
        throw new Error('Error creating order: ' + error.message);
    } finally {
        client.release();
    }
};

export const updateOrderStatus = async (id, status) => {
    const q = `
    UPDATE orders 
    SET status = $1, "updatedAt" = NOW() 
    WHERE id = $2 
    RETURNING *
  `;
    const res = await db.query(q, [status, id]);
    if (!res.rows.length) throw new Error('Order not found');
    return res.rows[0];
};

export const deleteOrder = async (id) => {
    await db.query('DELETE FROM orders WHERE id = $1', [id]);
    return { success: true };
};
