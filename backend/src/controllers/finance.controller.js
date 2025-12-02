import * as financeService from '../services/finance.service.js';

export const getAll = async (req, res) => {
  try {
    const filters = {
      type: req.query.type,
      status: req.query.status,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
    };
    const pagination = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20,
    };
    const result = await financeService.getAllTransactions(filters, pagination);
    res.json(result);
  } catch (error) {
    console.error('Error in finance.getAll:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getById = async (req, res) => {
  try {
    const item = await financeService.getTransactionById(req.params.id);
    res.json({ transaction: item });
  } catch (error) {
    console.error('Error in finance.getById:', error);
    res.status(404).json({ error: error.message });
  }
};

export const create = async (req, res) => {
  try {
    const data = req.body;
    const created = await financeService.createTransaction(data);
    res.status(201).json({ transaction: created });
  } catch (error) {
    console.error('Error in finance.create:', error);
    res.status(400).json({ error: error.message });
  }
};

export const update = async (req, res) => {
  try {
    const updated = await financeService.updateTransaction(req.params.id, req.body);
    res.json({ transaction: updated });
  } catch (error) {
    console.error('Error in finance.update:', error);
    res.status(400).json({ error: error.message });
  }
};

export const remove = async (req, res) => {
  try {
    await financeService.deleteTransaction(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error in finance.remove:', error);
    res.status(400).json({ error: error.message });
  }
};


