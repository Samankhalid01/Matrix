-- ============================================
-- MATRIX: Additional Tables for Promotions, Analytics & Notifications
-- ============================================

-- ============================================
-- 0. CUSTOMER IN-STORE TRACKING & SHOPPING CART
-- ============================================

-- Track customers currently in the store (scanned QR/checked in)
CREATE TABLE IF NOT EXISTS public."CustomerInStore" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES public."Customer"(id) ON DELETE CASCADE,
  check_in_time timestamp with time zone DEFAULT now(),
  check_out_time timestamp with time zone,
  is_active boolean DEFAULT true, -- true if still in store
  duration_minutes integer, -- Auto-calculated on checkout
  created_at timestamp with time zone DEFAULT now()
);

-- Shopping Cart (items customers add while browsing)
CREATE TABLE IF NOT EXISTS public."ShoppingCart" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES public."Customer"(id) ON DELETE CASCADE,
  product_id bigint REFERENCES public."Product"(id) ON DELETE CASCADE,
  quantity integer NOT NULL DEFAULT 1,
  added_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(customer_id, product_id) -- One entry per product per customer
);

-- Cart Items History (for analytics - what was in cart but not purchased)
CREATE TABLE IF NOT EXISTS public."CartHistory" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES public."Customer"(id) ON DELETE SET NULL,
  product_id bigint REFERENCES public."Product"(id) ON DELETE SET NULL,
  quantity integer NOT NULL,
  action varchar(20), -- added, removed, purchased, abandoned
  action_date timestamp with time zone DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_customer_instore_active ON public."CustomerInStore"(customer_id, is_active);
CREATE INDEX IF NOT EXISTS idx_shopping_cart_customer ON public."ShoppingCart"(customer_id);
CREATE INDEX IF NOT EXISTS idx_cart_history_customer ON public."CartHistory"(customer_id, action_date);

-- ============================================
-- 1. TRANSACTIONS & ORDERS
-- ============================================

-- Main Transaction/Order table
CREATE TABLE IF NOT EXISTS public."Transaction" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES public."Customer"(id) ON DELETE SET NULL,
  total_amount decimal(10,2) NOT NULL,
  discount_applied decimal(10,2) DEFAULT 0,
  final_amount decimal(10,2) NOT NULL,
  payment_method varchar(50), -- cash, card, digital_wallet
  payment_status varchar(20) DEFAULT 'completed', -- pending, completed, failed, refunded
  transaction_date timestamp with time zone DEFAULT now(),
  month_year varchar(7), -- Will be set via trigger instead of generated column
  created_at timestamp with time zone DEFAULT now()
);

-- Transaction Items (detailed items in each order)
CREATE TABLE IF NOT EXISTS public."TransactionItem" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id uuid REFERENCES public."Transaction"(id) ON DELETE CASCADE,
  product_id bigint REFERENCES public."Product"(id) ON DELETE SET NULL,
  product_name text, -- Store name in case product deleted
  quantity integer NOT NULL,
  unit_price decimal(10,2) NOT NULL,
  discount_applied decimal(10,2) DEFAULT 0,
  total_price decimal(10,2) NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_transaction_customer ON public."Transaction"(customer_id);
CREATE INDEX IF NOT EXISTS idx_transaction_date ON public."Transaction"(transaction_date);
CREATE INDEX IF NOT EXISTS idx_transaction_month ON public."Transaction"(month_year);
CREATE INDEX IF NOT EXISTS idx_transaction_item_product ON public."TransactionItem"(product_id);

-- ============================================
-- 2. PROMOTIONS & DISCOUNTS
-- ============================================

-- Tier Configuration (discount rules for each tier)
CREATE TABLE IF NOT EXISTS public."TierConfig" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tier_name varchar(50) UNIQUE NOT NULL, -- BRONZE, SILVER, GOLD, PLATINUM
  min_monthly_spending decimal(10,2) NOT NULL, -- Minimum to achieve this tier
  discount_percentage decimal(5,2) NOT NULL, -- Base discount for tier
  benefits text, -- Description of tier benefits
  created_at timestamp with time zone DEFAULT now()
);

