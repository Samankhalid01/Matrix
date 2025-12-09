-- ============================================
-- GENERATE SAMPLE TRANSACTION DATA
-- ============================================
-- This script creates realistic transaction data for testing analytics
-- Run this AFTER CREATE_HISTORICAL_DATA_TABLES.sql
-- Creates transactions across different time periods to test time filters

-- 1. Ensure we have at least one customer
DO $$
DECLARE
  customer_count INTEGER;
  test_customer_id UUID;
BEGIN
  SELECT COUNT(*) INTO customer_count FROM "Customer";
  
  IF customer_count = 0 THEN
    RAISE NOTICE 'No customers found. Creating test customer...';
    
    INSERT INTO "Customer" (
      "name",
      "email",
      "phone",
      "address",
      "created_at"
    ) VALUES (
      'Test Customer Analytics',
      'analytics@test.com',
      '0300-1234567',
      'Analytics Test Address, Islamabad',
      CURRENT_TIMESTAMP
    ) RETURNING id INTO test_customer_id;
    
    RAISE NOTICE 'Created test customer with ID: %', test_customer_id;
  ELSE
    RAISE NOTICE 'Found % existing customers', customer_count;
  END IF;
END $$;

-- 2. Generate transactions for the last 90 days
-- This creates varying patterns for different time periods
DO $$
DECLARE
  product_record RECORD;
  customer_record RECORD;
  transaction_id UUID;
  days_back INTEGER;
  transactions_per_day INTEGER;
  items_per_transaction INTEGER;
  item_quantity INTEGER;
  transaction_total DECIMAL(10,2);
  base_multiplier DECIMAL(4,2);
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Starting transaction data generation...';
  RAISE NOTICE '========================================';
  
  -- Get a customer to use (use first one or test customer)
  SELECT id INTO customer_record FROM "Customer" LIMIT 1;
  
  IF customer_record IS NULL THEN
    RAISE EXCEPTION 'No customer found! Run customer creation first.';
  END IF;
  
  RAISE NOTICE 'Using customer ID: %', customer_record.id;
  
  -- Generate transactions for the last 90 days
  FOR days_back IN 0..89 LOOP
    -- Vary transactions per day based on time period
    -- Last 7 days: 8-12 transactions/day
    -- Last 30 days: 5-8 transactions/day  
    -- Older: 3-6 transactions/day
    IF days_back < 7 THEN
      transactions_per_day := floor(random() * 5 + 8)::INTEGER; -- 8-12
      base_multiplier := 1.2; -- 20% more revenue
    ELSIF days_back < 30 THEN
      transactions_per_day := floor(random() * 4 + 5)::INTEGER; -- 5-8
      base_multiplier := 1.0; -- Normal revenue
    ELSE
      transactions_per_day := floor(random() * 4 + 3)::INTEGER; -- 3-6
      base_multiplier := 0.8; -- 20% less revenue (older data)
    END IF;
    
    -- Create multiple transactions per day
    FOR trans_num IN 1..transactions_per_day LOOP
      transaction_id := gen_random_uuid();
      transaction_total := 0;
      
      -- Create transaction
      INSERT INTO "Transaction" (
        "id",
        "transaction_date",
        "customer_id",
        "total_amount",
        "discount_applied",
        "final_amount",
        "payment_method",
        "created_at"
      ) VALUES (
        transaction_id,
        CURRENT_TIMESTAMP - (days_back || ' days')::INTERVAL - (trans_num || ' hours')::INTERVAL,
        customer_record.id,
        0, -- Will update after adding items
        0, -- No discount for sample data
        0, -- Will update after adding items
        CASE floor(random() * 3)::INTEGER
          WHEN 0 THEN 'cash'
          WHEN 1 THEN 'card'
          ELSE 'mobile'
        END,
        CURRENT_TIMESTAMP - (days_back || ' days')::INTERVAL
      );
      
      -- Add 1-5 items per transaction
      items_per_transaction := floor(random() * 5 + 1)::INTEGER;
      
      FOR product_record IN 
        SELECT id, "product_name", price FROM "Product" 
        ORDER BY random() 
        LIMIT items_per_transaction
      LOOP
        -- Vary quantity: more items in recent transactions
        IF days_back < 7 THEN
          item_quantity := floor(random() * 4 + 2)::INTEGER; -- 2-5 items
        ELSE
          item_quantity := floor(random() * 3 + 1)::INTEGER; -- 1-3 items
        END IF;
        
        -- Calculate price with base multiplier
        transaction_total := transaction_total + (item_quantity * product_record.price * base_multiplier);
        
        INSERT INTO "TransactionItem" (
          "transaction_id",
          "product_id",
          "product_name",
          "quantity",
          "unit_price",
          "total_price"
        ) VALUES (
          transaction_id,
          product_record.id,
          product_record."product_name",
          item_quantity,
          product_record.price,
          item_quantity * product_record.price * base_multiplier
        );
      END LOOP;
      
      -- Update transaction total
      UPDATE "Transaction" 
      SET 
        "total_amount" = transaction_total,
        "final_amount" = transaction_total -- No discount applied
      WHERE id = transaction_id;
    END LOOP;
    
    -- Progress update every 10 days
    IF days_back % 10 = 0 THEN
      RAISE NOTICE 'Generated data for day % (% days ago)', days_back, days_back;
    END IF;
  END LOOP;
  
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Transaction data generation complete!';
  RAISE NOTICE '========================================';
END $$;

-- 3. Verify the data was created
DO $$
DECLARE
  total_transactions INTEGER;
  total_items INTEGER;
  total_revenue DECIMAL(10,2);
  last_24h_trans INTEGER;
  last_7d_trans INTEGER;
  last_30d_trans INTEGER;
