# 🚀 How to Run Your Project

## Prerequisites
- Node.js installed
- Python 3.8+ installed
- Supabase account with Product table created

## Step 1: Start the Python Embeddings Service

Open a terminal and run:
```bash
cd python-services/embeddings-service
pip install -r requirements.txt
uvicorn app:app --host 0.0.0.0 --port 8000
```

The embeddings service will start on **http://localhost:8000**

You can test it by visiting:
- http://localhost:8000 - Welcome message
- http://localhost:8000/health - Health check

## Step 2: Start Your Next.js Web Application

Open another terminal and run:
```bash
npm run dev
```

Your Next.js app will start on **http://localhost:3000**

## 🎯 Adding Products - Yes, They Go to Supabase!

### How to Add Products as Admin:

1. **Navigate to Admin Panel**: Go to your admin dashboard (typically `/admin/products` or similar)

2. **Fill in Product Details**:
   - Product Name
   - Description
   - Category (typo: "catergory" in database)
   - Price
   - Quantity
   - Weight
   - Tags (optional)
   - Upload Images (multiple supported)

3. **Click Submit**

### What Happens Behind the Scenes:

```
Your Form → API Route (/api/products POST) 
           ↓
    Upload Images to Cloudinary
           ↓
    Get Cloudinary URLs
           ↓
    Generate Text Embedding (Python Service)
           ↓
    Save to Supabase Products Table
           ↓
    ✅ Product Created!
```

### Product Data Stored in Supabase:

```javascript
{
  id: 1,                          // Auto-increment
  product_name: "iPhone 15",
  description: "Latest model...",
  catergory: "Electronics",
  qrcode: "PROD-001",            // Auto-generated
  price: 999,
  quantity: 50,
  weight: 200,
  images: [                       // Cloudinary URLs
    "https://res.cloudinary.com/...",
    "https://res.cloudinary.com/..."
  ],
  in_stock: true,
  tags: "smartphone, apple, 5G",
  embedding: [0.123, -0.456, ...] // 384-dimensional vector
}
```

## 🔍 API Endpoints Available:

### Products API (`/api/products`):

- **GET** `/api/products` - Get all products
  - Optional: `?search=phone` - Semantic search using embeddings
  - Optional: `?category=Electronics` - Filter by category

- **POST** `/api/products` - Create new product (Admin only)
  ```json
  {
    "product_name": "iPhone 15",
    "description": "Latest model",
    "catergory": "Electronics",
    "price": 999,
    "quantity": 50,
    "weight": 200,
    "tags": "smartphone, apple",
    "images": [File, File]  // multipart/form-data
  }
  ```

- **PUT** `/api/products` - Update product
  ```json
  {
    "id": 1,
    "product_name": "Updated Name",
    "price": 899
  }
  ```

- **DELETE** `/api/products?id=1` - Delete product

## 📊 Verification

### Check in Supabase:
1. Go to https://qdwsqbzlhyxhebdlqath.supabase.co
2. Navigate to **Table Editor**
3. Select **Product** table
4. You'll see your products with:
   - All product details
   - Cloudinary image URLs in `images` array
   - Vector embeddings in `embedding` column

### Test Semantic Search:
```bash
GET /api/products?search=mobile phone
# Will find "iPhone", "Samsung Galaxy", etc. even if exact words don't match
```

## 🔐 Authentication Required

To add products, you need to be logged in as an admin:
1. Login via `/api/auth/login`
2. Get JWT token
3. Include in Authorization header: `Bearer <token>`
4. Your role must be "admin" in users table

## 🛠️ Troubleshooting

### Python Service Not Starting:
```bash
# Check if port 8000 is in use
netstat -ano | findstr :8000

# Kill the process if needed
taskkill /PID <process_id> /F
```

### Next.js Errors:
```bash
# Clear cache and restart
rm -rf .next
npm run dev
```

### Images Not Uploading:
- Check Cloudinary credentials in `.env.local`
- Verify API key and secret are correct

### Embeddings Not Generated:
- Ensure Python service is running on port 8000
- Check `PYTHON_EMBEDDINGS_SERVICE_URL` in `.env.local`

## 📝 Quick Commands Reference

```bash
# Start Python Embeddings Service
cd python-services/embeddings-service && uvicorn app:app --port 8000

# Start Next.js (in another terminal)
npm run dev

# Both services must be running for product creation to work!
```

## ✅ Success Indicators

- ✅ Python service: http://localhost:8000 shows welcome message
- ✅ Next.js: http://localhost:3000 loads
- ✅ Product added → Check Supabase Products table
- ✅ Images uploaded → Check Cloudinary media library
- ✅ Embeddings generated → Check `embedding` column in Supabase

---

**Yes, your products will go directly to Supabase Products table!** 🎉
