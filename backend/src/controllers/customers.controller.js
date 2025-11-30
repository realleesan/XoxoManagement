import * as customersService from '../services/customers.service.js';

/**
 * GET /api/customers
 * Get all customers with filters and pagination
 */
export const getAllCustomers = async (req, res) => {
  try {
    const filters = {
      search: req.query.search,
    };

    const pagination = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20,
    };

    const result = await customersService.getAllCustomers(filters, pagination);
    res.json(result);
  } catch (error) {
    console.error('Error in getAllCustomers:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * GET /api/customers/:id
 * Get customer by ID
 */
export const getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;
    const customer = await customersService.getCustomerById(id);
    res.json({ customer });
  } catch (error) {
    console.error('Error in getCustomerById:', error);
    res.status(404).json({ error: error.message });
  }
};

/**
 * POST /api/customers
 * Create a new customer
 */
export const createCustomer = async (req, res) => {
  try {
    const customerData = req.body;
    const customer = await customersService.createCustomer(customerData);
    res.status(201).json({ customer });
  } catch (error) {
    console.error('Error in createCustomer:', error);
    res.status(400).json({ error: error.message });
  }
};

/**
 * PUT /api/customers/:id
 * Update a customer
 */
export const updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const customer = await customersService.updateCustomer(id, updateData);
    res.json({ customer });
  } catch (error) {
    console.error('Error in updateCustomer:', error);
    res.status(400).json({ error: error.message });
  }
};

/**
 * DELETE /api/customers/:id
 * Delete a customer
 */
export const deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    await customersService.deleteCustomer(id);
    res.json({ success: true, message: 'Customer deleted successfully' });
  } catch (error) {
    console.error('Error in deleteCustomer:', error);
    res.status(400).json({ error: error.message });
  }
};

/**
 * POST /api/customers/convert-from-lead/:leadId
 * Convert lead to customer
 */
export const convertLeadToCustomer = async (req, res) => {
  try {
    const { leadId } = req.params;
    const customerData = req.body || {};
    const customer = await customersService.convertLeadToCustomer(leadId, customerData);
    res.status(201).json({ customer, message: 'Lead converted to customer successfully' });
  } catch (error) {
    console.error('Error in convertLeadToCustomer:', error);
    res.status(400).json({ error: error.message });
  }
};

