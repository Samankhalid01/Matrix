require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

console.log('🚀 Starting to populate EXISTING Supabase tables...\n');

// ============================================
// PRODUCTS WITH CLOUDINARY IMAGES
// ============================================

const PRODUCTS_WITH_IMAGES = [
  // Dairy Products
  { product_name: 'Fresh Milk 1L', category: 'Dairy', price: 4.99, current_stock: 45, min_stock_threshold: 20, max_stock_threshold: 100, cost_price: 3.50, supplier: 'DairyFresh Co.', images: ['https://res.cloudinary.com/dujkjy26v/image/upload/v1730891234/milk.jpg'], reorder_quantity: 50, in_stock: true },
  { product_name: 'Cheddar Cheese 500g', category: 'Dairy', price: 7.99, current_stock: 8, min_stock_threshold: 15, max_stock_threshold: 80, cost_price: 5.50, supplier: 'DairyFresh Co.', images: ['https://res.cloudinary.com/dujkjy26v/image/upload/v1730891234/cheese.jpg'], reorder_quantity: 40, in_stock: true },
  { product_name: 'Greek Yogurt 500g', category: 'Dairy', price: 5.49, current_stock: 30, min_stock_threshold: 12, max_stock_threshold: 70, cost_price: 3.80, supplier: 'DairyFresh Co.', images: ['https://res.cloudinary.com/dujkjy26v/image/upload/v1730891234/yogurt.jpg'], reorder_quantity: 35, in_stock: true },
  
  // Bakery
  { product_name: 'Whole Wheat Bread', category: 'Bakery', price: 3.49, current_stock: 0, min_stock_threshold: 15, max_stock_threshold: 60, cost_price: 2.00, supplier: 'Fresh Bakes Ltd.', images: ['https://res.cloudinary.com/dujkjy26v/image/upload/v1730891234/bread.jpg'], reorder_quantity: 30, in_stock: false },
  { product_name: 'Croissants Pack of 6', category: 'Bakery', price: 6.99, current_stock: 18, min_stock_threshold: 10, max_stock_threshold: 50, cost_price: 4.50, supplier: 'Fresh Bakes Ltd.', images: ['https://res.cloudinary.com/dujkjy26v/image/upload/v1730891234/croissant.jpg'], reorder_quantity: 25, in_stock: true },
  
  // Fruits & Vegetables
  { product_name: 'Organic Apples 1kg', category: 'Fruits', price: 5.99, current_stock: 5, min_stock_threshold: 10, max_stock_threshold: 60, cost_price: 3.50, supplier: 'Green Farms', images: ['https://res.cloudinary.com/dujkjy26v/image/upload/v1730891234/apples.jpg'], reorder_quantity: 30, in_stock: true },
  { product_name: 'Fresh Bananas 1kg', category: 'Fruits', price: 3.99, current_stock: 40, min_stock_threshold: 15, max_stock_threshold: 70, cost_price: 2.20, supplier: 'Green Farms', images: ['https://res.cloudinary.com/dujkjy26v/image/upload/v1730891234/bananas.jpg'], reorder_quantity: 35, in_stock: true },
  { product_name: 'Tomatoes 500g', category: 'Vegetables', price: 2.99, current_stock: 25, min_stock_threshold: 10, max_stock_threshold: 50, cost_price: 1.50, supplier: 'Green Farms', images: ['https://res.cloudinary.com/dujkjy26v/image/upload/v1730891234/tomatoes.jpg'], reorder_quantity: 30, in_stock: true },
  { product_name: 'Fresh Lettuce', category: 'Vegetables', price: 2.49, current_stock: 15, min_stock_threshold: 8, max_stock_threshold: 40, cost_price: 1.20, supplier: 'Green Farms', images: ['https://res.cloudinary.com/dujkjy26v/image/upload/v1730891234/lettuce.jpg'], reorder_quantity: 20, in_stock: true },
  
  // Meat & Seafood
  { product_name: 'Chicken Breast 1kg', category: 'Meat', price: 12.99, current_stock: 20, min_stock_threshold: 10, max_stock_threshold: 50, cost_price: 8.50, supplier: 'Prime Meats', images: ['https://res.cloudinary.com/dujkjy26v/image/upload/v1730891234/chicken.jpg'], reorder_quantity: 25, in_stock: true },
  { product_name: 'Ground Beef 500g', category: 'Meat', price: 9.99, current_stock: 3, min_stock_threshold: 8, max_stock_threshold: 40, cost_price: 6.50, supplier: 'Prime Meats', images: ['https://res.cloudinary.com/dujkjy26v/image/upload/v1730891234/beef.jpg'], reorder_quantity: 20, in_stock: true },
  { product_name: 'Salmon Fillet 500g', category: 'Seafood', price: 15.99, current_stock: 12, min_stock_threshold: 6, max_stock_threshold: 30, cost_price: 11.00, supplier: 'Ocean Fresh', images: ['https://res.cloudinary.com/dujkjy26v/image/upload/v1730891234/salmon.jpg'], reorder_quantity: 15, in_stock: true },
  
  // Beverages
  { product_name: 'Orange Juice 1L', category: 'Beverages', price: 4.49, current_stock: 35, min_stock_threshold: 15, max_stock_threshold: 70, cost_price: 2.80, supplier: 'Fresh Squeeze', images: ['https://res.cloudinary.com/dujkjy26v/image/upload/v1730891234/orange-juice.jpg'], reorder_quantity: 35, in_stock: true },
  { product_name: 'Coffee Beans 500g', category: 'Beverages', price: 14.99, current_stock: 22, min_stock_threshold: 10, max_stock_threshold: 50, cost_price: 10.00, supplier: 'Bean Masters', images: ['https://res.cloudinary.com/dujkjy26v/image/upload/v1730891234/coffee.jpg'], reorder_quantity: 25, in_stock: true },
  { product_name: 'Green Tea Box', category: 'Beverages', price: 6.99, current_stock: 18, min_stock_threshold: 8, max_stock_threshold: 40, cost_price: 4.50, supplier: 'Tea House', images: ['https://res.cloudinary.com/dujkjy26v/image/upload/v1730891234/tea.jpg'], reorder_quantity: 20, in_stock: true },
  
  // Snacks & Packaged Foods
  { product_name: 'Potato Chips 200g', category: 'Snacks', price: 3.99, current_stock: 50, min_stock_threshold: 20, max_stock_threshold: 100, cost_price: 2.20, supplier: 'Snack Attack', images: ['https://res.cloudinary.com/dujkjy26v/image/upload/v1730891234/chips.jpg'], reorder_quantity: 50, in_stock: true },
  { product_name: 'Chocolate Bar 100g', category: 'Snacks', price: 2.49, current_stock: 60, min_stock_threshold: 25, max_stock_threshold: 120, cost_price: 1.50, supplier: 'Sweet Treats', images: ['https://res.cloudinary.com/dujkjy26v/image/upload/v1730891234/chocolate.jpg'], reorder_quantity: 60, in_stock: true },
  { product_name: 'Pasta 500g', category: 'Pantry', price: 2.99, current_stock: 40, min_stock_threshold: 15, max_stock_threshold: 80, cost_price: 1.80, supplier: 'Italian Foods', images: ['https://res.cloudinary.com/dujkjy26v/image/upload/v1730891234/pasta.jpg'], reorder_quantity: 40, in_stock: true },
  { product_name: 'Rice 2kg', category: 'Pantry', price: 8.99, current_stock: 28, min_stock_threshold: 10, max_stock_threshold: 60, cost_price: 6.00, supplier: 'Grain Co.', images: ['https://res.cloudinary.com/dujkjy26v/image/upload/v1730891234/rice.jpg'], reorder_quantity: 30, in_stock: true },
  { product_name: 'Olive Oil 500ml', category: 'Pantry', price: 11.99, current_stock: 15, min_stock_threshold: 8, max_stock_threshold: 40, cost_price: 8.50, supplier: 'Mediterranean Imports', images: ['https://res.cloudinary.com/dujkjy26v/image/upload/v1730891234/olive-oil.jpg'], reorder_quantity: 20, in_stock: true },
  
  // Frozen Foods
  { product_name: 'Frozen Pizza', category: 'Frozen', price: 7.99, current_stock: 25, min_stock_threshold: 10, max_stock_threshold: 50, cost_price: 5.00, supplier: 'Frozen Delights', images: ['https://res.cloudinary.com/dujkjy26v/image/upload/v1730891234/pizza.jpg'], reorder_quantity: 25, in_stock: true },
  { product_name: 'Ice Cream 1L', category: 'Frozen', price: 6.49, current_stock: 30, min_stock_threshold: 12, max_stock_threshold: 60, cost_price: 4.20, supplier: 'Cold Treats', images: ['https://res.cloudinary.com/dujkjy26v/image/upload/v1730891234/ice-cream.jpg'], reorder_quantity: 30, in_stock: true },
  
  // Personal Care
  { product_name: 'Shampoo 400ml', category: 'Personal Care', price: 8.99, current_stock: 20, min_stock_threshold: 10, max_stock_threshold: 50, cost_price: 5.50, supplier: 'Beauty Essentials', images: ['https://res.cloudinary.com/dujkjy26v/image/upload/v1730891234/shampoo.jpg'], reorder_quantity: 25, in_stock: true },
  { product_name: 'Toothpaste 100ml', category: 'Personal Care', price: 4.49, current_stock: 35, min_stock_threshold: 15, max_stock_threshold: 70, cost_price: 2.80, supplier: 'Health Plus', images: ['https://res.cloudinary.com/dujkjy26v/image/upload/v1730891234/toothpaste.jpg'], reorder_quantity: 35, in_stock: true },
  { product_name: 'Hand Soap 250ml', category: 'Personal Care', price: 3.99, current_stock: 2, min_stock_threshold: 12, max_stock_threshold: 60, cost_price: 2.30, supplier: 'Clean & Fresh', images: ['https://res.cloudinary.com/dujkjy26v/image/upload/v1730891234/soap.jpg'], reorder_quantity: 30, in_stock: true },
];

