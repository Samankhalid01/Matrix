# Bulk Product Addition Script

This script adds 150 products to your database with dummy images and generates embeddings automatically.

## 📋 What it does:

- Adds **150 products** across **10 categories**
- Each product gets:
  - ✅ A placeholder image (you can edit later)
  - ✅ Product name, description, price, quantity, weight
  - ✅ Relevant tags for recommendations
  - ✅ AI embeddings (if embeddings service is running)

## 🏷️ Categories (15 products each):

1. **Beverages** - Cola, Juice, Water, Tea, Coffee, etc.
2. **Snacks** - Chips, Chocolate, Cookies, Nuts, Popcorn, etc.
3. **Dairy** - Milk, Yogurt, Cheese, Butter, Cream, etc.
4. **Bakery** - Bread, Croissant, Bagel, Muffin, Donut, etc.
5. **Frozen Foods** - Pizza, Ice Cream, Vegetables, Fish, Fries, etc.
6. **Canned Goods** - Tomatoes, Tuna, Beans, Corn, Soup, etc.
7. **Personal Care** - Shampoo, Soap, Toothpaste, Deodorant, Lotion, etc.
8. **Household** - Dish Soap, Detergent, Toilet Paper, Paper Towels, etc.
9. **Fresh Produce** - Apples, Bananas, Tomatoes, Lettuce, Carrots, etc.
10. **Meat & Seafood** - Chicken, Beef, Salmon, Shrimp, Bacon, etc.

## 🚀 How to Run:

### Step 1: Install Dependencies
```bash
cd scripts
npm install
```

### Step 2: (Optional) Start Embeddings Service
If you want embeddings generated automatically:
```bash
cd ../python-services/embeddings-service
python app.py
```

### Step 3: Run the Script
```bash
cd ../scripts
npm run bulk-add
```

Or directly:
```bash
node bulk-add-products-direct.js
```

## 📊 Output Example:

```
🚀 Starting bulk product addition...

🔍 Checking embeddings service...
✅ Embeddings service is online

📦 Generated 150 products

✅ [0.7%] Added: Cola (ID: 123) with embedding
✅ [1.3%] Added: Orange Juice (ID: 124) with embedding
...
✅ [100.0%] Added: Bacon C (ID: 272) with embedding

============================================================
📊 BULK ADD SUMMARY
============================================================
✅ Successfully added: 150 products
🧠 Embeddings generated: 150 products
❌ Failed: 0 products
============================================================

✨ You can now edit the images for each product in the admin panel!
```

## 📝 Next Steps:

1. Go to your admin panel: `http://localhost:3001/admin/products`
2. Edit each product to:
   - Upload real product images
   - Adjust prices, quantities, descriptions
   - Add more specific tags

## ⚙️ Configuration:

The script uses:
- **Supabase URL**: `https://qdwsqbzlhyxhebdlqath.supabase.co`
- **Service Role Key**: From your Supabase dashboard
- **Embeddings Service**: `http://localhost:8000`
- **Dummy Image**: `https://via.placeholder.com/300x300.png?text=Product+Image`

## 🔧 Customization:

You can edit `bulk-add-products-direct.js` to:
- Change the number of products
- Modify categories
- Update product templates
- Change dummy image URL
- Adjust prices, weights, quantities

## ⚠️ Notes:

- The script adds products with a 100ms delay between each to avoid overwhelming the database
- If embeddings service is offline, products will be added without embeddings (you can generate them later)
- All products get `in_stock: true` by default
- Quantities are randomly set between 50-150 units
