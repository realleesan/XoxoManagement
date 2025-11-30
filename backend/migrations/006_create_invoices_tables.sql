-- Migration: Create Invoices Tables
-- Created: 2025-11-30
-- Description: Creates tables for Invoice Management (Hóa đơn)

-- ============================================
-- ENUMS
-- ============================================

-- Invoice Status Enum
DO $$ BEGIN
    CREATE TYPE invoice_status_enum AS ENUM ('PENDING', 'PAID', 'CANCELLED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- TABLES
-- ============================================

-- Invoices Table
CREATE TABLE IF NOT EXISTS invoices (
    id TEXT PRIMARY KEY,
    "customerId" TEXT NOT NULL,
    "invoiceNo" TEXT NOT NULL UNIQUE,
    "totalAmount" DECIMAL(10, 2) NOT NULL DEFAULT 0,
    status invoice_status_enum NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    CONSTRAINT fk_invoices_customer FOREIGN KEY ("customerId") 
        REFERENCES customers(id) ON DELETE CASCADE
);

-- Invoice Items Table
CREATE TABLE IF NOT EXISTS invoice_items (
    id TEXT PRIMARY KEY,
    "invoiceId" TEXT NOT NULL,
    "productId" TEXT,
    "serviceId" TEXT,
    name TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    price DECIMAL(10, 2) NOT NULL,
    notes TEXT,
    images TEXT[] DEFAULT '{}',
    "qrCode" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    CONSTRAINT fk_invoice_items_invoice FOREIGN KEY ("invoiceId") 
        REFERENCES invoices(id) ON DELETE CASCADE,
    CONSTRAINT fk_invoice_items_product FOREIGN KEY ("productId") 
        REFERENCES products(id) ON DELETE SET NULL,
    CONSTRAINT fk_invoice_items_service FOREIGN KEY ("serviceId") 
        REFERENCES services(id) ON DELETE SET NULL
);

-- If table already exists without createdAt, add it
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'invoice_items' AND column_name = 'createdAt'
    ) THEN
        ALTER TABLE invoice_items ADD COLUMN "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW();
    END IF;
END $$;

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_invoices_customer ON invoices("customerId");
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_no ON invoices("invoiceNo");
CREATE INDEX IF NOT EXISTS idx_invoices_created_at ON invoices("createdAt");

CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice ON invoice_items("invoiceId");
CREATE INDEX IF NOT EXISTS idx_invoice_items_product ON invoice_items("productId");
CREATE INDEX IF NOT EXISTS idx_invoice_items_service ON invoice_items("serviceId");

-- ============================================
-- TRIGGERS
-- ============================================

-- Apply trigger to invoices table for updatedAt
DROP TRIGGER IF EXISTS update_invoices_updated_at ON invoices;
CREATE TRIGGER update_invoices_updated_at
    BEFORE UPDATE ON invoices
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger to auto-update invoice totalAmount when items change
CREATE OR REPLACE FUNCTION update_invoice_total()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE invoices
    SET "totalAmount" = (
        SELECT COALESCE(SUM(price * quantity), 0)
        FROM invoice_items
        WHERE "invoiceId" = COALESCE(NEW."invoiceId", OLD."invoiceId")
    )
    WHERE id = COALESCE(NEW."invoiceId", OLD."invoiceId");
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_invoice_total_insert ON invoice_items;
CREATE TRIGGER trigger_update_invoice_total_insert
    AFTER INSERT ON invoice_items
    FOR EACH ROW
    EXECUTE FUNCTION update_invoice_total();

DROP TRIGGER IF EXISTS trigger_update_invoice_total_update ON invoice_items;
CREATE TRIGGER trigger_update_invoice_total_update
    AFTER UPDATE ON invoice_items
    FOR EACH ROW
    EXECUTE FUNCTION update_invoice_total();

DROP TRIGGER IF EXISTS trigger_update_invoice_total_delete ON invoice_items;
CREATE TRIGGER trigger_update_invoice_total_delete
    AFTER DELETE ON invoice_items
    FOR EACH ROW
    EXECUTE FUNCTION update_invoice_total();

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE invoices IS 'Invoices table - Hóa đơn';
COMMENT ON TABLE invoice_items IS 'Invoice items table - Chi tiết hóa đơn (mỗi item = 1 product với nhiều services)';
COMMENT ON COLUMN invoice_items."productId" IS 'Product ID (túi xách)';
COMMENT ON COLUMN invoice_items."serviceId" IS 'Service ID (dịch vụ áp dụng cho product)';
COMMENT ON COLUMN invoice_items.images IS 'Ảnh sản phẩm trước khi sửa chữa';
COMMENT ON COLUMN invoice_items."qrCode" IS 'QR code data: số HĐ + túi + dịch vụ';

