'use client';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/admin/DashboardLayout';
import { TrendingUp, BarChart3, Download, Calendar, Filter, RefreshCw, AlertTriangle } from 'lucide-react';

export default function DemandPredictionPage() {
  const [forecasts, setForecasts] = useState([]);
  const [performanceData, setPerformanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('forecast'); // forecast, performance, export
  
  // Filter states
  const [startDate, setStartDate] = useState('2025-01-01');
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [reportLimit, setReportLimit] = useState(10);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load forecasts
      const forecastRes = await fetch('/api/analytics/demand-forecast');
      const forecastData = await forecastRes.json();
      if (forecastData.success) {
        setForecasts(forecastData.forecasts);
      }

      // Load performance data
      const perfRes = await fetch(`/api/analytics/performance-report?startDate=${startDate}&endDate=${endDate}&limit=${reportLimit}`);
      const perfData = await perfRes.json();
      if (perfData.success) {
        setPerformanceData(perfData);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    loadData();
  };

  const exportReport = async (reportType, format) => {
    try {
      const response = await fetch('/api/analytics/export-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportType,
          format,
          startDate,
          endDate,
          category: selectedCategory !== 'all' ? selectedCategory : null
        })
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${reportType}-${format}-${Date.now()}.${format}`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export report');
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6 max-w-7xl mx-auto">
          {/* Header Shimmer */}
          <div className="mb-6 animate-pulse">
            <div className="h-10 bg-gray-300 rounded w-96 mb-3"></div>
            <div className="h-4 bg-gray-200 rounded w-64"></div>
          </div>

          {/* Tabs Shimmer */}
          <div className="flex gap-4 mb-6 border-b border-gray-200">
            <div className="pb-3 px-4 h-10 bg-gray-200 rounded-t w-32 animate-pulse"></div>
            <div className="pb-3 px-4 h-10 bg-gray-200 rounded-t w-36 animate-pulse"></div>
            <div className="pb-3 px-4 h-10 bg-gray-200 rounded-t w-28 animate-pulse"></div>
          </div>

          {/* Filters Shimmer */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6 animate-pulse">
            <div className="h-6 bg-gray-300 rounded w-40 mb-3"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
            <div className="mt-4 h-10 bg-blue-200 rounded w-32"></div>
          </div>

          {/* Summary Cards Shimmer */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-gradient-to-r from-gray-300 to-gray-400 rounded-lg p-6 animate-pulse">
              <div className="h-4 bg-white/30 rounded w-24 mb-2"></div>
              <div className="h-8 bg-white/50 rounded w-16"></div>
            </div>
            <div className="bg-gradient-to-r from-gray-300 to-gray-400 rounded-lg p-6 animate-pulse">
              <div className="h-4 bg-white/30 rounded w-32 mb-2"></div>
              <div className="h-8 bg-white/50 rounded w-20"></div>
            </div>
          </div>

          {/* Table Shimmer */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden animate-pulse">
            <div className="p-4 bg-gray-50 border-b">
              <div className="h-6 bg-gray-300 rounded w-48"></div>
            </div>
            <div className="p-6 space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex gap-4">
                  <div className="h-4 bg-gray-200 rounded flex-1"></div>
                  <div className="h-4 bg-gray-200 rounded flex-1"></div>
                  <div className="h-4 bg-gray-200 rounded flex-1"></div>
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <TrendingUp className="w-8 h-8 text-blue-600" />
            Demand Prediction & Analytics
          </h1>
          <p className="text-gray-600 mt-2">
            ML-powered forecasting and performance analytics
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('forecast')}
            className={`pb-3 px-4 font-medium ${
              activeTab === 'forecast'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📊 Demand Forecast
          </button>
          <button
            onClick={() => setActiveTab('performance')}
            className={`pb-3 px-4 font-medium ${
              activeTab === 'performance'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📈 Performance Reports
          </button>
          <button
            onClick={() => setActiveTab('export')}
            className={`pb-3 px-4 font-medium ${
              activeTab === 'export'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            💾 Export Reports
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Filters & Parameters</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all" className="text-gray-900 bg-white">All Categories</option>
                <option value="Electronics" className="text-gray-900 bg-white">Electronics</option>
                <option value="Clothing" className="text-gray-900 bg-white">Clothing</option>
                <option value="Food" className="text-gray-900 bg-white">Food</option>
                <option value="Books" className="text-gray-900 bg-white">Books</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Result Limit</label>
              <select
                value={reportLimit}
                onChange={(e) => setReportLimit(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="5" className="text-gray-900 bg-white">Top 5</option>
                <option value="10" className="text-gray-900 bg-white">Top 10</option>
                <option value="20" className="text-gray-900 bg-white">Top 20</option>
                <option value="50" className="text-gray-900 bg-white">Top 50</option>
              </select>
            </div>
          </div>
          <div className="mt-4">
            <button
              onClick={applyFilters}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Apply Filters
            </button>
          </div>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'forecast' && (
          <div>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                <p className="text-sm opacity-90">Total Forecasts</p>
                <p className="text-3xl font-bold">{forecasts.length}</p>
              </div>
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
                <p className="text-sm opacity-90">Total Predicted Demand</p>
                <p className="text-3xl font-bold">
                  {forecasts.reduce((sum, f) => sum + f.predicted_demand, 0).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Forecast Table */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-4 bg-gray-50 border-b">
                <h2 className="text-xl font-semibold text-gray-900">Demand Forecasts by Product</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Product</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Forecast Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Predicted Demand</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Model Version</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {forecasts.slice(0, 20).map((forecast, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {forecast.Product?.product_name || 'Unknown'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {forecast.Product?.category || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {forecast.forecast_date}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                          {forecast.predicted_demand} units
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-600">
                          {forecast.model_version}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'performance' && performanceData && (
          <div>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-blue-500">
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">${performanceData.summary.totalRevenue.toLocaleString()}</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-green-500">
                <p className="text-sm text-gray-600">Units Sold</p>
                <p className="text-2xl font-bold text-gray-900">{performanceData.summary.totalUnitsSold.toLocaleString()}</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-yellow-500">
                <p className="text-sm text-gray-600">Total Products</p>
                <p className="text-2xl font-bold text-gray-900">{performanceData.summary.totalProducts}</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-red-500">
                <p className="text-sm text-gray-600">Low Stock Items</p>
                <p className="text-2xl font-bold text-gray-900">{performanceData.summary.lowStockCount}</p>
              </div>
            </div>

            {/* Top Selling Products */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
              <div className="p-4 bg-green-50 border-b">
                <h2 className="text-xl font-semibold text-gray-900">🏆 Top Selling Products</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Rank</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Product</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Units Sold</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Revenue</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Stock Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {performanceData.topSelling.map((product, index) => (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                          #{index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {product.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {product.category}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {product.totalSold}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                          ${product.totalRevenue.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-semibold rounded ${
                            product.stockStatus === 'low' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                          }`}>
                            {product.currentStock} in stock
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Underperforming Products */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-4 bg-red-50 border-b flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <h2 className="text-xl font-semibold text-gray-900">⚠️ Underperforming Products</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Product</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Units Sold</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Revenue</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Current Stock</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {performanceData.underperforming.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {product.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {product.category}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {product.totalSold}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                          ${product.totalRevenue.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {product.currentStock}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'export' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Export Reports</h2>
            <p className="text-gray-600 mb-6">
              Download reports in various formats (CSV, JSON, Excel)
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Performance Report */}
              <div className="border rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Performance Report</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Top selling, underperforming products, and category analysis
                </p>
                <div className="space-y-2">
                  <button
                    onClick={() => exportReport('performance', 'csv')}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Export as CSV
                  </button>
                  <button
                    onClick={() => exportReport('performance', 'json')}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Export as JSON
                  </button>
                </div>
              </div>

              {/* Forecast Report */}
              <div className="border rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Demand Forecast</h3>
                <p className="text-sm text-gray-600 mb-4">
                  ML-powered demand predictions for next 3 months
                </p>
                <div className="space-y-2">
                  <button
                    onClick={() => exportReport('forecast', 'csv')}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Export as CSV
                  </button>
                  <button
                    onClick={() => exportReport('forecast', 'json')}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Export as JSON
                  </button>
                </div>
              </div>

              {/* Sales Report */}
              <div className="border rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Sales Report</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Complete transaction history with customer details
                </p>
                <div className="space-y-2">
                  <button
                    onClick={() => exportReport('sales', 'csv')}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Export as CSV
                  </button>
                  <button
                    onClick={() => exportReport('sales', 'json')}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Export as JSON
                  </button>
                </div>
              </div>
            </div>

            {/* Export Info */}
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">Export Features:</h4>
              <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                <li>CSV format - Compatible with Excel, Google Sheets</li>
                <li>JSON format - For programmatic access and APIs</li>
                <li>Customizable date ranges and filters</li>
                <li>Category-specific reports</li>
                <li>Real-time data export</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
