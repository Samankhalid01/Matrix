import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '7days';

    console.log('📊 Fetching analytics data for period:', period);

    // Fetch all necessary data
    const [productsRes, customersRes, transactionsRes, cartRes] = await Promise.all([
      supabase.from('Product').select('*'),
      supabase.from('Customer').select('*'),
      supabase.from('Transaction').select('*'),
      supabase.from('Cart').select('*, Product(*)')
    ]);

    if (productsRes.error) throw productsRes.error;
    if (customersRes.error) throw customersRes.error;

    const products = productsRes.data || [];
    const customers = customersRes.data || [];
    const transactions = transactionsRes.data || [];
    const cartItems = cartRes.data || [];

    // Calculate analytics
    const totalSales = transactions.reduce((sum, t) => sum + (t.total_amount || 0), 0);
    const customerCount = customers.length;
    const avgOrderValue = transactions.length > 0 ? totalSales / transactions.length : 0;

    // Calculate product performance
    const productSales = {};
    transactions.forEach(t => {
      if (t.product_id) {
        if (!productSales[t.product_id]) {
          productSales[t.product_id] = { quantity: 0, revenue: 0 };
        }
        productSales[t.product_id].quantity += t.quantity || 0;
        productSales[t.product_id].revenue += t.total_amount || 0;
      }
    });

    // Get top products
    const topProducts = products
      .map(p => ({
        name: p.product_name,
        sales: productSales[p.id]?.quantity || 0,
        revenue: productSales[p.id]?.revenue || 0
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Calculate daily sales (mock for now - would need date-based grouping)
    const salesData = [
      { day: 'Mon', sales: Math.floor(totalSales * 0.12) },
      { day: 'Tue', sales: Math.floor(totalSales * 0.15) },
      { day: 'Wed', sales: Math.floor(totalSales * 0.13) },
      { day: 'Thu', sales: Math.floor(totalSales * 0.16) },
      { day: 'Fri', sales: Math.floor(totalSales * 0.18) },
      { day: 'Sat', sales: Math.floor(totalSales * 0.14) },
      { day: 'Sun', sales: Math.floor(totalSales * 0.12) }
    ];

    // Calculate monthly growth (comparing with previous period - would need historical data)
    const monthlyGrowth = 8.5; // Mock for now

    const analytics = {
      totalSales: parseFloat(totalSales.toFixed(2)),
      monthlyGrowth,
      customerCount,
      avgOrderValue: parseFloat(avgOrderValue.toFixed(2)),
      topProducts,
      salesData,
      productCount: products.length,
      transactionCount: transactions.length,
      activeCartCount: cartItems.length
    };

    console.log('✅ Analytics calculated:', analytics);

    return Response.json({
      success: true,
      analytics
    });

  } catch (error) {
    console.error('❌ Analytics error:', error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
