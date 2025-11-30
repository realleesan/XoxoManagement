-- Migration: Create Services Table
-- Created: 2025-11-30
-- Description: Creates table for Service Management (Bảng giá dịch vụ)

-- ============================================
-- TABLE
-- ============================================

-- Services Table
CREATE TABLE IF NOT EXISTS services (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    description TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_services_category ON services(category);
CREATE INDEX IF NOT EXISTS idx_services_name ON services(name);
CREATE INDEX IF NOT EXISTS idx_services_created_at ON services("createdAt");

-- ============================================
-- TRIGGERS
-- ============================================

-- Apply trigger to services table for updatedAt
DROP TRIGGER IF EXISTS update_services_updated_at ON services;
CREATE TRIGGER update_services_updated_at
    BEFORE UPDATE ON services
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE services IS 'Services table - Bảng giá dịch vụ sửa chữa';
COMMENT ON COLUMN services.category IS 'Category: Vệ sinh, Khâu vá, Phục hồi màu, Xi mạ';
COMMENT ON COLUMN services.price IS 'Giá dịch vụ';

-- ============================================
-- SAMPLE DATA (Optional)
-- ============================================

-- Có thể insert một số dịch vụ mẫu nếu cần
-- INSERT INTO services (id, name, category, price, description) VALUES
-- ('sample1', 'Vệ sinh túi xách', 'Vệ sinh', 100000, 'Vệ sinh cơ bản túi xách'),
-- ('sample2', 'Khâu vá da', 'Khâu vá', 200000, 'Khâu vá các vết rách trên da');

