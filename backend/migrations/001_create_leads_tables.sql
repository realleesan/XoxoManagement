-- Migration: Create Leads & Related Tables
-- Created: 2025-11-30
-- Description: Creates tables for Leads Management (CRM)

-- ============================================
-- ENUMS
-- ============================================

-- Lead Source Enum
DO $$ BEGIN
    CREATE TYPE lead_source_enum AS ENUM ('FACEBOOK', 'ZALO', 'TIKTOK', 'WEBSITE', 'OTHER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Lead Status Enum
DO $$ BEGIN
    CREATE TYPE lead_status_enum AS ENUM (
        'CAN_NHAC',
        'HEN_GUI_ANH',
        'HEN_QUA_SHOP',
        'HEN_GUI_SAN_PHAM',
        'KHACH_TOI_SHOP',
        'DA_BAO_GIA_IM_LANG'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Activity Type Enum
DO $$ BEGIN
    CREATE TYPE activity_type_enum AS ENUM ('CALL', 'EMAIL', 'MESSAGE', 'NOTE', 'MEETING');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- TABLES
-- ============================================

-- Leads Table
CREATE TABLE IF NOT EXISTS leads (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    source lead_source_enum NOT NULL,
    status lead_status_enum NOT NULL DEFAULT 'CAN_NHAC',
    "assignedTo" TEXT,
    notes TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    -- Foreign key to users table
    CONSTRAINT fk_lead_assigned_to FOREIGN KEY ("assignedTo") 
        REFERENCES users(id) ON DELETE SET NULL
);

-- Lead Activities Table
CREATE TABLE IF NOT EXISTS lead_activities (
    id TEXT PRIMARY KEY,
    "leadId" TEXT NOT NULL,
    type activity_type_enum NOT NULL,
    content TEXT NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    -- Foreign key to leads table
    CONSTRAINT fk_lead_activity_lead FOREIGN KEY ("leadId") 
        REFERENCES leads(id) ON DELETE CASCADE
);

-- ============================================
-- INDEXES
-- ============================================

-- Indexes for leads table
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_source ON leads(source);
CREATE INDEX IF NOT EXISTS idx_leads_assigned_to ON leads("assignedTo");
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads("createdAt");

-- Indexes for lead_activities table
CREATE INDEX IF NOT EXISTS idx_lead_activities_lead_id ON lead_activities("leadId");
CREATE INDEX IF NOT EXISTS idx_lead_activities_created_at ON lead_activities("createdAt");

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger to update updatedAt timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to leads table
DROP TRIGGER IF EXISTS update_leads_updated_at ON leads;
CREATE TRIGGER update_leads_updated_at
    BEFORE UPDATE ON leads
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE leads IS 'Leads table for CRM management';
COMMENT ON TABLE lead_activities IS 'Activities log for each lead';
COMMENT ON COLUMN leads.source IS 'Source of the lead (Facebook, Zalo, TikTok, Website, Other)';
COMMENT ON COLUMN leads.status IS 'Current status of the lead';
COMMENT ON COLUMN leads."assignedTo" IS 'User ID who is assigned to this lead';

