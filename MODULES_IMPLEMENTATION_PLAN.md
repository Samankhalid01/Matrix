# Implementation Plan: Promotion, Analytics & Notifications Modules

## 📊 Current Database Assessment

### ✅ **Tables You Already Have:**
1. **Customer** - id, name, email, address, customer_tier, in_store, is_fraud, created_at
2. **Product** - (need to check structure)
3. **ShoppingSession** - id, customer_id, started_at, ended_at, is_active
4. **Cart** - id, customer_id, product_id, quantity, unit_price, total_price

### ❌ **Tables You Need to Create:**
1. **Transaction/Order** - For purchase history
2. **Discount/Promotion** - For discount management
3. **Notification** - For alert system
4. **StockAlert** - For inventory tracking
5. **SalesAnalytics** - For aggregated data
6. **DemandForecast** - For ML predictions

---

## 🎯 Module 5: Promotion and Discount

### **Current Status:** ⚠️ Missing Prerequisites

### **What You Need:**

#### 1. **Database Schema:**
```sql
-- Transactions table (capture purchase history)
CREATE TABLE public."Transaction" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES public."Customer"(id),
  total_amount decimal(10,2) NOT NULL,
  discount_applied decimal(10,2) DEFAULT 0,
  final_amount decimal(10,2) NOT NULL,
  transaction_date timestamp with time zone DEFAULT now(),
  month_year varchar(7) -- Format: "2025-11" for aggregation
);

-- Transaction Items (detailed items in each purchase)
CREATE TABLE public."TransactionItem" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id uuid REFERENCES public."Transaction"(id),
  product_id uuid REFERENCES public."Product"(id),
  quantity integer NOT NULL,
  unit_price decimal(10,2) NOT NULL,
  discount_applied decimal(10,2) DEFAULT 0,
  total_price decimal(10,2) NOT NULL
);

-- Promotions table
CREATE TABLE public."Promotion" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  discount_percentage decimal(5,2),
  discount_amount decimal(10,2),
  customer_tier varchar(50), -- BRONZE, SILVER, GOLD, PLATINUM
  start_date timestamp with time zone,
  end_date timestamp with time zone,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

-- Customer tier configuration
CREATE TABLE public."TierConfig" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tier_name varchar(50) UNIQUE NOT NULL, -- BRONZE, SILVER, GOLD, PLATINUM
  min_monthly_purchases decimal(10,2) NOT NULL,
  discount_percentage decimal(5,2) NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);
```

#### 2. **Minimum Data Required:**
- **For Testing (MVP):**
  - 5-10 customers across different tiers
  - 3-6 months of transaction history (simulate with backdated records)
  - At least 50-100 transactions total
  - 20-30 products

- **For Production:**
  - 100+ customers
  - 6-12 months of real purchase data
  - 500+ transactions
  - 50+ products

#### 3. **Implementation Approach:**

**FE-1: Customer Segmentation (NO HARDCODING)**
```javascript
// API: /api/analytics/customer-segments
// Calculates real-time based on Transaction table

// Backend Logic:
1. Query all transactions grouped by customer & month
2. Calculate total purchases per month for each customer
3. Segment customers:
   - High Spenders: >$500/month
   - Medium Spenders: $200-$500/month
   - Low Spenders: <$200/month
4. Auto-upgrade customer_tier in Customer table

// Sample SQL:
SELECT 
  customer_id,
  DATE_TRUNC('month', transaction_date) as month,
  SUM(total_amount) as monthly_total,
  COUNT(*) as transaction_count
FROM "Transaction"
GROUP BY customer_id, DATE_TRUNC('month', transaction_date)
ORDER BY monthly_total DESC;
```