// ============================================
// CUSTOMERS WITH DIFFERENT TIERS
// ============================================

const CUSTOMERS = [
  { name: 'Ahmed Khan', email: 'ahmed.khan@example.com', address: 'Lahore, Pakistan', customer_tier: 'PLATINUM', in_store: false, is_fraud: false, password: 'hashed_password_1' },
  { name: 'Sarah Ali', email: 'sarah.ali@example.com', address: 'Karachi, Pakistan', customer_tier: 'GOLD', in_store: false, is_fraud: false, password: 'hashed_password_2' },
  { name: 'Hassan Malik', email: 'hassan.malik@example.com', address: 'Islamabad, Pakistan', customer_tier: 'GOLD', in_store: false, is_fraud: false, password: 'hashed_password_3' },
  { name: 'Fatima Noor', email: 'fatima.noor@example.com', address: 'Faisalabad, Pakistan', customer_tier: 'SILVER', in_store: false, is_fraud: false, password: 'hashed_password_4' },
  { name: 'Bilal Ahmed', email: 'bilal.ahmed@example.com', address: 'Rawalpindi, Pakistan', customer_tier: 'SILVER', in_store: false, is_fraud: false, password: 'hashed_password_5' },
  { name: 'Aisha Raza', email: 'aisha.raza@example.com', address: 'Multan, Pakistan', customer_tier: 'BRONZE', in_store: false, is_fraud: false, password: 'hashed_password_6' },
  { name: 'Usman Tariq', email: 'usman.tariq@example.com', address: 'Peshawar, Pakistan', customer_tier: 'BRONZE', in_store: false, is_fraud: false, password: 'hashed_password_7' },
  { name: 'Zainab Shah', email: 'zainab.shah@example.com', address: 'Quetta, Pakistan', customer_tier: 'BRONZE', in_store: false, is_fraud: false, password: 'hashed_password_8' },
  { name: 'Ali Raza', email: 'ali.raza@example.com', address: 'Sialkot, Pakistan', customer_tier: 'BRONZE', in_store: false, is_fraud: false, password: 'hashed_password_9' },
  { name: 'Maryam Hussain', email: 'maryam.hussain@example.com', address: 'Gujranwala, Pakistan', customer_tier: 'BRONZE', in_store: false, is_fraud: false, password: 'hashed_password_10' },
];

