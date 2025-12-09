# Fix Analytics Data Loading - Complete Guide

## 🔍 Root Causes Identified

1. **Hardcoded Data Flag**: Frontend was using `USE_HARDCODED_DATA = true`, preventing real data fetching
2. **Missing Historical Data**: ProductSalesHistory table may be empty
3. **No Transaction Data**: Your database might not have actual transaction records yet

## ✅ Fixed in Frontend

Changed line 54 in `src/app/admin/analytics-dashboard/page.jsx`:
```javascript
const USE_HARDCODED_DATA = false; // Now fetches real data
```

## 🗄️ Backend Setup Required

### Step 1: Execute Backend SQL Files

Run these SQL files in your Supabase SQL Editor **in this order**:

#### A. Create Historical Data Tables (REQUIRED)
```sql
-- File: CREATE_HISTORICAL_DATA_TABLES.sql
-- This creates:
-- 1. ProductSalesHistory table (stores daily sales aggregates)
-- 2. DemandForecast table (stores ML predictions)
-- 3. Auto-population triggers (updates history when TransactionItem inserted)
-- 4. Sample data generation (90 days × 10 products)
-- 5. Stock notification triggers
```

**Copy the entire content of `CREATE_HISTORICAL_DATA_TABLES.sql` and execute it in Supabase.**

#### B. Create Real-Time Notifications (OPTIONAL)
```sql
-- File: REAL_TIME_PRODUCT_NOTIFICATIONS.sql
-- This creates:
-- 1. Product-linked notification system
-- 2. Auto-notifications for stock changes
-- 3. Views for active notifications
```

**Copy the entire content of `REAL_TIME_PRODUCT_NOTIFICATIONS.sql` and execute it in Supabase.**

### Step 2: Verify Data Population

After running the SQL, verify that data was created:

```sql
-- Check if ProductSalesHistory has data
SELECT COUNT(*) as total_records FROM "ProductSalesHistory";

-- View sample historical data
SELECT 
  p."name" as product_name,
  psh."date",
  psh."quantity_sold",
  psh."revenue"
FROM "ProductSalesHistory" psh
JOIN "Product" p ON p.id = psh."product_id"
ORDER BY psh."date" DESC
LIMIT 20;

-- Check products
SELECT id, "name", price, "quantity" FROM "Product" LIMIT 10;
```

**Expected Results:**
- `total_records` should be **900** (90 days × 10 products)
- You should see sales data from the last 90 days

### Step 3: Create Transaction Data (If Missing)

If you don't have any Transaction records yet, the analytics will show zeros. Here's SQL to create sample transactions:

```sql
-- Create sample transactions for testing
DO $$
DECLARE
  product_record RECORD;
  customer_record RECORD;
  transaction_id UUID;
  days_back INTEGER;
  items_count INTEGER;
  item_quantity INTEGER;
BEGIN
  -- Get first customer (or create a test customer)
  SELECT id INTO customer_record FROM "Customer" LIMIT 1;
  
  IF customer_record IS NULL THEN
    -- Create a test customer if none exists
    INSERT INTO "Customer" (
      "name",
      "email",
      "phone",
      "address",
      "created_at"
    ) VALUES (
      'Test Customer',
      'test@example.com',
      '1234567890',
      'Test Address',
      CURRENT_TIMESTAMP
    ) RETURNING id INTO customer_record;
  END IF;
  
  -- Create transactions for the last 30 days
  FOR days_back IN 0..29 LOOP
    -- Create 2-5 transactions per day
    FOR items_count IN 1..(floor(random() * 4 + 2)::INTEGER) LOOP
      -- Create transaction
      transaction_id := gen_random_uuid();
      
      INSERT INTO "Transaction" (
        "id",
        "transaction_date",
        "customer_id",
        "total_amount",
        "payment_method",
        "created_at"
      ) VALUES (
        transaction_id,
        CURRENT_TIMESTAMP - (days_back || ' days')::INTERVAL,
        customer_record.id,
        0, -- Will update after adding items
        'cash',
        CURRENT_TIMESTAMP - (days_back || ' days')::INTERVAL
      );
      
      -- Add 1-4 items to this transaction
      DECLARE
        total_amount DECIMAL(10,2) := 0;
      BEGIN
        FOR product_record IN 
          SELECT id, "name", price FROM "Product" 
          ORDER BY random() 
          LIMIT (floor(random() * 4 + 1)::INTEGER)
        LOOP
          item_quantity := floor(random() * 5 + 1)::INTEGER;
          
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
            product_record."name",
            item_quantity,
            product_record.price,
            item_quantity * product_record.price
          );
          
          total_amount := total_amount + (item_quantity * product_record.price);
        END LOOP;
        
        -- Update transaction total
        UPDATE "Transaction" 
        SET "total_amount" = total_amount 
        WHERE id = transaction_id;
      END;
    END LOOP;
  END LOOP;
END $$;
```

## 🧪 Testing Steps

### 1. Check Frontend Console
Open browser DevTools (F12) → Console tab and look for:
```
=== Fetching Analytics ===
Period: monthly
Calculating fresh analytics data from transactions...
Transactions fetched: 50
Transaction Items fetched: 150
```