-- Insert default tier configurations
INSERT INTO public."TierConfig" (tier_name, min_monthly_spending, discount_percentage, benefits)
VALUES 
  ('BRONZE', 0, 5, 'Basic tier: 5% discount on all purchases'),
  ('SILVER', 200, 10, 'Silver tier: 10% discount + early access to sales'),
  ('GOLD', 500, 15, 'Gold tier: 15% discount + free delivery + priority support'),
  ('PLATINUM', 1000, 20, 'Platinum tier: 20% discount + exclusive deals + VIP support')
ON CONFLICT (tier_name) DO NOTHING;

-- Promotions table (special campaigns)
CREATE TABLE IF NOT EXISTS public."Promotion" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code varchar(50) UNIQUE, -- Promo code (optional)
  name text NOT NULL,
  description text,
  discount_type varchar(20), -- percentage, fixed_amount
  discount_value decimal(10,2) NOT NULL, -- 15 for 15% or $15
  target_tier varchar(50), -- Specific tier or NULL for all
  min_purchase_amount decimal(10,2), -- Minimum cart value required
  max_discount_amount decimal(10,2), -- Maximum discount cap
  start_date timestamp with time zone DEFAULT now(),
  end_date timestamp with time zone,
  is_active boolean DEFAULT true,
  usage_limit integer, -- Max times this promo can be used
  usage_count integer DEFAULT 0, -- Times already used
  created_at timestamp with time zone DEFAULT now()
);

-- Promotion Usage tracking
CREATE TABLE IF NOT EXISTS public."PromotionUsage" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  promotion_id uuid REFERENCES public."Promotion"(id) ON DELETE CASCADE,
  customer_id uuid REFERENCES public."Customer"(id) ON DELETE SET NULL,
  transaction_id uuid REFERENCES public."Transaction"(id) ON DELETE SET NULL,
  discount_amount decimal(10,2) NOT NULL,
  used_at timestamp with time zone DEFAULT now()
);

-- ============================================
-- 3. ANALYTICS & REPORTS
-- ============================================

-- Sales Analytics (aggregated daily/weekly/monthly data)
CREATE TABLE IF NOT EXISTS public."SalesAnalytics" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id bigint REFERENCES public."Product"(id) ON DELETE CASCADE,
  date date NOT NULL,
  units_sold integer DEFAULT 0,
  revenue decimal(10,2) DEFAULT 0,
  transactions_count integer DEFAULT 0,
  avg_price decimal(10,2),
  week_number integer,
  month_year varchar(7),
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(product_id, date)
);

-- Demand Forecast (ML predictions or statistical forecasts)
CREATE TABLE IF NOT EXISTS public."DemandForecast" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id bigint REFERENCES public."Product"(id) ON DELETE CASCADE,
  forecast_date date NOT NULL,
  predicted_demand integer NOT NULL,
  confidence_level decimal(5,2), -- 0-100%
  forecast_method varchar(50), -- moving_average, arima, prophet, etc.
  model_version varchar(50),
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(product_id, forecast_date)
);

-- Performance Reports (pre-generated reports)
CREATE TABLE IF NOT EXISTS public."PerformanceReport" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_type varchar(50) NOT NULL, -- daily, weekly, monthly, quarterly, custom
  start_date date NOT NULL,
  end_date date NOT NULL,
  total_revenue decimal(10,2),
  total_transactions integer,
  avg_transaction_value decimal(10,2),
  unique_customers integer,
  top_products jsonb, -- [{product_id, name, units_sold, revenue}]
  underperforming_products jsonb, -- [{product_id, name, units_sold}]
  customer_segments jsonb, -- {high_spenders: 10, medium: 20, low: 15}
  report_data jsonb, -- Full report details
  generated_at timestamp with time zone DEFAULT now()
);

-- ============================================
-- 4. NOTIFICATIONS
-- ============================================

-- Stock Alerts
CREATE TABLE IF NOT EXISTS public."StockAlert" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id bigint REFERENCES public."Product"(id) ON DELETE CASCADE,
  alert_type varchar(50) NOT NULL, -- out_of_stock, low_stock, restock_needed
  current_stock integer NOT NULL,
  threshold_stock integer NOT NULL,
  status varchar(20) DEFAULT 'pending', -- pending, acknowledged, resolved
  acknowledged_by uuid, -- admin who acknowledged
  acknowledged_at timestamp with time zone,
  resolved_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now()
);

