# 🔄 QR Shopping System - Visual Workflow

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         ADMIN WEB APP                            │
│                    (http://localhost:3001)                       │
└─────────────────────────────────────────────────────────────────┘
                               │
                ┌──────────────┼──────────────┐
                │              │              │
        ┌───────▼──────┐ ┌────▼─────┐ ┌─────▼──────┐
        │  Customer    │ │ Products │ │   Scan     │
        │ Management   │ │   Page   │ │  Shopping  │
        │              │ │          │ │            │
        │ - Create     │ │ - View   │ │ - Scanner  │
        │ - View List  │ │ - Edit   │ │ - Cart     │
        │ - Gen QR     │ │ - Gen QR │ │ - Session  │
        └──────────────┘ └──────────┘ └────────────┘
                               │
                ┌──────────────┼──────────────┐
                │              │              │
        ┌───────▼──────┐ ┌────▼─────┐ ┌─────▼──────┐
        │ /api/        │ │ /api/    │ │ /api/      │
        │ customers    │ │ session  │ │ cart       │
        └──────────────┘ └──────────┘ └────────────┘
                               │
                ┌──────────────┴──────────────┐
                │                             │
        ┌───────▼──────┐            ┌────────▼────────┐
        │  SUPABASE    │            │  CUSTOMER APP   │
        │  DATABASE    │            │  (Mobile View)  │
        │              │            │                 │
        │ - Customer   │            │ - View Cart     │
        │ - Session    │            │ - Check Total   │
        │ - Cart       │            │ - See Products  │
        │ - Product    │            │                 │
        └──────────────┘            └─────────────────┘
```

---

## Shopping Flow

```
STEP 1: Customer Registration
┌────────────────────────────────────────────────────────────┐
│  ADMIN                                                      │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ 1. Open /admin/customers                            │  │
│  │ 2. Click "+ New Customer"                           │  │
│  │ 3. Enter: Name, Email, Phone                        │  │
│  │ 4. Click "Create Customer & Generate QR Code"       │  │
│  └─────────────────────────────────────────────────────┘  │
│                           ↓                                 │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ System generates unique QR code:                    │  │
│  │ MATRIX_CUSTOMER_1730445678912_abc123xyz             │  │
│  └─────────────────────────────────────────────────────┘  │
│                           ↓                                 │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ Admin downloads QR code image                       │  │
│  │ Prints QR code on card/paper                        │  │
│  │ Gives QR card to customer                           │  │
│  └─────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
                           ↓
STEP 2: Customer Arrives at Store
┌────────────────────────────────────────────────────────────┐
│  CUSTOMER                                                   │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ Brings QR code card to store                        │  │
│  │ Shows QR code to admin at entrance                  │  │
│  └─────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
                           ↓
STEP 3: Start Shopping Session
┌────────────────────────────────────────────────────────────┐
│  ADMIN (Scanner App)                                        │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ 1. Open /admin/scan-shopping                        │  │
│  │ 2. Click "Start Scanning Customer"                  │  │
│  │ 3. Allow camera permissions                         │  │
│  └─────────────────────────────────────────────────────┘  │
│                           ↓                                 │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ 📷 CAMERA ACTIVE - Scanning for QR code            │  │
│  └─────────────────────────────────────────────────────┘  │
│                           ↓                                 │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ Customer shows QR card to camera                    │  │
│  │ System detects QR code                              │  │
│  │ Parses: MATRIX_CUSTOMER_1730445678912_abc123xyz     │  │
│  └─────────────────────────────────────────────────────┘  │
│                           ↓                                 │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ API Call: POST /api/session                         │  │
│  │ Body: { customerQrCode: "MATRIX_CUSTOMER_..." }     │  │
│  └─────────────────────────────────────────────────────┘  │
│                           ↓                                 │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ DATABASE: Find customer by qr_code                  │  │
│  │ DATABASE: Create ShoppingSession                    │  │
│  │           - customer_id: <uuid>                     │  │
│  │           - is_active: true                         │  │
│  │           - started_at: <now>                       │  │
│  └─────────────────────────────────────────────────────┘  │
│                           ↓                                 │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ ✅ SUCCESS                                          │  │
│  │ Display: "Welcome John Doe! Ready to scan products."│  │
│  │ Mode switches to: PRODUCT SCANNING                  │  │
│  └─────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
                           ↓
STEP 4: Scan Products
┌────────────────────────────────────────────────────────────┐
│  ADMIN (Scanner App)                                        │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ Left Panel: 📷 Camera scanning for products        │  │
│  │ Right Panel: 🛒 Cart (empty)                       │  │
│  └─────────────────────────────────────────────────────┘  │
│                           ↓                                 │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ Customer picks up Product #1                        │  │
│  │ Admin scans product QR code                         │  │
│  └─────────────────────────────────────────────────────┘  │
│                           ↓                                 │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ System detects product QR:                          │  │
│  │ {"id": 1, "productId": 1, "store": "MATRIX_..."}   │  │
│  └─────────────────────────────────────────────────────┘  │
│                           ↓                                 │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ API Call: POST /api/cart                            │  │
│  │ Body: {                                             │  │
│  │   customerId: <customer_uuid>,                      │  │
│  │   productId: 1,                                     │  │
│  │   quantity: 1                                       │  │
│  │ }                                                   │  │
│  └─────────────────────────────────────────────────────┘  │
│                           ↓                                 │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ DATABASE: Verify active session exists              │  │
│  │ DATABASE: Get product details (price, name, etc.)   │  │
│  │ DATABASE: Check if product already in cart          │  │
│  │                                                     │  │
│  │ IF NOT IN CART:                                     │  │
│  │   INSERT INTO Cart (customer_id, product_id, ...)  │  │
│  │                                                     │  │
│  │ IF ALREADY IN CART:                                 │  │
│  │   UPDATE Cart SET quantity = quantity + 1           │  │
│  │   UPDATE total_price = unit_price * new_quantity   │  │
│  └─────────────────────────────────────────────────────┘  │
│                           ↓                                 │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ ✅ "Product Name added to cart!"                   │  │
│  │                                                     │  │
│  │ Cart Panel Updates:                                 │  │
│  │ ┌─────────────────────────────────────────────┐   │  │
│  │ │ Product Name                    $9.99       │   │  │
│  │ │ $9.99 × 1                                   │   │  │
│  │ └─────────────────────────────────────────────┘   │  │
│  │                                                     │  │
│  │ Total: $9.99                                        │  │
│  │ 1 item(s)                                           │  │
│  └─────────────────────────────────────────────────────┘  │
│                           ↓                                 │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ Customer picks up Product #2                        │  │
│  │ Admin scans product QR code                         │  │
│  │ ... (repeat process)                                │  │
│  └─────────────────────────────────────────────────────┘  │
│                           ↓                                 │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ Cart Panel After Multiple Scans:                    │  │
│  │ ┌─────────────────────────────────────────────┐   │  │
│  │ │ Coca Cola                       $2.99       │   │  │
│  │ │ $2.99 × 3                                   │   │  │
│  │ ├─────────────────────────────────────────────┤   │  │
│  │ │ Chips                           $3.49       │   │  │
│  │ │ $3.49 × 1                                   │   │  │
│  │ ├─────────────────────────────────────────────┤   │  │
│  │ │ Bread                           $2.50       │   │  │
│  │ │ $2.50 × 2                                   │   │  │
│  │ └─────────────────────────────────────────────┘   │  │
│  │                                                     │  │
│  │ Total: $16.96                                       │  │
│  │ 6 item(s)                                           │  │
│  └─────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
                           ↓
STEP 5: Customer Views Cart (While Shopping)
┌────────────────────────────────────────────────────────────┐
│  CUSTOMER (Mobile Device)                                   │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ 1. Open /customer/cart on phone                     │  │
│  │ 2. Enter Customer ID (UUID from admin)              │  │
│  │ 3. Click "Load Cart"                                │  │
│  └─────────────────────────────────────────────────────┘  │
│                           ↓                                 │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ API Call: GET /api/cart?customerId=<uuid>           │  │
│  └─────────────────────────────────────────────────────┘  │
│                           ↓                                 │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ DATABASE: SELECT * FROM Cart                        │  │
│  │           WHERE customer_id = <uuid>                │  │
│  │           JOIN Product ON Cart.product_id           │  │
│  └─────────────────────────────────────────────────────┘  │
│                           ↓                                 │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ Cart Display:                                       │  │
│  │ ┌───────────────────────────────────────────────┐  │  │
│  │ │ [Image] Coca Cola                             │  │  │
│  │ │ Refreshing cola drink                         │  │  │
│  │ │ $2.99 × 3                         $8.97       │  │  │
│  │ ├───────────────────────────────────────────────┤  │  │
│  │ │ [Image] Chips                                 │  │  │
│  │ │ Crunchy potato chips                          │  │  │
│  │ │ $3.49 × 1                         $3.49       │  │  │
│  │ ├───────────────────────────────────────────────┤  │  │
│  │ │ [Image] Bread                                 │  │  │
│  │ │ Fresh whole wheat bread                       │  │  │
│  │ │ $2.50 × 2                         $5.00       │  │  │
│  │ └───────────────────────────────────────────────┘  │  │
│  │                                                     │  │
│  │ Items: 6                                            │  │
│  │ Total: $16.96                                       │  │
│  └─────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
                           ↓
STEP 6: End Session
┌────────────────────────────────────────────────────────────┐
│  ADMIN (Scanner App)                                        │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ Customer finished shopping                          │  │
│  │ Admin clicks "End Session" button                   │  │
│  └─────────────────────────────────────────────────────┘  │
│                           ↓                                 │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ API Call: DELETE /api/session                       │  │
│  │ Body: { sessionId: <session_id> }                   │  │
│  └─────────────────────────────────────────────────────┘  │
│                           ↓                                 │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ DATABASE: UPDATE ShoppingSession                    │  │
│  │           SET is_active = false,                    │  │
│  │               ended_at = NOW()                      │  │
│  │           WHERE id = <session_id>                   │  │
│  └─────────────────────────────────────────────────────┘  │
│                           ↓                                 │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ ✅ "Session ended. Cart saved for customer."       │  │
│  │                                                     │  │
│  │ Scanner resets to:                                  │  │
│  │ "Scan customer QR code to start session"           │  │
│  └─────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
                           ↓
STEP 7: Checkout (Future Implementation)
┌────────────────────────────────────────────────────────────┐
│  CUSTOMER (Mobile Device)                                   │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ Cart still accessible after session end             │  │
│  │ Can review items and total                          │  │
│  │ Proceed to payment (future feature)                 │  │
│  └─────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
```

---

## Database Entity Relationships

```
┌──────────────────────────────────────────────────────────────┐
│                      CUSTOMER TABLE                          │
├──────────────────────────────────────────────────────────────┤
│  id (PK)              │ uuid                                 │
│  customer_name        │ text                                 │
│  email                │ text (optional)                      │
│  phone                │ text (optional)                      │
│  qr_code (UNIQUE)     │ text (MATRIX_CUSTOMER_...)           │
│  created_at           │ timestamp                            │
└──────────────────────────────────────────────────────────────┘
                           │
                           │ (1 customer : N sessions)
                           ↓
┌──────────────────────────────────────────────────────────────┐
│                  SHOPPING SESSION TABLE                      │
├──────────────────────────────────────────────────────────────┤
│  id (PK)              │ bigint                               │
│  customer_id (FK)     │ uuid → Customer.id                   │
│  started_at           │ timestamp                            │
│  ended_at             │ timestamp (nullable)                 │
│  is_active            │ boolean                              │
└──────────────────────────────────────────────────────────────┘
                           │
                           │ (1 customer : N cart items)
                           ↓
┌──────────────────────────────────────────────────────────────┐
│                       CART TABLE                             │
├──────────────────────────────────────────────────────────────┤
│  id (PK)              │ bigint                               │
│  customer_id (FK)     │ uuid → Customer.id                   │
│  product_id (FK)      │ bigint → Product.id                  │
│  quantity             │ bigint                               │
│  unit_price           │ bigint                               │
│  total_price          │ bigint (unit_price × quantity)       │
│  created_at           │ timestamp                            │
└──────────────────────────────────────────────────────────────┘
                           │
                           │ (N cart items : 1 product)
                           ↓
┌──────────────────────────────────────────────────────────────┐
│                      PRODUCT TABLE                           │
├──────────────────────────────────────────────────────────────┤
│  id (PK)              │ bigint                               │
│  product_name         │ text                                 │
│  description          │ text                                 │
│  catergory            │ text                                 │
│  price                │ bigint                               │
│  quantity             │ bigint                               │
│  weight               │ bigint                               │
│  images               │ text[] (array)                       │
│  tags                 │ text                                 │
│  embedding            │ vector (for AI search)               │
│  in_stock             │ boolean                              │
│  created_at           │ timestamp                            │
└──────────────────────────────────────────────────────────────┘
```

---

## API Endpoints Flow

```
CUSTOMER MANAGEMENT
┌─────────────────────────────────────────────────────────────┐
│ POST   /api/customers                                        │
│ ├─ Input:  { customer_name, email, phone }                  │
│ ├─ Process: Generate unique QR code                         │
│ │           Generate QR code image (base64)                 │
│ │           Insert into Customer table                      │
│ └─ Output: { customer object, qrCodeImage }                 │
│                                                              │
│ GET    /api/customers                                        │
│ ├─ Input:  (none) or ?id=<uuid>                             │
│ ├─ Process: Fetch customer(s) from database                 │
│ │           Generate QR code image if specific customer     │
│ └─ Output: { customers array } or { customer, qrCodeImage } │
└─────────────────────────────────────────────────────────────┘

SESSION MANAGEMENT
┌─────────────────────────────────────────────────────────────┐
│ POST   /api/session                                          │
│ ├─ Input:  { customerQrCode }                               │
│ ├─ Process: Find customer by qr_code                        │
│ │           Check for existing active session               │
│ │           Create new session if none exists               │
│ └─ Output: { session, customer }                            │
│                                                              │
│ GET    /api/session?customerId=<uuid>                        │
│ ├─ Input:  customerId (query param)                         │
│ ├─ Process: Find active session for customer                │
│ └─ Output: { session with customer details }                │
│                                                              │
│ DELETE /api/session                                          │
│ ├─ Input:  { sessionId }                                    │
│ ├─ Process: Update session: is_active=false, ended_at=NOW() │
│ └─ Output: { success, session }                             │
└─────────────────────────────────────────────────────────────┘

CART MANAGEMENT
┌─────────────────────────────────────────────────────────────┐
│ POST   /api/cart                                             │
│ ├─ Input:  { customerId, productId, quantity }              │
│ ├─ Process: Verify active session                           │
│ │           Get product details                             │
│ │           Check if product already in cart                │
│ │           → If exists: Update quantity                    │
│ │           → If new: Insert cart item                      │
│ │           Calculate total_price                           │
│ └─ Output: { cartItem, product }                            │
│                                                              │
│ GET    /api/cart?customerId=<uuid>                           │
│ ├─ Input:  customerId (query param)                         │
│ ├─ Process: Fetch cart items for customer                   │
│ │           JOIN with Product table for details             │
│ │           Calculate grand total                           │
│ └─ Output: { cartItems, total, itemCount }                  │
│                                                              │
│ PUT    /api/cart                                             │
│ ├─ Input:  { cartItemId, quantity }                         │
│ ├─ Process: Get cart item with product                      │
│ │           Recalculate total_price                         │
│ │           Update cart item                                │
│ └─ Output: { cartItem }                                     │
│                                                              │
│ DELETE /api/cart                                             │
│ ├─ Input:  { cartItemId }                                   │
│ ├─ Process: Delete cart item from database                  │
│ └─ Output: { success }                                      │
└─────────────────────────────────────────────────────────────┘

QR CODE GENERATION
┌─────────────────────────────────────────────────────────────┐
│ GET    /api/qrcode/product?productId=<id>                    │
│ ├─ Input:  productId (query param)                          │
│ ├─ Process: Create QR data JSON                             │
│ │           Generate QR code image (base64)                 │
│ └─ Output: { qrCode (base64 image), productId }            │
└─────────────────────────────────────────────────────────────┘
```

---

## Component Hierarchy

```
App Root (layout.js)
│
├── Admin Routes (/admin/*)
│   │
│   ├── /admin/scan-shopping
│   │   └── ScanShoppingPage
│   │       ├── QRScanner (customer mode)
│   │       ├── QRScanner (product mode)
│   │       ├── Customer Info Display
│   │       ├── Cart Display Panel
│   │       └── Session Controls
│   │
│   ├── /admin/customers
│   │   └── CustomersPage
│   │       ├── Customer Form Modal
│   │       ├── Customer QR Modal
│   │       └── Customers Table
│   │
│   └── /admin/products
│       └── ProductsPage
│           ├── Product Form
│           ├── Product QR Modal (NEW)
│           └── Products Grid
│
└── Customer Routes (/customer/*)
    │
    └── /customer/cart
        └── CustomerCartPage
            ├── Customer ID Input
            ├── Cart Items List
            └── Total Display
```

---

This visual workflow shows the complete journey from customer registration to cart viewing! 🎉
