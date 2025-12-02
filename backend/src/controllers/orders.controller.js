import * as ordersService from '../services/orders.service.js';

export const getAll = async (req, res) => {
    try {
        const filters = {
            status: req.query.status,
            customerId: req.query.customerId,
            startDate: req.query.startDate,
            endDate: req.query.endDate,
        };
        const pagination = {
            page: parseInt(req.query.page) || 1,
            limit: parseInt(req.query.limit) || 20,
        };
        const result = await ordersService.getAllOrders(filters, pagination);
        res.json(result);
    } catch (error) {
        console.error('Error in orders.getAll:', error);
        res.status(500).json({ error: error.message });
    }
};

export const getById = async (req, res) => {
    try {
        const order = await ordersService.getOrderById(req.params.id);
        res.json(order);
    } catch (error) {
        console.error('Error in orders.getById:', error);
        res.status(404).json({ error: error.message });
    }
};

export const create = async (req, res) => {
    try {
        const order = await ordersService.createOrder(req.body);
        res.status(201).json(order);
    } catch (error) {
        console.error('Error in orders.create:', error);
        res.status(400).json({ error: error.message });
    }
};

export const updateStatus = async (req, res) => {
    try {
        const { status } = req.body;
        if (!status) throw new Error('Status is required');
        const order = await ordersService.updateOrderStatus(req.params.id, status);
        res.json(order);
    } catch (error) {
        console.error('Error in orders.updateStatus:', error);
        res.status(400).json({ error: error.message });
    }
};

export const remove = async (req, res) => {
    try {
        await ordersService.deleteOrder(req.params.id);
        res.json({ success: true });
    } catch (error) {
        console.error('Error in orders.remove:', error);
        res.status(400).json({ error: error.message });
    }
};