-- Unified Notifications table
CREATE TABLE IF NOT EXISTS public."Notification" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_type varchar(20) NOT NULL, -- admin, customer
  recipient_id uuid, -- customer_id or admin_id (can be NULL for broadcast)
  notification_type varchar(50) NOT NULL, -- stock_alert, discount, order_update, security_alert, promotion
  title text NOT NULL,
  message text NOT NULL,
  priority varchar(20) DEFAULT 'medium', -- low, medium, high, critical
  is_read boolean DEFAULT false,
  action_url text, -- Link to relevant page
  metadata jsonb, -- Extra data: {product_id, discount_id, order_id, etc.}
  created_at timestamp with time zone DEFAULT now(),
  read_at timestamp with time zone
);

CREATE INDEX IF NOT EXISTS idx_notification_recipient ON public."Notification"(recipient_type, recipient_id);
CREATE INDEX IF NOT EXISTS idx_notification_unread ON public."Notification"(is_read) WHERE is_read = false;

-- ============================================
-- 5. UPDATE PRODUCT TABLE (Add Stock Tracking)
-- ============================================

-- Add stock management columns to Product table if they don't exist
ALTER TABLE public."Product" 
ADD COLUMN IF NOT EXISTS current_stock integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS min_stock_threshold integer DEFAULT 10,
ADD COLUMN IF NOT EXISTS max_stock_threshold integer DEFAULT 100,
ADD COLUMN IF NOT EXISTS reorder_quantity integer DEFAULT 50,
ADD COLUMN IF NOT EXISTS supplier varchar(255),
ADD COLUMN IF NOT EXISTS cost_price decimal(10,2),
ADD COLUMN IF NOT EXISTS category varchar(100);

-- ============================================
-- 6. DATABASE TRIGGERS (Automatic Actions)
-- ============================================

-- Trigger: Auto-populate month_year field
CREATE OR REPLACE FUNCTION set_month_year()
RETURNS TRIGGER AS $$
BEGIN
  NEW.month_year := TO_CHAR(NEW.transaction_date, 'YYYY-MM');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to Transaction table
DROP TRIGGER IF EXISTS set_month_year_trigger ON public."Transaction";
CREATE TRIGGER set_month_year_trigger
BEFORE INSERT OR UPDATE OF transaction_date ON public."Transaction"
FOR EACH ROW
EXECUTE FUNCTION set_month_year();

