-- Migration: Create Workflows Tables
-- Created: 2025-11-30
-- Description: Creates tables for Workflow Management (Quy trình sửa chữa)

-- ============================================
-- ENUMS
-- ============================================

-- Workflow Status Enum
DO $$ BEGIN
    CREATE TYPE workflow_status_enum AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'BLOCKED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Stage Status Enum
DO $$ BEGIN
    CREATE TYPE stage_status_enum AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'BLOCKED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- TABLES
-- ============================================

-- Workflows Table
CREATE TABLE IF NOT EXISTS workflows (
    id TEXT PRIMARY KEY,
    "productId" TEXT NOT NULL,
    name TEXT NOT NULL,
    status workflow_status_enum NOT NULL DEFAULT 'PENDING',
    "currentStage" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    CONSTRAINT fk_workflows_product FOREIGN KEY ("productId") 
        REFERENCES products(id) ON DELETE CASCADE
);

-- Workflow Stages Table
CREATE TABLE IF NOT EXISTS workflow_stages (
    id TEXT PRIMARY KEY,
    "workflowId" TEXT NOT NULL,
    name TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    status stage_status_enum NOT NULL DEFAULT 'PENDING',
    "assignedTo" TEXT,
    "dueDate" TIMESTAMP WITH TIME ZONE,
    "completedAt" TIMESTAMP WITH TIME ZONE,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    CONSTRAINT fk_workflow_stages_workflow FOREIGN KEY ("workflowId") 
        REFERENCES workflows(id) ON DELETE CASCADE,
    CONSTRAINT fk_workflow_stages_user FOREIGN KEY ("assignedTo") 
        REFERENCES users(id) ON DELETE SET NULL
);

-- Workflow Tasks Table
CREATE TABLE IF NOT EXISTS workflow_tasks (
    id TEXT PRIMARY KEY,
    "stageId" TEXT NOT NULL,
    name TEXT NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    CONSTRAINT fk_workflow_tasks_stage FOREIGN KEY ("stageId") 
        REFERENCES workflow_stages(id) ON DELETE CASCADE
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_workflows_product ON workflows("productId");
CREATE INDEX IF NOT EXISTS idx_workflows_status ON workflows(status);
CREATE INDEX IF NOT EXISTS idx_workflows_created_at ON workflows("createdAt");

CREATE INDEX IF NOT EXISTS idx_workflow_stages_workflow ON workflow_stages("workflowId");
CREATE INDEX IF NOT EXISTS idx_workflow_stages_assigned ON workflow_stages("assignedTo");
CREATE INDEX IF NOT EXISTS idx_workflow_stages_status ON workflow_stages(status);
CREATE INDEX IF NOT EXISTS idx_workflow_stages_order ON workflow_stages("workflowId", "order");

CREATE INDEX IF NOT EXISTS idx_workflow_tasks_stage ON workflow_tasks("stageId");
CREATE INDEX IF NOT EXISTS idx_workflow_tasks_completed ON workflow_tasks(completed);

-- ============================================
-- TRIGGERS
-- ============================================

-- Apply trigger to workflows table for updatedAt
DROP TRIGGER IF EXISTS update_workflows_updated_at ON workflows;
CREATE TRIGGER update_workflows_updated_at
    BEFORE UPDATE ON workflows
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE workflows IS 'Workflows table - Quy trình sửa chữa';
COMMENT ON TABLE workflow_stages IS 'Workflow stages table - Các giai đoạn trong quy trình';
COMMENT ON TABLE workflow_tasks IS 'Workflow tasks table - Các nhiệm vụ trong giai đoạn';

COMMENT ON COLUMN workflow_stages.name IS 'Tên giai đoạn: Vệ sinh, Khâu vá, Phục hồi màu, Xi mạ';
COMMENT ON COLUMN workflow_stages."order" IS 'Thứ tự giai đoạn trong quy trình';

