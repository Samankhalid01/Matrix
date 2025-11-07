-- Add New Customer with Email-based QR Code
-- The QR code will contain the customer's email address

-- Example 1: Basic customer
INSERT INTO public."Customer" (
  id,
  name,
  email,
  password,
  address,
  "2FA_enabled",
  customer_tier,
  in_store,
  is_fraud
) VALUES (
  gen_random_uuid(),                    -- Auto-generate UUID
  'John Doe',                            -- Customer name
  'john.doe@gmail.com',                  -- Email (this will be in QR code)
  'password123',                         -- Password (optional)
  '123 Main Street, City',               -- Address (optional)
  false,                                 -- 2FA disabled
  'GOLD',                                -- Customer tier (GOLD/SILVER/BRONZE)
  false,                                 -- Not in store
  false                                  -- Not fraud
);

-- Example 2: VIP customer
INSERT INTO public."Customer" (
  id,
  name,
  email,
  password,
  address,
  customer_tier,
  "2FA_enabled",
  in_store,
  is_fraud
) VALUES (
  gen_random_uuid(),
  'Jane Smith',
  'jane.smith@gmail.com',
  'secure456',
  '456 Oak Avenue, Town',
  'PLATINUM',
  true,
  false,
  false
);

-- Example 3: Minimal customer (only required fields)
INSERT INTO public."Customer" (
  id,
  name,
  email
) VALUES (
  gen_random_uuid(),
  'Test Customer',
  'test@example.com'
);

-- ============================================
-- View all customers
-- ============================================
SELECT 
  id,
  name,
  email,
  customer_tier,
  in_store,
  created_at
FROM public."Customer"
ORDER BY created_at DESC;

-- ============================================
-- Check if customer exists by email
-- ============================================
SELECT * FROM public."Customer" 
WHERE email = 'your.email@gmail.com';

-- ============================================
-- Update customer email (if QR code changed)
-- ============================================
UPDATE public."Customer"
SET email = 'new.email@gmail.com'
WHERE id = 'your-customer-id-here';

-- ============================================
-- Generate QR Code for existing customer
-- ============================================
-- Use the API endpoint to generate QR code:
-- GET http://localhost:3000/api/customers?id=CUSTOMER_ID
-- The API will return the customer data with qrCodeImage

-- Or use the /admin/customers page in the frontend
-- to view and download QR codes for all customers
