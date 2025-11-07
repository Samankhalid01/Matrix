require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkTable() {
  try {
    // First, delete any test records
    await supabase
      .from('DemandForecast')
      .delete()
      .eq('product_id', 1)
      .eq('forecast_date', '2025-12-01');
    
    // Try inserting with all required fields
    console.log('Trying insert with all required fields...');
    const { data, error } = await supabase
      .from('DemandForecast')
      .insert({ 
        product_id: 1, 
        forecast_date: '2025-12-01',
        predicted_demand: 100,
        model_version: 'test'
      })
      .select();

    if (!error) {
      console.log('✅ Insert successful!');
      console.log('Inserted data:', JSON.stringify(data, null, 2));
      console.log('\n📋 Table columns:', Object.keys(data[0]).join(', '));
      
      // Clean up test record
      await supabase
        .from('DemandForecast')
        .delete()
        .eq('product_id', 1)
        .eq('forecast_date', '2025-12-01');
      console.log('\n🧹 Cleaned up test record');
    } else {
      console.log('❌ Error:', error.message);
    }
  } catch (error) {
    console.error('Fatal error:', error.message);
  }
}

checkTable();
