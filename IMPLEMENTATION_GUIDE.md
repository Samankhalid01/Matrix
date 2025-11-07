# 🚀 Quick Start Guide: Implementation Steps

## Step 1: Setup Database (10 minutes)

### 1.1 Run Database Schema
```bash
# Go to Supabase Dashboard → SQL Editor
# Copy and paste DATABASE_SCHEMA_COMPLETE.sql
# Click "Run"
```

**What this does:**
- ✅ Creates all 11 new tables
- ✅ Sets up database triggers (auto stock alerts, auto tier upgrades)
- ✅ Creates useful views for reporting
- ✅ Inserts default tier configurations

---

## Step 2: Seed Sample Data (5 minutes)

### 2.1 Run Seeding Script
```bash
# In your terminal
cd E:\Eighth_Semester\FYP-2\MATRIX
node scripts/seed-database.js
```

**What this does:**
- ✅ Creates 25 products with stock levels
- ✅ Creates 10 customers with different tiers
- ✅ Generates 6 months of purchase history (150-300 transactions)
- ✅ Creates 4 active promotions

**Expected Output:**
```
🚀 Starting database seeding...
🌱 Seeding products...
✅ Created 25 products
🌱 Seeding customers...
✅ Created 10 customers
🌱 Seeding transactions (6 months of history)...
✅ Created 200+ transactions with 500+ items
🎉 Database seeding completed successfully!
```

---

## Step 3: Verify Data (2 minutes)

### 3.1 Check in Supabase
Go to Supabase → Table Editor and verify:
- ✅ **Product** table: 25+ products
- ✅ **Customer** table: 10+ customers
- ✅ **Transaction** table: 100+ transactions
- ✅ **TransactionItem** table: 300+ items
- ✅ **Promotion** table: 4 promotions
- ✅ **TierConfig** table: 4 tiers (BRONZE, SILVER, GOLD, PLATINUM)

### 3.2 Test Database Triggers
```sql
-- Test stock alert trigger
UPDATE public."Product" 
SET current_stock = 3 
WHERE product_name = 'Milk 1L';

-- Check if notification was created
SELECT * FROM public."Notification" ORDER BY created_at DESC LIMIT 5;
```

You should see a new notification about low stock!

---

## Step 4: Build APIs (By Module)

### Phase 1: Notifications Module (EASIEST - 2-3 days)

#### 4.1 Create Notification API
```bash
# Create file: src/app/api/notifications/route.js
```

<details>
<summary>📄 Click to see code structure</summary>

```javascript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// GET - Fetch notifications
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const recipientType = searchParams.get('recipientType'); // admin or customer
  const isRead = searchParams.get('isRead');
  
  let query = supabase
    .from('Notification')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (recipientType) {
    query = query.eq('recipient_type', recipientType);
  }
  
  if (isRead !== null) {
    query = query.eq('is_read', isRead === 'true');
  }
  
  const { data, error } = await query;
  
  if (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
  
  // Count unread
  const { count } = await supabase
    .from('Notification')
    .select('*', { count: 'exact', head: true })
    .eq('is_read', false);
  
  return Response.json({
    success: true,
    notifications: data,
    unread_count: count
  });
}

// POST - Create notification
export async function POST(request) {
  const body = await request.json();
  
  const { data, error } = await supabase
    .from('Notification')
    .insert([body])
    .select()
    .single();
  
  if (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
  
  return Response.json({ success: true, notification: data });
}

// PUT - Mark as read
export async function PUT(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  
  const { data, error } = await supabase
    .from('Notification')
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
  
  return Response.json({ success: true, notification: data });
}
```

</details>

#### 4.2 Create Frontend Notification Bell
```bash
# Create: src/components/NotificationBell.jsx
```

#### 4.3 Test
- View notifications: `http://localhost:3000/api/notifications?recipientType=admin`
- Mark as read: `PUT http://localhost:3000/api/notifications?id=xxx`

---

### Phase 2: Promotions Module (MEDIUM - 3-4 days)

#### 4.4 Create Customer Segmentation API
```bash
# Create: src/app/api/analytics/customer-segments/route.js
```

<details>
<summary>📄 Click to see code structure</summary>

```javascript
export async function GET(request) {
  const { data, error } = await supabase
    .from('customer_purchase_summary') // Use the VIEW we created!
    .select('*');
  
  // Segment customers
  const segments = {
    high_spenders: data.filter(c => c.current_month_spending >= 500),
    medium_spenders: data.filter(c => c.current_month_spending >= 200 && c.current_month_spending < 500),
    low_spenders: data.filter(c => c.current_month_spending < 200)
  };
  
  return Response.json({
    success: true,
    segments,
    summary: {
      high_spenders_count: segments.high_spenders.length,
      medium_spenders_count: segments.medium_spenders.length,
      low_spenders_count: segments.low_spenders.length
    }
  });
}
```

</details>

#### 4.5 Create Discount Calculator API
```bash
# Create: src/app/api/promotions/calculate-discount/route.js
```

#### 4.6 Create Promotions Management Page
```bash
# Create: src/app/admin/promotions/page.jsx
```

---

### Phase 3: Analytics Module (HARD - 5-7 days)

#### 4.7 Create Performance Report API
```bash
# Create: src/app/api/reports/performance/route.js
```

<details>
<summary>📄 Click to see code structure</summary>

```javascript
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');
  
  // Get summary
  const { data: summary } = await supabase
    .rpc('get_sales_summary', { start_date: startDate, end_date: endDate });
  
  // Get top products
  const { data: topProducts } = await supabase
    .from('product_performance') // Use VIEW!
    .select('*')
    .order('total_units_sold', { ascending: false })
    .limit(10);
  
  // Get underperforming
  const { data: underperforming } = await supabase
    .from('product_performance')
    .select('*')
    .order('total_units_sold', { ascending: true })
    .limit(10);
  
  return Response.json({
    success: true,
    report: {
      summary,
      top_products: topProducts,
      underperforming_products: underperforming
    }
  });
}
```

