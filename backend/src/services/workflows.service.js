import db from '../utils/db.js';
import { createId } from '@paralleldrive/cuid2';

/**
 * Get all workflows with filters and pagination
 */
export const getAllWorkflows = async (filters = {}, pagination = {}) => {
  const {
    productId,
    status,
    assignedTo,
    page = 1,
    limit = 50,
  } = { ...filters, ...pagination };

  // Build WHERE clause
  const whereConditions = [];
  const params = [];
  let paramIndex = 1;

  if (productId) {
    whereConditions.push(`w."productId" = $${paramIndex++}`);
    params.push(productId);
  }
  if (status) {
    whereConditions.push(`w.status = $${paramIndex++}`);
    params.push(status);
  }

  const whereClause = whereConditions.length > 0 
    ? `WHERE ${whereConditions.join(' AND ')}`
    : '';

  // Count query
  const countQuery = `
    SELECT COUNT(*) as total
    FROM workflows w
    ${whereClause}
  `;

  // Data query with product info
  const offset = (page - 1) * limit;
  const dataQuery = `
    SELECT 
      w.*,
      p.name as "productName",
      p.status as "productStatus",
      c.id as "customerId",
      c.name as "customerName"
    FROM workflows w
    LEFT JOIN products p ON w."productId" = p.id
    LEFT JOIN customers c ON p."customerId" = c.id
    ${whereClause}
    ORDER BY w."createdAt" DESC
    LIMIT $${paramIndex++} OFFSET $${paramIndex++}
  `;

  try {
    // Get count
    const countResult = await db.query(countQuery, params);
    const total = parseInt(countResult.rows[0].total);

    // Get data
    const dataParams = [...params, limit, offset];
    const dataResult = await db.query(dataQuery, dataParams);

    // Get stages for each workflow
    const workflowsWithStages = await Promise.all(
      dataResult.rows.map(async (workflow) => {
        const stagesQuery = `
          SELECT 
            ws.*,
            u.name as "assignedToName",
            u.email as "assignedToEmail"
          FROM workflow_stages ws
          LEFT JOIN users u ON ws."assignedTo" = u.id
          WHERE ws."workflowId" = $1
          ORDER BY ws."order" ASC
        `;
        const stagesResult = await db.query(stagesQuery, [workflow.id]);
        
        // Get tasks for each stage
        const stagesWithTasks = await Promise.all(
          stagesResult.rows.map(async (stage) => {
            const tasksQuery = `
              SELECT *
              FROM workflow_tasks
              WHERE "stageId" = $1
              ORDER BY "createdAt" ASC
            `;
            const tasksResult = await db.query(tasksQuery, [stage.id]);
            
            return {
              ...stage,
              tasks: tasksResult.rows || [],
            };
          })
        );

        return {
          ...workflow,
          stages: stagesWithTasks,
        };
      })
    );

    return {
      workflows: workflowsWithStages || [],
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    throw new Error('Error fetching workflows: ' + error.message);
  }
};

/**
 * Get workflow by ID with all stages and tasks
 */
export const getWorkflowById = async (id) => {
  try {
    console.log('🔍 Fetching workflow with ID:', id);
    
    // Get workflow with product info
    const workflowQuery = `
      SELECT 
        w.*,
        p.name as "productName",
        p.status as "productStatus",
        p."customerId",
        c.name as "customerName"
      FROM workflows w
      LEFT JOIN products p ON w."productId" = p.id
      LEFT JOIN customers c ON p."customerId" = c.id
      WHERE w.id = $1
    `;
    const workflowResult = await db.query(workflowQuery, [id]);

    console.log('📊 Workflow query result:', {
      rowCount: workflowResult.rows?.length || 0,
      id: id,
    });

    if (!workflowResult.rows || workflowResult.rows.length === 0) {
      // Check if workflows table exists
      const tableCheckQuery = `
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'workflows'
        );
      `;
      const tableExists = await db.query(tableCheckQuery);
      console.log('📋 Workflows table exists:', tableExists.rows[0]?.exists);
      
      if (!tableExists.rows[0]?.exists) {
        throw new Error('Workflows table does not exist. Please run the migration first.');
      }
      
      throw new Error(`Workflow not found with ID: ${id}`);
    }

    const workflow = workflowResult.rows[0];

    // Get stages
    const stagesQuery = `
      SELECT 
        ws.*,
        u.name as "assignedToName",
        u.email as "assignedToEmail"
      FROM workflow_stages ws
      LEFT JOIN users u ON ws."assignedTo" = u.id
      WHERE ws."workflowId" = $1
      ORDER BY ws."order" ASC
    `;
    const stagesResult = await db.query(stagesQuery, [id]);

    // Get tasks for each stage
    const stagesWithTasks = await Promise.all(
      stagesResult.rows.map(async (stage) => {
        const tasksQuery = `
          SELECT *
          FROM workflow_tasks
          WHERE "stageId" = $1
          ORDER BY "createdAt" ASC
        `;
        const tasksResult = await db.query(tasksQuery, [stage.id]);
        
        return {
          ...stage,
          tasks: tasksResult.rows || [],
        };
      })
    );

    return {
      ...workflow,
      stages: stagesWithTasks,
    };
  } catch (error) {
    throw new Error('Error fetching workflow: ' + error.message);
  }
};

/**
 * Create a new workflow with stages
 */
export const createWorkflow = async (workflowData) => {
  const {
    productId,
    name,
    stages = [], // Array of { name, order, assignedTo, dueDate, tasks: [] }
  } = workflowData;

  // Validation
  if (!productId || !name) {
    throw new Error('Product ID and name are required');
  }

  const workflowId = createId();
  const now = new Date().toISOString();

  const client = await db.getClient();
  try {
    // Start transaction
    await client.query('BEGIN');

    // Create workflow
    const workflowResult = await client.query(
      `INSERT INTO workflows (id, "productId", name, status, "currentStage", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [workflowId, productId, name, 'PENDING', null, now, now]
    );

    // Create stages
    const createdStages = [];
    for (const stage of stages) {
      const stageId = createId();
      const stageResult = await client.query(
        `INSERT INTO workflow_stages (id, "workflowId", name, "order", status, "assignedTo", "dueDate", "createdAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [
          stageId,
          workflowId,
          stage.name,
          stage.order,
          'PENDING',
          stage.assignedTo || null,
          stage.dueDate || null,
          now,
        ]
      );

      const createdStage = stageResult.rows[0];

      // Create tasks for this stage
      if (stage.tasks && stage.tasks.length > 0) {
        for (const taskName of stage.tasks) {
          const taskId = createId();
          await client.query(
            `INSERT INTO workflow_tasks (id, "stageId", name, completed, "createdAt")
             VALUES ($1, $2, $3, $4, $5)`,
            [taskId, stageId, taskName, false, now]
          );
        }
      }

      createdStages.push(createdStage);
    }

    await client.query('COMMIT');
    client.release();

    // Return workflow with stages
    return await getWorkflowById(workflowId);
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
    throw new Error('Error creating workflow: ' + error.message);
  }
};

