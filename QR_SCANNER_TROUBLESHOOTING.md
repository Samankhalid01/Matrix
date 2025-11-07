# 🛒 QR Shopping Scanner - Troubleshooting & Testing Guide

## ❓ **Your Questions Answered**

### **1. Should I add more products for demand prediction?**

**Answer: YES! More products = Better predictions**

The demand prediction system **automatically works with ANY number of products**. Currently:
- ✅ You have **5 products** → Generates **15 forecasts** (5 products × 3 months)
- ✅ If you add **50 products** → Generates **150 forecasts** (50 × 3 months)
- ✅ If you add **100 products** → Generates **300 forecasts** (100 × 3 months)

**How it works:**
```javascript
// Script automatically fetches ALL products from database
const { data: products } = await supabase
  .from('Product')
  .select('id, product_name, category, price');

console.log(`📦 Found ${products.length} products`);
// Generates forecasts for EVERY product
```

**To add more products and regenerate forecasts:**
1. Add products to your database (using admin panel or API)
2. Run: `node scripts/generate-demand-forecast.js`
3. Visit: `http://localhost:3000/admin/demand-prediction`
4. See forecasts for ALL products!

**Benefits of more products:**
- ✅ More comprehensive analytics
- ✅ Better category-level insights
- ✅ More accurate performance reports
- ✅ Better top-selling/underperforming analysis

---

### **2. Why are products not being added when scanning QR codes?**

**Issue:** Products not appearing in cart after scanning product QR code

**Possible Causes & Solutions:**

---

## 🔍 **Debugging Steps**

### **Step 1: Check Browser Console**

1. Open the page: `http://localhost:3000/admin/scan-shopping`
2. Open browser console (F12 or Right-click → Inspect → Console tab)
3. Scan a customer QR code
4. Then scan a product QR code
5. Look for these debug messages:

```
📦 Raw QR Data: [the scanned data]
📦 Parsed JSON, Product ID: [number] OR
📦 Direct Product ID: [number]
📦 Sending to API - Customer ID: [number] Product ID: [number]
📦 API Response: {...}
```

**What to look for:**
- ✅ Product ID should be a number (e.g., 1, 2, 3)
- ✅ API Response should have `success: true`
- ❌ If you see `success: false`, check the error message

---

### **Step 2: Verify Products Exist in Database**

Check if products actually exist with valid IDs:

```powershell
# Test with curl
curl "http://localhost:3000/api/products" | ConvertFrom-Json
```

**Expected output:**
```json
{
  "success": true,
  "products": [
    {
      "id": 1,
      "product_name": "coke",
      "price": 50.00,
      "qr_code": "some-qr-code"
    }
  ]
}
```

**Note the product IDs** - these are what should be in the QR codes!

---

### **Step 3: Check Product QR Code Format**

Product QR codes should contain **just the product ID** (e.g., "1", "2", "3")

**Test your QR codes:**
1. Generate a product QR code
2. Use any QR scanner app to read it
3. It should show a number like `1` or `2` or `3`

**If QR code shows JSON:**
```json
{"id": 1}
```
That's fine too - the scanner handles both formats!

---

### **Step 4: Verify Shopping Session is Active**

The cart API **requires an active shopping session**.

**Check if session exists:**
1. Scan customer QR code first
2. You should see: "Welcome [Customer Name]! Ready to scan products."
3. Then scan product QR code

**Common Error:**
```
"No active shopping session. Please scan customer QR code first."
```

**Solution:** Always scan customer QR code BEFORE scanning products!

---

### **Step 5: Test API Directly**

Test if the cart API works manually:

```powershell
# First, create a shopping session (replace with actual customer ID)
curl -Method POST `
  -Uri "http://localhost:3000/api/session" `
  -Headers @{"Content-Type"="application/json"} `
  -Body '{"customerQrCode":"customer@example.com"}' | ConvertFrom-Json

# Then add product to cart (use actual customer ID and product ID)
curl -Method POST `
  -Uri "http://localhost:3000/api/cart" `
  -Headers @{"Content-Type"="application/json"} `
  -Body '{"customerId":1,"productId":1,"quantity":1}' | ConvertFrom-Json
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Product added to cart",
  "product": {
    "id": 1,
    "product_name": "coke",
    "price": 50.00
  }
}
```

---

## 🎯 **Complete Testing Workflow**

### **1. Start the Server**
```powershell
npm run dev
```

### **2. Open QR Scanner Page**
```
http://localhost:3000/admin/scan-shopping
```

### **3. Test Customer Scanning**
1. Click "Start Scanning Customer"
2. Scan a customer QR code (should contain email)
3. ✅ You should see: "Welcome [Name]! Ready to scan products."
4. ✅ Customer info box should appear (green)

