import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Cache for dashboard stats (15 seconds)
let cachedStats = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 15000; // 15 seconds

export async function GET() {
  try {
    // Return cached data if still fresh
    const now = Date.now();
    if (cachedStats && (now - cacheTimestamp) < CACHE_DURATION) {
      return NextResponse.json(cachedStats, {
        headers: {
          'Cache-Control': 'public, s-maxage=15, stale-while-revalidate=30',
        }
      });
    }

    const today = new Date().toISOString().split('T')[0];

    // Parallelize ALL database queries to reduce waterfall
    const [
      productsCount,
      customersInStoreCount,
      totalCustomersCount,
      allTransactions,
      todayTransactions,
      stockAlertsCount,
      lowStockProducts,
      recentTransactions,
      topProducts,
      tierDistribution
    ] = await Promise.all([
      // Get total products (count only, no data)
      supabase.from('Product').select('id', { count: 'exact', head: true }),
      
      // Get customers in-store count (count only)
      supabase.from('customers_instore').select('id', { count: 'exact', head: true }),
      
      // Get total customers (count only)
      supabase.from('Customer').select('id', { count: 'exact', head: true }),
      
      // Get total revenue from transactions (only amount field)
      supabase.from('Transaction').select('total_amount'),
      
      // Get today's revenue (only amount field)
      supabase.from('Transaction').select('total_amount').gte('transaction_date', today),
      
      // Get stock alerts count (count only)
      supabase.from('StockAlert').select('id', { count: 'exact', head: true }).eq('resolved', false),
      
      // Get low stock products (limit to 20 for speed)
      supabase.from('Product')
        .select('id, product_name, quantity, min_stock_threshold')
        .lte('quantity', 20)
        .limit(20),
      
      // Get recent transactions (last 5, minimal fields)
      supabase.from('Transaction')
        .select(`id, transaction_date, total_amount, payment_method`)
        .order('transaction_date', { ascending: false })
        .limit(5),
      
      // Get top selling products (limit 5, skip for speed - can be lazy loaded)
      supabase.from('TransactionItem')
        .select(`product_id, quantity`)
        .order('quantity', { ascending: false })
        .limit(5),
      
      // Get customer tier distribution (count only, simplified)
      supabase.from('Customer').select('customer_tier').limit(1000) // Limit for speed
    ]);

    // Calculate totals
    const totalRevenue = allTransactions.data?.reduce(
      (sum, t) => sum + (parseFloat(t.total_amount) || 0),
      0
    ) || 0;

    const todayRevenue = todayTransactions.data?.reduce(
      (sum, t) => sum + (parseFloat(t.total_amount) || 0),
      0
    ) || 0;

    const tierCounts = tierDistribution.data?.reduce((acc, customer) => {
      const tier = customer.customer_tier || 'BRONZE';
      acc[tier] = (acc[tier] || 0) + 1;
      return acc;
    }, {}) || {};

    const responseData = {
      success: true,
      stats: {
        totalProducts: productsCount.count || 0,
        totalCustomers: totalCustomersCount.count || 0,
        customersInStore: customersInStoreCount.count || 0,
        totalRevenue: parseFloat(totalRevenue.toFixed(2)),
        todayRevenue: parseFloat(todayRevenue.toFixed(2)),
        stockAlerts: stockAlertsCount.count || 0,
        lowStockCount: lowStockProducts.data?.length || 0
      },
      recentTransactions: recentTransactions.data || [],
      topProducts: topProducts.data || [],
      lowStockProducts: lowStockProducts.data || [],
      tierDistribution: tierCounts
    };

    // Cache the response
    cachedStats = responseData;
    cacheTimestamp = now;

    return NextResponse.json(responseData, {
      headers: {
        'Cache-Control': 'public, s-maxage=15, stale-while-revalidate=30',
      }
    });

  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message,
        stats: {
          totalProducts: 0,
          totalCustomers: 0,
          customersInStore: 0,
          totalRevenue: 0,
          todayRevenue: 0,
          stockAlerts: 0,
          lowStockCount: 0
        }
      },
      { status: 500 }
    );
  }
}
