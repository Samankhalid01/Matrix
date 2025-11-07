require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkStockAlerts() {
  console.log('\n🔍 Checking StockAlert table...\n');
  
  // Get a sample stock alert
  const { data: alerts, error } = await supabase
    .from('StockAlert')
    .select('*')
    .limit(1);
  
  if (error) {
    console.error('❌ Error:', error.message);
    return;
  }

  if (alerts && alerts.length > 0) {
    console.log('✅ Sample StockAlert structure:');
    console.log(JSON.stringify(alerts[0], null, 2));
  } else {
    console.log('⚠️  No stock alerts found');
  }

  // Get all stock alerts count
  const { count } = await supabase
    .from('StockAlert')
    .select('*', { count: 'exact', head: true });
  
  console.log(`\n📊 Total StockAlerts: ${count}`);

  // Try to update one
  if (alerts && alerts.length > 0) {
    console.log('\n🔧 Testing update...');
    const { data: updated, error: updateError } = await supabase
      .from('StockAlert')
      .update({ 
        status: 'acknowledged',
        acknowledged_by: 'test-admin',
        acknowledged_at: new Date().toISOString()
      })
      .eq('id', alerts[0].id)
      .select();
    
    if (updateError) {
      console.error('❌ Update error:', updateError.message);
      console.log('\n💡 Available columns might be different. Trying with "resolved" field...');
      
      const { data: updated2, error: updateError2 } = await supabase
        .from('StockAlert')
        .update({ resolved: true })
        .eq('id', alerts[0].id)
        .select();
      
      if (updateError2) {
        console.error('❌ Still error:', updateError2.message);
      } else {
        console.log('✅ Update successful with "resolved" field!');
        console.log(JSON.stringify(updated2[0], null, 2));
      }
    } else {
      console.log('✅ Update successful!');
      console.log(JSON.stringify(updated[0], null, 2));
    }
  }
}

checkStockAlerts();