/**
 * Update workflow
 */
export const updateWorkflow = async (id, updateData) => {
  const {
    name,
    status,
    currentStage,
  } = updateData;

  // Build update query dynamically
  const updates = [];
  const values = [];
  let paramIndex = 1;

  if (name !== undefined) {
    updates.push(`name = $${paramIndex++}`);
    values.push(name);
  }
  if (status !== undefined) {
    updates.push(`status = $${paramIndex++}`);
    values.push(status);
  }
  if (currentStage !== undefined) {
    updates.push(`"currentStage" = $${paramIndex++}`);
    values.push(currentStage);
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
    UPDATE workflows
    SET ${updates.join(', ')}
    WHERE id = $${paramIndex}
    RETURNING *
  `;

  const result = await db.query(query, values);

  if (!result.rows || result.rows.length === 0) {
    throw new Error('Workflow not found');
  }

  return await getWorkflowById(id);
};

/**
 * Delete workflow (cascade deletes stages and tasks)
 */
export const deleteWorkflow = async (id) => {
  try {
    const query = `DELETE FROM workflows WHERE id = $1 RETURNING id`;
    const result = await db.query(query, [id]);

    if (!result.rows || result.rows.length === 0) {
      throw new Error('Workflow not found');
    }

    return { success: true };
  } catch (error) {
    throw new Error('Error deleting workflow: ' + error.message);
  }
};

/**
 * Update stage status
 */
export const updateStageStatus = async (stageId, status) => {
  try {
    const updates = [`status = $1`];
    const values = [status];
    
    if (status === 'COMPLETED') {
      updates.push(`"completedAt" = $2`);
      values.push(new Date().toISOString());
    } else if (status !== 'COMPLETED') {
      updates.push(`"completedAt" = $2`);
      values.push(null);
    }

    values.push(stageId);

    const query = `
      UPDATE workflow_stages
      SET ${updates.join(', ')}
      WHERE id = $${values.length}
      RETURNING *
    `;

    const result = await db.query(query, values);

    if (!result.rows || result.rows.length === 0) {
      throw new Error('Stage not found');
    }

    // Update workflow currentStage if needed
    const stage = result.rows[0];
    const workflowQuery = `SELECT * FROM workflows WHERE id = $1`;
    const workflowResult = await db.query(workflowQuery, [stage.workflowId]);
    
    if (workflowResult.rows.length > 0) {
      const workflow = workflowResult.rows[0];
      
      // Auto-update workflow status based on stages
      const stagesQuery = `SELECT status FROM workflow_stages WHERE "workflowId" = $1 ORDER BY "order"`;
      const stagesResult = await db.query(stagesQuery, [workflow.id]);
      
      const allCompleted = stagesResult.rows.every(s => s.status === 'COMPLETED');
      const anyInProgress = stagesResult.rows.some(s => s.status === 'IN_PROGRESS');
      const anyBlocked = stagesResult.rows.some(s => s.status === 'BLOCKED');
      
      let newWorkflowStatus = 'PENDING';
      if (allCompleted) {
        newWorkflowStatus = 'COMPLETED';
      } else if (anyBlocked) {
        newWorkflowStatus = 'BLOCKED';
      } else if (anyInProgress) {
        newWorkflowStatus = 'IN_PROGRESS';
      }
      
      if (workflow.status !== newWorkflowStatus) {
        await db.query(
          `UPDATE workflows SET status = $1, "updatedAt" = $2 WHERE id = $3`,
          [newWorkflowStatus, new Date().toISOString(), workflow.id]
        );
      }
    }

    return result.rows[0];
  } catch (error) {
    throw new Error('Error updating stage status: ' + error.message);
  }
};

/**
 * Assign stage to user
 */
export const assignStage = async (stageId, userId) => {
  try {
    const query = `
      UPDATE workflow_stages
      SET "assignedTo" = $1
      WHERE id = $2
      RETURNING *
    `;

    const result = await db.query(query, [userId, stageId]);

    if (!result.rows || result.rows.length === 0) {
      throw new Error('Stage not found');
    }

    return result.rows[0];
  } catch (error) {
    throw new Error('Error assigning stage: ' + error.message);
  }
};

/**
 * Add task to stage
 */
export const addTaskToStage = async (stageId, taskName) => {
  try {
    const taskId = createId();
    const query = `
      INSERT INTO workflow_tasks (id, "stageId", name, completed, "createdAt")
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const result = await db.query(query, [
      taskId,
      stageId,
      taskName,
      false,
      new Date().toISOString(),
    ]);

    return result.rows[0];
  } catch (error) {
    throw new Error('Error adding task: ' + error.message);
  }
};

