import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function GET() {
  try {
    // Get total products
    const { count: totalProducts } = await supabase
      .from('Product')
      .select('*', { count: 'exact', head: true });

    // Get customers in-store count
    const { count: customersInStore } = await supabase
      .from('customers_instore')
      .select('*', { count: 'exact', head: true });

    // Get total customers
    const { count: totalCustomers } = await supabase
      .from('Customer')
      .select('*', { count: 'exact', head: true });

    // Get total revenue from transactions
    const { data: transactions, error: transError } = await supabase
      .from('Transaction')
      .select('total_amount');

    if (transError) {
      console.error('Transaction error:', transError);
    }

    const totalRevenue = transactions?.reduce(
      (sum, t) => sum + (parseFloat(t.total_amount) || 0),
      0
    ) || 0;

    // Get today's revenue
    const today = new Date().toISOString().split('T')[0];
    const { data: todayTransactions } = await supabase
      .from('Transaction')
      .select('total_amount')
      .gte('transaction_date', today);

    const todayRevenue = todayTransactions?.reduce(
      (sum, t) => sum + (parseFloat(t.total_amount) || 0),
      0
    ) || 0;

    // Get stock alerts count
    const { count: stockAlerts } = await supabase
      .from('StockAlert')
      .select('*', { count: 'exact', head: true })
      .eq('resolved', false);

    // Get low stock products
    const { data: lowStockProducts } = await supabase
      .from('Product')
      .select('id, name, current_stock, min_stock_threshold')
      .filter('current_stock', 'lte', 'min_stock_threshold');

    // Get recent transactions (last 5)
    const { data: recentTransactions } = await supabase
      .from('Transaction')
      .select(`
        id,
        transaction_date,
        total_amount,
        payment_method,
        Customer (
          name,
          email
        )
      `)
      .order('transaction_date', { ascending: false })
      .limit(5);

    // Get top selling products (from TransactionItem)
    const { data: topProducts } = await supabase
      .from('TransactionItem')
      .select(`
        product_id,
        quantity,
        Product (
          name,
          price,
          category
        )
      `)
      .order('quantity', { ascending: false })
      .limit(5);

    // Get customer tier distribution
    const { data: tierDistribution } = await supabase
      .from('Customer')
      .select('customer_tier');

    const tierCounts = tierDistribution?.reduce((acc, customer) => {
      const tier = customer.customer_tier || 'BRONZE';
      acc[tier] = (acc[tier] || 0) + 1;
      return acc;
    }, {}) || {};

    return NextResponse.json({
      success: true,
      stats: {
        totalProducts: totalProducts || 0,
        totalCustomers: totalCustomers || 0,
        customersInStore: customersInStore || 0,
        totalRevenue: parseFloat(totalRevenue.toFixed(2)),
        todayRevenue: parseFloat(todayRevenue.toFixed(2)),
        stockAlerts: stockAlerts || 0,
        lowStockCount: lowStockProducts?.length || 0
      },
      recentTransactions: recentTransactions || [],
      topProducts: topProducts || [],
      lowStockProducts: lowStockProducts || [],
      tierDistribution: tierCounts
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
