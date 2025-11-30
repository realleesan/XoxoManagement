import * as leadsService from '../services/leads.service.js';

/**
 * GET /api/leads
 * Get all leads with filters and pagination
 */
export const getAllLeads = async (req, res) => {
  try {
    const filters = {
      status: req.query.status,
      source: req.query.source,
      assignedTo: req.query.assignedTo,
      search: req.query.search,
    };

    const pagination = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20,
    };

    const result = await leadsService.getAllLeads(filters, pagination);
    res.json(result);
  } catch (error) {
    console.error('Error in getAllLeads:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * GET /api/leads/:id
 * Get lead by ID with activities
 */
export const getLeadById = async (req, res) => {
  try {
    const { id } = req.params;
    const lead = await leadsService.getLeadById(id);
    res.json({ lead });
  } catch (error) {
    console.error('Error in getLeadById:', error);
    res.status(404).json({ error: error.message });
  }
};

/**
 * POST /api/leads
 * Create a new lead
 */
export const createLead = async (req, res) => {
  try {
    const leadData = req.body;
    const lead = await leadsService.createLead(leadData);
    res.status(201).json({ lead });
  } catch (error) {
    console.error('Error in createLead:', error);
    res.status(400).json({ error: error.message });
  }
};

/**
 * PUT /api/leads/:id
 * Update a lead
 */
export const updateLead = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const lead = await leadsService.updateLead(id, updateData);
    res.json({ lead });
  } catch (error) {
    console.error('Error in updateLead:', error);
    res.status(400).json({ error: error.message });
  }
};

/**
 * DELETE /api/leads/:id
 * Delete a lead
 */
export const deleteLead = async (req, res) => {
  try {
    const { id } = req.params;
    await leadsService.deleteLead(id);
    res.json({ success: true, message: 'Lead deleted successfully' });
  } catch (error) {
    console.error('Error in deleteLead:', error);
    res.status(400).json({ error: error.message });
  }
};

/**
 * GET /api/leads/:id/activities
 * Get activities for a lead
 */
export const getLeadActivities = async (req, res) => {
  try {
    const { id } = req.params;
    const activities = await leadsService.getLeadActivities(id);
    res.json({ activities });
  } catch (error) {
    console.error('Error in getLeadActivities:', error);
    res.status(400).json({ error: error.message });
  }
};

/**
 * POST /api/leads/:id/activities
 * Add activity to a lead
 */
export const addActivity = async (req, res) => {
  try {
    const { id } = req.params;
    const activityData = req.body;
    const activity = await leadsService.addActivity(id, activityData);
    res.status(201).json({ activity });
  } catch (error) {
    console.error('Error in addActivity:', error);
    res.status(400).json({ error: error.message });
  }
};