</details>

#### 4.8 Create Simple Demand Forecast
```bash
# Create: src/app/api/analytics/forecast-demand/route.js
# Use moving average method (no ML needed)
```

#### 4.9 Create Export Functionality
```bash
# Install: npm install jspdf xlsx
# Create: src/app/api/reports/export/route.js
```

---

## Step 5: Create Frontend Pages

### 5.1 Notifications Page
```bash
# Create: src/app/admin/notifications-center/page.jsx
```
Features:
- List all notifications
- Filter by type/priority
- Mark as read
- Real-time updates

### 5.2 Promotions Dashboard
```bash
# Create: src/app/admin/promotions/page.jsx
```
Features:
- List active promotions
- Create new promotion
- View usage statistics
- Generate ad images

### 5.3 Analytics Dashboard
```bash
# Create: src/app/admin/analytics-dashboard/page.jsx
```
Features:
- Performance charts (use recharts or chart.js)
- Top products table
- Revenue trends
- Customer segmentation view
- Export buttons

---

## Step 6: Add to Sidebar

Update `src/components/admin/DashboardLayout.jsx`:

```javascript
const menuItems = [
  { title: 'Dashboard', icon: '📊', path: '/dashboard' },
  { title: 'QR Shopping', icon: '📱', path: '/admin/scan-shopping' },
  { title: 'Debug QR', icon: '🔍', path: '/admin/debug-qr' },
  { title: 'Products', icon: '📦', path: '/admin/products' },
  { title: 'Customer Management', icon: '👥', path: '/admin/customers' },
  
  // NEW PAGES
  { title: 'Promotions', icon: '🎁', path: '/admin/promotions' },
  { title: 'Analytics', icon: '📈', path: '/admin/analytics-dashboard' },
  { title: 'Notifications', icon: '🔔', path: '/admin/notifications-center' },
  
  { title: 'Generate Ad Images', icon: '🎨', path: '/admin/image-generation' },
];
```

---

## ✅ Testing Checklist

### Notifications Module
- [ ] View all notifications
- [ ] Mark notification as read
- [ ] Stock alerts trigger automatically (update product stock to <10)
- [ ] Broadcast notification to customers
- [ ] Filter notifications by type/priority

### Promotions Module
- [ ] View customer segments (high/medium/low spenders)
- [ ] Calculate discount for GOLD tier customer
- [ ] Apply promo code discount
- [ ] Create new promotion
- [ ] View active promotions

### Analytics Module
- [ ] Generate performance report for date range
- [ ] View top 10 products
- [ ] View underperforming products
- [ ] Forecast demand (simple moving average)
- [ ] Export report as PDF
- [ ] Export report as CSV

---

## 📊 Expected Results After Implementation

### Database
- ✅ 11 new tables populated
- ✅ 100+ transactions with 6 months history
- ✅ Auto-triggers working (stock alerts, tier upgrades)

### APIs (20 routes)
- ✅ All returning real data from Supabase
- ✅ No hardcoded values
- ✅ Dynamic calculations

### Frontend (3 new pages)
- ✅ Notifications Center
- ✅ Promotions Dashboard
- ✅ Analytics Dashboard

---

## 🐛 Troubleshooting

### Issue: Seeding script fails
**Solution:**
```bash
# Check .env.local has correct Supabase credentials
NEXT_PUBLIC_SUPABASE_URL=your_url
SUPABASE_ANON_KEY=your_key
```

### Issue: No notifications showing
**Solution:**
```sql
-- Manually trigger stock alert
UPDATE public."Product" SET current_stock = 2 WHERE id = 'any_product_id';

-- Check notifications table
SELECT * FROM public."Notification" ORDER BY created_at DESC;
```

### Issue: Customer tier not updating
**Solution:**
```sql
-- Check trigger is active
SELECT * FROM pg_trigger WHERE tgname = 'customer_tier_trigger';

-- Manually run tier update
UPDATE public."Customer" 
SET customer_tier = 'GOLD' 
WHERE id = 'customer_id';
```

---

## 📈 Performance Tips

1. **Use Database Views:** Already created `customer_purchase_summary` and `product_performance` views for fast queries

2. **Index Usage:** All critical indexes already created in schema

3. **Caching:** For reports, cache results for 5-10 minutes:
```javascript
// In API route
const cacheKey = `report_${startDate}_${endDate}`;
// Use Redis or simple in-memory cache
```

4. **Pagination:** For large datasets:
```javascript
const limit = 20;
const offset = (page - 1) * limit;
query = query.range(offset, offset + limit - 1);
```

---

## 🎯 Next Steps After Completion

1. **Add real-time updates** using Supabase Realtime:
```javascript
supabase
  .channel('notifications')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'Notification'
  }, (payload) => {
    // Show toast notification
  })
  .subscribe();
```

2. **Implement ML forecasting** (optional):
```bash
# Create Python service
cd python-services
mkdir demand-forecasting
# Use Prophet or ARIMA for better predictions
```

3. **Add Email/SMS notifications** using Twilio or SendGrid

4. **Create mobile customer app** for viewing cart and notifications

---

## 📞 Need Help?

Reference these files:
- `DATABASE_SCHEMA_COMPLETE.sql` - Complete schema
- `scripts/seed-database.js` - Data seeding
- `API_ROUTES_STRUCTURE.md` - All API endpoints
- `MODULES_IMPLEMENTATION_PLAN.md` - Detailed requirements

**You now have everything to implement all 3 modules with 100% dynamic data from Supabase! 🚀**
