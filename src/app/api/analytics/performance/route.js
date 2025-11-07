import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// GET: Get performance analytics
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'monthly'; // daily, weekly, monthly, yearly
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    // Calculate date range
    let dateFilter = {};
    const now = new Date();
    
    if (startDate && endDate) {
      dateFilter = {
        start: new Date(startDate),
        end: new Date(endDate)
      };
    } else if (period === 'daily') {
      dateFilter = {
        start: new Date(now.getTime() - 24 * 60 * 60 * 1000),
        end: now
      };
    } else if (period === 'weekly') {
      dateFilter = {
        start: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        end: now
      };
    } else if (period === 'monthly') {
      dateFilter = {
        start: new Date(now.getFullYear(), now.getMonth(), 1),
        end: now
      };
    } else if (period === 'yearly') {
      dateFilter = {
        start: new Date(now.getFullYear(), 0, 1),
        end: now
      };
    }

    // Get transactions in date range
    const { data: transactions, error: transError } = await supabase
      .from('Transaction')
      .select('*, TransactionItem(*)')
      .gte('transaction_date', dateFilter.start.toISOString())
      .lte('transaction_date', dateFilter.end.toISOString());

    if (transError) throw transError;

    // Calculate metrics
    const totalRevenue = transactions?.reduce((sum, t) => sum + parseFloat(t.total_amount || 0), 0) || 0;
    const totalTransactions = transactions?.length || 0;
    const avgTransactionValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

    // Get unique customers
    const uniqueCustomers = new Set(transactions?.map(t => t.customer_id).filter(id => id));
    
    // Get product performance
    const { data: productPerf, error: perfError } = await supabase
      .from('product_performance')
      .select('*')
      .order('total_revenue', { ascending: false })
      .limit(10);

    if (perfError) throw perfError;

    // Top products (from current transactions)
    const productSales = {};
    transactions?.forEach(trans => {
      trans.TransactionItem?.forEach(item => {
        if (!productSales[item.product_id]) {
          productSales[item.product_id] = {
            product_id: item.product_id,
            product_name: item.product_name,
            units_sold: 0,
            revenue: 0
          };
        }
        productSales[item.product_id].units_sold += item.quantity;
        productSales[item.product_id].revenue += parseFloat(item.total_price);
      });
    });

    const topProducts = Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // Underperforming products (from product_performance view)
    const underperformingProducts = productPerf
      ?.filter(p => parseInt(p.total_units_sold) < 5)
      .slice(0, 10) || [];

    // Sales trend by day
    const salesByDay = {};
    transactions?.forEach(trans => {
      const date = new Date(trans.transaction_date).toISOString().split('T')[0];
      if (!salesByDay[date]) {
        salesByDay[date] = { date, revenue: 0, transactions: 0 };
      }
      salesByDay[date].revenue += parseFloat(trans.total_amount);
      salesByDay[date].transactions++;
    });

    const salesTrend = Object.values(salesByDay).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    return NextResponse.json({
      success: true,
      period,
      dateRange: {
        start: dateFilter.start,
        end: dateFilter.end
      },
      metrics: {
        totalRevenue: parseFloat(totalRevenue.toFixed(2)),
        totalTransactions,
        avgTransactionValue: parseFloat(avgTransactionValue.toFixed(2)),
        uniqueCustomers: uniqueCustomers.size
      },
      topProducts,
      underperformingProducts,
      salesTrend,
      productPerformance: productPerf
    });
  } catch (error) {
    console.error('Error fetching performance analytics:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
