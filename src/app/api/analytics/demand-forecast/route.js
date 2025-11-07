import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('product_id') || searchParams.get('productId');
    const month = searchParams.get('month');

    console.log('🔍 Demand Forecast API called - Product ID:', productId);

    // If specific product requested, get detailed forecast with historical data
    if (productId) {
      console.log('📊 Fetching forecasts for product:', productId);
      
      // Get product info first - select only fields that exist
      const { data: productData, error: productError } = await supabase
        .from('Product')
        .select('product_id, product_name, category, price, quantity')
        .eq('product_id', productId)
        .single();

      if (productError) {
        console.error('❌ Product fetch error:', productError);
        throw productError;
      }

      console.log('✅ Product found:', productData?.product_name);

      // Get forecasts for this product
      const { data: forecasts, error: forecastError } = await supabase
        .from('DemandForecast')
        .select('*')
        .eq('product_id', productId)
        .order('forecast_date', { ascending: true });

      if (forecastError) {
        console.error('❌ Forecast fetch error:', forecastError);
        throw forecastError;
      }

      console.log('📈 Forecasts found:', forecasts?.length || 0);

      // Get historical sales data (last 90 days)
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

      const { data: transactions, error: txError } = await supabase
        .from('Transaction')
        .select('quantity, created_at')
        .eq('product_id', productId)
        .gte('created_at', ninetyDaysAgo.toISOString())
        .order('created_at', { ascending: true });

      if (txError) {
        console.error('❌ Transaction fetch error:', txError);
        throw txError;
      }

      console.log('📊 Transactions found:', transactions?.length || 0);

      // Aggregate sales by date
      const salesByDate = {};
      (transactions || []).forEach(tx => {
        const date = tx.created_at.split('T')[0];
        salesByDate[date] = (salesByDate[date] || 0) + (tx.quantity || 0);
      });

      const dates = Object.keys(salesByDate).sort();
      const quantities = dates.map(date => salesByDate[date]);
      const avgDailyDemand = quantities.length > 0 
        ? Math.round(quantities.reduce((a, b) => a + b, 0) / quantities.length)
        : 0;

      // If no forecasts exist, generate simple ones based on historical data
      let forecastData = forecasts;
      if (!forecasts || forecasts.length === 0) {
        console.log('⚠️ No forecasts in database, generating sample data');
        const baselineDemand = avgDailyDemand || 5;
        forecastData = [];
        for (let i = 1; i <= 3; i++) {
          const forecastDate = new Date();
          forecastDate.setMonth(forecastDate.getMonth() + i);
          forecastData.push({
            forecast_date: forecastDate.toISOString().split('T')[0],
            predicted_demand: Math.round(baselineDemand * 30 * (1 + Math.random() * 0.2)),
            confidence_level: 0.75,
            forecast_method: 'simple_moving_average'
          });
        }
      }
      
      console.log('✅ Returning forecast data:', forecastData.length, 'months');
      
      return NextResponse.json({
        success: true,
        forecasts: [{
          product_id: productId,
          product_name: productData.product_name,
          forecast: forecastData.map(f => ({
            forecast_date: f.forecast_date,
            predicted_demand: f.predicted_demand,
            confidence_level: f.confidence_level,
            forecast_method: f.forecast_method
          })),
          total_predicted_demand: forecastData.reduce((sum, f) => sum + (f.predicted_demand || 0), 0),
          method: forecastData[0]?.forecast_method || 'moving_average_with_trend',
          historical_data: {
            dates,
            quantities,
            avg_daily_demand: avgDailyDemand
          }
        }]
      });
    }

    // Otherwise return all forecasts (without foreign key relationship)
    let query = supabase
      .from('DemandForecast')
      .select('*')
      .order('forecast_date', { ascending: true });

    if (month) {
      query = query.like('forecast_date', `${month}%`);
    }

    const { data: forecasts, error } = await query;

    if (error) throw error;

    // Get all unique product IDs from forecasts
    const productIds = [...new Set(forecasts.map(f => f.product_id))];
    
    // Fetch product details separately
    const { data: products, error: productsError } = await supabase
      .from('Product')
      .select('product_id, product_name, category, price, quantity')
      .in('product_id', productIds);

    if (productsError) throw productsError;

    // Create a product lookup map
    const productMap = {};
    (products || []).forEach(p => {
      productMap[p.product_id] = p;
    });

    // Combine forecasts with product data
    const enrichedForecasts = forecasts.map(f => ({
      ...f,
      Product: productMap[f.product_id] || null
    }));

    const totalForecasts = enrichedForecasts.length;
    const totalPredictedDemand = enrichedForecasts.reduce((sum, f) => sum + (f.predicted_demand || 0), 0);

    const byMonth = enrichedForecasts.reduce((acc, forecast) => {
      const month = forecast.forecast_date.substring(0, 7);
      if (!acc[month]) {
        acc[month] = {
          month,
          totalDemand: 0,
          products: []
        };
      }
      acc[month].totalDemand += forecast.predicted_demand || 0;
      acc[month].products.push({
        id: forecast.Product?.product_id,
        name: forecast.Product?.product_name,
        demand: forecast.predicted_demand
      });
      return acc;
    }, {});

    return NextResponse.json({
      success: true,
      forecasts: enrichedForecasts,
      summary: {
        totalForecasts,
        totalPredictedDemand,
        forecastsByMonth: Object.values(byMonth)
      }
    });

  } catch (error) {
    console.error('Demand forecast error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
