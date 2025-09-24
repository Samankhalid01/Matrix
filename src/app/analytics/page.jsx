'use client';
import { useState } from 'react';
import DashboardLayout from '@/components/admin/DashboardLayout';

const AnalyticsPage = () => {
  const [reportType, setReportType] = useState('sales');
  const [timeRange, setTimeRange] = useState('week');
  const [exportFormat, setExportFormat] = useState('pdf');

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Analytics & Forecasting</h2>
          <div className="flex gap-4">
            <select
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value)}
            >
              <option value="pdf">Export as PDF</option>
              <option value="csv">Export as CSV</option>
              <option value="excel">Export as Excel</option>
            </select>
            <button className="px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600">
              Export Report
            </button>
          </div>
        </div>

        {/* Report Controls */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Report Type
              </label>
              <select
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
              >
                <option value="sales">Sales Patterns</option>
                <option value="demand">Demand Forecast</option>
                <option value="performance">Store Performance</option>
                <option value="inventory">Inventory Analysis</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time Range
              </label>
              <select
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
              >
                <option value="day">Last 24 Hours</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
                <option value="quarter">Last Quarter</option>
                <option value="year">Last Year</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categories
              </label>
              <select
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                defaultValue="all"
              >
                <option value="all">All Categories</option>
                <option value="electronics">Electronics</option>
                <option value="clothing">Clothing</option>
                <option value="food">Food & Beverages</option>
              </select>
            </div>
          </div>
        </div>

        {/* Analytics Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Sales Trend Chart */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Sales Trend</h3>
            <div className="aspect-w-16 aspect-h-9 bg-gray-100 rounded-lg">
              {/* Chart will go here */}
              <div className="flex items-center justify-center h-full">
                Chart Placeholder
              </div>
            </div>
          </div>

          {/* Demand Forecast Chart */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Demand Forecast</h3>
            <div className="aspect-w-16 aspect-h-9 bg-gray-100 rounded-lg">
              {/* Chart will go here */}
              <div className="flex items-center justify-center h-full">
                Chart Placeholder
              </div>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Top Performing Products */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-4">Top Performing Products</h4>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((item) => (
                  <div key={item} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Product {item}</span>
                    <span className="text-sm font-medium">$1,234</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Underperforming Products */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-4">Underperforming Products</h4>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((item) => (
                  <div key={item} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Product {item}</span>
                    <span className="text-sm font-medium text-red-500">-12%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Stock Alerts */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-4">Low Stock Alerts</h4>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((item) => (
                  <div key={item} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Product {item}</span>
                    <span className="text-sm font-medium text-yellow-500">Low Stock</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AnalyticsPage;