**FE-2: Tier-Based Discount Calculation (DYNAMIC)**
```javascript
// API: /api/promotions/calculate-discount
// Input: { customerId, cartTotal }

// Backend Logic:
1. Fetch customer tier from Customer table
2. Fetch discount percentage from TierConfig table
3. Apply discount: finalAmount = cartTotal * (1 - discountPercentage/100)
4. Return discount details

// Tier Rules (stored in database):
- BRONZE: 5% discount
- SILVER: 10% discount  
- GOLD: 15% discount
- PLATINUM: 20% discount
```

**FE-3: Generate Discount Ads (AI-POWERED)**
```javascript
// Use existing image generation feature
// API: /api/promotions/generate-ad-image
// Input: { promotionId, tierName, discountPercentage }

// Use AI model to generate promotional images
// Text overlay: "GOLD Member: 15% OFF"
```

### **Can Implement Without Hardcoding?**
✅ **YES** - All features fetch from database
- Transaction data manually inserted initially
- Customer tiers auto-calculated based on purchases
- Discounts fetched from TierConfig table

---

## 📈 Module 7: Demand Prediction and Analytics

### **Current Status:** ⚠️ Missing Prerequisites + ML Model

### **What You Need:**

#### 1. **Database Schema:**
```sql
-- Sales Analytics (aggregated for performance)
CREATE TABLE public."SalesAnalytics" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES public."Product"(id),
  date date NOT NULL,
  units_sold integer DEFAULT 0,
  revenue decimal(10,2) DEFAULT 0,
  month_year varchar(7),
  created_at timestamp with time zone DEFAULT now()
);

-- Demand Forecast
CREATE TABLE public."DemandForecast" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES public."Product"(id),
  forecast_date date NOT NULL,
  predicted_demand integer NOT NULL,
  confidence_level decimal(5,2), -- 0-100%
  model_version varchar(50),
  created_at timestamp with time zone DEFAULT now()
);

-- Store Performance Reports
CREATE TABLE public."PerformanceReport" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_type varchar(50), -- daily, weekly, monthly, custom
  start_date date,
  end_date date,
  total_revenue decimal(10,2),
  total_transactions integer,
  top_products jsonb, -- Array of {product_id, name, units_sold}
  underperforming_products jsonb,
  generated_at timestamp with time zone DEFAULT now()
);
```

#### 2. **Minimum Data Required:**
- **For ML Model (Demand Forecasting):**
  - At least 6-12 months of historical sales data
  - Daily/weekly sales data for each product
  - Minimum 100 data points per product
  - Seasonal patterns (if applicable)

- **For Analytics Reports:**
  - 3-6 months of transaction history
  - Product inventory data
  - Customer purchase patterns

#### 3. **Implementation Approach:**

**FE-1: Demand Forecasting (REQUIRES ML MODEL)**

**Option A: Python ML Model (Recommended)**
```python
# python-services/demand-forecasting/model.py
# Use Time Series Forecasting

import pandas as pd
from prophet import Prophet  # Facebook Prophet
# OR
from statsmodels.tsa.arima.model import ARIMA

# Steps:
1. Load historical sales data from Supabase
2. Train model on past 6-12 months
3. Predict next 30-60 days demand
4. Store predictions in DemandForecast table
5. Retrain weekly/monthly

# API: POST /api/analytics/forecast-demand
# Triggers Python service to run prediction
```

**Option B: Simple Statistical Method (No ML)**
```javascript
// API: /api/analytics/simple-forecast
// Moving Average Method

// Backend Logic:
1. Calculate average sales for last 30/60/90 days
2. Apply trend factor (increasing/decreasing)
3. Predict next 7-30 days
4. Less accurate but easier to implement
```

**FE-2: Forecast Reports (GENERATED FROM DB)**
```javascript
// API: /api/reports/forecast
// Query: /api/reports/forecast?period=30days

// Backend Logic:
1. Fetch predictions from DemandForecast table
2. Group by product category
3. Generate visual report data
4. Include confidence levels
```

