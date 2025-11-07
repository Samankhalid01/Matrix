require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// ============================================
// SAMPLE DATA WITH PRODUCT IMAGES
// ============================================

const SAMPLE_PRODUCTS = [
  // Dairy Products
  { product_name: 'Fresh Milk 1L', category: 'Dairy', price: 4.99, current_stock: 45, min_stock_threshold: 20, cost_price: 3.50, supplier: 'DairyFresh Co.', barcode: 'PRD001', image_url: 'https://res.cloudinary.com/demo/image/upload/v1/grocery/milk.jpg' },
  { product_name: 'Cheddar Cheese 500g', category: 'Dairy', price: 7.99, current_stock: 8, min_stock_threshold: 15, cost_price: 5.50, supplier: 'DairyFresh Co.', barcode: 'PRD002', image_url: 'https://res.cloudinary.com/demo/image/upload/v1/grocery/cheese.jpg' },
  { product_name: 'Greek Yogurt 500g', category: 'Dairy', price: 5.49, current_stock: 30, min_stock_threshold: 12, cost_price: 3.80, supplier: 'DairyFresh Co.', barcode: 'PRD003', image_url: 'https://res.cloudinary.com/demo/image/upload/v1/grocery/yogurt.jpg' },
  
  // Bakery
  { product_name: 'Whole Wheat Bread', category: 'Bakery', price: 3.49, current_stock: 0, min_stock_threshold: 15, cost_price: 2.00, supplier: 'Fresh Bakes Ltd.', barcode: 'PRD004', image_url: 'https://res.cloudinary.com/demo/image/upload/v1/grocery/bread.jpg' },
  { product_name: 'Croissants Pack of 6', category: 'Bakery', price: 6.99, current_stock: 18, min_stock_threshold: 10, cost_price: 4.50, supplier: 'Fresh Bakes Ltd.', barcode: 'PRD005', image_url: 'https://res.cloudinary.com/demo/image/upload/v1/grocery/croissant.jpg' },
  
  // Fruits & Vegetables
  { product_name: 'Organic Apples 1kg', category: 'Fruits', price: 5.99, current_stock: 5, min_stock_threshold: 10, cost_price: 3.50, supplier: 'Green Farms', barcode: 'PRD006', image_url: 'https://res.cloudinary.com/demo/image/upload/v1/grocery/apples.jpg' },
  { product_name: 'Fresh Bananas 1kg', category: 'Fruits', price: 3.99, current_stock: 40, min_stock_threshold: 15, cost_price: 2.20, supplier: 'Green Farms', barcode: 'PRD007', image_url: 'https://res.cloudinary.com/demo/image/upload/v1/grocery/bananas.jpg' },
  { product_name: 'Tomatoes 500g', category: 'Vegetables', price: 2.99, current_stock: 25, min_stock_threshold: 10, cost_price: 1.50, supplier: 'Green Farms', barcode: 'PRD008', image_url: 'https://res.cloudinary.com/demo/image/upload/v1/grocery/tomatoes.jpg' },
  { product_name: 'Fresh Lettuce', category: 'Vegetables', price: 2.49, current_stock: 15, min_stock_threshold: 8, cost_price: 1.20, supplier: 'Green Farms', barcode: 'PRD009', image_url: 'https://res.cloudinary.com/demo/image/upload/v1/grocery/lettuce.jpg' },
  
  // Meat & Seafood
  { product_name: 'Chicken Breast 1kg', category: 'Meat', price: 12.99, current_stock: 20, min_stock_threshold: 10, cost_price: 8.50, supplier: 'Prime Meats', barcode: 'PRD010', image_url: 'https://res.cloudinary.com/demo/image/upload/v1/grocery/chicken.jpg' },
  { product_name: 'Ground Beef 500g', category: 'Meat', price: 9.99, current_stock: 3, min_stock_threshold: 8, cost_price: 6.50, supplier: 'Prime Meats', barcode: 'PRD011', image_url: 'https://res.cloudinary.com/demo/image/upload/v1/grocery/beef.jpg' },
  { product_name: 'Salmon Fillet 500g', category: 'Seafood', price: 15.99, current_stock: 12, min_stock_threshold: 6, cost_price: 11.00, supplier: 'Ocean Fresh', barcode: 'PRD012', image_url: 'https://res.cloudinary.com/demo/image/upload/v1/grocery/salmon.jpg' },
  
  // Beverages
  { product_name: 'Orange Juice 1L', category: 'Beverages', price: 4.49, current_stock: 35, min_stock_threshold: 15, cost_price: 2.80, supplier: 'Fresh Squeeze', barcode: 'PRD013', image_url: 'https://res.cloudinary.com/demo/image/upload/v1/grocery/orange-juice.jpg' },
  { product_name: 'Coffee Beans 500g', category: 'Beverages', price: 14.99, current_stock: 22, min_stock_threshold: 10, cost_price: 10.00, supplier: 'Bean Masters', barcode: 'PRD014', image_url: 'https://res.cloudinary.com/demo/image/upload/v1/grocery/coffee.jpg' },
  { product_name: 'Green Tea Box', category: 'Beverages', price: 6.99, current_stock: 18, min_stock_threshold: 8, cost_price: 4.50, supplier: 'Tea House', barcode: 'PRD015', image_url: 'https://res.cloudinary.com/demo/image/upload/v1/grocery/tea.jpg' },
  
  // Snacks & Packaged Foods
  { product_name: 'Potato Chips 200g', category: 'Snacks', price: 3.99, current_stock: 50, min_stock_threshold: 20, cost_price: 2.20, supplier: 'Snack Attack', barcode: 'PRD016', image_url: 'https://res.cloudinary.com/demo/image/upload/v1/grocery/chips.jpg' },
  { product_name: 'Chocolate Bar 100g', category: 'Snacks', price: 2.49, current_stock: 60, min_stock_threshold: 25, cost_price: 1.50, supplier: 'Sweet Treats', barcode: 'PRD017', image_url: 'https://res.cloudinary.com/demo/image/upload/v1/grocery/chocolate.jpg' },
  { product_name: 'Pasta 500g', category: 'Pantry', price: 2.99, current_stock: 40, min_stock_threshold: 15, cost_price: 1.80, supplier: 'Italian Foods', barcode: 'PRD018', image_url: 'https://res.cloudinary.com/demo/image/upload/v1/grocery/pasta.jpg' },
  { product_name: 'Rice 2kg', category: 'Pantry', price: 8.99, current_stock: 28, min_stock_threshold: 10, cost_price: 6.00, supplier: 'Grain Co.', barcode: 'PRD019', image_url: 'https://res.cloudinary.com/demo/image/upload/v1/grocery/rice.jpg' },
  { product_name: 'Olive Oil 500ml', category: 'Pantry', price: 11.99, current_stock: 15, min_stock_threshold: 8, cost_price: 8.50, supplier: 'Mediterranean Imports', barcode: 'PRD020', image_url: 'https://res.cloudinary.com/demo/image/upload/v1/grocery/olive-oil.jpg' },
  
  // Frozen Foods
  { product_name: 'Frozen Pizza', category: 'Frozen', price: 7.99, current_stock: 25, min_stock_threshold: 10, cost_price: 5.00, supplier: 'Frozen Delights', barcode: 'PRD021', image_url: 'https://res.cloudinary.com/demo/image/upload/v1/grocery/pizza.jpg' },
  { product_name: 'Ice Cream 1L', category: 'Frozen', price: 6.49, current_stock: 30, min_stock_threshold: 12, cost_price: 4.20, supplier: 'Cold Treats', barcode: 'PRD022', image_url: 'https://res.cloudinary.com/demo/image/upload/v1/grocery/ice-cream.jpg' },
  
  // Personal Care
  { product_name: 'Shampoo 400ml', category: 'Personal Care', price: 8.99, current_stock: 20, min_stock_threshold: 10, cost_price: 5.50, supplier: 'Beauty Essentials', barcode: 'PRD023', image_url: 'https://res.cloudinary.com/demo/image/upload/v1/grocery/shampoo.jpg' },
  { product_name: 'Toothpaste 100ml', category: 'Personal Care', price: 4.49, current_stock: 35, min_stock_threshold: 15, cost_price: 2.80, supplier: 'Health Plus', barcode: 'PRD024', image_url: 'https://res.cloudinary.com/demo/image/upload/v1/grocery/toothpaste.jpg' },
  { product_name: 'Hand Soap 250ml', category: 'Personal Care', price: 3.99, current_stock: 2, min_stock_threshold: 12, cost_price: 2.30, supplier: 'Clean & Fresh', barcode: 'PRD025', image_url: 'https://res.cloudinary.com/demo/image/upload/v1/grocery/soap.jpg' },
];