-- Trigger: Check stock level after update
CREATE OR REPLACE FUNCTION check_stock_level()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert stock alert if stock is low or out
  IF NEW.current_stock <= NEW.min_stock_threshold THEN
    INSERT INTO public."StockAlert" (
      product_id, alert_type, current_stock, threshold_stock, status
    ) VALUES (
      NEW.id,
      CASE 
        WHEN NEW.current_stock = 0 THEN 'out_of_stock'
        ELSE 'low_stock'
      END,
      NEW.current_stock,
      NEW.min_stock_threshold,
      'pending'
    )
    ON CONFLICT DO NOTHING; -- Avoid duplicate alerts
    
    -- Create notification for admin
    INSERT INTO public."Notification" (
      recipient_type, notification_type, title, message, priority, metadata
    ) VALUES (
      'admin',
      'stock_alert',
      CASE 
        WHEN NEW.current_stock = 0 THEN 'OUT OF STOCK: ' || NEW.product_name
        ELSE 'Low Stock Alert: ' || NEW.product_name
      END,
      'Product "' || NEW.product_name || '" stock is ' || 
      CASE 
        WHEN NEW.current_stock = 0 THEN 'OUT OF STOCK'
        ELSE 'running low (' || NEW.current_stock || ' units remaining)'
      END,
      CASE 
        WHEN NEW.current_stock = 0 THEN 'critical'
        WHEN NEW.current_stock <= NEW.min_stock_threshold / 2 THEN 'high'
        ELSE 'medium'
      END,
      jsonb_build_object(
        'product_id', NEW.id, 
        'current_stock', NEW.current_stock,
        'threshold', NEW.min_stock_threshold,
        'action_url', '/admin/products'
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to Product table
DROP TRIGGER IF EXISTS stock_level_trigger ON public."Product";
CREATE TRIGGER stock_level_trigger
AFTER UPDATE OF current_stock ON public."Product"
FOR EACH ROW
WHEN (OLD.current_stock IS DISTINCT FROM NEW.current_stock)
EXECUTE FUNCTION check_stock_level();

-- Trigger: Auto-update customer tier based on spending
CREATE OR REPLACE FUNCTION update_customer_tier()
RETURNS TRIGGER AS $$
DECLARE
  monthly_spending decimal(10,2);
  new_tier varchar(50);
BEGIN
  -- Calculate customer's spending in current month
  SELECT COALESCE(SUM(total_amount), 0)
  INTO monthly_spending
  FROM public."Transaction"
  WHERE customer_id = NEW.customer_id
    AND month_year = TO_CHAR(CURRENT_DATE, 'YYYY-MM');
  
  -- Determine appropriate tier
  SELECT tier_name INTO new_tier
  FROM public."TierConfig"
  WHERE monthly_spending >= min_monthly_spending
  ORDER BY min_monthly_spending DESC
  LIMIT 1;
  
  -- Update customer tier if changed
  IF new_tier IS NOT NULL THEN
    UPDATE public."Customer"
    SET customer_tier = new_tier
    WHERE id = NEW.customer_id
      AND (customer_tier IS NULL OR customer_tier != new_tier);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to Transaction table
DROP TRIGGER IF EXISTS customer_tier_trigger ON public."Transaction";
CREATE TRIGGER customer_tier_trigger
AFTER INSERT ON public."Transaction"
FOR EACH ROW
EXECUTE FUNCTION update_customer_tier();

-- ============================================
-- 7. USEFUL VIEWS (Pre-calculated queries)
-- ============================================

-- View: Customer Purchase Summary
CREATE OR REPLACE VIEW customer_purchase_summary AS
SELECT 
  c.id as customer_id,
  c.name as customer_name,
  c.email,
  c.customer_tier,
  COUNT(t.id) as total_transactions,
  COALESCE(SUM(t.total_amount), 0) as lifetime_spending,
  COALESCE(AVG(t.total_amount), 0) as avg_transaction_value,
  MAX(t.transaction_date) as last_purchase_date,
  COUNT(CASE WHEN t.month_year = TO_CHAR(CURRENT_DATE, 'YYYY-MM') THEN 1 END) as current_month_transactions,
  COALESCE(SUM(CASE WHEN t.month_year = TO_CHAR(CURRENT_DATE, 'YYYY-MM') THEN t.total_amount ELSE 0 END), 0) as current_month_spending
FROM public."Customer" c
LEFT JOIN public."Transaction" t ON c.id = t.customer_id
GROUP BY c.id, c.name, c.email, c.customer_tier;

-- View: Product Performance
CREATE OR REPLACE VIEW product_performance AS
SELECT 
  p.id as product_id,
  p.product_name,
  p.category,
  p.price,
  p.current_stock,
  COUNT(ti.id) as times_sold,
  COALESCE(SUM(ti.quantity), 0) as total_units_sold,
  COALESCE(SUM(ti.total_price), 0) as total_revenue,
  COALESCE(AVG(ti.unit_price), 0) as avg_selling_price,
  MAX(t.transaction_date) as last_sold_date
FROM public."Product" p
LEFT JOIN public."TransactionItem" ti ON p.id = ti.product_id
LEFT JOIN public."Transaction" t ON ti.transaction_id = t.id
GROUP BY p.id, p.product_name, p.category, p.price, p.current_stock;

-- ============================================
-- 8. GRANT PERMISSIONS (if needed)
-- ============================================

-- Grant access to anon and authenticated roles
GRANT ALL ON public."Transaction" TO anon, authenticated;
GRANT ALL ON public."TransactionItem" TO anon, authenticated;
GRANT ALL ON public."TierConfig" TO anon, authenticated;
GRANT ALL ON public."Promotion" TO anon, authenticated;
GRANT ALL ON public."PromotionUsage" TO anon, authenticated;
GRANT ALL ON public."SalesAnalytics" TO anon, authenticated;
GRANT ALL ON public."DemandForecast" TO anon, authenticated;
GRANT ALL ON public."PerformanceReport" TO anon, authenticated;
GRANT ALL ON public."StockAlert" TO anon, authenticated;
GRANT ALL ON public."Notification" TO anon, authenticated;

-- ============================================
-- DONE! Run this script in Supabase SQL Editor
-- ============================================

-- To verify tables created:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;
