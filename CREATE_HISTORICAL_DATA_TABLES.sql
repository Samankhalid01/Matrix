-- =====================================================
-- CREATE HISTORICAL DATA TABLES FOR DEMAND FORECASTING
-- =====================================================

-- 1. Create ProductSalesHistory table for daily aggregated sales
CREATE TABLE IF NOT EXISTS "ProductSalesHistory" (
  "id" SERIAL PRIMARY KEY,
  "product_id" INTEGER NOT NULL REFERENCES "Product"("id") ON DELETE CASCADE,
  "date" DATE NOT NULL,
  "quantity_sold" INTEGER DEFAULT 0,
  "revenue" DECIMAL(10, 2) DEFAULT 0,
  "transactions_count" INTEGER DEFAULT 0,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  CONSTRAINT "unique_product_date" UNIQUE("product_id", "date")
);

-- 2. Create indexes for better performance
CREATE INDEX IF NOT EXISTS "idx_product_sales_history_product" ON "ProductSalesHistory"("product_id");
CREATE INDEX IF NOT EXISTS "idx_product_sales_history_date" ON "ProductSalesHistory"("date");
CREATE INDEX IF NOT EXISTS "idx_product_sales_history_product_date" ON "ProductSalesHistory"("product_id", "date");

-- 3. Create DemandForecast table to store ML predictions
CREATE TABLE IF NOT EXISTS "DemandForecast" (
  "id" SERIAL PRIMARY KEY,
  "product_id" INTEGER NOT NULL REFERENCES "Product"("id") ON DELETE CASCADE,
  "forecast_date" DATE NOT NULL,
  "predicted_demand" INTEGER NOT NULL,
  "confidence_level" DECIMAL(3, 2) DEFAULT 0.85,
  "actual_demand" INTEGER,
  "accuracy" DECIMAL(5, 2),
  "method" VARCHAR(50) DEFAULT 'moving_average',
  "created_at" TIMESTAMP DEFAULT NOW(),
  CONSTRAINT "unique_forecast_product_date" UNIQUE("product_id", "forecast_date")
);

-- 4. Create indexes for DemandForecast
CREATE INDEX IF NOT EXISTS "idx_demand_forecast_product" ON "DemandForecast"("product_id");
CREATE INDEX IF NOT EXISTS "idx_demand_forecast_date" ON "DemandForecast"("forecast_date");

-- 5. Update Notification table to link with products
ALTER TABLE "Notification" 
ADD COLUMN IF NOT EXISTS "product_id" INTEGER REFERENCES "Product"("id") ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS "notification_type" VARCHAR(50) DEFAULT 'general',
ADD COLUMN IF NOT EXISTS "priority" VARCHAR(20) DEFAULT 'medium',
ADD COLUMN IF NOT EXISTS "metadata" JSONB;

-- 6. Create indexes for Notification
CREATE INDEX IF NOT EXISTS "idx_notification_product" ON "Notification"("product_id");
CREATE INDEX IF NOT EXISTS "idx_notification_type" ON "Notification"("notification_type");
CREATE INDEX IF NOT EXISTS "idx_notification_priority" ON "Notification"("priority");

-- 7. Create trigger to auto-update ProductSalesHistory
CREATE OR REPLACE FUNCTION update_product_sales_history()
RETURNS TRIGGER AS $$
BEGIN
  -- When a new transaction item is added, update the sales history
  INSERT INTO "ProductSalesHistory" (
    "product_id",
    "date",
    "quantity_sold",
    "revenue",
    "transactions_count"
  )
  VALUES (
    NEW."product_id",
    DATE(NEW."created_at"),
    NEW."quantity",
    NEW."quantity" * NEW."unit_price",
    1
  )
  ON CONFLICT ("product_id", "date")
  DO UPDATE SET
    "quantity_sold" = "ProductSalesHistory"."quantity_sold" + NEW."quantity",
    "revenue" = "ProductSalesHistory"."revenue" + (NEW."quantity" * NEW."unit_price"),
    "transactions_count" = "ProductSalesHistory"."transactions_count" + 1,
    "updated_at" = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. Create trigger on TransactionItem
DROP TRIGGER IF EXISTS trigger_update_sales_history ON "TransactionItem";
CREATE TRIGGER trigger_update_sales_history
AFTER INSERT ON "TransactionItem"
FOR EACH ROW
EXECUTE FUNCTION update_product_sales_history();

-- 9. Populate historical data from existing transactions (last 90 days)
INSERT INTO "ProductSalesHistory" (
  "product_id",
  "date",
  "quantity_sold",
  "revenue",
  "transactions_count"
)
SELECT 
  ti."product_id",
  DATE(t."transaction_date") as date,
  SUM(ti."quantity") as quantity_sold,
  SUM(ti."quantity" * ti."unit_price") as revenue,
  COUNT(DISTINCT t."id") as transactions_count
FROM "TransactionItem" ti
JOIN "Transaction" t ON ti."transaction_id" = t."id"
WHERE t."transaction_date" >= NOW() - INTERVAL '90 days'
  AND ti."product_id" IS NOT NULL
GROUP BY ti."product_id", DATE(t."transaction_date")
ON CONFLICT ("product_id", "date") DO NOTHING;

-- 10. Create sample historical data for products without sales (for demo purposes)
DO $$
DECLARE
  product_record RECORD;
  days_back INTEGER;
  random_quantity INTEGER;
