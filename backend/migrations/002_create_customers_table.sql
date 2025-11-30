-- Migration: Create Customers Table
-- Created: 2025-11-30
-- Description: Creates table for Customer Management

-- ============================================
-- TABLE
-- ============================================

-- Customers Table
CREATE TABLE IF NOT EXISTS customers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    address TEXT,
    "leadId" TEXT UNIQUE,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    -- Foreign key to leads table (optional - customer can be created from lead)
    CONSTRAINT fk_customer_lead FOREIGN KEY ("leadId") 
        REFERENCES leads(id) ON DELETE SET NULL
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_customers_lead_id ON customers("leadId");
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_created_at ON customers("createdAt");

-- ============================================
-- TRIGGERS
-- ============================================

-- Apply trigger to customers table for updatedAt
DROP TRIGGER IF EXISTS update_customers_updated_at ON customers;
CREATE TRIGGER update_customers_updated_at
    BEFORE UPDATE ON customers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE customers IS 'Customers table - converted from leads or created directly';
COMMENT ON COLUMN customers."leadId" IS 'Reference to lead if customer was converted from a lead';

