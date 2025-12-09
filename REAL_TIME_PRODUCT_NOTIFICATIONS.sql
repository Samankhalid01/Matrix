-- =====================================================
-- REAL-TIME PRODUCT NOTIFICATIONS SYSTEM
-- =====================================================
-- This system creates automatic notifications linked to products
-- with real-time updates when product stock changes

-- =====================================================
-- PART 1: UPDATE NOTIFICATION TABLE STRUCTURE
-- =====================================================

-- Add product relationship column if it doesn't exist
ALTER TABLE "Notification" 
ADD COLUMN IF NOT EXISTS "product_id" INTEGER REFERENCES "Product"("id") ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS "expires_at" TIMESTAMP;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS "idx_notification_product_id" ON "Notification"("product_id");
CREATE INDEX IF NOT EXISTS "idx_notification_type" ON "Notification"("notification_type");
CREATE INDEX IF NOT EXISTS "idx_notification_priority" ON "Notification"("priority");
CREATE INDEX IF NOT EXISTS "idx_notification_read_status" ON "Notification"("is_read");
CREATE INDEX IF NOT EXISTS "idx_notification_created_at" ON "Notification"("created_at");

-- =====================================================
-- PART 2: CREATE REAL-TIME NOTIFICATION TRIGGER
-- =====================================================

-- Function to create stock notifications automatically
CREATE OR REPLACE FUNCTION create_stock_notification()
RETURNS TRIGGER AS $$
DECLARE
  notification_msg TEXT;
  notification_priority VARCHAR(20);
  notification_type_val VARCHAR(50);
  notification_title TEXT;
