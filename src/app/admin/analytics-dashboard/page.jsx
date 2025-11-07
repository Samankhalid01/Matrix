'use client';
import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Package, DollarSign, Users, Calendar, RefreshCw } from 'lucide-react';

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('monthly');
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  useEffect(() => {
    if (selectedProduct) {
      fetchForecast(selectedProduct);
    }
  }, [selectedProduct]);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch(`/api/analytics/performance?period=${period}`);
      const data = await res.json();
      if (data.success) {
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchForecast = async (productId) => {
    try {
      console.log('🔍 Fetching forecast for product ID:', productId);
      const res = await fetch(`/api/analytics/demand-forecast?product_id=${productId}`);
      const data = await res.json();
      console.log('📊 Forecast API response:', data);
      if (data.success) {
        setForecast(data);
        console.log('✅ Forecast data set successfully');
      } else {
        console.error('❌ Forecast API returned success=false:', data);
      }
    } catch (error) {
      console.error('❌ Error fetching forecast:', error);
    }
  };

  const exportReport = async (format) => {
    try {
      console.log('📤 Exporting report in format:', format);
      const response = await fetch(`/api/analytics/export?format=${format}&period=${period}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Export failed:', errorText);
        alert(`Failed to export report: ${response.status} ${response.statusText}`);
        return;
      }

      console.log('✅ Export response received');
      
      if (format === 'csv') {
        const text = await response.text();
        const blob = new Blob([text], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics-report-${period}-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        console.log('✅ CSV downloaded');
      } else if (format === 'pdf') {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics-report-${period}-${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        console.log('✅ PDF downloaded');
      }
    } catch (error) {
      console.error('❌ Error exporting report:', error);
      alert('Failed to export report. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header Shimmer */}
        <div className="flex justify-between items-center mb-6 animate-pulse">
          <div>
            <div className="h-8 bg-gray-300 rounded w-64 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-96"></div>
          </div>
          <div className="flex gap-2">
            <div className="h-10 bg-gray-200 rounded w-32"></div>
            <div className="h-10 bg-blue-200 rounded w-28"></div>
          </div>
        </div>

        {/* Key Metrics Shimmer */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {[
            'from-green-50 to-green-100 border-green-300',
            'from-blue-50 to-blue-100 border-blue-300',
            'from-purple-50 to-purple-100 border-purple-300',
            'from-orange-50 to-orange-100 border-orange-300'
          ].map((color, i) => (
            <div key={i} className={`bg-gradient-to-br ${color} p-6 rounded-lg border animate-pulse`}>
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 bg-white/50 rounded"></div>
                <div className="h-3 bg-white/50 rounded w-16"></div>
              </div>
              <div className="h-9 bg-white/50 rounded w-32 mb-1"></div>
              <div className="h-4 bg-white/50 rounded w-28"></div>
            </div>
          ))}
        </div>

        {/* Sales Trend Chart Shimmer */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="h-6 bg-gray-300 rounded w-32 mb-4 animate-pulse"></div>
          <div className="space-y-2">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="flex-1 h-8 bg-blue-100 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Cards Shimmer */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="h-6 bg-gray-300 rounded w-40 mb-4 animate-pulse"></div>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="h-6 bg-gray-300 rounded w-40 mb-4 animate-pulse"></div>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="w-8 h-8 text-blue-600" />
            Analytics Dashboard
          </h1>
          <p className="text-gray-600 mt-1">Performance insights and demand forecasting</p>
        </div>
        <div className="flex gap-2">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-4 py-2 border rounded-lg bg-white text-gray-900 font-medium"
          >
            <option value="daily" className="text-gray-900">Last 24 Hours</option>
            <option value="weekly" className="text-gray-900">Last 7 Days</option>
            <option value="monthly" className="text-gray-900">This Month</option>
            <option value="yearly" className="text-gray-900">This Year</option>
          </select>
          <button
            onClick={fetchAnalytics}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
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
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-300">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="w-8 h-8 text-green-600" />
                <span className="text-xs text-green-700 font-medium uppercase">{period}</span>
              </div>
              <p className="text-3xl font-bold text-green-900">
                ${analytics.metrics.totalRevenue.toLocaleString()}
              </p>
              <p className="text-sm text-green-700 mt-1">Total Revenue</p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-300">
              <div className="flex items-center justify-between mb-2">
                <Package className="w-8 h-8 text-blue-600" />
                <span className="text-xs text-blue-700 font-medium uppercase">{period}</span>
              </div>
              <p className="text-3xl font-bold text-blue-900">
                {analytics.metrics.totalTransactions}
              </p>
              <p className="text-sm text-blue-700 mt-1">Total Transactions</p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-300">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-8 h-8 text-purple-600" />
                <span className="text-xs text-purple-700 font-medium uppercase">Average</span>
              </div>
              <p className="text-3xl font-bold text-purple-900">
                ${analytics.metrics.avgTransactionValue.toFixed(2)}
              </p>
              <p className="text-sm text-purple-700 mt-1">Avg Transaction Value</p>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-lg border border-orange-300">
              <div className="flex items-center justify-between mb-2">
                <Users className="w-8 h-8 text-orange-600" />
                <span className="text-xs text-orange-700 font-medium uppercase">{period}</span>
              </div>
              <p className="text-3xl font-bold text-orange-900">
                {analytics.metrics.uniqueCustomers}
              </p>
              <p className="text-sm text-orange-700 mt-1">Unique Customers</p>
            </div>
          </div>

          {/* Sales Trend Chart */}
          {analytics.salesTrend && analytics.salesTrend.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-900">
                <Calendar className="w-5 h-5 text-blue-600" />
                Sales Trend
              </h2>
              <div className="space-y-2">
                {analytics.salesTrend.map((day, idx) => {
                  const maxRevenue = Math.max(...analytics.salesTrend.map(d => d.revenue));
                  const barWidth = (day.revenue / maxRevenue) * 100;
                  return (
                    <div key={idx} className="flex items-center gap-3">
                      <span className="text-sm text-gray-700 w-24 font-medium">
                        {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                      <div className="flex-1 bg-gray-200 rounded-full h-8 relative">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-blue-600 h-8 rounded-full flex items-center justify-end pr-3"
                          style={{ width: `${barWidth}%` }}
                        >
                          <span className="text-white text-xs font-semibold">
                            ${day.revenue.toFixed(0)}
                          </span>
                        </div>
                      </div>
                      <span className="text-sm text-gray-300 w-16 text-right font-medium">
                        {day.transactions} orders
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Top Products */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 text-green-700">Top Performing Products</h2>
              <div className="space-y-3">
                {analytics.topProducts.slice(0, 5).map((product, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{product.product_name}</p>
                      <p className="text-sm text-gray-600">{product.units_sold} units sold</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-700">${product.revenue.toFixed(2)}</p>
                      <button
                        onClick={() => setSelectedProduct(product.product_id)}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        View Forecast
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Underperforming Products */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 text-red-700">Underperforming Products</h2>
              <div className="space-y-3">
                {analytics.underperformingProducts.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No underperforming products</p>
                ) : (
                  analytics.underperformingProducts.slice(0, 5).map((product, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{product.product_name}</p>
                        <p className="text-sm text-gray-600">{product.total_units_sold || 0} units sold</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-red-700">${parseFloat(product.total_revenue || 0).toFixed(2)}</p>
                        <p className="text-xs text-gray-500">
                          Stock: {product.current_stock}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Product Performance Table */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">All Products Performance</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => exportReport('csv')}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm font-medium flex items-center gap-2"
                >
                  � Export CSV
                </button>
                <button
                  onClick={() => exportReport('pdf')}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm font-medium flex items-center gap-2"
                >
                  📄 Export PDF
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-800 text-white">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">Product</th>
                    <th className="px-4 py-3 text-left font-semibold">Category</th>
                    <th className="px-4 py-3 text-right font-semibold">Price</th>
                    <th className="px-4 py-3 text-right font-semibold">Units Sold</th>
                    <th className="px-4 py-3 text-right font-semibold">Revenue</th>
                    <th className="px-4 py-3 text-right font-semibold">Stock</th>
                    <th className="px-4 py-3 text-center font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.productPerformance?.map((product, idx) => (
                    <tr key={idx} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 font-semibold text-gray-900">{product.product_name}</td>
                      <td className="px-4 py-3 text-gray-700">{product.category || 'N/A'}</td>
                      <td className="px-4 py-3 text-right font-medium text-gray-900">${parseFloat(product.price).toFixed(2)}</td>
                      <td className="px-4 py-3 text-right font-medium text-gray-900">{product.total_units_sold || 0}</td>
                      <td className="px-4 py-3 text-right font-bold text-green-700">
                        ${parseFloat(product.total_revenue || 0).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className={`px-3 py-1 rounded font-semibold text-sm ${
                          product.current_stock < 10 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {product.current_stock}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => {
                            console.log('🔘 Forecast button clicked for product:', product.product_name, 'ID:', product.product_id);
                            setSelectedProduct(product.product_id);
                          }}
                          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium text-sm"
                        >
                          Forecast
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">📊 Demand Forecast & Sales Pattern Analysis</h2>
              <button
                onClick={() => { setSelectedProduct(null); setForecast(null); }}
                className="text-gray-500 hover:text-gray-700 text-3xl font-bold"
              >
                ×
              </button>
            </div>
            
            {forecast.forecasts && forecast.forecasts.length > 0 ? (
              forecast.forecasts.map((productForecast, idx) => (
                <div key={idx}>
                  {/* Product Header */}
                  <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-lg mb-4">
                    <h3 className="text-xl font-bold">{productForecast.product_name}</h3>
                    <p className="text-sm opacity-90 mt-1">ML-based demand forecasting using historical sales patterns</p>
                  </div>

                  {/* Sales Pattern Analysis */}
                  <div className="bg-gray-900 text-white p-4 rounded-lg mb-4">
                    <h4 className="font-bold text-lg mb-3 flex items-center gap-2">
                      📈 Sales Pattern Analysis
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-gray-800 p-3 rounded">
                        <p className="text-xs text-gray-400 mb-1">Historical Data Points</p>
                        <p className="text-2xl font-bold text-blue-400">
                          {productForecast.historical_data?.dates?.length || 0} days
                        </p>
                      </div>
                      <div className="bg-gray-800 p-3 rounded">
                        <p className="text-xs text-gray-400 mb-1">Avg Daily Demand</p>
                        <p className="text-2xl font-bold text-green-400">
                          {productForecast.historical_data?.avg_daily_demand || 0} units
                        </p>
                      </div>
                      <div className="bg-gray-800 p-3 rounded">
                        <p className="text-xs text-gray-400 mb-1">Total Sold (90d)</p>
                        <p className="text-2xl font-bold text-purple-400">
                          {productForecast.historical_data?.quantities?.reduce((a, b) => a + b, 0) || 0}
                        </p>
                      </div>
                      <div className="bg-gray-800 p-3 rounded">
                        <p className="text-xs text-gray-400 mb-1">Forecast Method</p>
                        <p className="text-sm font-bold text-yellow-400">
                          {productForecast.method?.replace(/_/g, ' ').toUpperCase() || 'ML Model'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 3-Month Forecast Summary */}
                  <div className="bg-blue-50 p-4 rounded-lg mb-4 border-2 border-blue-300">
                    <h4 className="font-bold text-lg mb-3 text-blue-900">🎯 3-Month Demand Forecast</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {productForecast.forecast && productForecast.forecast.slice(0, 3).map((monthForecast, mIdx) => (
                        <div key={mIdx} className="bg-white p-4 rounded-lg border border-blue-200 shadow-sm">
                          <p className="text-sm font-semibold text-gray-600 mb-1">
                            {new Date(monthForecast.forecast_date).toLocaleDateString('en-US', { 
                              month: 'long', 
                              year: 'numeric' 
                            })}
                          </p>
                          <p className="text-3xl font-bold text-blue-700">
                            {monthForecast.predicted_demand} units
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Confidence: {monthForecast.confidence_level 
                              ? `${(monthForecast.confidence_level * 100).toFixed(0)}%`
                              : 'High'}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Historical Sales Chart */}
                  <div className="bg-gray-900 text-white p-4 rounded-lg mb-4">
                    <h4 className="font-bold text-lg mb-3">📊 Historical Sales Pattern (Last 90 Days)</h4>
                    <div className="space-y-1 max-h-64 overflow-y-auto">
                      {productForecast.historical_data?.dates?.map((date, dayIdx) => {
                        const quantity = productForecast.historical_data.quantities[dayIdx];
                        const maxQuantity = Math.max(...productForecast.historical_data.quantities);
                        const barWidth = (quantity / maxQuantity) * 100;
                        return (
                          <div key={dayIdx} className="flex items-center gap-2">
                            <span className="text-xs text-gray-400 w-24 font-medium">
                              {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                            <div className="flex-1 bg-gray-700 rounded h-6 relative">
                              <div
                                className="bg-gradient-to-r from-green-500 to-green-600 h-6 rounded flex items-center justify-end pr-2"
                                style={{ width: `${barWidth}%` }}
                              >
                                <span className="text-white text-xs font-semibold">
                                  {quantity} units
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Future Trends */}
                  <div className="bg-purple-50 p-4 rounded-lg border-2 border-purple-300">
                    <h4 className="font-bold text-lg mb-3 text-purple-900">🔮 Future Trend Insights</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="bg-white p-3 rounded border border-purple-200">
                        <p className="text-sm font-semibold text-gray-700">📈 Demand Trend</p>
                        <p className="text-lg font-bold text-purple-700">
                          {productForecast.total_predicted_demand > productForecast.historical_data?.quantities?.reduce((a, b) => a + b, 0) / 3
                            ? '↗️ Increasing'
                            : '↘️ Stable/Decreasing'}
                        </p>
                      </div>
                      <div className="bg-white p-3 rounded border border-purple-200">
                        <p className="text-sm font-semibold text-gray-700">📦 Recommended Stock</p>
                        <p className="text-lg font-bold text-purple-700">
                          {Math.ceil(productForecast.total_predicted_demand * 1.2)} units
                        </p>
                        <p className="text-xs text-gray-500">(+20% safety margin)</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600">No forecast data available for this product.</p>
                <p className="text-sm text-gray-500 mt-2">Forecasts are generated based on historical sales data.</p>
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => { setSelectedProduct(null); setForecast(null); }}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