**FE-3: Performance Reports (REAL-TIME CALCULATION)**
```javascript
// API: /api/reports/performance
// Query: /api/reports/performance?startDate=2025-01-01&endDate=2025-11-06

// Backend Logic:
1. Query Transaction & TransactionItem tables
2. Calculate:
   - Total revenue
   - Top 10 selling products (by units & revenue)
   - Bottom 10 products (underperforming)
   - Average transaction value
   - Customer retention rate
3. Return structured JSON

// Top Sellers Query:
SELECT 
  p.id, p.product_name, p.category,
  SUM(ti.quantity) as units_sold,
  SUM(ti.total_price) as revenue
FROM "TransactionItem" ti
JOIN "Product" p ON ti.product_id = p.id
JOIN "Transaction" t ON ti.transaction_id = t.id
WHERE t.transaction_date BETWEEN $1 AND $2
GROUP BY p.id, p.product_name, p.category
ORDER BY units_sold DESC
LIMIT 10;
```

**FE-4: Custom Report Parameters (DYNAMIC)**
```javascript
// Frontend: React form with filters
// Parameters:
- Date range (start_date, end_date)
- Product categories
- Customer tiers
- Minimum sales threshold
- Report type (daily/weekly/monthly)

// API: /api/reports/custom
// POST with filter parameters
// Backend generates report based on filters
```

**FE-5: Export Reports (PDF/CSV/Excel)**
```javascript
// Libraries needed:
- PDF: jsPDF or puppeteer (server-side)
- CSV: csv-writer or Papa Parse
- Excel: xlsx or exceljs

// API: /api/reports/export
// Query: /api/reports/export?format=pdf&reportId=xxx

// Backend Logic:
1. Fetch report data
2. Format based on requested type
3. Generate file
4. Return download link or file stream
```

### **Can Implement Without Hardcoding?**
⚠️ **PARTIALLY**
- **Analytics & Reports:** ✅ YES - Fetch from Transaction tables
- **Demand Forecasting:** ❌ REQUIRES ML MODEL + Historical Data
  - **Workaround:** Use simple statistical forecasting (moving average)
  - **Production:** Need to train ML model with 6+ months data

---

## 🔔 Module 9: Notifications

### **Current Status:** ⚠️ Missing Prerequisites

### **What You Need:**

#### 1. **Database Schema:**
```sql
-- Stock Alerts
CREATE TABLE public."StockAlert" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES public."Product"(id),
  alert_type varchar(50), -- out_of_stock, low_stock, restock_needed
  current_stock integer,
  threshold_stock integer,
  status varchar(20), -- pending, acknowledged, resolved
  created_at timestamp with time zone DEFAULT now(),
  resolved_at timestamp with time zone
);

-- Notifications
CREATE TABLE public."Notification" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_type varchar(20), -- admin, customer
  recipient_id uuid, -- customer_id or admin_id
  notification_type varchar(50), -- stock_alert, discount, order_update, security_alert
  title text NOT NULL,
  message text NOT NULL,
  priority varchar(20), -- low, medium, high, critical
  is_read boolean DEFAULT false,
  metadata jsonb, -- Extra data like {product_id, discount_id}
  created_at timestamp with time zone DEFAULT now()
);

-- Add to Product table if not exists:
ALTER TABLE public."Product" 
ADD COLUMN IF NOT EXISTS current_stock integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS min_stock_threshold integer DEFAULT 10,
ADD COLUMN IF NOT EXISTS max_stock_threshold integer DEFAULT 100;
```

#### 2. **Minimum Data Required:**
- Products with stock levels
- Stock thresholds configured
- Customer contact info (email)
- Admin contact info

#### 3. **Implementation Approach:**