BEGIN
  -- Critical: Out of stock
  IF NEW."quantity" = 0 AND (OLD."quantity" IS NULL OR OLD."quantity" > 0) THEN
    notification_title := 'Critical Stock Alert';
    notification_msg := 'CRITICAL: ' || NEW."product_name" || ' is OUT OF STOCK! Immediate restocking required.';
    notification_priority := 'critical';
    notification_type_val := 'stock_alert';
    
    INSERT INTO "Notification" (
      "recipient_type",
      "recipient_id",
      "product_id",
      "notification_type",
      "title",
      "message",
      "priority",
      "is_read",
      "action_url",
      "metadata",
      "created_at"
    )
    VALUES (
      'admin',
      NULL, -- Broadcast to all admins
      NEW."id",
      notification_type_val,
      notification_title,
      notification_msg,
      notification_priority,
      false,
      '/admin/products/' || NEW."id",
      jsonb_build_object(
        'product_id', NEW."id",
        'product_name', NEW."product_name",
        'current_stock', NEW."quantity",
        'previous_stock', COALESCE(OLD."quantity", 0),
        'category', NEW."category",
        'price', NEW."price",
        'supplier', NEW."supplier",
        'qrcode', NEW."qrcode"
      ),
      NOW()
    );
  
  -- High Priority: Low stock warning (< 20)
  ELSIF NEW."quantity" < 20 AND NEW."quantity" > 0 AND (OLD."quantity" IS NULL OR OLD."quantity" >= 20) THEN
    notification_title := 'Low Stock Warning';
    notification_msg := 'LOW STOCK: ' || NEW."product_name" || ' has only ' || NEW."quantity" || ' units left. Consider restocking.';
    notification_priority := 'high';
    notification_type_val := 'stock_alert';
    
    INSERT INTO "Notification" (
      "recipient_type",
      "recipient_id",
      "product_id",
      "notification_type",
      "title",
      "message",
      "priority",
      "is_read",
      "action_url",
      "metadata",
      "created_at"
    )
    VALUES (
      'admin',
      NULL,
      NEW."id",
      notification_type_val,
      notification_title,
      notification_msg,
      notification_priority,
      false,
      '/admin/products/' || NEW."id",
      jsonb_build_object(
        'product_id', NEW."id",
        'product_name', NEW."product_name",
        'current_stock', NEW."quantity",
        'threshold', 20,
        'category', NEW."category",
        'price', NEW."price"
      ),
      NOW()
    );
  
  -- Medium Priority: Stock replenished
  ELSIF OLD."quantity" IS NOT NULL AND OLD."quantity" < 20 AND NEW."quantity" >= 50 THEN
    notification_title := 'Stock Replenished';
    notification_msg := 'RESTOCKED: ' || NEW."product_name" || ' stock replenished to ' || NEW."quantity" || ' units.';
    notification_priority := 'medium';
    notification_type_val := 'stock_alert';
    
    INSERT INTO "Notification" (
      "recipient_type",
      "recipient_id",
      "product_id",
      "notification_type",
      "title",
      "message",
      "priority",
      "is_read",
      "action_url",
      "metadata",
      "created_at"
    )
    VALUES (
      'admin',
      NULL,
      NEW."id",
      notification_type_val,
      notification_title,
      notification_msg,
      notification_priority,
      false,
      '/admin/products/' || NEW."id",
      jsonb_build_object(
        'product_id', NEW."id",
        'product_name', NEW."product_name",
        'current_stock', NEW."quantity",
        'previous_stock', OLD."quantity",
        'category', NEW."category"
      ),
      NOW()
    );
  END IF;
  
  -- Price change notification
  IF OLD."price" IS NOT NULL AND NEW."price" != OLD."price" THEN
    notification_title := 'Price Update';
    notification_msg := 'PRICE UPDATE: ' || NEW."product_name" || ' price changed from ₨' || OLD."price" || ' to ₨' || NEW."price";
    
    INSERT INTO "Notification" (
      "recipient_type",
      "recipient_id",
      "product_id",
      "notification_type",
      "title",
      "message",
      "priority",
      "is_read",
      "action_url",
      "metadata",
      "created_at"
    )
    VALUES (
      'admin',
      NULL,
      NEW."id",
      'stock_alert',
      notification_title,
      notification_msg,
      'low',
      false,
      '/admin/products/' || NEW."id",
      jsonb_build_object(
        'product_id', NEW."id",
        'product_name', NEW."product_name",
        'old_price', OLD."price",
        'new_price', NEW."price",
        'price_change_percentage', ROUND(((NEW."price" - OLD."price") / OLD."price" * 100)::numeric, 2)
      ),
      NOW()
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_stock_notification ON "Product";

-- Create the trigger
CREATE TRIGGER trigger_stock_notification
AFTER INSERT OR UPDATE OF "quantity", "price" ON "Product"
FOR EACH ROW
EXECUTE FUNCTION create_stock_notification();

-- =====================================================
-- PART 3: INSERT INITIAL NOTIFICATIONS FOR ALL PRODUCTS
-- =====================================================

-- Clear old notifications (optional - comment out if you want to keep existing)
-- DELETE FROM "Notification" WHERE created_at < NOW() - INTERVAL '30 days';

-- Insert notifications for current product status
INSERT INTO "Notification" (
  "recipient_type",
  "recipient_id",
  "product_id",
  "notification_type",
  "title",
  "message",
  "priority",
  "is_read",
  "action_url",
  "metadata",
  "created_at"
)
SELECT 
  'admin' as recipient_type,
  NULL as recipient_id,
  p.id as product_id,
  'stock_alert' as notification_type,
  CASE 
    WHEN p.quantity = 0 THEN 'Critical: Out of Stock'
    WHEN p.quantity < 20 THEN 'Warning: Low Stock'
    WHEN p.quantity >= 100 THEN 'Info: Well Stocked'
    ELSE 'Info: Stock Status'
  END as title,
  CASE 
    WHEN p.quantity = 0 THEN 'CRITICAL: ' || p.product_name || ' is OUT OF STOCK!'
    WHEN p.quantity < 20 THEN 'LOW STOCK: ' || p.product_name || ' has only ' || p.quantity || ' units left.'
    WHEN p.quantity >= 100 THEN 'WELL STOCKED: ' || p.product_name || ' has healthy stock (' || p.quantity || ' units).'
    ELSE p.product_name || ' stock level: ' || p.quantity || ' units'
  END as message,
  CASE 
    WHEN p.quantity = 0 THEN 'critical'
    WHEN p.quantity < 20 THEN 'high'
    WHEN p.quantity < 50 THEN 'medium'
    ELSE 'low'
  END as priority,
  false as is_read,
  '/admin/products/' || p.id as action_url,
  jsonb_build_object(
    'product_id', p.id,
    'product_name', p.product_name,
    'current_stock', p.quantity,
    'category', p.category,
    'price', p.price,
    'qrcode', p.qrcode,
    'supplier', p.supplier
  ) as metadata,
  NOW() as created_at
FROM "Product" p
ON CONFLICT DO NOTHING;

-- =====================================================
-- PART 4: CREATE VIEWS FOR EASY QUERYING
-- =====================================================

-- View for active product notifications
CREATE OR REPLACE VIEW "ActiveProductNotifications" AS
SELECT 
  n.id,
  n.recipient_type,
  n.recipient_id,
  n.product_id,
  p.product_name,
  p.category,
  p.quantity as current_stock,
  p.price,
  n.title,
  n.message,
  n.notification_type,
  n.priority,
  n.is_read,
  n.action_url,
  n.metadata,
  n.created_at,
  CASE 
    WHEN n.priority = 'critical' THEN 1
    WHEN n.priority = 'high' THEN 2
    WHEN n.priority = 'medium' THEN 3
    ELSE 4
  END as priority_order
FROM "Notification" n
LEFT JOIN "Product" p ON n.product_id = p.id
WHERE n.is_read = false AND n.recipient_type = 'admin'
ORDER BY priority_order, n.created_at DESC;

-- View for notification summary by product
CREATE OR REPLACE VIEW "ProductNotificationSummary" AS
SELECT 
  p.id as product_id,
  p.product_name,
  p.category,
  p.quantity as current_stock,
  COUNT(n.id) as total_notifications,
  COUNT(CASE WHEN n.is_read = false THEN 1 END) as unread_notifications,
  COUNT(CASE WHEN n.priority = 'critical' THEN 1 END) as critical_count,
  COUNT(CASE WHEN n.priority = 'high' THEN 1 END) as high_priority_count,
  MAX(n.created_at) as last_notification_date
FROM "Product" p
LEFT JOIN "Notification" n ON p.id = n.product_id
WHERE n.recipient_type = 'admin' OR n.recipient_type IS NULL
GROUP BY p.id, p.product_name, p.category, p.quantity
ORDER BY critical_count DESC, high_priority_count DESC;

-- =====================================================
-- PART 5: USEFUL QUERIES
-- =====================================================

-- Get all unread notifications with product details
-- SELECT * FROM "ActiveProductNotifications" LIMIT 50;

-- Get notification summary for all products
-- SELECT * FROM "ProductNotificationSummary";

-- Get critical notifications only
-- SELECT * FROM "Notification" 
-- WHERE priority = 'critical' AND is_read = false 
-- ORDER BY created_at DESC;

-- Get notifications for specific product
-- SELECT * FROM "Notification" 
-- WHERE product_id = 1 
-- ORDER BY created_at DESC;

-- Mark notifications as read
-- UPDATE "Notification" SET is_read = true WHERE id IN (1, 2, 3);

-- Delete old read notifications (older than 30 days)
-- DELETE FROM "Notification" 
-- WHERE is_read = true AND created_at < NOW() - INTERVAL '30 days';

-- =====================================================
-- PART 6: TEST THE SYSTEM
-- =====================================================

-- Test 1: Update a product to trigger low stock notification
-- UPDATE "Product" SET quantity = 15 WHERE id = 1;

-- Test 2: Update a product to trigger out of stock notification
-- UPDATE "Product" SET quantity = 0 WHERE id = 2;

-- Test 3: Restock a product
-- UPDATE "Product" SET quantity = 100 WHERE id = 1;

-- Test 4: Change product price
-- UPDATE "Product" SET price = 150 WHERE id = 1;

-- View results
SELECT 
  COUNT(*) as total_notifications,
  COUNT(CASE WHEN is_read = false THEN 1 END) as unread,
  COUNT(CASE WHEN priority = 'critical' THEN 1 END) as critical,
  COUNT(CASE WHEN priority = 'high' THEN 1 END) as high_priority
FROM "Notification"
WHERE created_at >= NOW() - INTERVAL '1 hour';

-- Display recent notifications with product info
SELECT 
  n.id,
  n.notification_type,
  n.priority,
  n.message,
  p.product_name,
  p.quantity as current_stock,
  n.created_at
FROM "Notification" n
LEFT JOIN "Product" p ON n.product_id = p.id
WHERE n.created_at >= NOW() - INTERVAL '1 hour'
ORDER BY 
  CASE n.priority
    WHEN 'critical' THEN 1
    WHEN 'high' THEN 2
    WHEN 'medium' THEN 3
    ELSE 4
  END,
  n.created_at DESC
LIMIT 20;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================
SELECT '✅ Real-time product notifications system created successfully!' as status;
SELECT 'Total notifications created: ' || COUNT(*) FROM "Notification" WHERE created_at >= NOW() - INTERVAL '5 minutes';
