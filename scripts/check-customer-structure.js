require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkCustomerTable() {
  console.log('\n🔍 Checking Customer table structure...\n');
  
  // Get a sample customer to see structure
  const { data: customers, error } = await supabase
    .from('Customer')
    .select('*')
    .limit(1);
  
  if (error) {
    console.error('Error:', error.message);
    return;
  }

  if (customers && customers.length > 0) {
    console.log('Sample customer structure:');
    console.log(JSON.stringify(customers[0], null, 2));
  }
}

checkCustomerTable();
