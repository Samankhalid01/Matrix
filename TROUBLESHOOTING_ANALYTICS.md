# 🔧 Troubleshooting Guide - Analytics Dashboard

## 🐛 Issue: Forecast Button Not Working

### Symptoms
- Clicking "Forecast" button does nothing
- No modal appears
- No errors visible on screen

### Debugging Steps

#### Step 1: Open Browser Console
1. Press **F12** on your keyboard (or right-click → Inspect)
2. Click on **Console** tab
3. Click any **"Forecast"** button
4. Look for these messages:

**Expected Console Output:**
```
🔘 Forecast button clicked for product: Gourmet Cola ID: 1
🔍 Fetching forecast for product ID: 1
📊 Forecast API response: {success: true, forecasts: [...]}
✅ Forecast data set successfully
```

**If you see errors instead:**
- ❌ `404 Not Found` → API route doesn't exist
- ❌ `500 Internal Server Error` → Database/API error
- ❌ `product_id is undefined` → Product data structure issue

#### Step 2: Check Product ID
Look at the console log that says:
```
🔘 Forecast button clicked for product: X ID: Y
```

- If **ID is undefined** → Product data is missing the `product_id` field
- If **ID is a number** → Good! Continue to Step 3

#### Step 3: Check API Response
Look for:
```
📊 Forecast API response: {...}
```

**Expected:**
```json
{
  "success": true,
  "forecasts": [
    {
      "product_id": 1,
      "product_name": "Gourmet Cola",
      "forecast": [...],
      "historical_data": {...}
    }
  ]
}
```

**If `success: false`:**
- Check the error message in the response
- Database might not have forecast data
- Run: `node scripts/generate-demand-forecast.js`

#### Step 4: Check Modal Rendering
If API returns data but modal doesn't show:

1. Open console
2. Type: `document.querySelector('.fixed.inset-0')`
3. If it returns `null` → Modal is not rendering
4. Check React state: The modal only shows when BOTH `forecast` and `selectedProduct` are set

---

## 🐛 Issue: Export Buttons Not Working

### Symptoms
- Clicking "Export CSV" or "Export PDF" does nothing
- No file downloads
- No errors visible

### Debugging Steps

#### Step 1: Check Console
Click an export button and look for:

**Expected:**
```
📤 Exporting report in format: csv
✅ Export response received
✅ CSV downloaded
```

**Common Errors:**
```
❌ Export failed: 500 Internal Server Error
```
This means the API endpoint has an issue.

#### Step 2: Check API Response
Open Network tab (F12 → Network):
1. Click export button
2. Look for request to `/api/analytics/export?format=csv&period=monthly`
3. Check the response:
   - **200 OK** → Good
   - **404 Not Found** → API route missing
   - **500 Error** → Server error (check terminal)

#### Step 3: Check Server Terminal
Look at your `npm run dev` terminal output:

**Expected:**
```
📊 Export API called - Format: csv Period: monthly
✅ Data fetched: 5 products
📊 Generating CSV with 5 products
✅ CSV generated successfully
```

**If you see errors:**
- Database connection issues
- Missing environment variables
- Supabase API errors

---

## 🔍 Common Issues & Solutions

### Issue 1: "product_id is undefined"

**Cause**: Product data structure doesn't include `product_id` field

**Solution**: Check your analytics API response structure

Update table mapping:
```jsx
// In analytics-dashboard page.jsx
// Make sure product has product_id or id field
<button onClick={() => setSelectedProduct(product.id || product.product_id)}>
```

---

### Issue 2: "No forecast data in database"

**Cause**: DemandForecast table is empty

**Solution**: Run the forecast generation script
```bash
node scripts/generate-demand-forecast.js
```

**Expected output:**
```
✅ Generated 3 forecasts for Product A
✅ Generated 3 forecasts for Product B
✅ Total: 15 forecasts created
```

---

### Issue 3: "jsPDF is not defined"

**Cause**: PDF library not installed

**Solution**:
```bash
npm install jspdf jspdf-autotable
```

Then restart server:
```bash
npm run dev
```

---

### Issue 4: "Modal appears but shows 'No forecast data'"

**Cause**: API returns data but in wrong format

**Check**: Console log of forecast data:
```javascript
console.log('Forecast data:', forecast);
```

**Expected structure:**
```json
{
  "forecasts": [
    {
      "product_name": "...",
      "forecast": [...],
      "historical_data": {
        "dates": [...],
        "quantities": [...],
        "avg_daily_demand": 35
      }
    }
  ]
}
```

---

### Issue 5: "CSV file is empty or corrupted"

**Cause**: API returning wrong content type or empty data

**Solutions**:

1. Check API logs for data count:
   ```
   ✅ Data fetched: 5 products
   ```

2. Verify products exist in database:
   ```sql
   SELECT COUNT(*) FROM Product;
   ```

3. Check CSV generation:
   - Open downloaded CSV in text editor
   - Should see headers and data rows

---

## 📋 Quick Checks

Run these checks in order:

### ✅ Check 1: Database has data
```sql
-- Products exist?
SELECT COUNT(*) FROM Product;

-- Forecasts exist?
SELECT COUNT(*) FROM DemandForecast;

-- Transactions exist?
SELECT COUNT(*) FROM Transaction;
```

### ✅ Check 2: API routes exist
Check these files exist:
- `src/app/api/analytics/performance/route.js`
- `src/app/api/analytics/demand-forecast/route.js`
- `src/app/api/analytics/export/route.js`

### ✅ Check 3: Environment variables
Check `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

### ✅ Check 4: Server is running
```bash
npm run dev
```
Should see:
```
▲ Next.js 14.0.0
- Local:        http://localhost:3000
✓ Ready in 2.5s
```

---

## 🧪 Test Each Feature

### Test Forecast Button

1. **Go to**: `http://localhost:3000/admin/analytics-dashboard`
2. **Open console**: F12
3. **Click**: Any "Forecast" button
4. **Expected**: Modal opens with:
   - Blue header with product name
   - Dark section with sales pattern analysis
   - Green bars showing historical sales
   - 3 blue cards with forecast numbers
   - Purple section with trend insights

### Test CSV Export

1. **Go to**: `http://localhost:3000/admin/analytics-dashboard`
2. **Open console**: F12
3. **Click**: "📊 Export CSV"
4. **Expected**:
   - Console shows: `✅ CSV downloaded`
   - File downloads automatically
   - Open file in Excel/Notepad
   - Should see product data in CSV format

### Test PDF Export

1. **Click**: "📄 Export PDF"
2. **Expected**:
   - Console shows: `✅ PDF downloaded`
   - PDF file downloads
   - Open PDF
   - Should see formatted table with summary stats

---

## 🆘 Still Not Working?

If nothing works:

### Last Resort Checks

1. **Clear browser cache**:
   - Ctrl + Shift + Delete
   - Clear cache and reload

2. **Restart Next.js server**:
   ```bash
   # Stop server (Ctrl+C)
   npm run dev
   ```

3. **Check for TypeScript/build errors**:
   ```bash
   npm run build
   ```

4. **Verify all packages installed**:
   ```bash
   npm install
   ```

---

## 📞 Report Issue

If still not working, provide:

1. **Console logs** (F12 → Console) - copy all red errors
2. **Network tab** (F12 → Network) - show failed requests
3. **Server terminal** output - any errors there?
4. **Browser** used (Chrome, Firefox, etc.)
5. **What happens** when you click the button?

---

**Remember**: Check the browser console (F12) - it will tell you exactly what's wrong! 🔍