const SAMPLE_CUSTOMERS = [
  { name: 'Ahmed Khan', email: 'ahmed.khan@example.com', phone: '+92-300-1234567', customer_tier: 'PLATINUM' },
  { name: 'Sarah Ali', email: 'sarah.ali@example.com', phone: '+92-321-2345678', customer_tier: 'GOLD' },
  { name: 'Hassan Malik', email: 'hassan.malik@example.com', phone: '+92-333-3456789', customer_tier: 'GOLD' },
  { name: 'Fatima Noor', email: 'fatima.noor@example.com', phone: '+92-345-4567890', customer_tier: 'SILVER' },
  { name: 'Bilal Ahmed', email: 'bilal.ahmed@example.com', phone: '+92-301-5678901', customer_tier: 'SILVER' },
  { name: 'Aisha Raza', email: 'aisha.raza@example.com', phone: '+92-322-6789012', customer_tier: 'BRONZE' },
  { name: 'Usman Tariq', email: 'usman.tariq@example.com', phone: '+92-334-7890123', customer_tier: 'BRONZE' },
  { name: 'Zainab Shah', email: 'zainab.shah@example.com', phone: '+92-346-8901234', customer_tier: 'BRONZE' },
  { name: 'Ali Raza', email: 'ali.raza@example.com', phone: '+92-302-9012345', customer_tier: 'BRONZE' },
  { name: 'Maryam Hussain', email: 'maryam.hussain@example.com', phone: '+92-323-0123456', customer_tier: 'BRONZE' },
];

