require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

console.log('\n🚀 POPULATING ALL EXISTING TABLES...\n');

async function populate() {
  try {
    // Get existing data first
    const { data: existingProducts } = await supabase.from('Product').select('*');
    const { data: existingCustomers } = await supabase.from('Customer').select('*');
    
    console.log(`📊 Current Database State:`);
    console.log(`   Products: ${existingProducts?.length || 0}`);
    console.log(`   Customers: ${existingCustomers?.length || 0}\n`);

    // ========== 1. POPULATE CUSTOMERS IN-STORE ==========
    if (existingCustomers && existingCustomers.length > 0) {
      console.log('🏪 Populating customers_instore table...');
      const customersInStore = existingCustomers.slice(0, Math.min(5, existingCustomers.length)).map(c => ({
        customer_id: c.id,
        email: c.email
      }));

      const { error: inStoreError } = await supabase
        .from('customers_instore')
        .upsert(customersInStore, { onConflict: 'customer_id' });
      
      if (inStoreError) {
        console.log(`   ⚠️  ${inStoreError.message}`);
      } else {
        console.log(`   ✅ Added ${customersInStore.length} customers in-store\n`);
      }
    }

    // ========== 2. POPULATE SHOPPING CARTS ==========
    if (existingCustomers && existingCustomers.length > 0 && existingProducts && existingProducts.length > 0) {
      console.log('🛒 Populating Cart table...');
      const carts = [];
      
      existingCustomers.slice(0, Math.min(5, existingCustomers.length)).forEach(customer => {
        const numItems = Math.floor(Math.random() * 3) + 1;
        const selectedProducts = existingProducts
          .sort(() => 0.5 - Math.random())
          .slice(0, Math.min(numItems, existingProducts.length));
        
        selectedProducts.forEach(product => {
          const quantity = Math.floor(Math.random() * 3) + 1;
          const unitPrice = parseFloat(product.price) || 0;
          carts.push({
            customer_id: customer.id,
            product_id: product.id,
            quantity: quantity,
            unit_price: unitPrice,
            total_price: unitPrice * quantity
          });
        });
      });

      if (carts.length > 0) {
        const { error: cartError } = await supabase.from('Cart').upsert(carts, { onConflict: 'id' });
        
        if (cartError) {
          console.log(`   ⚠️  ${cartError.message}`);
        } else {
          console.log(`   ✅ Added ${carts.length} cart items\n`);
        }
      }
    }

    // ========== 3. CHECK NOTIFICATIONS ==========
    const { data: notifications } = await supabase.from('Notification').select('*');
    console.log(`🔔 Notifications: ${notifications?.length || 0}`);

    // ========== 4. CHECK STOCK ALERTS ==========
    const { data: stockAlerts } = await supabase.from('StockAlert').select('*');
    console.log(`📉 Stock Alerts: ${stockAlerts?.length || 0}`);

    // ========== 5. CHECK PROMOTIONS ==========
    const { data: promotions } = await supabase.from('Promotion').select('*');
    console.log(`🎁 Promotions: ${promotions?.length || 0}`);

    // ========== 6. CHECK TRANSACTIONS ==========
    const { data: transactions } = await supabase.from('Transaction').select('*', { count: 'exact', head: true });
    console.log(`💰 Transactions: ${transactions || 0}\n`);

    console.log('═'.repeat(60));
    console.log('✅ POPULATION COMPLETED!');
    console.log('═'.repeat(60));
    console.log('\n📱 Now visit your admin pages:');
    console.log('   • http://localhost:3000/admin/notifications-center');
    console.log('   • http://localhost:3000/admin/promotions');
    console.log('   • http://localhost:3000/admin/analytics-dashboard\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

populate();
