-- Fix Customer table to auto-generate UUID for id column
ALTER TABLE "Customer" 
ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Verify the change
SELECT column_name, column_default, is_nullable, data_type
FROM information_schema.columns
WHERE table_name = 'Customer' AND column_name = 'id';
