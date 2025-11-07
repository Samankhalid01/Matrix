# 🔧 CUSTOMER TABLE FIX REQUIRED

## Issue Discovered
The `Customer` table is missing a default UUID generator for the `id` column, which prevents new customers from being added automatically.

## ⚠️ REQUIRED ACTION

### Step 1: Fix the Customer Table Schema

1. **Open Supabase Dashboard**: https://supabase.com/dashboard
2. **Navigate to**: Your project → SQL Editor
3. **Run this SQL command**:

```sql
ALTER TABLE "Customer" ALTER COLUMN id SET DEFAULT gen_random_uuid();
```

4. **Click "Run"** to execute

### Step 2: Verify the Fix

After running the SQL, verify with:

```sql
SELECT column_name, column_default, is_nullable, data_type
FROM information_schema.columns
WHERE table_name = 'Customer' AND column_name = 'id';
```

You should see:
- `column_default`: `gen_random_uuid()`
- `data_type`: `uuid`

### Step 3: Populate Customer Data

After the schema fix, run:

```bash
node scripts/add-customers.js
```

---

## 📊 What This Will Add

### Customer Table (15 new customers)
- **PLATINUM tier**: 1 customer
  - Ahmed Khan (Lahore)
  
- **GOLD tier**: 3 customers
  - Sarah Ali (Karachi)
  - Hassan Malik (Islamabad)
  - Kamran Iqbal (Sargodha)
  
- **SILVER tier**: 4 customers
  - Fatima Noor (Faisalabad)
  - Bilal Ahmed (Rawalpindi)
  - Omar Farooq (Hyderabad)
  - Fahad Hussain (Larkana)
  
- **BRONZE tier**: 7 customers
  - Aisha Raza (Multan)
  - Usman Tariq (Peshawar)
  - Zainab Shah (Quetta)
  - Ali Raza (Sialkot)
  - Maryam Hussain (Gujranwala)
  - Hina Bashir (Bahawalpur)
  - Nadia Malik (Sukkur)

### customers_instore Table
- **7 random customers** will be marked as currently in-store
- This simulates real-time store presence tracking
- Used for:
  - Real-time customer analytics
  - In-store notifications
  - Store capacity monitoring
  - Heat mapping

---

## 📁 Files Created

### 1. `scripts/add-customers.js`
Main population script that:
- Adds 15 diverse customers with different tiers
- Includes full Pakistani addresses
- Sets up 2FA_enabled flag
- Randomly selects 7 customers to be in-store
- Clears and repopulates customers_instore table
- Shows tier distribution statistics

### 2. `scripts/fix-customer-id.sql`
SQL file with the schema fix (for reference)

### 3. `scripts/check-customer-structure.js`
Utility to inspect Customer table structure

---

## 🎯 Expected Outcome

After running `node scripts/add-customers.js`:

```
👥 Adding new customers...
   ✅ Added 15 new customers

📊 Total customers in database: 16

Customer Tier Distribution:
   PLATINUM: 2 customers
   GOLD: 3 customers
   SILVER: 4 customers
   BRONZE: 7 customers

🏪 Adding customers currently in-store...
   ✅ Added 7 customers currently in-store

   Customers in-store:
   1. Ahmed Khan (PLATINUM)
   2. Sarah Ali (GOLD)
   3. Hassan Malik (GOLD)
   4. Fatima Noor (SILVER)
   5. Bilal Ahmed (SILVER)
   6. Aisha Raza (BRONZE)
   7. Usman Tariq (BRONZE)

📊 Final Database Verification:
   ✅ Customer table: 16 rows
   ✅ customers_instore table: 7 rows
```

---

## 🔗 Impact on Features

### Promotions Page (`/admin/promotions`)
- **Customer Segments** will now show accurate tier distribution:
  - PLATINUM: 12.5%
  - GOLD: 18.75%
  - SILVER: 25%
  - BRONZE: 43.75%
- Target tier dropdowns will have meaningful data
- Promotion usage tracking will work across different customer segments

### Notifications Page (`/admin/notifications-center`)
- Can send targeted notifications to specific tiers
- Real-time in-store customer count
- Personalized discount alerts based on tier

### Analytics Dashboard (`/admin/analytics-dashboard`)
- Customer segmentation charts
- Tier-based revenue analysis
- In-store vs online customer behavior
- Customer lifetime value by tier

---

## ✅ Quick Start Checklist

- [ ] Open Supabase SQL Editor
- [ ] Run: `ALTER TABLE "Customer" ALTER COLUMN id SET DEFAULT gen_random_uuid();`
- [ ] Verify the fix worked
- [ ] Run: `node scripts/add-customers.js`
- [ ] Check output shows 16 total customers
- [ ] Check output shows 7 in-store customers
- [ ] Visit `/admin/promotions` and verify Customer Segments widget
- [ ] Visit `/admin/notifications-center` and check customer count
- [ ] Visit `/admin/analytics-dashboard` for tier analytics

---

## 🐛 Troubleshooting

### If you see "null value in column id"
→ The schema fix hasn't been applied yet. Run the SQL command in Step 1.

### If you see "duplicate key value violates unique constraint"
→ Some customers already exist. The script will skip duplicates and continue.

### If in-store customers aren't showing
→ Check the `customers_instore` table directly:
```sql
SELECT * FROM customers_instore;
```

### If tier distribution looks wrong
→ Run this query to verify:
```sql
SELECT customer_tier, COUNT(*) as count 
FROM "Customer" 
GROUP BY customer_tier 
ORDER BY count DESC;
```

---

## 📝 Notes

1. **Password Field**: Set to `null` for all test customers (in production, use proper password hashing)
2. **2FA Enabled**: Set to `false` for ease of testing
3. **Email Uniqueness**: Each customer has a unique email (required by schema)
4. **In-Store Selection**: Randomly picks 7 customers each time script runs
5. **Addresses**: Full Pakistani addresses for realistic data

---

## 🚀 Next Steps After Population

1. **Test Promotions**: Create tier-specific promotions and verify targeting works
2. **Send Notifications**: Test sending notifications to different customer segments
3. **View Analytics**: Check customer distribution charts on analytics dashboard
4. **Add Cart Items**: Populate Cart table with shopping data for these customers
5. **Create Transactions**: Add purchase history for revenue analytics

---

**Last Updated**: November 6, 2025
**Status**: ⚠️ Awaiting schema fix in Supabase SQL Editor
**Next Action**: Run the ALTER TABLE command, then execute add-customers.js
