gf-- ========================================
-- RESET PRODUCT ID TO START FROM 1
-- ========================================
-- Run this in Supabase SQL Editor
-- https://qdwsqbzlhyxhebdlqath.supabase.co

-- Step 1: Delete all existing products (if you want a fresh start)
-- WARNING: This will delete all your test products!
DELETE FROM "Product";

-- Step 2: Reset the auto-increment sequence to start from 1
ALTER SEQUENCE "Product_id_seq" RESTART WITH 1;

-- ========================================
-- VERIFICATION
-- ========================================
-- Check current sequence value:
SELECT last_value FROM "Product_id_seq";
-- Should show: 1

-- ========================================
-- ALTERNATIVE: Keep existing products but reset sequence
-- ========================================
-- If you want to keep existing products but just fix the sequence:
-- (Uncomment the line below and comment out the DELETE and ALTER above)

-- SELECT setval('"Product_id_seq"', (SELECT MAX(id) FROM "Product"), true);

-- This will set the sequence to continue from your highest existing ID
