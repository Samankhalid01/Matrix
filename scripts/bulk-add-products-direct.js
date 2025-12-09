import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';

// Supabase configuration
const supabaseUrl = 'https://qdwsqbzlhyxhebdlqath.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkd3NxYnpsaHl4aGViZGxxYXRoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDQwMDMxNSwiZXhwIjoyMDc1OTc2MzE1fQ.gJwFLaQuM4XNYcrBIIPDITKy3rkEDcidgpj6a-Xd8xc';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Embeddings service URL
const EMBEDDINGS_SERVICE_URL = 'http://localhost:8000';

// Dummy image URL (Cloudinary placeholder)
const DUMMY_IMAGE = 'https://via.placeholder.com/300x300.png?text=Product+Image';

// Product categories
const CATEGORIES = [
  'Beverages',
  'Snacks',
  'Dairy',
  'Bakery',
  'Frozen Foods',
  'Canned Goods',
  'Personal Care',
  'Household',
  'Fresh Produce',
  'Meat & Seafood'
];

// Sample product templates for each category
const PRODUCT_TEMPLATES = {
  'Beverages': [
    { name: 'Cola', tags: 'soda, cola, drink, cold, refreshing, carbonated', price: 50, weight: 330 },
    { name: 'Orange Juice', tags: 'juice, orange, fresh, vitamin c, healthy, breakfast', price: 120, weight: 1000 },
    { name: 'Water', tags: 'water, hydration, pure, mineral, healthy, essential', price: 30, weight: 500 },
    { name: 'Green Tea', tags: 'tea, green, healthy, antioxidant, hot, beverage', price: 80, weight: 200 },
    { name: 'Coffee', tags: 'coffee, caffeine, hot, morning, espresso, beverage', price: 150, weight: 250 }
  ],
  'Snacks': [
    { name: 'Potato Chips', tags: 'chips, snack, crispy, salty, potato, crunchy', price: 60, weight: 100 },
    { name: 'Chocolate Bar', tags: 'chocolate, sweet, snack, cocoa, dessert, candy', price: 80, weight: 50 },
    { name: 'Cookies', tags: 'cookies, biscuit, sweet, snack, baked, crispy', price: 100, weight: 200 },
    { name: 'Nuts Mix', tags: 'nuts, healthy, protein, snack, mixed, crunchy', price: 200, weight: 150 },
    { name: 'Popcorn', tags: 'popcorn, snack, movie, butter, salty, light', price: 70, weight: 100 }
  ],
  'Dairy': [
    { name: 'Milk', tags: 'milk, dairy, fresh, calcium, protein, drink', price: 90, weight: 1000 },
    { name: 'Yogurt', tags: 'yogurt, dairy, probiotic, healthy, breakfast, snack', price: 60, weight: 200 },
    { name: 'Cheese', tags: 'cheese, dairy, protein, calcium, cooking, pizza', price: 250, weight: 200 },
    { name: 'Butter', tags: 'butter, dairy, cooking, spread, baking, fat', price: 180, weight: 200 },
    { name: 'Cream', tags: 'cream, dairy, cooking, dessert, whipped, rich', price: 120, weight: 250 }
  ],
  'Bakery': [
    { name: 'White Bread', tags: 'bread, bakery, fresh, wheat, sandwich, breakfast', price: 40, weight: 400 },
    { name: 'Croissant', tags: 'croissant, bakery, pastry, butter, breakfast, flaky', price: 100, weight: 80 },
    { name: 'Bagel', tags: 'bagel, bakery, bread, breakfast, sandwich, round', price: 50, weight: 100 },
    { name: 'Muffin', tags: 'muffin, bakery, sweet, breakfast, snack, cupcake', price: 80, weight: 120 },
    { name: 'Donut', tags: 'donut, bakery, sweet, dessert, glazed, fried', price: 60, weight: 80 }
  ],
  'Frozen Foods': [
    { name: 'Frozen Pizza', tags: 'pizza, frozen, quick, meal, cheese, italian', price: 300, weight: 500 },
    { name: 'Ice Cream', tags: 'ice cream, frozen, dessert, sweet, cold, creamy', price: 250, weight: 500 },
    { name: 'Frozen Vegetables', tags: 'vegetables, frozen, healthy, mixed, convenient, nutrition', price: 150, weight: 400 },
    { name: 'Fish Fingers', tags: 'fish, frozen, seafood, quick, meal, crispy', price: 280, weight: 300 },
    { name: 'Frozen Fries', tags: 'fries, frozen, potato, quick, side, crispy', price: 120, weight: 500 }
  ],
  'Canned Goods': [
    { name: 'Canned Tomatoes', tags: 'tomatoes, canned, cooking, sauce, italian, preserved', price: 70, weight: 400 },
    { name: 'Canned Tuna', tags: 'tuna, canned, fish, protein, omega3, seafood', price: 150, weight: 180 },
    { name: 'Canned Beans', tags: 'beans, canned, protein, fiber, cooking, legume', price: 60, weight: 400 },
    { name: 'Canned Corn', tags: 'corn, canned, vegetable, sweet, side, preserved', price: 50, weight: 340 },
    { name: 'Soup Can', tags: 'soup, canned, meal, quick, hot, convenient', price: 90, weight: 300 }
  ],
  'Personal Care': [
    { name: 'Shampoo', tags: 'shampoo, hair, care, clean, wash, hygiene', price: 200, weight: 400 },
    { name: 'Soap', tags: 'soap, clean, hygiene, bath, wash, antibacterial', price: 50, weight: 100 },
    { name: 'Toothpaste', tags: 'toothpaste, dental, hygiene, fresh, clean, mint', price: 100, weight: 150 },
    { name: 'Deodorant', tags: 'deodorant, hygiene, fresh, scent, antiperspirant, daily', price: 150, weight: 150 },
    { name: 'Hand Lotion', tags: 'lotion, skin, care, moisturizer, hand, soft', price: 180, weight: 200 }
  ],
  'Household': [
    { name: 'Dish Soap', tags: 'dish soap, cleaning, kitchen, wash, detergent, clean', price: 80, weight: 500 },
    { name: 'Laundry Detergent', tags: 'detergent, laundry, clean, wash, clothes, fresh', price: 350, weight: 1000 },
    { name: 'Toilet Paper', tags: 'toilet paper, hygiene, bathroom, soft, tissue, essential', price: 120, weight: 400 },
    { name: 'Paper Towels', tags: 'paper towels, cleaning, absorbent, kitchen, convenient, wipe', price: 100, weight: 300 },
    { name: 'Garbage Bags', tags: 'garbage bags, trash, waste, kitchen, cleaning, disposable', price: 150, weight: 200 }
  ],
  'Fresh Produce': [
    { name: 'Apples', tags: 'apple, fruit, fresh, healthy, vitamin, organic', price: 150, weight: 500 },
    { name: 'Bananas', tags: 'banana, fruit, fresh, potassium, healthy, tropical', price: 100, weight: 500 },
    { name: 'Tomatoes', tags: 'tomato, vegetable, fresh, cooking, salad, healthy', price: 80, weight: 500 },
    { name: 'Lettuce', tags: 'lettuce, vegetable, fresh, salad, green, healthy', price: 60, weight: 300 },
    { name: 'Carrots', tags: 'carrot, vegetable, fresh, healthy, vitamin a, orange', price: 70, weight: 500 }
  ],
  'Meat & Seafood': [
    { name: 'Chicken Breast', tags: 'chicken, meat, protein, fresh, lean, cooking', price: 400, weight: 500 },
    { name: 'Ground Beef', tags: 'beef, meat, protein, ground, cooking, burger', price: 500, weight: 500 },
    { name: 'Salmon Fillet', tags: 'salmon, fish, seafood, omega3, protein, fresh', price: 800, weight: 300 },
    { name: 'Shrimp', tags: 'shrimp, seafood, protein, fresh, cooking, crustacean', price: 600, weight: 250 },
    { name: 'Bacon', tags: 'bacon, pork, meat, breakfast, crispy, smoked', price: 350, weight: 200 }
  ]
};

