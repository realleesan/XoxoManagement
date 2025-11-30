import * as productsService from '../services/products.service.js';

/**
 * GET /api/products
 * Get all products with filters and pagination
 */
export const getAllProducts = async (req, res) => {
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

    const result = await productsService.getAllProducts(filters, pagination);
    res.json(result);
  } catch (error) {
    console.error('Error in getAllProducts:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * GET /api/products/:id
 * Get product by ID
 */
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await productsService.getProductById(id);
    res.json({ product });
  } catch (error) {
    console.error('Error in getProductById:', error);
    res.status(404).json({ error: error.message });
  }
};

/**
 * POST /api/products
 * Create a new product
 */
export const createProduct = async (req, res) => {
  try {
    const productData = req.body;
    const product = await productsService.createProduct(productData);
    res.status(201).json({ product });
  } catch (error) {
    console.error('Error in createProduct:', error);
    res.status(400).json({ error: error.message });
  }
};

/**
 * PUT /api/products/:id
 * Update a product
 */
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const product = await productsService.updateProduct(id, updateData);
    res.json({ product });
  } catch (error) {
    console.error('Error in updateProduct:', error);
    res.status(400).json({ error: error.message });
  }
};

/**
 * DELETE /api/products/:id
 * Delete a product
 */
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    await productsService.deleteProduct(id);
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error in deleteProduct:', error);
    res.status(400).json({ error: error.message });
  }
};

