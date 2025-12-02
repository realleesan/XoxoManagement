-- Migration: Add SKU / location / notes to materials
-- Created: 2025-12-02
-- Description: Adds optional columns sku, location, notes to materials table and index on sku

-- Add column sku if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'materials' AND column_name = 'sku'
    ) THEN
        ALTER TABLE materials ADD COLUMN sku TEXT;
    END IF;
END
$$;

-- Add column location if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'materials' AND column_name = 'location'
    ) THEN
        ALTER TABLE materials ADD COLUMN location TEXT;
    END IF;
END
$$;

-- Add column notes if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'materials' AND column_name = 'notes'
    ) THEN
        ALTER TABLE materials ADD COLUMN notes TEXT;
    END IF;
END
$$;

-- Create index on sku for faster lookup (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relname = 'idx_materials_sku'
    ) THEN
        CREATE INDEX idx_materials_sku ON materials (sku);
    END IF;
END
$$;

COMMENT ON COLUMN materials.sku IS 'Stock Keeping Unit (mã SKU)';
COMMENT ON COLUMN materials.location IS 'Kho / vị trí lưu trữ';
COMMENT ON COLUMN materials.notes IS 'Ghi chú bổ sung cho nguyên vật liệu';


