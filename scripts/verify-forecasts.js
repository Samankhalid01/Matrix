require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function verifyForecasts() {
  try {
    console.log('\n📊 Verifying Demand Forecasts in Database...\n');
    
    // Get all forecasts with product details
    const { data: forecasts, error } = await supabase
      .from('DemandForecast')
      .select(`
        *,
        Product:product_id (
          id,
          product_name,
          category
        )
      `)
      .order('forecast_date', { ascending: true });

    if (error) {
      console.error('❌ Error:', error.message);
      return;
    }

    console.log(`✅ Found ${forecasts.length} forecasts in database\n`);
    
    // Group by product
    const byProduct = {};
    forecasts.forEach(f => {
      const productName = f.Product?.product_name || 'Unknown';
      if (!byProduct[productName]) {
        byProduct[productName] = [];
      }
      byProduct[productName].push(f);
    });

    // Display results
    console.log('📋 Forecasts by Product:\n');
    Object.keys(byProduct).forEach(productName => {
      console.log(`\n🔹 ${productName}:`);
      byProduct[productName].forEach(f => {
        console.log(`   ${f.forecast_date} → ${f.predicted_demand} units (Model: ${f.model_version})`);
      });
    });

    // Summary
    console.log('\n' + '═'.repeat(60));
    console.log('📊 SUMMARY:');
    console.log('═'.repeat(60));
    console.log(`Total Forecasts: ${forecasts.length}`);
    console.log(`Total Products: ${Object.keys(byProduct).length}`);
    console.log(`Total Predicted Demand: ${forecasts.reduce((sum, f) => sum + f.predicted_demand, 0)} units`);
    console.log(`Forecast Months: ${[...new Set(forecasts.map(f => f.forecast_date))].join(', ')}`);
    console.log('\n✅ Database verification complete!\n');

  } catch (error) {
    console.error('Fatal error:', error.message);
  }
}

verifyForecasts();
