import * as servicesService from '../services/services.service.js';

/**
 * GET /api/services
 * Get all services with filters and pagination
 */
export const getAllServices = async (req, res) => {
  try {
    const filters = {
      category: req.query.category,
      search: req.query.search,
    };

    const pagination = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 100,
    };

    const result = await servicesService.getAllServices(filters, pagination);
    res.json(result);
  } catch (error) {
    console.error('Error in getAllServices:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * GET /api/services/categories
 * Get all categories
 */
export const getCategories = async (req, res) => {
  try {
    const categories = await servicesService.getCategories();
    res.json({ categories });
  } catch (error) {
    console.error('Error in getCategories:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * GET /api/services/category/:category
 * Get services by category
 */
export const getServicesByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const services = await servicesService.getServicesByCategory(category);
    res.json({ services });
  } catch (error) {
    console.error('Error in getServicesByCategory:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * GET /api/services/:id
 * Get service by ID
 */
export const getServiceById = async (req, res) => {
  try {
    const { id } = req.params;
    const service = await servicesService.getServiceById(id);
    res.json({ service });
  } catch (error) {
    console.error('Error in getServiceById:', error);
    res.status(404).json({ error: error.message });
  }
};

/**
 * POST /api/services
 * Create a new service
 */
export const createService = async (req, res) => {
  try {
    const serviceData = req.body;
    const service = await servicesService.createService(serviceData);
    res.status(201).json({ service });
  } catch (error) {
    console.error('Error in createService:', error);
    res.status(400).json({ error: error.message });
  }
};

/**
 * PUT /api/services/:id
 * Update a service
 */
export const updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const service = await servicesService.updateService(id, updateData);
    res.json({ service });
  } catch (error) {
    console.error('Error in updateService:', error);
    res.status(400).json({ error: error.message });
  }
};

/**
 * DELETE /api/services/:id
 * Delete a service
 */
export const deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    await servicesService.deleteService(id);
    res.json({ success: true, message: 'Service deleted successfully' });
  } catch (error) {
    console.error('Error in deleteService:', error);
    res.status(400).json({ error: error.message });
  }
};

