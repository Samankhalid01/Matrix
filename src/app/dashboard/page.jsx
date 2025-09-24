'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardLayout from '../../components/DashboardLayout';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalCustomers: 0,
    revenue: 0,
    alerts: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data loading
    setTimeout(() => {
      setStats({
        totalProducts: 156,
        totalCustomers: 42,
        revenue: 12450.75,
        alerts: 3
      });
      setLoading(false);
    }, 1000);
  }, []);

  const StatCard = ({ title, value, icon, color = "blue", link }) => (
    <div className={`bg-white p-6 rounded-lg shadow-sm border-l-4 border-${color}-500`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {link && (
            <Link href={link} className="text-blue-500 text-sm hover:underline">
              View Details →
            </Link>
          )}
        </div>
        <div className={`text-${color}-500 text-3xl`}>
          {icon}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <p className="text-gray-600 mt-4">Loading dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-600 mt-2">Welcome back! Here's what's happening with your store today.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            title="Total Products" 
            value={stats.totalProducts} 
            icon="📦" 
            color="blue"
            link="/admin/products"
          />
          <StatCard 
            title="Active Customers" 
            value={stats.totalCustomers} 
            icon="👥" 
            color="green"
            link="/admin/customers"
          />
          <StatCard 
            title="Today's Revenue" 
            value={`$${stats.revenue.toLocaleString()}`} 
            icon="💰" 
            color="yellow"
            link="/admin/analytics"
          />
          <StatCard 
            title="Active Alerts" 
            value={stats.alerts} 
            icon="🚨" 
            color="red"
            link="/admin/notifications"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-4">
              <Link href="/admin/products" className="flex items-center p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                <span className="text-2xl mr-3">📦</span>
                <span className="font-medium text-gray-900">Manage Products</span>
              </Link>
              <Link href="/admin/analytics" className="flex items-center p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                <span className="text-2xl mr-3">📊</span>
                <span className="font-medium text-gray-900">View Analytics</span>
              </Link>
              <Link href="/admin/theft-detection" className="flex items-center p-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                <span className="text-2xl mr-3">🛡️</span>
                <span className="font-medium text-gray-900">Theft Detection</span>
              </Link>
              <Link href="/admin/notifications" className="flex items-center p-3 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors">
                <span className="text-2xl mr-3">🔔</span>
                <span className="font-medium text-gray-900">Notifications</span>
              </Link>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    🚨
                  </div>
                  <div>
                    <p className="font-medium">Suspicious activity detected</p>
                    <p className="text-sm text-gray-600">2 minutes ago</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    👤
                  </div>
                  <div>
                    <p className="font-medium">Customer entered store</p>
                    <p className="text-sm text-gray-600">5 minutes ago</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    💰
                  </div>
                  <div>
                    <p className="font-medium">Sale completed</p>
                    <p className="text-sm text-gray-600">12 minutes ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}