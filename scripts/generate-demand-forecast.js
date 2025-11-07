require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

console.log('\n📊 Generating Demand Forecast Data...\n');

// Simple ML-like prediction using moving averages and trend analysis
function calculateDemandForecast(historicalData) {
  if (historicalData.length === 0) return 0;
  
  // Calculate moving average
  const sum = historicalData.reduce((acc, val) => acc + val, 0);
  const avg = sum / historicalData.length;
  
  // Calculate trend (simple linear regression)
  let trend = 0;
  if (historicalData.length > 1) {
    const recentAvg = historicalData.slice(-3).reduce((a, b) => a + b, 0) / 3;
    const olderAvg = historicalData.slice(0, 3).reduce((a, b) => a + b, 0) / 3;
    trend = (recentAvg - olderAvg) / historicalData.length;
  }
  
  // Forecast = moving average + trend adjustment
  const forecast = Math.max(0, Math.round(avg + (trend * 3)));
  
  return forecast;
}

function calculateConfidenceScore(historicalData) {
  if (historicalData.length < 3) return 0.3;
  
  // Calculate variance
  const avg = historicalData.reduce((a, b) => a + b, 0) / historicalData.length;
  const variance = historicalData.reduce((acc, val) => acc + Math.pow(val - avg, 2), 0) / historicalData.length;
  const stdDev = Math.sqrt(variance);
  
  // Higher variance = lower confidence
  const cv = stdDev / (avg || 1); // coefficient of variation
  const confidence = Math.max(0.1, Math.min(0.95, 1 - (cv / 2)));
  
  return parseFloat(confidence.toFixed(2));
}

async function generateDemandForecasts() {
  try {
    // Get all products
    const { data: products, error: productsError } = await supabase
      .from('Product')
      .select('id, product_name, category, price');

    if (productsError) throw productsError;

    console.log(`📦 Found ${products.length} products\n`);

    // Generate forecasts for next 3 months
    const forecastMonths = ['2025-12', '2026-01', '2026-02'];
    const forecasts = [];

    for (const product of products) {
      // Get historical transaction data for this product
      const { data: transactionItems } = await supabase
        .from('TransactionItem')
        .select(`
          quantity,
          Transaction!inner(transaction_date)
        `)
        .eq('product_id', product.id)
        .order('Transaction(transaction_date)', { ascending: true });

      // Calculate monthly sales for last 6 months
      const monthlySales = {};
      transactionItems?.forEach(item => {
        const month = item.Transaction.transaction_date.substring(0, 7); // YYYY-MM
        monthlySales[month] = (monthlySales[month] || 0) + item.quantity;
      });

      const historicalQuantities = Object.values(monthlySales);
      
      // Generate forecast for each month
      forecastMonths.forEach(month => {
        const predictedDemand = calculateDemandForecast(historicalQuantities);
        const confidence = calculateConfidenceScore(historicalQuantities);
        
        forecasts.push({
          product_id: product.id,
          forecast_date: month + '-01', // YYYY-MM-DD format
          predicted_demand: predictedDemand,
          model_version: 'v1.0-moving-average'
        });
      });

      console.log(`✅ ${product.product_name}: Forecast generated`);
      console.log(`   Historical sales: ${historicalQuantities.join(', ')}`);
      console.log(`   Next month prediction: ${calculateDemandForecast(historicalQuantities)} units`);
      console.log(`   Confidence: ${(calculateConfidenceScore(historicalQuantities) * 100).toFixed(0)}%\n`);
    }

    // Delete existing forecasts for these months
    for (const month of forecastMonths) {
      await supabase
        .from('DemandForecast')
        .delete()
        .eq('forecast_date', month + '-01');
    }

    // Insert new forecasts
    const { data: inserted, error: insertError } = await supabase
      .from('DemandForecast')
      .insert(forecasts)
      .select();

    if (insertError) {
      console.error('❌ Error inserting forecasts:', insertError.message);
      throw insertError;
    }

    console.log('\n' + '═'.repeat(60));
    console.log('✅ DEMAND FORECAST GENERATION COMPLETE!');
    console.log('═'.repeat(60));
    console.log(`\n📊 Generated ${inserted.length} forecasts`);
    console.log(`📅 Forecast periods: ${forecastMonths.join(', ')}`);
    console.log(`🤖 Model: Moving Average with Trend Analysis`);
    console.log(`📈 Confidence scores: 10% - 95%\n`);

  } catch (error) {
    console.error('\n❌ Fatal error:', error.message);
    process.exit(1);
  }
}

generateDemandForecasts();
