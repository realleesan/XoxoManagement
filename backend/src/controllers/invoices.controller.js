import * as invoicesService from '../services/invoices.service.js';

/**
 * GET /api/invoices
 * Get all invoices with filters and pagination
 */
export const getAllInvoices = async (req, res) => {
  try {
    const filters = {
      customerId: req.query.customerId,
      status: req.query.status,
      search: req.query.search,
    };

    const pagination = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20,
    };

    const result = await invoicesService.getAllInvoices(filters, pagination);
    res.json(result);
  } catch (error) {
    console.error('Error in getAllInvoices:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * GET /api/invoices/:id
 * Get invoice by ID
 */
export const getInvoiceById = async (req, res) => {
  try {
    const { id } = req.params;
    const invoice = await invoicesService.getInvoiceById(id);
    res.json({ invoice });
  } catch (error) {
    console.error('Error in getInvoiceById:', error);
    res.status(404).json({ error: error.message });
  }
};

/**
 * POST /api/invoices
 * Create a new invoice
 */
export const createInvoice = async (req, res) => {
  try {
    const invoiceData = req.body;
    const invoice = await invoicesService.createInvoice(invoiceData);
    res.status(201).json({ invoice });
  } catch (error) {
    console.error('Error in createInvoice:', error);
    res.status(400).json({ error: error.message });
  }
};

/**
 * PUT /api/invoices/:id
 * Update invoice
 */
export const updateInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const invoice = await invoicesService.updateInvoice(id, updateData);
    res.json({ invoice });
  } catch (error) {
    console.error('Error in updateInvoice:', error);
    res.status(400).json({ error: error.message });
  }
};

/**
 * DELETE /api/invoices/:id
 * Delete invoice
 */
export const deleteInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    await invoicesService.deleteInvoice(id);
    res.json({ success: true, message: 'Invoice deleted successfully' });
  } catch (error) {
    console.error('Error in deleteInvoice:', error);
    res.status(400).json({ error: error.message });
  }
};

/**
 * POST /api/invoices/:id/items
 * Add item to invoice
 */
export const addInvoiceItem = async (req, res) => {
  try {
    const { id } = req.params;
    const itemData = req.body;
    const invoice = await invoicesService.addInvoiceItem(id, itemData);
    res.status(201).json({ invoice });
  } catch (error) {
    console.error('Error in addInvoiceItem:', error);
    res.status(400).json({ error: error.message });
  }
};

/**
 * PUT /api/invoices/items/:id
 * Update invoice item
 */
export const updateInvoiceItem = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const invoice = await invoicesService.updateInvoiceItem(id, updateData);
    res.json({ invoice });
  } catch (error) {
    console.error('Error in updateInvoiceItem:', error);
    res.status(400).json({ error: error.message });
  }
};

/**
 * DELETE /api/invoices/items/:id
 * Delete invoice item
 */
export const deleteInvoiceItem = async (req, res) => {
  try {
    const { id } = req.params;
    const invoice = await invoicesService.deleteInvoiceItem(id);
    res.json({ invoice });
  } catch (error) {
    console.error('Error in deleteInvoiceItem:', error);
    res.status(400).json({ error: error.message });
  }
};