**FE-1: Stock Alerts (AUTOMATED TRIGGERS)**
```javascript
// Option A: Database Trigger (Recommended)
CREATE OR REPLACE FUNCTION check_stock_level()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if stock is low
  IF NEW.current_stock <= NEW.min_stock_threshold THEN
    INSERT INTO "Notification" (
      recipient_type, notification_type, title, message, priority, metadata
    ) VALUES (
      'admin',
      'stock_alert',
      'Low Stock Alert',
      'Product ' || NEW.product_name || ' is running low (Stock: ' || NEW.current_stock || ')',
      CASE 
        WHEN NEW.current_stock = 0 THEN 'critical'
        WHEN NEW.current_stock <= NEW.min_stock_threshold / 2 THEN 'high'
        ELSE 'medium'
      END,
      jsonb_build_object('product_id', NEW.id, 'current_stock', NEW.current_stock)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER stock_level_trigger
AFTER UPDATE OF current_stock ON "Product"
FOR EACH ROW
EXECUTE FUNCTION check_stock_level();

// Option B: Scheduled Job (API)
// API: /api/cron/check-stock (run every hour)
// Check all products, generate alerts for low stock
```

```javascript
// Frontend: Real-time notifications
// API: /api/notifications?recipientType=admin&isRead=false

// Display on admin dashboard
// Use polling or WebSockets for real-time updates
```

**FE-2: Security Alerts (FROM THEFT DETECTION)**
```javascript
// You already have theft detection module!
// API: /api/notifications/security

// Backend Logic:
1. When theft detected (from your existing module)
2. Create notification:
   INSERT INTO "Notification" (
     recipient_type, notification_type, title, message, priority
   ) VALUES (
     'admin', 'security_alert', 
     'Suspicious Activity Detected',
     'Camera X detected potential theft at ' || NOW(),
     'critical'
   );
3. Display on admin portal
4. Optional: Send email/SMS using service like Twilio
```

**FE-3: Customer Notifications (TRIGGERED BY EVENTS)**
```javascript
// API: /api/notifications/customer

// Discount Notifications:
// Triggered when new promotion created
INSERT INTO "Notification" (
  recipient_type, recipient_id, notification_type, title, message, priority
)
SELECT 
  'customer', id, 'discount', 
  'Special Discount for ' || customer_tier || ' Members',
  'You have a new ' || discount_percentage || '% discount available!',
  'medium'
FROM "Customer"
WHERE customer_tier = 'GOLD'; -- Target specific tier

// Order Update Notifications:
// Triggered when order status changes
INSERT INTO "Notification" (
  recipient_type, recipient_id, notification_type, title, message
)
VALUES (
  'customer', $customer_id, 'order_update',
  'Order Confirmed',
  'Your order #' || $order_id || ' has been confirmed. Total: $' || $total
);
```

### **Can Implement Without Hardcoding?**
✅ **YES** - All notifications generated from database events
- Stock alerts: Triggered by inventory changes
- Security alerts: From theft detection system
- Customer notifications: From promotions/orders

---

## 📋 IMPLEMENTATION PRIORITY & FEASIBILITY

### **Phase 1: Foundation (Do This First)**
1. ✅ **Create Missing Tables** (1-2 days)
   - Transaction, TransactionItem
   - Promotion, TierConfig
   - Notification, StockAlert
   - SalesAnalytics, PerformanceReport

2. ✅ **Populate Sample Data** (1-2 days)
   - Insert 10 customers
   - Insert 20-30 products with stock levels
   - Insert 3-6 months of backdated transactions (100+ records)
   - Insert tier configurations
   - Insert sample promotions

3. ✅ **Update Product Table** (1 hour)
   - Add stock tracking columns

### **Phase 2: Module 9 - Notifications (EASIEST)**
**Time: 2-3 days**
**Difficulty: ⭐⭐ Easy**
**Prerequisites: ✅ Ready**

Why start here:
- No ML required
- Simple database triggers
- Clear logic
- Immediate value

Implementation:
1. Create Notification & StockAlert tables
2. Build notification API endpoints
3. Create frontend notification bell/panel
4. Add database triggers for stock alerts
5. Integrate with existing theft detection
6. Add customer notification triggers

### **Phase 3: Module 5 - Promotions (MEDIUM)**
**Time: 3-4 days**
**Difficulty: ⭐⭐⭐ Medium**
**Prerequisites: ✅ Need transaction data**

