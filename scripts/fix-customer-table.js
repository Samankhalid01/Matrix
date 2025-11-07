require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function fixCustomerTable() {
  console.log('\n🔧 Fixing Customer table ID column...\n');
  
  try {
    // Apply the SQL fix
    const { data, error } = await supabase.rpc('exec_sql', {
      query: `ALTER TABLE "Customer" ALTER COLUMN id SET DEFAULT gen_random_uuid();`
    });
    
    if (error) {
      console.log('⚠️  Could not use RPC method. Trying direct approach...');
      console.log('Error:', error.message);
      console.log('\n📋 Please run this SQL command in your Supabase SQL Editor:');
      console.log('─'.repeat(60));
      console.log('ALTER TABLE "Customer" ALTER COLUMN id SET DEFAULT gen_random_uuid();');
      console.log('─'.repeat(60));
      console.log('\nAfter running the above SQL, run: node scripts/add-customers.js\n');
    } else {
      console.log('✅ Successfully set default UUID generator for Customer.id');
      console.log('\nYou can now run: node scripts/add-customers.js\n');
    }
  } catch (err) {
    console.error('\n❌ Error:', err.message);
    console.log('\n📋 Please run this SQL command in your Supabase SQL Editor:');
    console.log('─'.repeat(60));
    console.log('ALTER TABLE "Customer" ALTER COLUMN id SET DEFAULT gen_random_uuid();');
    console.log('─'.repeat(60));
    console.log('\nAfter running the above SQL, run: node scripts/add-customers.js\n');
  }
}

fixCustomerTable();
