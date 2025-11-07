-- Query to check what QR codes exist in Customer table
-- Run this in Supabase SQL Editor to see your customer QR code format

SELECT 
  id,
  customer_name,
  qr_code,
  created_at
FROM "Customer"
LIMIT 5;

-- If you want to update your existing customer's QR code to match the scanned one:
-- UPDATE "Customer" 
-- SET qr_code = 'YOUR_SCANNED_QR_CODE_VALUE'
-- WHERE id = 'YOUR_CUSTOMER_UUID';
