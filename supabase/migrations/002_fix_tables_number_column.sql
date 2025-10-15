-- Ensure the tables table has the number column
-- This migration is idempotent and safe to run multiple times

-- Check if the column exists, if not add it
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'tables' 
        AND column_name = 'number'
    ) THEN
        ALTER TABLE tables ADD COLUMN number INTEGER;
        ALTER TABLE tables ADD CONSTRAINT tables_number_unique UNIQUE (number);
    END IF;
END $$;

-- Ensure the column is NOT NULL if it exists
ALTER TABLE tables ALTER COLUMN number SET NOT NULL;