Implementation:
1. Create Transaction tables
2. Build promotion management API
3. Customer segmentation algorithm
4. Tier-based discount calculator
5. Promotion ad image generator (use existing AI)
6. Frontend promotion dashboard

### **Phase 4: Module 7 - Analytics (HARD)**
**Time: 5-7 days**
**Difficulty: ⭐⭐⭐⭐ Hard**
**Prerequisites: ⚠️ Need ML model + 6 months data**

Implementation:
1. Create analytics tables
2. Build report generation APIs
3. **Simple forecasting** (moving average) OR
4. **ML forecasting** (Python service + Prophet/ARIMA)
5. Custom report parameters
6. Export functionality (PDF/CSV/Excel)
7. Dashboard with charts

---

## 🎯 RECOMMENDED APPROACH

### **Can You Do It Without Hardcoding?**
✅ **YES, BUT:**

1. **You MUST manually insert initial data:**
   - Historical transactions (3-6 months)
   - Product stock levels
   - Customer tiers
   - Promotion rules

2. **After initial data, everything is dynamic:**
   - New transactions recorded in real-time
   - Customer tiers auto-calculated
   - Discounts applied based on database rules
   - Notifications triggered by events
   - Reports generated from actual data

### **Minimal Data Requirements:**

**Absolutely Minimum (MVP Demo):**
- 5 customers
- 10 products
- 30 transactions (backdated over 3 months)
- 3 promotions
- Stock levels for products

**Recommended (Realistic Demo):**
- 10-15 customers
- 20-30 products
- 100+ transactions (backdated over 6 months)
- 5-10 promotions
- Properly configured stock thresholds

**Production Ready:**
- 100+ customers
- 50+ products
- 500+ transactions (6-12 months)
- Active promotion campaigns
- Real-time stock tracking

---

## 🚀 QUICK START GUIDE

### **Step 1: Create Database Schema (Do Today)**
```sql
-- Run the SQL scripts I provided above
-- Creates all necessary tables
```

### **Step 2: Generate Sample Data (Script It)**
```javascript
// Create data seeding script: /scripts/seed-data.js
// Generates realistic historical data
// Backdates transactions over 6 months
// Assigns random customer tiers
```

### **Step 3: Choose Implementation Path**

**Path A: Quick MVP (2 weeks)**
- Module 9: Notifications ✅
- Module 5: Promotions (basic) ✅
- Module 7: Analytics (reports only, no ML) ✅
- Use simple calculations, no ML forecasting

**Path B: Full Implementation (4 weeks)**
- All modules fully implemented
- ML-based demand forecasting
- Advanced analytics
- Complete automation

---

## 📊 FINAL VERDICT

**Question: Can we implement without hardcoding?**
✅ **YES** - With proper database setup and initial data seeding

**Question: How much data needed?**
- **Minimum:** 30-50 transactions, 10 products, 5 customers
- **Recommended:** 100+ transactions, 30 products, 15 customers
- **Production:** 500+ transactions, 50+ products, 100+ customers

**Question: Do we have prerequisites?**
- ✅ Database (Supabase) - Ready
- ✅ Frontend (Next.js) - Ready
- ✅ AI Image Generation - Ready
- ❌ Transaction history - Need to create
- ❌ ML model - Need to build OR use simple forecasting
- ❌ Additional tables - Need to create

**Question: Which modules can we do fully?**
- ✅ Module 9 (Notifications) - **100% Dynamic**
- ✅ Module 5 (Promotions) - **100% Dynamic** (after data seeding)
- ⚠️ Module 7 (Analytics) - **80% Dynamic** (100% if you add ML model)

**My Recommendation:**
Start with **Phase 1 + Phase 2** (Notifications). It's the easiest, provides immediate value, and requires minimal data. Then move to Promotions, then Analytics.

Would you like me to create the database schema SQL file and data seeding script to get started?
