# Supabase Foreign Key Relationship Fixes

## Errors Fixed

### Error 1: Column Does Not Exist
```
column Product_1.stock does not exist
```
**Cause:** Trying to select `*` from Product table which included non-existent column `stock`

### Error 2: Foreign Key Relationship Not Found
```
Could not find a relationship between 'Transaction' and 'Product' in the schema cache
```
**Cause:** Supabase queries trying to use foreign key joins that don't exist in the database schema

## Solutions Applied

### 1. Export API (`src/app/api/analytics/export/route.js`)

**Before (BROKEN):**
```javascript
const { data: transactions } = await supabase
  .from('Transaction')
  .select('*, Product(product_name, category, price)');  // ❌ Foreign key join
```

**After (FIXED):**
```javascript
const { data: transactions } = await supabase
  .from('Transaction')
  .select('product_id, quantity, total_amount');  // ✅ Just the fields we need

// Then filter in JavaScript
const productTransactions = transactions.filter(t => t.product_id === product.product_id);
```

### 2. Demand Forecast API (`src/app/api/analytics/demand-forecast/route.js`)

#### Fix A: Product Selection
**Before (BROKEN):**
```javascript
.select('*')  // ❌ Tries to select non-existent columns like 'stock'
```

**After (FIXED):**
```javascript
.select('product_id, product_name, category, price, quantity')  // ✅ Only existing columns
```

#### Fix B: All Forecasts Query
**Before (BROKEN):**
```javascript
.select(`
  *,
  Product:product_id (id, product_name, category, price, stock)
`)  // ❌ Foreign key join + non-existent 'stock' column
```

**After (FIXED):**
```javascript
// Step 1: Get forecasts
const { data: forecasts } = await supabase
  .from('DemandForecast')
  .select('*');

// Step 2: Get unique product IDs
const productIds = [...new Set(forecasts.map(f => f.product_id))];

// Step 3: Fetch products separately
const { data: products } = await supabase
  .from('Product')
  .select('product_id, product_name, category, price, quantity')
  .in('product_id', productIds);

// Step 4: Join in JavaScript
const productMap = {};
products.forEach(p => productMap[p.product_id] = p);
const enrichedForecasts = forecasts.map(f => ({
  ...f,
  Product: productMap[f.product_id]
}));
```

## Key Changes

1. **Removed all foreign key relationship queries** (`Product:product_id (...)` syntax)
2. **Explicit field selection** instead of `SELECT *`
3. **Manual joins in JavaScript** instead of database joins
4. **Correct field names**: Use `quantity` instead of `stock` for Product table

## Files Modified

1. ✅ `src/app/api/analytics/export/route.js`
   - Removed foreign key join from Transaction query
   - Added manual filtering in JavaScript
   - Changed `stock` to `quantity`

2. ✅ `src/app/api/analytics/demand-forecast/route.js`
   - Changed `SELECT *` to explicit fields
   - Removed foreign key joins
   - Added separate product queries with manual joining
   - Used `quantity` instead of `stock`

## Testing

After these fixes:
- ✅ Export (CSV/PDF) should work without errors
- ✅ Forecast button should work without errors
- ✅ No more "stock does not exist" errors
- ✅ No more "foreign key relationship not found" errors

Check the terminal - you should see:
```
✅ Products fetched: X
✅ Transactions fetched: Y
✅ Product found: Product Name
```

Instead of:
```
❌ Transactions fetch error: {...}
❌ Export error: {...}
```
