-- Disable RLS on Product table for now (or create proper policies)

-- Option 1: Disable RLS (simpler for development)
ALTER TABLE "Product" DISABLE ROW LEVEL SECURITY;

-- Option 2: Create permissive policy (if you want to keep RLS enabled)
-- ALTER TABLE "Product" ENABLE ROW LEVEL SECURITY;
-- 
-- CREATE POLICY "Allow all operations on Product"
-- ON "Product"
-- FOR ALL
-- TO public
-- USING (true)
-- WITH CHECK (true);