### **4. Test Product Scanning**
1. After customer is scanned, click "Scan Next Product"
2. Scan a product QR code (should contain product ID like "1")
3. **Open browser console (F12)** to see debug logs:
   ```
   📦 Raw QR Data: 1
   📦 Direct Product ID: 1
   📦 Sending to API - Customer ID: 1 Product ID: 1
   📦 API Response: {success: true, ...}
   ```
4. ✅ You should see: "✓ [Product Name] added to cart!"
5. ✅ Product should appear in right panel (Shopping Cart)
6. ✅ Total should update

### **5. Test Multiple Products**
1. Scan another product QR code
2. Product should be added
3. If you scan the same product again, quantity should increase

### **6. End Session**
1. Click "End Session & Save Cart"
2. ✅ Cart should be saved for customer
3. ✅ Session should end
4. ✅ Scanner should reset to "Scan Customer QR"

---

## 🐛 **Common Issues & Solutions**

### **Issue 1: "No active shopping session"**
**Cause:** Trying to scan product before scanning customer
**Solution:** Always scan customer QR code FIRST!

---

### **Issue 2: "Product not found"**
**Cause:** Product ID in QR code doesn't exist in database
**Solution:**
1. Check what products exist: `curl http://localhost:3000/api/products`
2. Verify QR code contains valid product ID
3. Regenerate QR codes if needed

---

### **Issue 3: Product name shows as "Product" instead of actual name**
**Cause:** Database column mismatch
**Fix Applied:** ✅ Code now uses `product.product_name`

---

### **Issue 4: Nothing happens when scanning**
**Causes:**
1. Camera permission not granted
2. QR code not readable
3. JavaScript errors

**Solutions:**
1. Check browser console for errors
2. Allow camera access when prompted
3. Ensure QR code is clear and not blurry
4. Try using a different QR code

---

### **Issue 5: Cart doesn't update after adding product**
**Causes:**
1. API call failed
2. Product ID invalid
3. Session expired

**Debug:**
1. Open browser console (F12)
2. Look for API error messages
3. Check Network tab for failed requests
4. Look for console.error messages

---

## 📋 **Verification Checklist**

Before testing, ensure:
- [ ] Products exist in database with valid IDs
- [ ] Customers exist in database with emails
- [ ] Customer QR codes contain valid emails
- [ ] Product QR codes contain valid product IDs (numbers)
- [ ] ShoppingSession table exists in database
- [ ] Cart table exists in database
- [ ] Camera permission granted to browser

---

## 🔧 **Debug Mode Enabled**

I've added console logging to help you debug:

**When you scan a product QR code, you'll see:**
```javascript
📦 Raw QR Data: 1
📦 Direct Product ID: 1
📦 Sending to API - Customer ID: 1 Product ID: 1
📦 API Response: {success: true, product: {...}}
✓ coke added to cart!
```

**If something fails:**
```javascript
❌ Failed to add product: Product not found
```

---

## 🧪 **Manual Testing Steps**

### **Test 1: Verify Product IDs**
```powershell
curl http://localhost:3000/api/products | ConvertFrom-Json | Select-Object -ExpandProperty products | Select-Object id, product_name
```

### **Test 2: Verify Customer Emails**
```powershell
curl http://localhost:3000/api/customers | ConvertFrom-Json
```

### **Test 3: Check Active Sessions**
```powershell
# This would require a session API endpoint
# Currently sessions are managed internally
```

---

## 💡 **Tips for Success**

1. **Always scan customer first** - This creates the shopping session
2. **Check console for errors** - F12 → Console tab
3. **Verify product IDs match** - QR code should contain actual product ID from database
4. **Use clear QR codes** - Blurry codes won't scan
5. **Grant camera permission** - Browser needs access to camera
6. **Test with one product first** - Ensure basic flow works before scanning multiple

---

## 📊 **Expected Behavior**

### **Correct Flow:**
```
1. Open page → "Scan customer QR code to start"
2. Scan customer → "Welcome [Name]! Ready to scan products."
3. Scan product → "✓ [Product] added to cart!"
4. Cart updates → Shows product, quantity, price
5. Scan more products → Cart updates each time
6. End session → "Session ended. Cart saved for customer."
7. Reset → Back to step 1
```

### **Cart Display:**
```
Shopping Cart
━━━━━━━━━━━━━━━━━━━━━━
coke
$50.00 × 2
              $100.00
━━━━━━━━━━━━━━━━━━━━━━
Lays
$30.00 × 1
               $30.00
━━━━━━━━━━━━━━━━━━━━━━
Total:        $130.00
2 item(s)
```

---

## 🚀 **Next Steps**

1. **Test the scanner** with debug console open
2. **Check what errors appear** in console
3. **Verify product IDs** match between database and QR codes
4. **Report specific error messages** if issues persist

**I've added detailed console logging to help you debug the issue! Open the page, scan some QR codes, and check what the console says.** 🔍
