# QR Shopping System - Frontend Locations

## 📍 Main Features Location Guide

### 1. **QR Scanner Page** (Admin Panel)
**URL:** `http://localhost:3000/admin/scan-shopping`
**File:** `/src/app/admin/scan-shopping/page.jsx`
**Access:** Click "QR Shopping" in the left sidebar (📱 icon)

**What it does:**
- ✅ Scan customer QR codes to start shopping session
- ✅ Scan product QR codes to add items to cart
- ✅ Real-time cart display showing all scanned products
- ✅ Session management (end session button)

**Features:**
- Two-panel layout: Scanner on left, Cart on right
- Live webcam QR scanning
- Automatic session creation on customer scan
- Instant cart updates on product scan
- Total price calculation

---

### 2. **Customer Cart View** (Mobile/Customer Side)
**URL:** `http://localhost:3000/customer/cart?customerId=XXX`
**File:** `/src/app/customer/cart/page.jsx`

**What it does:**
- 📱 Customer views their shopping cart in real-time
- Shows all products added by admin
- Displays quantities, prices, and total
- Updates automatically as admin scans products

---

### 3. **Debug QR Scanner** (Testing)
**URL:** `http://localhost:3000/admin/test-qr`
**File:** `/src/app/admin/test-qr/page.jsx`

**What it does:**
- 🔍 Test and decode any QR code
- Shows exact QR code contents
- Helps debug customer QR mismatches
- Displays JSON structure if applicable

---

## 🔗 Related Pages

### 4. **Customer Management**
**URL:** `http://localhost:3000/admin/customers`
**Features:**
- View all customers
- Generate customer QR codes
- Download QR codes as images
- Add new customers

### 5. **Product Management**
**URL:** `http://localhost:3000/admin/products`
**Features:**
- View all products
- Generate product QR codes
- Manage inventory
- Add new products

---

## 📊 Backend API Endpoints

### Session Management
- **POST** `/api/session` - Create new shopping session
- **GET** `/api/session?customerId=XXX` - Get active session
- **DELETE** `/api/session?sessionId=XXX` - End session

### Cart Management
- **POST** `/api/cart` - Add product to cart
- **GET** `/api/cart?customerId=XXX` - Get customer cart
- **PUT** `/api/cart?id=XXX` - Update cart item quantity
- **DELETE** `/api/cart?id=XXX` - Remove cart item

### QR Code Generation
- **GET** `/api/qrcode/product?productId=XXX` - Generate product QR
- **GET** `/api/qrcode/customer?customerId=XXX` - Generate customer QR

---

## 🎯 Complete Workflow

### For Admin:
1. Login → http://localhost:3000/login
   - Username: `Saman`
   - Password: `1234`

2. Click **"QR Shopping"** in sidebar (📱)

3. **Scan Customer QR Code**
   - Point camera at customer's QR code
   - Session starts automatically
   - Customer info displays on screen

4. **Scan Product QR Codes**
   - Point camera at product QR codes
   - Products add to cart automatically
   - Quantities update if same product scanned twice
   - Cart displays with running total

5. **End Session**
   - Click "End Session" button
   - Cart clears
   - Ready for next customer

### For Customer:
1. Receive QR code from admin (contains customer ID)

2. Open cart view:
   - `http://localhost:3000/customer/cart?customerId=YOUR_ID`
   - Or get link from admin panel

3. Watch cart update in real-time as admin scans products

4. Review final cart before checkout

---

## 🛠️ Troubleshooting

### "Customer Not Found" Error
**Fix:** Use debug scanner first
1. Go to http://localhost:3000/admin/test-qr
2. Scan your customer QR code
3. Copy the displayed value
4. Update database:
   ```sql
   UPDATE "Customer" 
   SET qr_code = 'VALUE_FROM_TEST_PAGE' 
   WHERE id = YOUR_CUSTOMER_ID;
   ```

### Nested Sidebar Issue
**Fixed:** The scan-shopping page now loads without DashboardLayout wrapper

### Camera Not Working
- Grant browser camera permissions
- Check if camera is in use by another app
- Try different browser (Chrome recommended)

---

## 📝 Database Tables

### Customer
- `id` - Unique customer identifier
- `customer_name` - Customer name
- `email` - Email address
- `phone` - Phone number
- `qr_code` - QR code value (must match scanned code!)

### ShoppingSession
- `id` - Session identifier
- `customer_id` - Links to Customer
- `started_at` - Session start time
- `ended_at` - Session end time (null if active)
- `is_active` - Boolean flag

### Cart
- `id` - Cart item identifier
- `customer_id` - Links to Customer
- `product_id` - Links to Product
- `quantity` - Item quantity
- `unit_price` - Price per unit
- `total_price` - Calculated total

---

## 🚀 Quick Access Links

**Main Scanner:** http://localhost:3000/admin/scan-shopping
**Debug Scanner:** http://localhost:3000/admin/test-qr
**Customer View:** http://localhost:3000/customer/cart?customerId=XXX
**Customers:** http://localhost:3000/admin/customers
**Products:** http://localhost:3000/admin/products

---

## 📱 Sidebar Navigation

The **"QR Shopping"** option is now in your left sidebar with a 📱 icon:
- Dashboard 📊
- **QR Shopping 📱** ← NEW!
- Products 📦
- Customer Management 👥
- Analytics 📈
- Generate Ad Images 🎨
- Notifications 🔔
