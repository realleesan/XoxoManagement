-- Migration: Create Products Table
-- Created: 2025-11-30
-- Description: Creates table for Product Management

-- ============================================
-- ENUMS
-- ============================================

-- Product Status Enum
DO $$ BEGIN
    CREATE TYPE product_status_enum AS ENUM ('DANG_LAM', 'DA_XONG', 'CO_VAN_DE', 'KHIEU_NAI');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- TABLES
-- ============================================

-- Products Table
CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    "customerId" TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    status product_status_enum NOT NULL DEFAULT 'DANG_LAM',
    images TEXT[] DEFAULT '{}',
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    -- Foreign key to customers table
    CONSTRAINT fk_product_customer FOREIGN KEY ("customerId") 
        REFERENCES customers(id) ON DELETE CASCADE
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_products_customer_id ON products("customerId");
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products("createdAt");

-- ============================================
-- TRIGGERS
-- ============================================

-- Apply trigger to products table for updatedAt
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE products IS 'Products table - items being repaired/restored';
COMMENT ON COLUMN products.status IS 'Current status of the product (DANG_LAM, DA_XONG, CO_VAN_DE, KHIEU_NAI)';
COMMENT ON COLUMN products.images IS 'Array of image URLs for the product';