// ============================================
// MAIN SEEDING FUNCTION
// ============================================

async function seedDatabase() {
  console.log('🚀 Starting comprehensive database seeding...\n');

  try {
    // STEP 1: Seed Products
    console.log('📦 Seeding products...');
    const { data: existingProducts } = await supabase.from('Product').select('id, product_name');
    
    if (existingProducts && existingProducts.length >= 25) {
      console.log(`ℹ️  Products already exist (${existingProducts.length} found), skipping...`);
    } else {
      const { data: products, error: productError } = await supabase
        .from('Product')
        .insert(SAMPLE_PRODUCTS)
        .select();
      
      if (productError) throw productError;
      console.log(`✅ Inserted ${products.length} products with images`);
    }

    // Fetch all products for later use
    const { data: allProducts } = await supabase.from('Product').select('*');
    console.log(`📊 Total products in database: ${allProducts.length}\n`);

    // STEP 2: Seed Customers
    console.log('👥 Seeding customers...');
    const { data: existingCustomers } = await supabase.from('Customer').select('id, name');
    
    if (existingCustomers && existingCustomers.length >= 10) {
      console.log(`ℹ️  Customers already exist (${existingCustomers.length} found), skipping...`);
    } else {
      const { data: customers, error: customerError } = await supabase
        .from('Customer')
        .insert(SAMPLE_CUSTOMERS)
        .select();
      
      if (customerError) throw customerError;
      console.log(`✅ Inserted ${customers.length} customers with different tiers`);
    }

    // Fetch all customers
    const { data: allCustomers } = await supabase.from('Customer').select('*');
    console.log(`📊 Total customers in database: ${allCustomers.length}\n`);

    // STEP 3: Seed Customers In Store (5 currently shopping)
    console.log('🏪 Seeding customers in-store...');
    const customersInStore = allCustomers.slice(0, 5).map((customer, index) => ({
      customer_id: customer.id,
      check_in_time: new Date(Date.now() - (index + 1) * 15 * 60000).toISOString(), // Checked in 15-75 mins ago
      is_active: true
    }));

    const { error: inStoreError } = await supabase
      .from('CustomerInStore')
      .insert(customersInStore);
    
    if (inStoreError) console.error('⚠️  CustomerInStore error:', inStoreError);
    else console.log(`✅ Added ${customersInStore.length} customers currently in store\n`);

    // STEP 4: Seed Shopping Carts
    console.log('🛒 Seeding shopping carts...');
    const carts = [];
    const activeCustomers = allCustomers.slice(0, 5);
    
    activeCustomers.forEach(customer => {
      const numItems = Math.floor(Math.random() * 5) + 2; // 2-6 items per cart
      const selectedProducts = allProducts
        .sort(() => 0.5 - Math.random())
        .slice(0, numItems);
      
      selectedProducts.forEach(product => {
        carts.push({
          customer_id: customer.id,
          product_id: product.id,
          quantity: Math.floor(Math.random() * 3) + 1
        });
      });
    });

    const { error: cartError } = await supabase
      .from('ShoppingCart')
      .insert(carts);
    
    if (cartError) console.error('⚠️  ShoppingCart error:', cartError);
    else console.log(`✅ Added ${carts.length} items across ${activeCustomers.length} shopping carts\n`);

    // STEP 5: Seed Transactions (6 months history)
    console.log('💰 Seeding transactions (6 months history)...');
    const transactions = [];
    const transactionItems = [];
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 6);

    for (let i = 0; i < 300; i++) {
      const customer = allCustomers[Math.floor(Math.random() * allCustomers.length)];
      const transactionDate = new Date(
        startDate.getTime() + Math.random() * (Date.now() - startDate.getTime())
      );
      
      const numItems = Math.floor(Math.random() * 5) + 1;
      let totalAmount = 0;
      const transactionId = `${Date.now()}-${i}`;
      
      for (let j = 0; j < numItems; j++) {
        const product = allProducts[Math.floor(Math.random() * allProducts.length)];
        const quantity = Math.floor(Math.random() * 3) + 1;
        const unitPrice = parseFloat(product.price);
        const itemTotal = unitPrice * quantity;
        totalAmount += itemTotal;
        
        transactionItems.push({
          transaction_id: transactionId,
          product_id: product.id,
          product_name: product.product_name,
          quantity,
          unit_price: unitPrice,
          total_price: itemTotal,
          discount_applied: 0
        });
      }

      const discountRate = customer.customer_tier === 'PLATINUM' ? 0.20 :
                           customer.customer_tier === 'GOLD' ? 0.15 :
                           customer.customer_tier === 'SILVER' ? 0.10 : 0.05;
      const discountAmount = totalAmount * discountRate;
      const finalAmount = totalAmount - discountAmount;

      transactions.push({
        id: transactionId,
        customer_id: customer.id,
        total_amount: totalAmount.toFixed(2),
        discount_applied: discountAmount.toFixed(2),
        final_amount: finalAmount.toFixed(2),
        payment_method: ['cash', 'card', 'digital_wallet'][Math.floor(Math.random() * 3)],
        payment_status: 'completed',
        transaction_date: transactionDate.toISOString()
      });
    }

    // Insert in batches
    const batchSize = 50;
    for (let i = 0; i < transactions.length; i += batchSize) {
      const batch = transactions.slice(i, i + batchSize);
      const { error } = await supabase.from('Transaction').insert(batch);
      if (error) console.error(`⚠️  Transaction batch ${i / batchSize + 1} error:`, error);
    }
    console.log(`✅ Inserted ${transactions.length} transactions\n`);

    // STEP 6: Seed Promotions
    console.log('🎁 Seeding promotions...');
    const promotions = [
      {
        code: 'WELCOME20',
        name: 'New Customer Welcome',
        description: '20% off your first purchase',
        discount_type: 'percentage',
        discount_value: 20,
        target_tier: null,
        min_purchase_amount: 50,
        is_active: true,
        usage_limit: 100,
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        code: 'GOLD50',
        name: 'Gold Member Special',
        description: 'Extra $50 off for Gold tier members',
        discount_type: 'fixed_amount',
        discount_value: 50,
        target_tier: 'GOLD',
        min_purchase_amount: 200,
        is_active: true,
        usage_limit: 50,
        end_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        code: 'WEEKEND15',
        name: 'Weekend Flash Sale',
        description: '15% off all purchases this weekend',
        discount_type: 'percentage',
        discount_value: 15,
        target_tier: null,
        min_purchase_amount: 0,
        is_active: true,
        usage_limit: 200,
        end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        code: 'PLATINUM100',
        name: 'Platinum VIP Deal',
        description: '$100 off for our Platinum members',
        discount_type: 'fixed_amount',
        discount_value: 100,
        target_tier: 'PLATINUM',
        min_purchase_amount: 500,
        is_active: true,
        usage_limit: 20,
        end_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    const { error: promoError } = await supabase
      .from('Promotion')
      .insert(promotions);
    
    if (promoError) console.error('⚠️  Promotion error:', promoError);
    else console.log(`✅ Inserted ${promotions.length} active promotions\n`);

    // STEP 7: Seed Customer Notifications
    console.log('🔔 Seeding customer notifications...');
    const customerNotifications = [];
    
    // Discount notifications for all customers
    allCustomers.forEach(customer => {
      customerNotifications.push({
        recipient_type: 'customer',
        recipient_id: customer.id,
        notification_type: 'promotion',
        title: `${customer.customer_tier} Member Exclusive: New Discounts Available!`,
        message: `Hi ${customer.name}! Check out our latest promotions designed for ${customer.customer_tier} members.`,
        priority: 'medium',
        is_read: Math.random() > 0.7,
        metadata: { customer_tier: customer.customer_tier }
      });
    });

    // Order update notifications
    allCustomers.slice(0, 5).forEach(customer => {
      customerNotifications.push({
        recipient_type: 'customer',
        recipient_id: customer.id,
        notification_type: 'order_update',
        title: 'Your Order is Ready for Pickup',
        message: `Hi ${customer.name}! Your recent order is ready for collection.`,
        priority: 'high',
        is_read: false,
        metadata: { order_status: 'ready' }
      });
    });

    const { error: notifError } = await supabase
      .from('Notification')
      .insert(customerNotifications);
    
    if (notifError) console.error('⚠️  Notification error:', notifError);
    else console.log(`✅ Inserted ${customerNotifications.length} customer notifications\n`);

    // STEP 8: Trigger stock alerts by updating products
    console.log('📉 Triggering stock alerts for low-stock products...');
    const lowStockProducts = allProducts.filter(p => 
      p.current_stock <= p.min_stock_threshold
    );
    
    console.log(`✅ ${lowStockProducts.length} products have low stock - alerts will be auto-generated by triggers\n`);

    // Final Summary
    console.log('═'.repeat(60));
    console.log('🎉 DATABASE SEEDING COMPLETED SUCCESSFULLY!\n');
    console.log('📊 Summary:');
    console.log(`   ✅ Products: ${allProducts.length} (with images)`);
    console.log(`   ✅ Customers: ${allCustomers.length}`);
    console.log(`   ✅ Customers In-Store: ${customersInStore.length}`);
    console.log(`   ✅ Shopping Carts: ${carts.length} items`);
    console.log(`   ✅ Transactions: ${transactions.length}`);
    console.log(`   ✅ Promotions: ${promotions.length}`);
    console.log(`   ✅ Customer Notifications: ${customerNotifications.length}`);
    console.log(`   ⚠️  Low Stock Items: ${lowStockProducts.length}`);
    console.log('═'.repeat(60));

  } catch (error) {
    console.error('\n❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seeding
seedDatabase();
