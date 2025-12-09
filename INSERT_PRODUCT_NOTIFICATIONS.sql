-- SQL Query to Insert Product Notifications for Stock Alerts
-- This will create notifications for products that are currently in the database

-- Insert notifications for all products with low stock (quantity < 20)
INSERT INTO "Notification" (
  "customer_id",
  "message",
  "type",
  "is_read",
  "created_at"
)
SELECT 
  1 as customer_id, -- Default admin/system customer ID
  'Low stock alert: ' || product_name || ' has only ' || quantity || ' units remaining. Please restock soon.' as message,
  'stock_alert' as type,
  false as is_read,
  NOW() as created_at
FROM "Product"
WHERE quantity < 20 AND quantity > 0;

-- Insert notifications for out of stock products (quantity = 0)
INSERT INTO "Notification" (
  "customer_id",
  "message",
  "type",
  "is_read",
  "created_at"
)
SELECT 
  1 as customer_id,
  'OUT OF STOCK: ' || product_name || ' is completely out of stock. Immediate restocking required!' as message,
  'critical' as type,
  false as is_read,
  NOW() as created_at
FROM "Product"
WHERE quantity = 0;

-- Insert notifications for new products added in the last 7 days
INSERT INTO "Notification" (
  "customer_id",
  "message",
  "type",
  "is_read",
  "created_at"
)
SELECT 
  1 as customer_id,
  'New product added: ' || product_name || ' (₨' || price || ') is now available in the store!' as message,
  'info' as type,
  false as is_read,
  created_at
FROM "Product"
WHERE created_at >= NOW() - INTERVAL '7 days';

-- Insert notifications for products with high value (price > 500)
INSERT INTO "Notification" (
  "customer_id",
  "message",
  "type",
  "is_read",
  "created_at"
)
SELECT 
  1 as customer_id,
  'Premium product available: ' || product_name || ' (₨' || price || ') - High-value item in inventory' as message,
  'info' as type,
  false as is_read,
  NOW() as created_at
FROM "Product"
WHERE price > 500
AND id NOT IN (
  SELECT id FROM "Product" 
  WHERE created_at >= NOW() - INTERVAL '7 days'
)
LIMIT 5;

-- Insert notifications for products needing price review (no recent updates)
INSERT INTO "Notification" (
  "customer_id",
  "message",
  "type",
  "is_read",
  "created_at"
)
SELECT 
  1 as customer_id,
  'Price review needed: ' || product_name || ' has not been updated in over 30 days. Consider reviewing pricing.' as message,
  'warning' as type,
  false as is_read,
  NOW() as created_at
FROM "Product"
WHERE updated_at < NOW() - INTERVAL '30 days'
OR (updated_at IS NULL AND created_at < NOW() - INTERVAL '30 days')
LIMIT 10;

-- Summary query to verify inserted notifications
SELECT 
  type,
  COUNT(*) as notification_count,
  MIN(created_at) as earliest,
  MAX(created_at) as latest
FROM "Notification"
GROUP BY type
ORDER BY notification_count DESC;

-- Query to view all notifications with product context
SELECT 
  n.id,
  n.message,
  n.type,
  n.is_read,
  n.created_at,
  CASE 
    WHEN n.message LIKE '%Low stock alert%' THEN 'Stock Alert'
    WHEN n.message LIKE '%OUT OF STOCK%' THEN 'Critical Stock'
    WHEN n.message LIKE '%New product%' THEN 'New Addition'
    WHEN n.message LIKE '%Premium product%' THEN 'Premium Item'
    WHEN n.message LIKE '%Price review%' THEN 'Price Review'
    ELSE 'General'
  END as category
FROM "Notification" n
WHERE n.created_at >= NOW() - INTERVAL '1 day'
ORDER BY 
  CASE 
    WHEN n.type = 'critical' THEN 1
    WHEN n.type = 'stock_alert' THEN 2
    WHEN n.type = 'warning' THEN 3
    ELSE 4
  END,
  n.created_at DESC;
