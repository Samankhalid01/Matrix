// Check Customer table and analyze data issues
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function analyzeCustomers() {
  console.log('🔍 Analyzing Customer Table...\n');
  console.log('='.repeat(70));

  // Check Customer table
  const { data: customers, error: customersError } = await supabase
    .from('Customer')
    .select('*');

  if (customersError) {
    console.error('❌ Customer table error:', customersError.message);
  } else {
    console.log(`✅ Customer table accessible`);
    console.log(`📊 Total customers found: ${customers.length}\n`);
    
    if (customers.length > 0) {
      console.log('👥 Customer Details:');
      customers.forEach((c, index) => {
        console.log(`\n   Customer ${index + 1}:`);
        console.log(`   - ID: ${c.id}`);
        console.log(`   - Name: ${c.customer_name || c.name || 'N/A'}`);
        console.log(`   - Email: ${c.email || 'N/A'}`);
        console.log(`   - Phone: ${c.phone || 'N/A'}`);
        console.log(`   - Created: ${c.created_at || 'N/A'}`);
      });
    } else {
      console.log('⚠️  No customers found in database!');
      console.log('\n💡 Possible reasons:');
      console.log('   1. Customers haven\'t been created yet');
      console.log('   2. Data was deleted');
      console.log('   3. Wrong table name or schema');
    }
  }

  // Check related tables
  console.log('\n' + '='.repeat(70));
  console.log('🔍 Checking Related Tables:\n');

  // Shopping Sessions
  const { data: sessions, error: sessionsError } = await supabase
    .from('ShoppingSession')
    .select('customer_id, is_active')
    .limit(10);

  if (!sessionsError) {
    console.log(`✅ ShoppingSession: ${sessions.length} records`);
    const uniqueCustomers = [...new Set(sessions.map(s => s.customer_id))];
    console.log(`   Unique customer IDs in sessions: ${uniqueCustomers.length}`);
  }

  // Cart
  const { data: carts, error: cartsError } = await supabase
    .from('Cart')
    .select('customer_id')
    .limit(10);

  if (!cartsError) {
    console.log(`✅ Cart: ${carts.length} records`);
    const uniqueCustomers = [...new Set(carts.map(c => c.customer_id))];
    console.log(`   Unique customer IDs in cart: ${uniqueCustomers.length}`);
  }

  // Transactions
  const { data: transactions, error: transError } = await supabase
    .from('Transaction')
    .select('customer_id')
    .limit(10);

  if (!transError && transactions) {
    console.log(`✅ Transaction: ${transactions.length} records`);
    const uniqueCustomers = [...new Set(transactions.map(t => t.customer_id).filter(Boolean))];
    console.log(`   Unique customer IDs in transactions: ${uniqueCustomers.length}`);
  }

  console.log('\n' + '='.repeat(70));
  console.log('📝 RECOMMENDATIONS:\n');
  
  if (customers.length <= 1) {
    console.log('⚠️  ISSUE: Only 1 customer in database');
    console.log('\n💡 Solutions:');
    console.log('   1. Create more customers via Admin Panel → Customers → New Customer');
    console.log('   2. Import customer data if available');
    console.log('   3. Check if customer creation form is working');
    console.log('   4. URL: http://localhost:3001/admin/customers');
  }

  console.log('\n✅ Analysis Complete!');
}

analyzeCustomers().catch(console.error);