/**
 * Update task completion
 */
export const updateTaskCompletion = async (taskId, completed) => {
  try {
    const query = `
      UPDATE workflow_tasks
      SET completed = $1
      WHERE id = $2
      RETURNING *
    `;

    const result = await db.query(query, [completed, taskId]);

    if (!result.rows || result.rows.length === 0) {
      throw new Error('Task not found');
    }

    // Check if all tasks in stage are completed, then auto-update stage status
    const task = result.rows[0];
    const stageTasksQuery = `SELECT completed FROM workflow_tasks WHERE "stageId" = $1`;
    const stageTasksResult = await db.query(stageTasksQuery, [task.stageId]);
    
    const allTasksCompleted = stageTasksResult.rows.every(t => t.completed);
    if (allTasksCompleted && stageTasksResult.rows.length > 0) {
      await updateStageStatus(task.stageId, 'COMPLETED');
    }

    return result.rows[0];
  } catch (error) {
    throw new Error('Error updating task: ' + error.message);
  }
};

/**
 * Delete task
 */
export const deleteTask = async (taskId) => {
  try {
    const query = `DELETE FROM workflow_tasks WHERE id = $1 RETURNING id`;
    const result = await db.query(query, [taskId]);

    if (!result.rows || result.rows.length === 0) {
      throw new Error('Task not found');
    }

    return { success: true };
  } catch (error) {
    throw new Error('Error deleting task: ' + error.message);
  }
};

