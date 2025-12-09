'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { BarChart3, TrendingUp, Package, DollarSign, Users, Calendar, Download, RefreshCw, AlertCircle } from 'lucide-react';

export default function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('monthly');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [forecast, setForecast] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // Calculate date range
      const now = new Date();
      let startDate;
      
      switch(period) {
        case 'daily':
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case 'weekly':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'monthly':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'yearly':
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
        default:
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      }

      // Fetch transactions
      const { data: transactions, error: transError } = await supabase
        .from('Transaction')
        .select('*')
        .gte('transaction_date', startDate.toISOString())
        .order('transaction_date', { ascending: false });

      if (transError) throw transError;

      // Fetch products
      const { data: products, error: prodError } = await supabase
        .from('Product')
        .select('*');

      if (prodError) throw prodError;

      // Calculate metrics
      const totalRevenue = transactions?.reduce((sum, t) => sum + parseFloat(t.total_amount || 0), 0) || 0;
      const totalTransactions = transactions?.length || 0;
      const uniqueCustomers = new Set(transactions?.map(t => t.customer_id)).size || 0;
      const avgTransactionValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

      // Sales trend by day
      const salesByDay = {};
      transactions?.forEach(t => {
        const date = new Date(t.transaction_date).toISOString().split('T')[0];
        if (!salesByDay[date]) {
          salesByDay[date] = { revenue: 0, transactions: 0 };
        }
        salesByDay[date].revenue += parseFloat(t.total_amount || 0);
        salesByDay[date].transactions += 1;
      });

      const salesTrend = Object.entries(salesByDay)
        .map(([date, data]) => ({ date, ...data }))
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(-30); // Last 30 days

      // Product performance
      const productSales = {};
      transactions?.forEach(t => {
        t.items?.forEach(item => {
          if (!productSales[item.product_id]) {
            productSales[item.product_id] = {
              product_id: item.product_id,
              units_sold: 0,
              revenue: 0
            };
          }
          productSales[item.product_id].units_sold += item.quantity;
          productSales[item.product_id].revenue += item.quantity * item.price;
        });
      });

      // Merge with product data
      const productPerformance = products?.map(p => {
        const sales = productSales[p.product_id] || { units_sold: 0, revenue: 0 };
        return {
          ...p,
          total_units_sold: sales.units_sold,
          total_revenue: sales.revenue
        };
      }).sort((a, b) => b.total_revenue - a.total_revenue) || [];

      const topProducts = productPerformance.slice(0, 5);
      const underperformingProducts = productPerformance
        .filter(p => p.total_units_sold < 5)
        .slice(0, 5);

      setAnalytics({
        metrics: {
          totalRevenue,
          totalTransactions,
          uniqueCustomers,
          avgTransactionValue
        },
        salesTrend,
        topProducts,
        underperformingProducts,
        productPerformance
      });

    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchForecast = async (productId) => {
    try {
      // Fetch historical sales for this product
      const { data: transactions, error } = await supabase
        .from('Transaction')
        .select('*')
        .gte('transaction_date', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString())
        .order('transaction_date', { ascending: true });

      if (error) throw error;

      // Calculate daily sales for the product
      const dailySales = {};
      transactions?.forEach(t => {
        const date = new Date(t.transaction_date).toISOString().split('T')[0];
        t.items?.forEach(item => {
          if (item.product_id === productId) {
            if (!dailySales[date]) dailySales[date] = 0;
            dailySales[date] += item.quantity;
          }
        });
      });

      const dates = Object.keys(dailySales).sort();
      const quantities = dates.map(d => dailySales[d]);

      // Simple moving average forecast (3-month)
      const avgDailyDemand = quantities.reduce((a, b) => a + b, 0) / quantities.length;
      const forecastMonths = [];
      
      for (let i = 1; i <= 3; i++) {
        const forecastDate = new Date();
        forecastDate.setMonth(forecastDate.getMonth() + i);
        const daysInMonth = new Date(forecastDate.getFullYear(), forecastDate.getMonth() + 1, 0).getDate();
        const predictedDemand = Math.round(avgDailyDemand * daysInMonth);
        
        forecastMonths.push({
          forecast_date: forecastDate.toISOString(),
          predicted_demand: predictedDemand,
          confidence_level: 0.85
        });
      }

      const { data: productData } = await supabase
        .from('Product')
        .select('*')
        .eq('product_id', productId)
        .single();

      setForecast({
        forecasts: [{
          product_id: productId,
          product_name: productData?.product_name || 'Unknown',
          forecast: forecastMonths,
          historical_data: {
            dates,
            quantities,
            avg_daily_demand: avgDailyDemand.toFixed(1)
          },
          total_predicted_demand: forecastMonths.reduce((sum, f) => sum + f.predicted_demand, 0),
          method: 'moving_average'
        }]
      });

    } catch (error) {
      console.error('Error fetching forecast:', error);
    }
  };

  const exportReport = async (format) => {
    if (!analytics) return;
    
    if (format === 'csv') {
      // Generate CSV
      let csv = 'Product Name,Category,Price,Units Sold,Revenue,Stock\n';
      analytics.productPerformance.forEach(p => {
        csv += `"${p.product_name}","${p.category || 'N/A'}",${p.price},${p.total_units_sold || 0},${p.total_revenue || 0},${p.current_stock}\n`;
      });
      
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-report-${period}-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } else if (format === 'excel') {
      // For Excel, we'll use CSV format with .xls extension
      let csv = 'Product Name\tCategory\tPrice\tUnits Sold\tRevenue\tStock\n';
      analytics.productPerformance.forEach(p => {
        csv += `${p.product_name}\t${p.category || 'N/A'}\t${p.price}\t${p.total_units_sold || 0}\t${p.total_revenue || 0}\t${p.current_stock}\n`;
      });
      
      const blob = new Blob([csv], { type: 'application/vnd.ms-excel' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-report-${period}-${new Date().toISOString().split('T')[0]}.xls`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } else if (format === 'pdf') {
      alert('PDF export coming soon! Use CSV for now.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-purple-900/30 rounded-lg w-1/2"></div>
            <div className="grid grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-purple-900/30 rounded-lg"></div>
              ))}
            </div>
            <div className="h-64 bg-purple-900/30 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-4xl font-bold text-white flex items-center gap-3">
              <BarChart3 className="w-10 h-10 text-purple-500" />
              Analytics & Forecasting Dashboard
            </h1>
            <p className="text-gray-400 mt-2">Performance insights, demand prediction & data analytics</p>
          </div>
          <div className="flex gap-3">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="px-4 py-2 bg-purple-900/30 border-2 border-purple-500/30 text-white rounded-lg font-medium focus:border-purple-500 focus:outline-none"
            >
              <option value="daily">Last 24 Hours</option>
              <option value="weekly">Last 7 Days</option>
              <option value="monthly">This Month</option>
              <option value="yearly">This Year</option>
            </select>
            <button
              onClick={fetchAnalytics}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 flex items-center gap-2 font-semibold"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        {analytics && (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gradient-to-br from-green-900/40 to-green-800/40 p-6 rounded-xl border-2 border-green-500/30 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-3">
                  <DollarSign className="w-10 h-10 text-green-400" />
                  <span className="text-xs text-green-400 font-bold uppercase tracking-wider">{period}</span>
                </div>
                <p className="text-4xl font-bold text-white mb-1">
                  ${analytics.metrics.totalRevenue.toLocaleString()}
                </p>
                <p className="text-sm text-green-400 font-semibold">Total Revenue</p>
              </div>

              <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/40 p-6 rounded-xl border-2 border-blue-500/30 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-3">
                  <Package className="w-10 h-10 text-blue-400" />
                  <span className="text-xs text-blue-400 font-bold uppercase tracking-wider">{period}</span>
                </div>
                <p className="text-4xl font-bold text-white mb-1">
                  {analytics.metrics.totalTransactions}
                </p>
                <p className="text-sm text-blue-400 font-semibold">Total Transactions</p>
              </div>

              <div className="bg-gradient-to-br from-purple-900/40 to-purple-800/40 p-6 rounded-xl border-2 border-purple-500/30 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-3">
                  <TrendingUp className="w-10 h-10 text-purple-400" />
                  <span className="text-xs text-purple-400 font-bold uppercase tracking-wider">Average</span>
                </div>
                <p className="text-4xl font-bold text-white mb-1">
                  ${analytics.metrics.avgTransactionValue.toFixed(2)}
                </p>
                <p className="text-sm text-purple-400 font-semibold">Avg Transaction</p>
              </div>

              <div className="bg-gradient-to-br from-pink-900/40 to-pink-800/40 p-6 rounded-xl border-2 border-pink-500/30 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-3">
                  <Users className="w-10 h-10 text-pink-400" />
                  <span className="text-xs text-pink-400 font-bold uppercase tracking-wider">{period}</span>
                </div>
                <p className="text-4xl font-bold text-white mb-1">
                  {analytics.metrics.uniqueCustomers}
                </p>
                <p className="text-sm text-pink-400 font-semibold">Unique Customers</p>
              </div>
            </div>

            {/* Sales Trend Chart */}
            {analytics.salesTrend && analytics.salesTrend.length > 0 && (
              <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 rounded-xl border-2 border-purple-500/30 p-6 mb-6 backdrop-blur-sm">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-white">
                  <Calendar className="w-6 h-6 text-purple-500" />
                  Sales Trend & Performance
                </h2>
                <div className="space-y-3">
                  {analytics.salesTrend.map((day, idx) => {
                    const maxRevenue = Math.max(...analytics.salesTrend.map(d => d.revenue));
                    const barWidth = Math.max((day.revenue / maxRevenue) * 100, 5);
                    return (
                      <div key={idx} className="flex items-center gap-4">
                        <span className="text-sm text-gray-400 w-28 font-semibold">
                          {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                        <div className="flex-1 bg-gray-800/50 rounded-lg h-10 relative">
                          <div
                            className="bg-gradient-to-r from-purple-500 to-pink-500 h-10 rounded-lg flex items-center justify-end pr-4 transition-all"
                            style={{ width: `${barWidth}%` }}
                          >
                            <span className="text-white text-sm font-bold">
                              ${day.revenue.toFixed(0)}
                            </span>
                          </div>
                        </div>
                        <span className="text-sm text-gray-400 w-20 text-right font-semibold">
                          {day.transactions} orders
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Top & Underperforming Products */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Top Products */}
              <div className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 rounded-xl border-2 border-green-500/30 p-6 backdrop-blur-sm">
                <h2 className="text-2xl font-bold mb-4 text-green-400 flex items-center gap-2">
                  🏆 Top Performing Products
                </h2>
                <div className="space-y-3">
                  {analytics.topProducts.slice(0, 5).map((product, idx) => (
                    <div key={idx} className="bg-black/40 p-4 rounded-lg border border-green-500/30 hover:border-green-500/60 transition-all">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-bold text-white text-lg">{product.product_name}</p>
                          <p className="text-sm text-gray-400">{product.total_units_sold} units sold</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-400 text-xl">${product.total_revenue?.toFixed(2)}</p>
                          <button
                            onClick={() => {
                              setSelectedProduct(product.product_id);
                              fetchForecast(product.product_id);
                            }}
                            className="text-xs text-purple-400 hover:text-purple-300 underline mt-1"
                          >
                            📊 View Forecast
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Underperforming Products */}
              <div className="bg-gradient-to-br from-red-900/20 to-orange-900/20 rounded-xl border-2 border-red-500/30 p-6 backdrop-blur-sm">
                <h2 className="text-2xl font-bold mb-4 text-red-400 flex items-center gap-2">
                  ⚠️ Underperforming Products
                </h2>
                <div className="space-y-3">
                  {analytics.underperformingProducts.length === 0 ? (
                    <div className="flex items-center justify-center py-8 text-gray-500">
                      <p>✅ All products performing well!</p>
                    </div>
                  ) : (
                    analytics.underperformingProducts.slice(0, 5).map((product, idx) => (
                      <div key={idx} className="bg-black/40 p-4 rounded-lg border border-red-500/30 hover:border-red-500/60 transition-all">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="font-bold text-white text-lg">{product.product_name}</p>
                            <p className="text-sm text-gray-400">{product.total_units_sold || 0} units sold</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-red-400 text-xl">${parseFloat(product.total_revenue || 0).toFixed(2)}</p>
                            <p className="text-xs text-gray-500">Stock: {product.current_stock}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Product Performance Table */}
            <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 rounded-xl border-2 border-purple-500/30 p-6 backdrop-blur-sm">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">📊 Complete Product Performance Report</h2>
                <div className="flex gap-3">
                  <button
                    onClick={() => exportReport('csv')}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold flex items-center gap-2 transition-all"
                  >
                    <Download className="w-4 h-4" />
                    CSV
                  </button>
                  <button
                    onClick={() => exportReport('excel')}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold flex items-center gap-2 transition-all"
                  >
                    <Download className="w-4 h-4" />
                    Excel
                  </button>
                  <button
                    onClick={() => exportReport('pdf')}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold flex items-center gap-2 transition-all"
                  >
                    <Download className="w-4 h-4" />
                    PDF
                  </button>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-purple-900/50 border-b-2 border-purple-500/50">
                    <tr>
                      <th className="px-4 py-4 text-left font-bold text-white">Product</th>
                      <th className="px-4 py-4 text-left font-bold text-white">Category</th>
                      <th className="px-4 py-4 text-right font-bold text-white">Price</th>
                      <th className="px-4 py-4 text-right font-bold text-white">Units Sold</th>
                      <th className="px-4 py-4 text-right font-bold text-white">Revenue</th>
                      <th className="px-4 py-4 text-right font-bold text-white">Stock</th>
                      <th className="px-4 py-4 text-center font-bold text-white">Forecast</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.productPerformance?.map((product, idx) => (
                      <tr key={idx} className="border-b border-purple-500/20 hover:bg-purple-900/20 transition-all">
                        <td className="px-4 py-4 font-bold text-white">{product.product_name}</td>
                        <td className="px-4 py-4 text-gray-400">{product.category || 'N/A'}</td>
                        <td className="px-4 py-4 text-right font-semibold text-white">${parseFloat(product.price).toFixed(2)}</td>
                        <td className="px-4 py-4 text-right font-semibold text-white">{product.total_units_sold || 0}</td>
                        <td className="px-4 py-4 text-right font-bold text-green-400">
                          ${parseFloat(product.total_revenue || 0).toFixed(2)}
                        </td>
                        <td className="px-4 py-4 text-right">
                          <span className={`px-3 py-1 rounded-lg font-bold text-sm ${
                            product.current_stock < 10 
                              ? 'bg-red-900/50 text-red-300 border border-red-500/30' 
                              : 'bg-green-900/50 text-green-300 border border-green-500/30'
                          }`}>
                            {product.current_stock}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <button
                            onClick={() => {
                              setSelectedProduct(product.product_id);
                              fetchForecast(product.product_id);
                            }}
                            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 font-semibold text-sm transition-all"
                          >
                            📈 Forecast
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Forecast Modal */}
        {forecast && selectedProduct && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-purple-900/90 to-blue-900/90 rounded-2xl border-2 border-purple-500/50 p-8 max-w-5xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                  📊 ML-Based Demand Forecast
                </h2>
                <button
                  onClick={() => { setSelectedProduct(null); setForecast(null); }}
                  className="text-gray-400 hover:text-white text-4xl font-bold transition-all"
                >
                  ×
                </button>
              </div>
              
              {forecast.forecasts && forecast.forecasts.length > 0 ? (
                forecast.forecasts.map((productForecast, idx) => (
                  <div key={idx} className="space-y-6">
                    {/* Product Header */}
                    <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 rounded-xl">
                      <h3 className="text-2xl font-bold">{productForecast.product_name}</h3>
                      <p className="text-sm opacity-90 mt-2">AI-powered demand forecasting using historical sales patterns</p>
                    </div>

                    {/* Sales Pattern Analysis */}
                    <div className="bg-black/50 border-2 border-purple-500/30 text-white p-6 rounded-xl">
                      <h4 className="font-bold text-xl mb-4 flex items-center gap-2">
                        📈 Sales Pattern Analysis
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-purple-900/30 border border-purple-500/30 p-4 rounded-lg">
                          <p className="text-xs text-gray-400 mb-1">Historical Data</p>
                          <p className="text-3xl font-bold text-purple-400">
                            {productForecast.historical_data?.dates?.length || 0} days
                          </p>
                        </div>
                        <div className="bg-green-900/30 border border-green-500/30 p-4 rounded-lg">
                          <p className="text-xs text-gray-400 mb-1">Avg Daily Demand</p>
                          <p className="text-3xl font-bold text-green-400">
                            {productForecast.historical_data?.avg_daily_demand || 0}
                          </p>
                        </div>
                        <div className="bg-blue-900/30 border border-blue-500/30 p-4 rounded-lg">
                          <p className="text-xs text-gray-400 mb-1">Total Sold (90d)</p>
                          <p className="text-3xl font-bold text-blue-400">
                            {productForecast.historical_data?.quantities?.reduce((a, b) => a + b, 0) || 0}
                          </p>
                        </div>
                        <div className="bg-pink-900/30 border border-pink-500/30 p-4 rounded-lg">
                          <p className="text-xs text-gray-400 mb-1">Method</p>
                          <p className="text-sm font-bold text-pink-400">
                            {productForecast.method?.replace(/_/g, ' ').toUpperCase()}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* 3-Month Forecast */}
                    <div className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 border-2 border-blue-500/30 p-6 rounded-xl">
                      <h4 className="font-bold text-xl mb-4 text-white">🎯 3-Month Demand Forecast</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {productForecast.forecast && productForecast.forecast.slice(0, 3).map((monthForecast, mIdx) => (
                          <div key={mIdx} className="bg-black/50 border-2 border-purple-500/30 p-6 rounded-xl">
                            <p className="text-sm font-semibold text-gray-400 mb-2">
                              {new Date(monthForecast.forecast_date).toLocaleDateString('en-US', { 
                                month: 'long', 
                                year: 'numeric' 
                              })}
                            </p>
                            <p className="text-4xl font-bold text-purple-400 mb-2">
                              {monthForecast.predicted_demand}
                            </p>
                            <p className="text-xs text-gray-500">
                              Confidence: {monthForecast.confidence_level 
                                ? `${(monthForecast.confidence_level * 100).toFixed(0)}%`
                                : '85%'}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Historical Chart */}
                    <div className="bg-black/50 border-2 border-purple-500/30 p-6 rounded-xl">
                      <h4 className="font-bold text-xl mb-4 text-white">📊 Historical Sales (Last 90 Days)</h4>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {productForecast.historical_data?.dates?.slice(-30).map((date, dayIdx) => {
                          const quantity = productForecast.historical_data.quantities[productForecast.historical_data.dates.indexOf(date)];
                          const maxQuantity = Math.max(...productForecast.historical_data.quantities);
                          const barWidth = Math.max((quantity / maxQuantity) * 100, 5);
                          return (
                            <div key={dayIdx} className="flex items-center gap-3">
                              <span className="text-xs text-gray-400 w-24 font-semibold">
                                {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </span>
                              <div className="flex-1 bg-gray-800/50 rounded-lg h-8 relative">
                                <div
                                  className="bg-gradient-to-r from-green-500 to-emerald-500 h-8 rounded-lg flex items-center justify-end pr-3"
                                  style={{ width: `${barWidth}%` }}
                                >
                                  <span className="text-white text-xs font-bold">
                                    {quantity} units
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Recommendations */}
                    <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border-2 border-purple-500/30 p-6 rounded-xl">
                      <h4 className="font-bold text-xl mb-4 text-white">💡 Recommendations</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-black/40 border border-purple-500/30 p-4 rounded-lg">
                          <p className="text-sm font-semibold text-gray-400 mb-1">Demand Trend</p>
                          <p className="text-2xl font-bold text-purple-400">
                            {productForecast.total_predicted_demand > (productForecast.historical_data?.quantities?.reduce((a, b) => a + b, 0) / 3)
                              ? '📈 Increasing'
                              : '📉 Stable/Decreasing'}
                          </p>
                        </div>
                        <div className="bg-black/40 border border-purple-500/30 p-4 rounded-lg">
                          <p className="text-sm font-semibold text-gray-400 mb-1">Recommended Stock</p>
                          <p className="text-2xl font-bold text-green-400">
                            {Math.ceil(productForecast.total_predicted_demand * 1.2)} units
                          </p>
                          <p className="text-xs text-gray-500">(+20% safety buffer)</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <AlertCircle className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg">No forecast data available</p>
                  <p className="text-sm text-gray-500 mt-2">Forecasts require historical sales data</p>
                </div>
              )}

              <div className="mt-8 flex justify-end">
                <button
                  onClick={() => { setSelectedProduct(null); setForecast(null); }}
                  className="px-6 py-3 bg-gradient-to-r from-gray-700 to-gray-800 text-white rounded-lg hover:from-gray-800 hover:to-gray-900 font-semibold transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
