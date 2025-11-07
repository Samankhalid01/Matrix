require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testAcknowledge() {
  console.log('\n🧪 Testing Stock Alert Acknowledgement...\n');
  
  // Get a pending stock alert
  const { data: alerts, error } = await supabase
    .from('StockAlert')
    .select('*')
    .eq('status', 'pending')
    .limit(1);
  
  if (error || !alerts || alerts.length === 0) {
    console.log('⚠️  No pending alerts to test with');
    return;
  }

  const alert = alerts[0];
  console.log('📋 Alert to acknowledge:');
  console.log(`   ID: ${alert.id}`);
  console.log(`   Product ID: ${alert.product_id}`);
  console.log(`   Status: ${alert.status}`);
  console.log(`   Alert Type: ${alert.alert_type}\n`);

  // Test update
  console.log('🔧 Updating to "resolved" status...');
  const { data: updated, error: updateError } = await supabase
    .from('StockAlert')
    .update({ 
      status: 'resolved',
      acknowledged_at: new Date().toISOString(),
      resolved_at: new Date().toISOString()
    })
    .eq('id', alert.id)
    .select();
  
  if (updateError) {
    console.error('❌ Update failed:', updateError.message);
  } else {
    console.log('✅ Update successful!');
    console.log(JSON.stringify(updated[0], null, 2));
  }

  // Reset it back to pending for testing
  console.log('\n🔄 Resetting back to pending...');
  await supabase
    .from('StockAlert')
    .update({ 
      status: 'pending',
      acknowledged_at: null,
      resolved_at: null
    })
    .eq('id', alert.id);
  
  console.log('✅ Reset complete!\n');
}

testAcknowledge();
