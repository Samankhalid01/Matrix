import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate') || '2025-01-01';
    const endDate = searchParams.get('endDate') || new Date().toISOString().split('T')[0];
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Get all transactions in date range
    const { data: transactions, error: transError } = await supabase
      .from('Transaction')
      .select(`
        id,
        transaction_date,
        total_amount,
        payment_method,
        TransactionItem (
          product_id,
          quantity,
          unit_price,
          total_price
        )
      `)
      .gte('transaction_date', startDate)
      .lte('transaction_date', endDate);

    if (transError) throw transError;

    // Get all products
    const { data: products, error: prodError } = await supabase
      .from('Product')
      .select('id, product_name, category, price, current_stock, min_stock_threshold');

    if (prodError) throw prodError;

    // Calculate product performance
    const productStats = {};
    
    transactions.forEach(transaction => {
      transaction.TransactionItem.forEach(item => {
        if (!productStats[item.product_id]) {
          productStats[item.product_id] = {
            totalSold: 0,
            totalRevenue: 0,
            transactionCount: 0
          };
        }
        productStats[item.product_id].totalSold += item.quantity;
        productStats[item.product_id].totalRevenue += parseFloat(item.total_price || 0);
        productStats[item.product_id].transactionCount++;
      });
    });

    // Combine product info with stats
    const productPerformance = products.map(product => {
      const stats = productStats[product.id] || { totalSold: 0, totalRevenue: 0, transactionCount: 0 };
      return {
        id: product.id,
        name: product.product_name,
        category: product.category,
        price: product.price,
        currentStock: product.current_stock,
        minStock: product.min_stock_threshold,
        totalSold: stats.totalSold,
        totalRevenue: stats.totalRevenue,
        transactionCount: stats.transactionCount,
        avgRevenuePerTransaction: stats.transactionCount > 0 ? stats.totalRevenue / stats.transactionCount : 0,
        stockStatus: product.current_stock <= product.min_stock_threshold ? 'low' : 'healthy'
      };
    });

    // Filter by category if specified
    const filteredProducts = category 
      ? productPerformance.filter(p => p.category === category)
      : productPerformance;

    // Sort by total revenue
    filteredProducts.sort((a, b) => b.totalRevenue - a.totalRevenue);

    // Top selling products
    const topSelling = filteredProducts.slice(0, limit);

    // Underperforming products (lowest revenue, excluding zero sales)
    const underperforming = filteredProducts
      .filter(p => p.totalSold > 0)
      .sort((a, b) => a.totalRevenue - b.totalRevenue)
      .slice(0, limit);

    // Zero sales products
    const zeroSales = filteredProducts.filter(p => p.totalSold === 0);

    // Overall statistics
    const totalRevenue = filteredProducts.reduce((sum, p) => sum + p.totalRevenue, 0);
    const totalUnitsSold = filteredProducts.reduce((sum, p) => sum + p.totalSold, 0);
    const avgRevenuePerProduct = totalRevenue / (filteredProducts.length || 1);

    // Revenue by category
    const categoryStats = filteredProducts.reduce((acc, product) => {
      const cat = product.category || 'Uncategorized';
      if (!acc[cat]) {
        acc[cat] = {
          category: cat,
          totalRevenue: 0,
          totalSold: 0,
          productCount: 0
        };
      }
      acc[cat].totalRevenue += product.totalRevenue;
      acc[cat].totalSold += product.totalSold;
      acc[cat].productCount++;
      return acc;
    }, {});

    // Stock alerts
    const lowStockProducts = filteredProducts.filter(p => p.stockStatus === 'low');
    const outOfStockProducts = filteredProducts.filter(p => p.currentStock === 0);

    return NextResponse.json({
      success: true,
      dateRange: { startDate, endDate },
      summary: {
        totalRevenue: parseFloat(totalRevenue.toFixed(2)),
        totalUnitsSold,
        totalProducts: filteredProducts.length,
        avgRevenuePerProduct: parseFloat(avgRevenuePerProduct.toFixed(2)),
        totalTransactions: transactions.length,
        lowStockCount: lowStockProducts.length,
        outOfStockCount: outOfStockProducts.length,
        zeroSalesCount: zeroSales.length
      },
      topSelling,
      underperforming,
      zeroSales: zeroSales.slice(0, 10),
      categoryPerformance: Object.values(categoryStats).sort((a, b) => b.totalRevenue - a.totalRevenue),
      lowStockProducts,
      outOfStockProducts
    });

  } catch (error) {
    console.error('Performance report error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