BEGIN
  -- Count totals
  SELECT COUNT(*) INTO total_transactions FROM "Transaction";
  SELECT COUNT(*) INTO total_items FROM "TransactionItem";
  SELECT SUM("final_amount") INTO total_revenue FROM "Transaction";
  
  -- Count by time period
  SELECT COUNT(*) INTO last_24h_trans 
  FROM "Transaction" 
  WHERE "transaction_date" >= CURRENT_TIMESTAMP - INTERVAL '24 hours';
  
  SELECT COUNT(*) INTO last_7d_trans 
  FROM "Transaction" 
  WHERE "transaction_date" >= CURRENT_TIMESTAMP - INTERVAL '7 days';
  
  SELECT COUNT(*) INTO last_30d_trans 
  FROM "Transaction" 
  WHERE "transaction_date" >= CURRENT_TIMESTAMP - INTERVAL '30 days';
  
  RAISE NOTICE '========================================';
  RAISE NOTICE 'DATA VERIFICATION REPORT';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Total Transactions: %', total_transactions;
  RAISE NOTICE 'Total Transaction Items: %', total_items;
  RAISE NOTICE 'Total Revenue: Rs. %', ROUND(total_revenue, 2);
  RAISE NOTICE '----------------------------------------';
  RAISE NOTICE 'Last 24 Hours: % transactions', last_24h_trans;
  RAISE NOTICE 'Last 7 Days: % transactions', last_7d_trans;
  RAISE NOTICE 'Last 30 Days: % transactions', last_30d_trans;
  RAISE NOTICE 'Last 90 Days: % transactions', total_transactions;
  RAISE NOTICE '========================================';
  
  -- Verify ProductSalesHistory was updated by trigger
  DECLARE
    history_count INTEGER;
  BEGIN
    SELECT COUNT(*) INTO history_count FROM "ProductSalesHistory";
    RAISE NOTICE 'ProductSalesHistory Records: %', history_count;
    
    IF history_count = 0 THEN
      RAISE WARNING 'ProductSalesHistory is empty! The trigger may not be working.';
      RAISE NOTICE 'Run CREATE_HISTORICAL_DATA_TABLES.sql first to create the trigger.';
    ELSE
      RAISE NOTICE 'ProductSalesHistory updated successfully!';
    END IF;
  END;
END $$;

-- 4. Show sample data for verification
SELECT 
  '=== SAMPLE TRANSACTIONS (Last 10) ===' as info;

SELECT 
  t.id,
  t."transaction_date"::DATE as date,
  t."transaction_date"::TIME as time,
  t."total_amount" as subtotal,
  t."discount_applied" as discount,
  t."final_amount" as amount,
  t."payment_method" as payment,
  COUNT(ti.id) as items
FROM "Transaction" t
LEFT JOIN "TransactionItem" ti ON ti."transaction_id" = t.id
GROUP BY t.id, t."transaction_date", t."total_amount", t."discount_applied", t."final_amount", t."payment_method"
ORDER BY t."transaction_date" DESC
LIMIT 10;

SELECT 
  '=== SALES BY TIME PERIOD ===' as info;

SELECT 
  'Last 24 Hours' as period,
  COUNT(*) as transactions,
  SUM("final_amount") as revenue,
  ROUND(AVG("final_amount"), 2) as avg_transaction
FROM "Transaction" 
WHERE "transaction_date" >= CURRENT_TIMESTAMP - INTERVAL '24 hours'

UNION ALL

SELECT 
  'Last 7 Days' as period,
  COUNT(*) as transactions,
  SUM("final_amount") as revenue,
  ROUND(AVG("final_amount"), 2) as avg_transaction
FROM "Transaction" 
WHERE "transaction_date" >= CURRENT_TIMESTAMP - INTERVAL '7 days'

UNION ALL

SELECT 
  'Last 30 Days' as period,
  COUNT(*) as transactions,
  SUM("final_amount") as revenue,
  ROUND(AVG("final_amount"), 2) as avg_transaction
FROM "Transaction" 
WHERE "transaction_date" >= CURRENT_TIMESTAMP - INTERVAL '30 days'

UNION ALL

SELECT 
  'Last 90 Days (All)' as period,
  COUNT(*) as transactions,
  SUM("final_amount") as revenue,
  ROUND(AVG("final_amount"), 2) as avg_transaction
FROM "Transaction";

SELECT 
  '=== TOP 5 PRODUCTS BY REVENUE ===' as info;

SELECT 
  p."product_name" as product_name,
  COUNT(ti.id) as times_sold,
  SUM(ti."quantity") as total_units,
  ROUND(SUM(ti."total_price"), 2) as total_revenue
FROM "TransactionItem" ti
JOIN "Product" p ON p.id = ti."product_id"
GROUP BY p.id, p."product_name"
ORDER BY total_revenue DESC
LIMIT 5;

-- 5. Final notes
DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'NEXT STEPS:';
  RAISE NOTICE '========================================';
  RAISE NOTICE '1. Refresh your frontend (Ctrl+R)';
  RAISE NOTICE '2. Open Analytics Dashboard';
  RAISE NOTICE '3. Test different time periods:';
  RAISE NOTICE '   - Last 24 Hours (should show ~8-12 transactions)';
  RAISE NOTICE '   - Last 7 Days (should show ~50-80 transactions)';
  RAISE NOTICE '   - This Month (should show ~150-250 transactions)';
  RAISE NOTICE '   - This Year (should show all ~500-600 transactions)';
  RAISE NOTICE '4. Click on any product to see ML forecast';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'If still showing zeros:';
  RAISE NOTICE '1. Check browser console (F12) for errors';
  RAISE NOTICE '2. Verify Supabase connection in frontend';
  RAISE NOTICE '3. Check RLS policies on tables';
  RAISE NOTICE '========================================';
END $$;
