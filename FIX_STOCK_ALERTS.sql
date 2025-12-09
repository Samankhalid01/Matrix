-- Fix Stock Alert System
-- This script checks and fixes the stock notification trigger

-- Step 1: Check if products have min_stock_threshold set
SELECT 
    id, 
    product_name, 
    current_stock, 
    min_stock_threshold,
    CASE 
        WHEN min_stock_threshold IS NULL THEN 'NO THRESHOLD SET'
        WHEN current_stock <= min_stock_threshold THEN 'SHOULD ALERT'
        ELSE 'OK'
    END as status
FROM public."Product"
ORDER BY current_stock ASC
LIMIT 20;

-- Step 2: Set default min_stock_threshold for products that don't have one
UPDATE public."Product"
SET min_stock_threshold = 20
WHERE min_stock_threshold IS NULL;

-- Step 3: Verify the stock trigger exists
SELECT 
    tgname as trigger_name,
    tgenabled as enabled,
    pg_get_triggerdef(oid) as trigger_definition
FROM pg_trigger
WHERE tgname = 'stock_level_trigger';

-- Step 4: Drop existing trigger if it exists (to recreate it fresh)
DROP TRIGGER IF EXISTS stock_level_trigger ON public."Product";

-- Step 5: Drop existing function if it exists
DROP FUNCTION IF EXISTS check_stock_level() CASCADE;

-- Step 6: Create improved stock level checking function
CREATE OR REPLACE FUNCTION check_stock_level()
RETURNS TRIGGER AS $$
DECLARE
    v_alert_id INTEGER;
    v_notification_id INTEGER;
    v_threshold INTEGER;
BEGIN
    -- Get the threshold (use default of 20 if not set)
    v_threshold := COALESCE(NEW.min_stock_threshold, 20);
    
    -- Only create alert if stock is at or below threshold
    IF NEW.current_stock <= v_threshold THEN
        -- Check if there's already an active alert for this product
        IF NOT EXISTS (
            SELECT 1 
            FROM public."StockAlert" 
            WHERE product_id = NEW.id 
            AND status = 'active'
        ) THEN
            -- Determine alert type
            DECLARE
                v_alert_type VARCHAR(50);
            BEGIN
                IF NEW.current_stock = 0 THEN
                    v_alert_type := 'out-of-stock';
                ELSE
                    v_alert_type := 'low-stock';
                END IF;
                
                -- Create stock alert
                INSERT INTO public."StockAlert" (
                    product_id,
                    alert_type,
                    current_stock,
                    threshold_stock,
                    status,
                    created_at
                )
                VALUES (
                    NEW.id,
                    v_alert_type,
                    NEW.current_stock,
                    v_threshold,
                    'active',
                    NOW()
                )
                RETURNING id INTO v_alert_id;
                
                -- Create notification
                INSERT INTO public."Notification" (
                    recipient_type,
                    notification_type,
                    title,
                    message,
                    priority,
                    metadata,
                    created_at,
                    is_read
                )
                VALUES (
                    'admin',
                    'stock_alert',
                    CASE 
                        WHEN NEW.current_stock = 0 THEN 'Out of Stock Alert'
                        ELSE 'Low Stock Alert'
                    END,
                    CASE 
                        WHEN NEW.current_stock = 0 THEN 
                            NEW.product_name || ' is out of stock!'
                        ELSE 
                            NEW.product_name || ' stock is low (' || NEW.current_stock || ' units remaining, threshold: ' || v_threshold || ')'
                    END,
                    CASE 
                        WHEN NEW.current_stock = 0 THEN 'high'
                        ELSE 'medium'
                    END,
                    json_build_object(
                        'product_id', NEW.id,
                        'product_name', NEW.product_name,
                        'current_stock', NEW.current_stock,
                        'threshold', v_threshold,
                        'alert_id', v_alert_id
                    ),
                    NOW(),
                    FALSE
                )
                RETURNING id INTO v_notification_id;
                
                RAISE NOTICE 'Stock alert created: Alert ID %, Notification ID % for product %', 
                    v_alert_id, v_notification_id, NEW.product_name;
            END;
        END IF;
    ELSE
        -- Stock is above threshold, resolve any active alerts
        UPDATE public."StockAlert"
        SET status = 'resolved',
            resolved_at = NOW()
        WHERE product_id = NEW.id 
        AND status = 'active';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 7: Create the trigger
CREATE TRIGGER stock_level_trigger
AFTER UPDATE OF current_stock ON public."Product"
FOR EACH ROW
WHEN (OLD.current_stock IS DISTINCT FROM NEW.current_stock)
EXECUTE FUNCTION check_stock_level();

-- Step 8: Test the trigger by finding a product and reducing its stock
-- First, show current products with stock above threshold
SELECT 
    id,
    product_name,
    current_stock,
    min_stock_threshold
FROM public."Product"
WHERE current_stock > COALESCE(min_stock_threshold, 20)
ORDER BY current_stock DESC
LIMIT 5;

-- INSTRUCTIONS TO TEST:
-- 1. Pick a product ID from the query above
-- 2. Run this command (replace 1 with actual product ID):
--    UPDATE public."Product" SET current_stock = 5 WHERE id = 1;
-- 3. Check if alert was created:
--    SELECT * FROM public."StockAlert" ORDER BY created_at DESC LIMIT 5;
-- 4. Check if notification was created:
--    SELECT * FROM public."Notification" WHERE notification_type = 'stock_alert' ORDER BY created_at DESC LIMIT 5;

-- Step 9: View existing alerts
SELECT 
    sa.id,
    sa.alert_type,
    p.product_name,
    sa.current_stock,
    sa.threshold_stock,
    sa.status,
    sa.created_at
FROM public."StockAlert" sa
JOIN public."Product" p ON sa.product_id = p.id
ORDER BY sa.created_at DESC
LIMIT 10;

-- Step 10: View stock alert notifications
SELECT 
    id,
    title,
    message,
    priority,
    created_at,
    is_read,
    metadata
FROM public."Notification"
WHERE notification_type = 'stock_alert'
ORDER BY created_at DESC
LIMIT 10;

-- DEBUGGING QUERIES:
-- If alerts still aren't working, run these queries:

-- Check if trigger is enabled:
SELECT 
    t.tgname,
    t.tgenabled,
    c.relname as table_name
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
WHERE t.tgname = 'stock_level_trigger';

-- Check products with NULL threshold:
SELECT COUNT(*) as products_without_threshold
FROM public."Product"
WHERE min_stock_threshold IS NULL;

-- Manually trigger alert for testing (replace ID):
UPDATE public."Product" 
SET current_stock = 1 
WHERE id = (
    SELECT id 
    FROM public."Product" 
    WHERE current_stock > 50 
    LIMIT 1
);