// Generate embedding for a product
async function generateEmbedding(productData) {
  try {
    const response = await fetch(`${EMBEDDINGS_SERVICE_URL}/embed/product`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        product_name: productData.product_name,
        description: productData.description || '',
        category: productData.catergory || '',
        tags: productData.tags || ''
      })
    });

    if (!response.ok) {
      console.warn('⚠️ Embedding service not available, skipping embeddings');
      return null;
    }

    const data = await response.json();
    return data.embedding;
  } catch (error) {
    console.warn('⚠️ Failed to generate embedding:', error.message);
    return null;
  }
}

// Generate 150 products
function generateProducts() {
  const products = [];
  let productCount = 0;
  
  // Generate 15 products per category (10 categories × 15 = 150)
  for (const category of CATEGORIES) {
    const templates = PRODUCT_TEMPLATES[category];
    
    for (let i = 0; i < 15; i++) {
      const template = templates[i % templates.length];
      const suffix = Math.floor(i / templates.length) > 0 ? ` ${String.fromCharCode(65 + Math.floor(i / templates.length))}` : '';
      
      products.push({
        product_name: `${template.name}${suffix}`,
        description: `High quality ${template.name.toLowerCase()} available in store. Perfect for daily use.`,
        catergory: category,
        price: template.price + (Math.floor(i / templates.length) * 10),
        quantity: 50 + Math.floor(Math.random() * 100),
        weight: template.weight,
        tags: template.tags,
        images: [DUMMY_IMAGE],
        in_stock: true
      });
      productCount++;
    }
  }
  
  return products;
}

// Main function to add products
async function bulkAddProducts() {
  console.log('🚀 Starting bulk product addition...\n');
  
  // Check embeddings service
  console.log('🔍 Checking embeddings service...');
  try {
    const healthCheck = await fetch(`${EMBEDDINGS_SERVICE_URL}/health`);
    if (healthCheck.ok) {
      console.log('✅ Embeddings service is online\n');
    }
  } catch (error) {
    console.log('⚠️ Embeddings service is offline - products will be added without embeddings\n');
  }
  
  const products = generateProducts();
  console.log(`📦 Generated ${products.length} products\n`);
  
  let successCount = 0;
  let failCount = 0;
  let embeddingCount = 0;
  
  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    const progress = ((i + 1) / products.length * 100).toFixed(1);
    
    try {
      // Generate embedding
      const embedding = await generateEmbedding(product);
      if (embedding) {
        embeddingCount++;
        product.embedding = embedding;
      }
      
      // Insert into database
      const { data, error } = await supabase
        .from('Product')
        .insert([product])
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      successCount++;
      console.log(`✅ [${progress}%] Added: ${product.product_name} (ID: ${data.id})${embedding ? ' with embedding' : ''}`);
      
    } catch (error) {
      failCount++;
      console.error(`❌ [${progress}%] Failed: ${product.product_name} - ${error.message}`);
    }
    
    // Small delay to avoid overwhelming the services
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 BULK ADD SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Successfully added: ${successCount} products`);
  console.log(`🧠 Embeddings generated: ${embeddingCount} products`);
  console.log(`❌ Failed: ${failCount} products`);
  console.log('='.repeat(60));
  console.log('\n✨ You can now edit the images for each product in the admin panel!');
}

// Run the script
bulkAddProducts().catch(console.error);