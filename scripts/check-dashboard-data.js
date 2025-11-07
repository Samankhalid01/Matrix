require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkTables() {
  console.log('\n🔍 Checking table structures...\n');
  
  // Check customer_purchase_summary
  const { data: summary, error: summaryError } = await supabase
    .from('customer_purchase_summary')
    .select('*')
    .limit(1);
  
  if (summaryError) {
    console.log('❌ customer_purchase_summary error:', summaryError.message);
  } else {
    console.log('✅ customer_purchase_summary structure:');
    if (summary && summary.length > 0) {
      console.log(JSON.stringify(summary[0], null, 2));
    } else {
      console.log('   (empty table)');
    }
  }

  // Check Product count
  const { count: productCount } = await supabase
    .from('Product')
    .select('*', { count: 'exact', head: true });
  
  console.log(`\n📦 Total Products: ${productCount}`);

  // Check customers_instore count
  const { count: instoreCount } = await supabase
    .from('customers_instore')
    .select('*', { count: 'exact', head: true });
  
  console.log(`🏪 Customers In-Store: ${instoreCount}`);

  // Check Transaction total revenue
  const { data: transactions } = await supabase
    .from('Transaction')
    .select('total_amount');
  
  const totalRevenue = transactions?.reduce((sum, t) => sum + (parseFloat(t.total_amount) || 0), 0) || 0;
  
  console.log(`💰 Total Revenue: $${totalRevenue.toFixed(2)}`);

  // Check Customer count
  const { count: customerCount } = await supabase
    .from('Customer')
    .select('*', { count: 'exact', head: true });
  
  console.log(`👥 Total Customers: ${customerCount}\n`);
}

checkTables();
