-- Migration: Create Orders tables
-- Created: 2025-12-03
-- Description: Create orders and order_items tables for managing service tickets and retail sales

-- Create Enums
DO $$ BEGIN
    CREATE TYPE order_status_enum AS ENUM ('PENDING', 'DEPOSITED', 'PROCESSING', 'COMPLETED', 'CANCELLED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE order_type_enum AS ENUM ('SERVICE', 'RETAIL', 'MIXED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    "customerId" TEXT NOT NULL,
    "totalAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "depositAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    status order_status_enum NOT NULL DEFAULT 'PENDING',
    type order_type_enum NOT NULL DEFAULT 'SERVICE',
    notes TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    CONSTRAINT fk_orders_customer FOREIGN KEY ("customerId") REFERENCES customers(id) ON DELETE CASCADE
);

-- Create Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
    id TEXT PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "productId" TEXT, -- For service items (Customer's product)
    "serviceId" TEXT, -- For service items (Service to perform)
    "materialId" TEXT, -- For retail items (Product from inventory)
    quantity INTEGER NOT NULL DEFAULT 1,
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    notes TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    CONSTRAINT fk_order_items_order FOREIGN KEY ("orderId") REFERENCES orders(id) ON DELETE CASCADE,
    CONSTRAINT fk_order_items_product FOREIGN KEY ("productId") REFERENCES products(id) ON DELETE SET NULL,
    CONSTRAINT fk_order_items_service FOREIGN KEY ("serviceId") REFERENCES services(id) ON DELETE SET NULL,
    CONSTRAINT fk_order_items_material FOREIGN KEY ("materialId") REFERENCES materials(id) ON DELETE SET NULL
);

-- Create Indexes
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders("customerId");
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders("createdAt");
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items("orderId");
