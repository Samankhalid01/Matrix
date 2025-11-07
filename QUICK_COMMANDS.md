# ⚡ QUICK START COMMANDS

## 🚀 Setup (One-Time)

### 1. Database Setup
```sql
-- Open Supabase SQL Editor
-- Copy paste content from: DATABASE_SCHEMA_COMPLETE.sql
-- Click RUN
-- ✅ Creates 11 tables, 2 triggers, 2 views
```

### 2. Seed Data
```powershell
# Run in terminal
node scripts/seed-database.js

# ✅ Generates:
# - 25 Products
# - 10 Customers
# - 150-300 Transactions (6 months)
# - 4 Promotions
```

### 3. Test APIs
```powershell
# Verify everything works
node test-modules.js

# ✅ Tests 6 APIs:
# - Notifications
# - Stock Alerts
# - Promotions
# - Customer Segments
# - Analytics
# - Forecasting
```

---

## 🌐 Access Pages

```
Make sure server is running: npm run dev
```

### Notifications Center
```
http://localhost:3000/admin/notifications-center
```

### Promotions Dashboard
```
http://localhost:3000/admin/promotions
```

### Analytics Dashboard
```
http://localhost:3000/admin/analytics-dashboard
```

---

## 🧪 API Testing (cURL Examples)

### Get Notifications
```powershell
curl "http://localhost:3000/api/notifications?recipient_type=admin"
```

### Get Stock Alerts
```powershell
curl "http://localhost:3000/api/notifications/stock-alerts?status=pending"
```

### Get Promotions
```powershell
curl "http://localhost:3000/api/promotions?is_active=true"
```

### Calculate Discount
```powershell
curl -X POST http://localhost:3000/api/promotions/calculate-discount `
  -H "Content-Type: application/json" `
  -d '{\"customerId\":\"YOUR_CUSTOMER_ID\",\"cartTotal\":250,\"promoCode\":\"SAVE20\"}'
```

### Get Analytics
```powershell
curl "http://localhost:3000/api/analytics/performance?period=monthly"
```

### Get Customer Segments
```powershell
curl "http://localhost:3000/api/analytics/customer-segments"
```

### Get Demand Forecast
```powershell
curl "http://localhost:3000/api/analytics/forecast?days=30"
```

---

## 🔧 Development Commands

### Start Development Server
```powershell
npm run dev
```

### Build for Production
```powershell
npm run build
```

### Run Production Server
```powershell
npm start
```

### Install Dependencies (if needed)
```powershell
npm install @supabase/supabase-js
```

---

## 📊 Database Quick Queries

### Check Tables Created
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

### Count Notifications
```sql
SELECT COUNT(*) FROM "Notification";
```

### Count Stock Alerts
```sql
SELECT COUNT(*) FROM "StockAlert" WHERE status = 'pending';
```

### Count Promotions
```sql
SELECT COUNT(*) FROM "Promotion" WHERE is_active = true;
```

### Count Transactions
```sql
SELECT COUNT(*) FROM "Transaction";
```

### View Customer Tiers
```sql
SELECT customer_tier, COUNT(*) 
FROM "Customer" 
GROUP BY customer_tier;
```

### Check Product Stock Levels
```sql
SELECT product_name, current_stock, min_stock_threshold
FROM "Product"
WHERE current_stock <= min_stock_threshold
ORDER BY current_stock;
```

---

## 🐛 Troubleshooting Commands

### Check Server Status
```powershell
# Should show server running on port 3000
Get-Process node
```

### Clear Node Modules (if issues)
```powershell
Remove-Item -Recurse -Force node_modules
npm install
```

### Check Environment Variables
```powershell
# Verify .env.local exists and has Supabase credentials
cat .env.local
```

### Test Supabase Connection
```javascript
// Run in Node.js
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
supabase.from('Customer').select('*').limit(1).then(console.log);
```

---

## 📦 Manual Testing Steps

### Test Notifications
1. Go to: http://localhost:3000/admin/notifications-center
2. Should see notifications list
3. Try marking one as read
4. Try deleting one
5. Try priority filter

### Test Promotions
1. Go to: http://localhost:3000/admin/promotions
2. Should see customer tier segments
3. Click "Create Promotion"
4. Fill form and save
5. Try copying promo code
6. Try toggling active/inactive

### Test Analytics
1. Go to: http://localhost:3000/admin/analytics-dashboard
2. Should see 4 metric cards
3. Check sales trend chart
4. View top products
5. Click "Forecast" on any product
6. Try changing time period

---

## 🔄 Update/Refresh Data

### Regenerate Sample Data
```powershell
# Delete old data first in Supabase, then:
node scripts/seed-database.js
```

### Trigger Stock Alert Manually
```sql
-- Update product stock to below threshold
UPDATE "Product" 
SET current_stock = 3 
WHERE product_name = 'YOUR_PRODUCT_NAME';

-- Check notification created
SELECT * FROM "Notification" 
WHERE notification_type = 'stock_alert' 
ORDER BY created_at DESC LIMIT 1;
```

### Test Tier Upgrade Manually
```sql
-- Add high-value transaction
INSERT INTO "Transaction" (customer_id, total_amount, final_amount)
VALUES ('YOUR_CUSTOMER_ID', 600, 600);

-- Check tier updated
SELECT name, customer_tier FROM "Customer" 
WHERE id = 'YOUR_CUSTOMER_ID';
```

---

## 📝 Quick File Locations

```
Database Schema:
E:\Eighth_Semester\FYP-2\MATRIX\DATABASE_SCHEMA_COMPLETE.sql

Seeding Script:
E:\Eighth_Semester\FYP-2\MATRIX\scripts\seed-database.js

Test Script:
E:\Eighth_Semester\FYP-2\MATRIX\test-modules.js

API Routes:
E:\Eighth_Semester\FYP-2\MATRIX\src\app\api\
  ├── notifications/
  ├── promotions/
  └── analytics/

Frontend Pages:
E:\Eighth_Semester\FYP-2\MATRIX\src\app\admin\
  ├── notifications-center/
  ├── promotions/
  └── analytics-dashboard/
```

---

## 🎯 Success Indicators

### ✅ Setup Complete When:
- [ ] All 6 API tests pass
- [ ] Notifications page loads with data
- [ ] Promotions page shows customer segments
- [ ] Analytics dashboard displays metrics
- [ ] Stock alerts appear in notifications
- [ ] Forecast modal opens and shows predictions

### ✅ Working Correctly When:
- [ ] Can mark notifications as read
- [ ] Can create new promotions
- [ ] Can calculate discounts
- [ ] Sales trends display correctly
- [ ] Top products list appears
- [ ] Forecasts generate for products

---

## 🚀 Deploy to Production

### Vercel Deployment
```powershell
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard:
# NEXT_PUBLIC_SUPABASE_URL
# NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## 📞 Need Help?

### Check These First:
1. Is server running? (npm run dev)
2. Did you run database schema?
3. Did you seed data?
4. Are Supabase credentials correct?
5. Check browser console for errors
6. Check terminal for API errors

### Common Issues:
- **"No data found"** → Run seed script
- **"API 500 error"** → Check Supabase credentials
- **"Cannot connect"** → Check server is running
- **"Module not found"** → Run npm install

---

## 🎉 You're Done!

All 3 modules are now fully functional and ready to use! 🚀
