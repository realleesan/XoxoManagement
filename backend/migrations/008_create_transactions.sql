-- Migration: Create Transactions table (Finance)
-- Created: 2025-12-02
-- Description: Create transactions table and enums used by finance features

DO $$ BEGIN
    CREATE TYPE transaction_type_enum AS ENUM ('REVENUE', 'EXPENSE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE transaction_status_enum AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'PAID');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    type transaction_type_enum NOT NULL,
    amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    description TEXT,
    status transaction_status_enum NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions("createdAt");


