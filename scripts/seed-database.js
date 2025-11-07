/**
 * MATRIX: Data Seeding Script
 * Generates realistic historical data for testing
 * Run this after creating database schema
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Configure Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// ============================================
// SAMPLE DATA CONFIGURATION
// ============================================

const SAMPLE_PRODUCTS = [
  { product_name: 'Milk 1L', category: 'Dairy', price: 3.99, cost_price: 2.50, current_stock: 45, min_stock_threshold: 20, supplier: 'Local Dairy Farm' },
  { product_name: 'Bread Loaf', category: 'Bakery', price: 2.49, cost_price: 1.20, current_stock: 30, min_stock_threshold: 15, supplier: 'Fresh Bakery Co' },
  { product_name: 'Eggs (12 pack)', category: 'Dairy', price: 5.99, cost_price: 3.50, current_stock: 8, min_stock_threshold: 10, supplier: 'Local Farms' },
  { product_name: 'Apples (1kg)', category: 'Fruits', price: 4.50, cost_price: 2.80, current_stock: 60, min_stock_threshold: 20, supplier: 'Fruit Distributors' },
  { product_name: 'Bananas (1kg)', category: 'Fruits', price: 3.20, cost_price: 1.90, current_stock: 75, min_stock_threshold: 25, supplier: 'Tropical Imports' },
  { product_name: 'Chicken Breast (1kg)', category: 'Meat', price: 12.99, cost_price: 8.50, current_stock: 25, min_stock_threshold: 10, supplier: 'Premium Meats' },
  { product_name: 'Rice (5kg)', category: 'Grains', price: 15.99, cost_price: 10.00, current_stock: 40, min_stock_threshold: 15, supplier: 'Grain Wholesale' },
  { product_name: 'Pasta (500g)', category: 'Grains', price: 2.99, cost_price: 1.50, current_stock: 55, min_stock_threshold: 20, supplier: 'Italian Foods' },
  { product_name: 'Tomatoes (1kg)', category: 'Vegetables', price: 4.20, cost_price: 2.50, current_stock: 35, min_stock_threshold: 15, supplier: 'Local Produce' },
  { product_name: 'Potatoes (2kg)', category: 'Vegetables', price: 5.50, cost_price: 3.20, current_stock: 50, min_stock_threshold: 20, supplier: 'Farm Direct' },
  { product_name: 'Orange Juice (1L)', category: 'Beverages', price: 4.99, cost_price: 3.00, current_stock: 5, min_stock_threshold: 10, supplier: 'Juice Factory' },
  { product_name: 'Coffee (250g)', category: 'Beverages', price: 8.99, cost_price: 5.50, current_stock: 22, min_stock_threshold: 10, supplier: 'Coffee Roasters' },
  { product_name: 'Tea Bags (100 pack)', category: 'Beverages', price: 6.50, cost_price: 4.00, current_stock: 18, min_stock_threshold: 10, supplier: 'Tea Importers' },
  { product_name: 'Butter (500g)', category: 'Dairy', price: 7.99, cost_price: 5.00, current_stock: 15, min_stock_threshold: 8, supplier: 'Dairy Products Inc' },
  { product_name: 'Cheese (400g)', category: 'Dairy', price: 9.99, cost_price: 6.50, current_stock: 20, min_stock_threshold: 10, supplier: 'Cheese Factory' },
  { product_name: 'Yogurt (500g)', category: 'Dairy', price: 4.50, cost_price: 2.80, current_stock: 28, min_stock_threshold: 15, supplier: 'Fresh Dairy' },
  { product_name: 'Cereal (500g)', category: 'Breakfast', price: 5.99, cost_price: 3.50, current_stock: 32, min_stock_threshold: 15, supplier: 'Breakfast Foods' },
  { product_name: 'Cookies (300g)', category: 'Snacks', price: 3.99, cost_price: 2.20, current_stock: 45, min_stock_threshold: 20, supplier: 'Snack Co' },
  { product_name: 'Chips (200g)', category: 'Snacks', price: 3.50, cost_price: 1.80, current_stock: 0, min_stock_threshold: 25, supplier: 'Crispy Snacks' },
  { product_name: 'Chocolate Bar', category: 'Snacks', price: 2.50, cost_price: 1.30, current_stock: 60, min_stock_threshold: 30, supplier: 'Sweet Treats' },
  { product_name: 'Soap (3 pack)', category: 'Personal Care', price: 6.99, cost_price: 4.00, current_stock: 25, min_stock_threshold: 10, supplier: 'Hygiene Supplies' },
  { product_name: 'Shampoo (400ml)', category: 'Personal Care', price: 8.50, cost_price: 5.50, current_stock: 18, min_stock_threshold: 8, supplier: 'Beauty Products' },
  { product_name: 'Toothpaste', category: 'Personal Care', price: 4.99, cost_price: 2.80, current_stock: 30, min_stock_threshold: 15, supplier: 'Dental Care Co' },
  { product_name: 'Tissue Box', category: 'Household', price: 3.20, cost_price: 1.80, current_stock: 40, min_stock_threshold: 20, supplier: 'Paper Products' },
  { product_name: 'Laundry Detergent (1L)', category: 'Household', price: 12.99, cost_price: 8.00, current_stock: 15, min_stock_threshold: 8, supplier: 'Cleaning Supplies' },
];

const SAMPLE_CUSTOMERS = [
  { name: 'Alice Johnson', email: 'alice.j@gmail.com', address: '123 Maple Street', customer_tier: 'PLATINUM' },
  { name: 'Bob Smith', email: 'bob.smith@gmail.com', address: '456 Oak Avenue', customer_tier: 'GOLD' },
  { name: 'Carol Williams', email: 'carol.w@yahoo.com', address: '789 Pine Road', customer_tier: 'GOLD' },
  { name: 'David Brown', email: 'david.brown@gmail.com', address: '321 Elm Street', customer_tier: 'SILVER' },
  { name: 'Emma Davis', email: 'emma.d@hotmail.com', address: '654 Birch Lane', customer_tier: 'SILVER' },
  { name: 'Frank Miller', email: 'frank.miller@gmail.com', address: '987 Cedar Drive', customer_tier: 'BRONZE' },
  { name: 'Grace Wilson', email: 'grace.w@gmail.com', address: '147 Spruce Court', customer_tier: 'BRONZE' },
  { name: 'Henry Moore', email: 'henry.m@yahoo.com', address: '258 Willow Way', customer_tier: 'BRONZE' },
  { name: 'Ivy Taylor', email: 'ivy.taylor@gmail.com', address: '369 Ash Boulevard', customer_tier: 'SILVER' },
  { name: 'Jack Anderson', email: 'jack.a@hotmail.com', address: '741 Poplar Street', customer_tier: 'GOLD' },
];

const PAYMENT_METHODS = ['cash', 'card', 'digital_wallet'];

// ============================================
// UTILITY FUNCTIONS
// ============================================

function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomDate(daysAgo) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString();
}

function getTierSpendingRange(tier) {
  switch (tier) {
    case 'PLATINUM': return { min: 80, max: 200 };
    case 'GOLD': return { min: 40, max: 100 };
    case 'SILVER': return { min: 20, max: 50 };
    case 'BRONZE': return { min: 10, max: 30 };
    default: return { min: 10, max: 30 };
  }
}

// ============================================
// SEEDING FUNCTIONS
// ============================================

async function seedProducts() {
  console.log('🌱 Seeding products...');
  
  const { data, error } = await supabase
    .from('Product')
    .insert(SAMPLE_PRODUCTS)
    .select();

  if (error) {
    console.error('❌ Error seeding products:', error);
    return [];
  }

  console.log(`✅ Created ${data.length} products`);
  return data;
}

async function seedCustomers() {
  console.log('🌱 Seeding customers...');
  
  const { data, error } = await supabase
    .from('Customer')
    .insert(SAMPLE_CUSTOMERS)
    .select();

  if (error) {
    console.error('❌ Error seeding customers:', error);
    return [];
  }

  console.log(`✅ Created ${data.length} customers`);
  return data;
}

async function seedTransactions(customers, products) {
  console.log('🌱 Seeding transactions (6 months of history)...');
  
  const transactions = [];
  const transactionItems = [];
  
  // Generate transactions over the last 6 months (180 days)
  for (let daysAgo = 180; daysAgo >= 0; daysAgo--) {
    // Random number of transactions per day (0-5)
    const transactionsPerDay = getRandomInt(0, 5);
    
    for (let i = 0; i < transactionsPerDay; i++) {
      const customer = getRandomElement(customers);
      const spendingRange = getTierSpendingRange(customer.customer_tier);
      
      // Determine number of items in this transaction (1-5)
      const itemCount = getRandomInt(1, 5);
      const items = [];
      let total = 0;
      
      for (let j = 0; j < itemCount; j++) {
        const product = getRandomElement(products);
        const quantity = getRandomInt(1, 3);
        const unitPrice = parseFloat(product.price);
        const itemTotal = quantity * unitPrice;
        
        items.push({
          product_id: product.id,
          product_name: product.product_name,
          quantity,
          unit_price: unitPrice,
          discount_applied: 0,
          total_price: itemTotal
        });
        
        total += itemTotal;
      }
      
      // Apply tier discount
      const tierConfig = {
        'PLATINUM': 0.20,
        'GOLD': 0.15,
        'SILVER': 0.10,
        'BRONZE': 0.05
      };
      
      const discountPercentage = tierConfig[customer.customer_tier] || 0.05;
      const discountAmount = total * discountPercentage;
      const finalAmount = total - discountAmount;
      
      const transaction = {
        id: crypto.randomUUID(),
        customer_id: customer.id,
        total_amount: parseFloat(total.toFixed(2)),
        discount_applied: parseFloat(discountAmount.toFixed(2)),
        final_amount: parseFloat(finalAmount.toFixed(2)),
        payment_method: getRandomElement(PAYMENT_METHODS),
        payment_status: 'completed',
        transaction_date: getRandomDate(daysAgo)
      };
      
      transactions.push(transaction);
      
      // Add transaction items
      items.forEach(item => {
        transactionItems.push({
          ...item,
          transaction_id: transaction.id
        });
      });
    }
  }
  
  console.log(`📦 Inserting ${transactions.length} transactions...`);
  
  const { error: transError } = await supabase
    .from('Transaction')
    .insert(transactions);

  if (transError) {
    console.error('❌ Error seeding transactions:', transError);
    return;
  }

  console.log(`📦 Inserting ${transactionItems.length} transaction items...`);
  
  const { error: itemsError } = await supabase
    .from('TransactionItem')
    .insert(transactionItems);

  if (itemsError) {
    console.error('❌ Error seeding transaction items:', itemsError);
    return;
  }

  console.log(`✅ Created ${transactions.length} transactions with ${transactionItems.length} items`);
}

async function seedPromotions() {
  console.log('🌱 Seeding promotions...');
  
  const promotions = [
    {
      code: 'WELCOME10',
      name: 'Welcome Discount',
      description: '10% off your first purchase',
      discount_type: 'percentage',
      discount_value: 10,
      target_tier: null, // All tiers
      min_purchase_amount: 20,
      max_discount_amount: 50,
      is_active: true,
      usage_limit: 100
    },
    {
      code: 'GOLD15',
      name: 'Gold Member Special',
      description: 'Extra 15% off for Gold members',
      discount_type: 'percentage',
      discount_value: 15,
      target_tier: 'GOLD',
      min_purchase_amount: 50,
      max_discount_amount: null,
      is_active: true,
      usage_limit: 50
    },
    {
      code: 'SAVE20',
      name: 'Big Saver',
      description: '$20 off on purchases over $100',
      discount_type: 'fixed_amount',
      discount_value: 20,
      target_tier: null,
      min_purchase_amount: 100,
      max_discount_amount: 20,
      is_active: true,
      usage_limit: 200
    },
    {
      code: 'PLATINUM25',
      name: 'Platinum Exclusive',
      description: '25% off for Platinum members',
      discount_type: 'percentage',
      discount_value: 25,
      target_tier: 'PLATINUM',
      min_purchase_amount: 0,
      max_discount_amount: null,
      is_active: true,
      usage_limit: 30
    }
  ];
  
  const { data, error } = await supabase
    .from('Promotion')
    .insert(promotions)
    .select();

  if (error) {
    console.error('❌ Error seeding promotions:', error);
    return;
  }

  console.log(`✅ Created ${data.length} promotions`);
}

// ============================================
// MAIN SEEDING FUNCTION
// ============================================

async function seedDatabase() {
  console.log('🚀 Starting database seeding...\n');
  
  try {
    // Check if products already exist
    const { data: existingProducts } = await supabase
      .from('Product')
      .select('id')
      .limit(1);
    
    let products;
    if (existingProducts && existingProducts.length > 0) {
      console.log('ℹ️  Products already exist, fetching...');
      const { data } = await supabase.from('Product').select('*');
      products = data;
    } else {
      products = await seedProducts();
    }
    
    // Check if customers already exist
    const { data: existingCustomers } = await supabase
      .from('Customer')
      .select('id')
      .limit(1);
    
    let customers;
    if (existingCustomers && existingCustomers.length > 0) {
      console.log('ℹ️  Customers already exist, fetching...');
      const { data } = await supabase.from('Customer').select('*');
      customers = data;
    } else {
      customers = await seedCustomers();
    }
    
    // Always seed transactions (you can run multiple times for more data)
    await seedTransactions(customers, products);
    
    // Seed promotions
    await seedPromotions();
    
    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Products: ${products.length}`);
    console.log(`   - Customers: ${customers.length}`);
    console.log(`   - Transactions: Generated for last 6 months`);
    console.log(`   - Promotions: 4 active campaigns`);
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  }
}

// Run the seeding
if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { seedDatabase };