### 2. Verify Time Period Filtering
- Select **"Last 24 Hours"** → Should show today's data only
- Select **"Last 7 Days"** → Should show last week's data
- Select **"This Month"** → Should show current month's data
- Select **"This Year"** → Should show current year's data

**Each period should show different numbers!**

### 3. Check Forecast Feature
1. Click on any product in the "Top Performing Products" section
2. Should display a modal with:
   - Historical data (last 90 days)
   - Average daily demand
   - Trend analysis
   - 3-month forecast with confidence levels

## 🚨 Troubleshooting

### Issue: Still Showing Zeros

**Cause**: No Transaction data in database

**Solution**: 
1. Run the sample transaction SQL (Step 3 above)
2. OR: Process some actual sales through your QR shopping system

### Issue: Same Data for All Time Periods

**Cause**: All your transaction data is from the same date range

**Solution**: The sample transaction SQL creates data across 30 days. If still same, check browser console for errors.

### Issue: Forecast Shows NaN

**Cause**: ProductSalesHistory table is empty for selected product

**Solution**:
```sql
-- Check if historical data exists for product
SELECT * FROM "ProductSalesHistory" 
WHERE "product_id" = 'YOUR_PRODUCT_ID' 
ORDER BY "date" DESC;

-- If empty, the sample data generation should have created it
-- Re-run section 10 of CREATE_HISTORICAL_DATA_TABLES.sql
```

### Issue: Console Shows "Error fetching analytics"

**Cause**: Database connection or RLS policy issues

**Solution**:
```sql
-- Check RLS policies on tables
SELECT tablename, policyname, roles 
FROM pg_policies 
WHERE tablename IN ('Transaction', 'TransactionItem', 'Product', 'ProductSalesHistory');

-- If missing, create policies:
ALTER TABLE "Transaction" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TransactionItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ProductSalesHistory" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read for all users" ON "Transaction" FOR SELECT USING (true);
CREATE POLICY "Enable read for all users" ON "TransactionItem" FOR SELECT USING (true);
CREATE POLICY "Enable read for all users" ON "ProductSalesHistory" FOR SELECT USING (true);
```

## 📊 Expected Results After Fix

### Analytics Dashboard Should Show:
- ✅ **Total Revenue**: Actual sum from transactions (not 0)
- ✅ **Total Transactions**: Count of Transaction records
- ✅ **Unique Customers**: Number of different customers
- ✅ **Avg Transaction Value**: Revenue / Transactions
- ✅ **Sales Trend Chart**: Daily/weekly trends with real data
- ✅ **Top Products**: Products sorted by revenue
- ✅ **Product Performance Table**: All products with sales data

### Forecast Modal Should Show:
- ✅ **Historical Data Points**: Last 90 days of sales
- ✅ **Trend Analysis**: Increasing/Decreasing/Stable
- ✅ **3-Month Forecast**: Predicted sales with confidence levels
- ✅ **AI Insights**: Recommendations based on trends

## 📝 Quick Commands Checklist

```bash
# 1. Check if frontend is updated
# Line 54 should show: const USE_HARDCODED_DATA = false;

# 2. Run SQL in Supabase (in order):
#    ☐ CREATE_HISTORICAL_DATA_TABLES.sql
#    ☐ REAL_TIME_PRODUCT_NOTIFICATIONS.sql
#    ☐ Sample transaction data (if needed)

# 3. Verify data:
#    ☐ ProductSalesHistory has 900 records
#    ☐ Transaction has records from last 30 days
#    ☐ TransactionItem linked to transactions

# 4. Test frontend:
#    ☐ Refresh browser (Ctrl+R)
#    ☐ Select different time periods
#    ☐ Click on products to see forecasts
#    ☐ Check browser console for errors

# 5. If still issues:
#    ☐ Check Supabase logs
#    ☐ Verify RLS policies
#    ☐ Check service role key in .env
```

## 🎯 Next Steps

1. **Execute the SQL files** in Supabase SQL Editor
2. **Verify data** using the SQL queries above
3. **Refresh your frontend** (Ctrl+R or F5)
4. **Test different time periods** to see varying data
5. **Click on products** to test the forecast feature

---

## 💡 Understanding the Architecture

### Data Flow:
```
1. Customer scans QR → Creates Transaction
2. Transaction trigger → Updates ProductSalesHistory (daily aggregates)
3. ProductSalesHistory → Used by ML forecast algorithm
4. DemandForecast → Stores predictions for future dates
5. Frontend → Fetches from Transaction + ProductSalesHistory
6. Time Period Filter → Changes date range in SQL queries
```

### Why Different Time Periods Show Different Data:
```javascript
// The fetchAnalytics function calculates date ranges:
switch(period) {
  case 'daily':  // Last 24 hours
    startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  case 'weekly': // Last 7 days
    startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  case 'monthly': // Current month
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  case 'yearly': // Current year
    startDate = new Date(now.getFullYear(), 0, 1);
}

// Then queries: .gte('transaction_date', startDate)
```

This means if your sample data spans 30 days, monthly and yearly will show same data, but daily/weekly will differ!

---

**Status**: ✅ Frontend fix applied, backend SQL ready to execute
**Next Action**: Execute SQL files in Supabase and verify data population