// ============================================
// MAIN POPULATION FUNCTION
// ============================================

async function populateDatabase() {
  try {
    // ========== 1. ADD PRODUCTS ==========
    console.log('📦 Adding products with Cloudinary images...');
    const { data: existingProducts } = await supabase.from('Product').select('id');
    
    if (existingProducts && existingProducts.length >= 25) {
      console.log(`ℹ️  ${existingProducts.length} products already exist, skipping...\n`);
    } else {
      const { data: products, error: productError } = await supabase
        .from('Product')
        .insert(PRODUCTS_WITH_IMAGES)
        .select();
      
      if (productError) {
        console.error('❌ Error adding products:', productError);
      } else {
        console.log(`✅ Added ${products.length} products with images\n`);
      }
    }

    // Fetch all products
    const { data: allProducts } = await supabase.from('Product').select('*');

    // ========== 2. ADD CUSTOMERS ==========
    console.log('👥 Adding customers...');
    const { data: existingCustomers } = await supabase.from('Customer').select('id');
    
    if (existingCustomers && existingCustomers.length >= 10) {
      console.log(`ℹ️  ${existingCustomers.length} customers already exist, skipping...\n`);
    } else {
      const { data: customers, error: customerError } = await supabase
        .from('Customer')
        .insert(CUSTOMERS)
        .select();
      
      if (customerError) {
        console.error('❌ Error adding customers:', customerError);
      } else {
        console.log(`✅ Added ${customers.length} customers\n`);
      }
    }

    // Fetch all customers
    const { data: allCustomers } = await supabase.from('Customer').select('*');

    // ========== 3. ADD CUSTOMERS IN-STORE ==========
    console.log('🏪 Adding customers currently in-store...');
    const customersInStore = allCustomers.slice(0, 5).map((customer, index) => ({
      customer_id: customer.id,
      created_at: new Date(Date.now() - (index + 1) * 15 * 60000).toISOString()
    }));

    const { error: inStoreError } = await supabase
      .from('customers_instore')
      .insert(customersInStore);
    
    if (inStoreError) {
      console.error('❌ Error:', inStoreError.message);
    } else {
      console.log(`✅ Added ${customersInStore.length} customers in-store\n`);
    }

    // ========== 4. ADD SHOPPING CARTS ==========
    console.log('🛒 Adding shopping carts...');
    const carts = [];
    allCustomers.slice(0, 5).forEach(customer => {
      const numItems = Math.floor(Math.random() * 5) + 2;
      const selectedProducts = allProducts.sort(() => 0.5 - Math.random()).slice(0, numItems);
      
      selectedProducts.forEach(product => {
        const quantity = Math.floor(Math.random() * 3) + 1;
        const unitPrice = parseFloat(product.price);
        carts.push({
          customer_id: customer.id,
          product_id: product.id,
          quantity: quantity,
          unit_price: unitPrice,
          total_price: (unitPrice * quantity).toFixed(2)
        });
      });
    });

    const { error: cartError } = await supabase.from('Cart').insert(carts);
    
    if (cartError) {
      console.error('❌ Error:', cartError.message);
    } else {
      console.log(`✅ Added ${carts.length} cart items\n`);
    }

    // ========== 5. ADD TRANSACTIONS ==========
    console.log('💰 Adding transactions (6 months history)...');
    const transactions = [];
    const transactionItems = [];
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 6);

    for (let i = 0; i < 200; i++) {
      const customer = allCustomers[Math.floor(Math.random() * allCustomers.length)];
      const transactionDate = new Date(
        startDate.getTime() + Math.random() * (Date.now() - startDate.getTime())
      );
      
      const transactionId = crypto.randomUUID();
      const numItems = Math.floor(Math.random() * 5) + 1;
      let totalAmount = 0;
      
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

    const batchSize = 50;
    for (let i = 0; i < transactions.length; i += batchSize) {
      const batch = transactions.slice(i, i + batchSize);
      const { error } = await supabase.from('Transaction').insert(batch);
      if (error) console.error(`⚠️  Batch error:`, error.message);
    }
    console.log(`✅ Added ${transactions.length} transactions\n`);

    // Add transaction items
    for (let i = 0; i < transactionItems.length; i += batchSize) {
      const batch = transactionItems.slice(i, i + batchSize);
      const { error } = await supabase.from('TransactionItem').insert(batch);
      if (error) console.error(`⚠️  TransactionItem batch error:`, error.message);
    }
    console.log(`✅ Added ${transactionItems.length} transaction items\n`);

    // ========== 6. ADD PROMOTIONS ==========
    console.log('🎁 Adding promotions...');
    const promotions = [
      {
        code: 'WELCOME20',
        name: 'New Customer Welcome',
        description: '20% off your first purchase',
        discount_type: 'percentage',
        discount_value: 20,
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

    const { error: promoError } = await supabase.from('Promotion').insert(promotions);
    if (promoError) {
      console.error('❌ Error:', promoError.message);
    } else {
      console.log(`✅ Added ${promotions.length} promotions\n`);
    }

    // ========== 7. ADD STOCK ALERTS ==========
    console.log('📉 Adding stock alerts for low-stock products...');
    const lowStockProducts = allProducts.filter(p => p.current_stock <= p.min_stock_threshold);
    const stockAlerts = lowStockProducts.map(product => ({
      product_id: product.id,
      alert_type: product.current_stock === 0 ? 'out_of_stock' : 'low_stock',
      current_stock: product.current_stock,
      threshold_stock: product.min_stock_threshold,
      status: 'pending'
    }));

    if (stockAlerts.length > 0) {
      const { error: alertError } = await supabase.from('StockAlert').insert(stockAlerts);
      if (alertError) {
        console.error('❌ Error:', alertError.message);
      } else {
        console.log(`✅ Added ${stockAlerts.length} stock alerts\n`);
      }
    }

    // ========== 8. ADD CUSTOMER NOTIFICATIONS ==========
    console.log('🔔 Adding customer notifications...');
    const notifications = [];
    
    // Discount notifications for all customers
    allCustomers.forEach(customer => {
      notifications.push({
        recipient_type: 'customer',
        recipient_id: customer.id,
        notification_type: 'promotion',
        title: `${customer.customer_tier} Member Exclusive: New Discounts Available!`,
        message: `Hi ${customer.name}! Check out our latest promotions designed for ${customer.customer_tier} members. Save up to 20% on your next purchase!`,
        priority: 'medium',
        is_read: false,
        action_url: '/promotions'
      });
    });

    // Order update notifications for 5 customers
    allCustomers.slice(0, 5).forEach(customer => {
      notifications.push({
        recipient_type: 'customer',
        recipient_id: customer.id,
        notification_type: 'order_update',
        title: 'Your Order is Ready for Pickup',
        message: `Hi ${customer.name}! Your recent order is ready for collection at the store.`,
        priority: 'high',
        is_read: false,
        action_url: '/orders'
      });
    });

    // Complaint resolution notifications
    allCustomers.slice(0, 3).forEach(customer => {
      notifications.push({
        recipient_type: 'customer',
        recipient_id: customer.id,
        notification_type: 'complaint_resolution',
        title: 'Your Complaint Has Been Resolved',
        message: `Hi ${customer.name}! We've addressed your recent concern. Thank you for bringing it to our attention.`,
        priority: 'medium',
        is_read: false,
        action_url: '/support'
      });
    });

    // Admin stock alert notifications
    lowStockProducts.forEach(product => {
      notifications.push({
        recipient_type: 'admin',
        notification_type: 'stock_alert',
        title: product.current_stock === 0 ? `OUT OF STOCK: ${product.product_name}` : `Low Stock Alert: ${product.product_name}`,
        message: `Product "${product.product_name}" ${product.current_stock === 0 ? 'is OUT OF STOCK' : `has only ${product.current_stock} units remaining (threshold: ${product.min_stock_threshold})`}`,
        priority: product.current_stock === 0 ? 'critical' : 'high',
        is_read: false,
        action_url: '/admin/products',
        metadata: { product_id: product.id, current_stock: product.current_stock }
      });
    });

    const { error: notifError } = await supabase.from('Notification').insert(notifications);
    if (notifError) {
      console.error('❌ Error:', notifError.message);
    } else {
      console.log(`✅ Added ${notifications.length} notifications\n`);
    }

    // ========== FINAL SUMMARY ==========
    console.log('═'.repeat(70));
    console.log('🎉 DATABASE POPULATION COMPLETED!\n');
    console.log('📊 Summary:');
    console.log(`   ✅ Products: ${allProducts.length} (with Cloudinary images)`);
    console.log(`   ✅ Customers: ${allCustomers.length}`);
    console.log(`   ✅ Customers In-Store: ${customersInStore.length}`);
    console.log(`   ✅ Shopping Carts: ${carts.length} items`);
    console.log(`   ✅ Transactions: ${transactions.length}`);
    console.log(`   ✅ Transaction Items: ${transactionItems.length}`);
    console.log(`   ✅ Promotions: 4`);
    console.log(`   ✅ Stock Alerts: ${stockAlerts.length}`);
    console.log(`   ✅ Notifications: ${notifications.length}`);
    console.log(`   ⚠️  Low Stock Products: ${lowStockProducts.length}`);
    console.log('═'.repeat(70));
    console.log('\n✨ All data populated successfully! Visit your admin pages to see the data.');

  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run
populateDatabase();