BEGIN
  FOR product_record IN SELECT id, price FROM "Product" LIMIT 10 LOOP
    FOR days_back IN 1..90 LOOP
      random_quantity := floor(random() * 15 + 5)::INTEGER;
      
      INSERT INTO "ProductSalesHistory" (
        "product_id",
        "date",
        "quantity_sold",
        "revenue",
        "transactions_count",
        "created_at"
      )
      VALUES (
        product_record.id,
        CURRENT_DATE - days_back,
        random_quantity,
        random_quantity * product_record.price,
        floor(random() * 5 + 1)::INTEGER,
        CURRENT_TIMESTAMP - (days_back || ' days')::INTERVAL
      )
      ON CONFLICT ("product_id", "date") DO NOTHING;
    END LOOP;
  END LOOP;
END $$;

-- 11. Create function to generate automatic stock notifications
CREATE OR REPLACE FUNCTION create_stock_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Low stock alert (quantity < 20)
  IF NEW."quantity" < 20 AND NEW."quantity" > 0 AND (OLD."quantity" IS NULL OR OLD."quantity" >= 20) THEN
    INSERT INTO "Notification" (
      "recipient_type",
      "recipient_id",
      "product_id",
      "notification_type",
      "title",
      "message",
      "priority",
      "is_read",
      "created_at",
      "metadata"
    )
    VALUES (
      'admin',
      NULL,
      NEW."id",
      'low_stock',
      'Low Stock Alert',
      'Low stock alert: ' || NEW."product_name" || ' has only ' || NEW."quantity" || ' units remaining.',
      'high',
      false,
      NOW(),
      jsonb_build_object(
        'product_id', NEW."id",
        'product_name', NEW."product_name",
        'current_stock', NEW."quantity",
        'threshold', 20
      )
    );
  END IF;
  
  -- Out of stock alert
  IF NEW."quantity" = 0 AND (OLD."quantity" IS NULL OR OLD."quantity" > 0) THEN
    INSERT INTO "Notification" (
      "recipient_type",
      "recipient_id",
      "product_id",
      "notification_type",
      "title",
      "message",
      "priority",
      "is_read",
      "created_at",
      "metadata"
    )
    VALUES (
      'admin',
      NULL,
      NEW."id",
      'out_of_stock',
      'Critical: Out of Stock',
      'OUT OF STOCK: ' || NEW."product_name" || ' is completely out of stock!',
      'critical',
      false,
      NOW(),
      jsonb_build_object(
        'product_id', NEW."id",
        'product_name', NEW."product_name",
        'current_stock', 0
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 12. Create trigger for automatic notifications
DROP TRIGGER IF EXISTS trigger_stock_notification ON "Product";
CREATE TRIGGER trigger_stock_notification
AFTER INSERT OR UPDATE OF "quantity" ON "Product"
FOR EACH ROW
EXECUTE FUNCTION create_stock_notification();

-- 13. Create initial notifications for all current products
INSERT INTO "Notification" (
  "recipient_type",
  "recipient_id",
  "product_id",
  "notification_type",
  "title",
  "message",
  "priority",
  "is_read",
  "created_at",
  "metadata"
)
SELECT 
  'admin' as recipient_type,
  NULL as recipient_id,
  p.id as product_id,
  CASE 
    WHEN p.quantity = 0 THEN 'out_of_stock'
    WHEN p.quantity < 20 THEN 'low_stock'
    ELSE 'stock_ok'
  END as notification_type,
  CASE 
    WHEN p.quantity = 0 THEN 'Critical: Out of Stock'
    WHEN p.quantity < 20 THEN 'Warning: Low Stock'
    ELSE 'Info: Stock OK'
  END as title,
  CASE 
    WHEN p.quantity = 0 THEN 'OUT OF STOCK: ' || p.product_name || ' is completely out of stock!'
    WHEN p.quantity < 20 THEN 'Low stock alert: ' || p.product_name || ' has only ' || p.quantity || ' units remaining.'
    ELSE 'Stock OK: ' || p.product_name || ' has sufficient stock (' || p.quantity || ' units).'
  END as message,
  CASE 
    WHEN p.quantity = 0 THEN 'critical'
    WHEN p.quantity < 20 THEN 'high'
    ELSE 'low'
  END as priority,
  false as is_read,
  NOW() as created_at,
  jsonb_build_object(
    'product_id', p.id,
    'product_name', p.product_name,
    'current_stock', p.quantity,
    'category', p.category
  ) as metadata
FROM "Product" p;

-- 14. Create view for easy forecast analysis
CREATE OR REPLACE VIEW "ForecastAccuracyView" AS
SELECT 
  df."product_id",
  p."product_name",
  df."forecast_date",
  df."predicted_demand",
  df."confidence_level"
FROM "DemandForecast" df
JOIN "Product" p ON df."product_id" = p."id";

-- 15. Summary queries
SELECT 'ProductSalesHistory created with' || COUNT(*) || ' records' as status 
FROM "ProductSalesHistory";

SELECT 'Notifications created with' || COUNT(*) || ' records' as status 
FROM "Notification" 
WHERE created_at >= NOW() - INTERVAL '1 minute';

-- Display sample data
SELECT * FROM "ProductSalesHistory" 
ORDER BY date DESC, product_id 
LIMIT 10;
