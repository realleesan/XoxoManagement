import * as inventoryService from '../services/inventory.service.js';

export const getAll = async (req, res) => {
  try {
    const filters = {
      search: req.query.search,
      category: req.query.category,
    };
    const pagination = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20,
    };
    const result = await inventoryService.getAllMaterials(filters, pagination);
    res.json(result);
  } catch (error) {
    console.error('Error in inventory.getAll:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getById = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await inventoryService.getMaterialById(id);
    res.json({ item });
  } catch (error) {
    console.error('Error in inventory.getById:', error);
    res.status(404).json({ error: error.message });
  }
};

export const create = async (req, res) => {
  try {
    const data = req.body;
    const item = await inventoryService.createMaterial(data);
    res.status(201).json({ item });
  } catch (error) {
    console.error('Error in inventory.create:', error);
    res.status(400).json({ error: error.message });
  }
};

export const update = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await inventoryService.updateMaterial(id, req.body);
    res.json({ item: updated });
  } catch (error) {
    console.error('Error in inventory.update:', error);
    res.status(400).json({ error: error.message });
  }
};

export const remove = async (req, res) => {
  try {
    const { id } = req.params;
    await inventoryService.deleteMaterial(id);
    res.json({ success: true, message: 'Material deleted' });
  } catch (error) {
    console.error('Error in inventory.remove:', error);
    res.status(400).json({ error: error.message });
  }
};


