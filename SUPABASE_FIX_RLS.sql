-- ========================================
-- FIX SUPABASE RLS POLICY FOR PRODUCT TABLE
-- ========================================
-- Run this SQL in your Supabase SQL Editor
-- https://qdwsqbzlhyxhebdlqath.supabase.co

-- Option 1: Disable RLS completely (EASIEST FOR DEVELOPMENT)
ALTER TABLE "Product" DISABLE ROW LEVEL SECURITY;

-- Option 2: Enable RLS with permissive policy (if you want to keep RLS)
-- Uncomment the lines below if you prefer this approach:

-- ALTER TABLE "Product" ENABLE ROW LEVEL SECURITY;
-- 
-- DROP POLICY IF EXISTS "Allow all operations on Product" ON "Product";
-- 
-- CREATE POLICY "Allow all operations on Product"
-- ON "Product"
-- FOR ALL
-- TO public, anon, authenticated
-- USING (true)
-- WITH CHECK (true);

-- ========================================
-- VERIFICATION QUERY
-- ========================================
-- Run this to check if RLS is disabled:
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'Product';

-- If rowsecurity = false, RLS is disabled ✅
-- If rowsecurity = true, RLS is enabled (you need the policy above)
