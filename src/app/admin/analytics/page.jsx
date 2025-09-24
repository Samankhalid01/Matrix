'use client';
import { useState, useEffect } from 'react';

const AnalyticsPage = () => {
  const [analytics, setAnalytics] = useState({
    totalSales: 0,
    monthlyGrowth: 0,
    customerCount: 0,
    avgOrderValue: 0,
    topProducts: [],
    salesData: []
  });
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('7days');

  useEffect(() => {
    fetchAnalytics();
  }, [selectedPeriod]);

  const fetchAnalytics = async () => {
    try {
      // Mock data for analytics
      setTimeout(() => {
        setAnalytics({
          totalSales: 45678.90,
          monthlyGrowth: 12.5,
          customerCount: 234,
          avgOrderValue: 195.25,
          topProducts: [
            { name: 'Premium Coffee Beans', sales: 156, revenue: 2340 },
            { name: 'Organic Tea Selection', sales: 134, revenue: 2010 },
            { name: 'Fresh Bread Loaves', sales: 289, revenue: 1445 },
            { name: 'Dairy Products', sales: 178, revenue: 1780 },
            { name: 'Snack Items', sales: 267, revenue: 1335 }
          ],
          salesData: [
            { day: 'Mon', sales: 4500 },
            { day: 'Tue', sales: 5200 },
            { day: 'Wed', sales: 4800 },
            { day: 'Thu', sales: 6100 },
            { day: 'Fri', sales: 7200 },
            { day: 'Sat', sales: 8900 },
            { day: 'Sun', sales: 6300 }
          ]
        });
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, change, icon }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {change && (
            <p className={`text-sm mt-1 ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change > 0 ? '↗' : '↘'} {Math.abs(change)}% vs last period
            </p>
          )}
        </div>
        <div className="text-3xl">{icon}</div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="text-gray-600 mt-4">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-2">Track your store performance and insights</p>
        </div>
        
        <div className="flex items-center gap-4">
          <select 
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 bg-white"
          >
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="3months">Last 3 Months</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Sales"
          value={`₨${analytics.totalSales.toLocaleString()}`}
          change={analytics.monthlyGrowth}
          icon="💰"
        />
        <StatCard
          title="Customers"
          value={analytics.customerCount.toLocaleString()}
          change={8.2}
          icon="👥"
        />
        <StatCard
          title="Avg Order Value"
          value={`₨${analytics.avgOrderValue.toFixed(2)}`}
          change={-2.4}
          icon="🛒"
        />
        <StatCard
          title="Conversion Rate"
          value="3.24%"
          change={1.8}
          icon="📊"
        />
      </div>

      {/* Charts and Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Sales Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Sales</h3>
          <div className="space-y-4">
            {analytics.salesData.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-gray-600 font-medium">{item.day}</span>
                <div className="flex items-center gap-3">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${(item.sales / 9000) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-semibold">₨{item.sales.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Products</h3>
          <div className="space-y-4">
            {analytics.topProducts.map((product, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{product.name}</p>
                  <p className="text-sm text-gray-600">{product.sales} units sold</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">₨{product.revenue.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Additional Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Customer Insights */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Insights</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">New Customers</span>
              <span className="font-semibold text-blue-600">32</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Returning Customers</span>
              <span className="font-semibold text-green-600">202</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Customer Retention</span>
              <span className="font-semibold text-purple-600">86%</span>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Page Views</span>
              <span className="font-semibold text-blue-600">12,847</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Bounce Rate</span>
              <span className="font-semibold text-red-600">24%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Conversion Rate</span>
              <span className="font-semibold text-green-600">3.24%</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full text-left p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
              <span className="text-blue-700 font-medium">📊 Export Report</span>
            </button>
            <button className="w-full text-left p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
              <span className="text-green-700 font-medium">📈 View Trends</span>
            </button>
            <button className="w-full text-left p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
              <span className="text-purple-700 font-medium">🎯 Set Goals</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;