import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Simple Moving Average forecast
function calculateMovingAverage(data, windowSize = 7) {
  const result = [];
  for (let i = 0; i < data.length; i++) {
    if (i < windowSize - 1) {
      result.push(null);
    } else {
      const sum = data.slice(i - windowSize + 1, i + 1).reduce((a, b) => a + b, 0);
      result.push(sum / windowSize);
    }
  }
  return result;
}

// GET: Generate demand forecast
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('product_id');
    const forecastDays = parseInt(searchParams.get('days')) || 30;

    // Get historical sales data (last 90 days)
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    let query = supabase
      .from('TransactionItem')
      .select(`
        quantity,
        created_at,
        Transaction!inner(transaction_date),
        Product(id, product_name)
      `)
      .gte('Transaction.transaction_date', ninetyDaysAgo.toISOString())
      .order('Transaction.transaction_date', { ascending: true });

    if (productId) {
      query = query.eq('product_id', productId);
    }

    const { data: salesData, error } = await query;

    if (error) throw error;

    if (!salesData || salesData.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No historical data available for forecast'
      });
    }

    // Group sales by date and product
    const productSales = {};
    salesData.forEach(item => {
      const productId = item.Product?.id;
      const date = new Date(item.Transaction.transaction_date).toISOString().split('T')[0];
      
      if (!productSales[productId]) {
        productSales[productId] = {
          product_id: productId,
          product_name: item.Product?.product_name,
          dailySales: {}
        };
      }
      
      if (!productSales[productId].dailySales[date]) {
        productSales[productId].dailySales[date] = 0;
      }
      
      productSales[productId].dailySales[date] += item.quantity;
    });

    // Generate forecasts for each product
    const forecasts = [];

    Object.values(productSales).forEach(product => {
      const dates = Object.keys(product.dailySales).sort();
      const quantities = dates.map(date => product.dailySales[date]);

      // Calculate moving average (7-day window)
      const movingAvg = calculateMovingAverage(quantities, 7);
      const validAvg = movingAvg.filter(v => v !== null);
      const avgDemand = validAvg.length > 0 
        ? validAvg.reduce((a, b) => a + b, 0) / validAvg.length 
        : 0;

      // Calculate trend (simple linear regression)
      const n = quantities.length;
      const sumX = (n * (n - 1)) / 2;
      const sumY = quantities.reduce((a, b) => a + b, 0);
      const sumXY = quantities.reduce((sum, y, i) => sum + i * y, 0);
      const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6;
      
      const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
      const intercept = (sumY - slope * sumX) / n;

      // Generate forecast for next N days
      const forecastData = [];
      const today = new Date();
      
      for (let i = 1; i <= forecastDays; i++) {
        const forecastDate = new Date(today);
        forecastDate.setDate(today.getDate() + i);
        
        // Predict using linear trend + moving average
        const trendPrediction = intercept + slope * (n + i);
        const prediction = Math.max(0, Math.round((trendPrediction + avgDemand) / 2));
        
        forecastData.push({
          date: forecastDate.toISOString().split('T')[0],
          predicted_demand: prediction,
          confidence: 70 // Simple confidence score
        });
      }

      forecasts.push({
        product_id: product.product_id,
        product_name: product.product_name,
        historical_data: {
          dates,
          quantities,
          avg_daily_demand: Math.round(avgDemand)
        },
        forecast: forecastData,
        method: 'moving_average_with_trend',
        total_predicted_demand: forecastData.reduce((sum, f) => sum + f.predicted_demand, 0)
      });
    });

    return NextResponse.json({
      success: true,
      forecasts,
      period: `${forecastDays} days`,
      method: 'Moving Average with Linear Trend',
      generated_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error generating forecast:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
