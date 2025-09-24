'use client';
import { useState, useEffect } from 'react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalCustomers: 0,
    todaySales: 0,
    lowStock: 0,
    suspiciousActivities: 0,
    activePromotions: 0
  });

  useEffect(() => {
    // Fetch dashboard stats
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      // This will be connected to real API later
      setStats({
        totalProducts: 157,
        totalCustomers: 1243,
        todaySales: 15760,
        lowStock: 12,
        suspiciousActivities: 3,
        activePromotions: 5
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Admin Dashboard
        </h1>
        <p className="text-gray-600">
          Welcome to Matrix Retail Management System
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Products</p>
              <p className="text-3xl font-bold text-blue-600">{stats.totalProducts}</p>
            </div>
            <div className="text-blue-500 text-3xl">📦</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Customers</p>
              <p className="text-3xl font-bold text-green-600">{stats.totalCustomers}</p>
            </div>
            <div className="text-green-500 text-3xl">👥</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Today's Sales</p>
              <p className="text-3xl font-bold text-purple-600">₨{stats.todaySales}</p>
            </div>
            <div className="text-purple-500 text-3xl">💰</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Low Stock Items</p>
              <p className="text-3xl font-bold text-orange-600">{stats.lowStock}</p>
            </div>
            <div className="text-orange-500 text-3xl">⚠️</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Suspicious Activities</p>
              <p className="text-3xl font-bold text-red-600">{stats.suspiciousActivities}</p>
            </div>
            <div className="text-red-500 text-3xl">🚨</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Promotions</p>
              <p className="text-3xl font-bold text-indigo-600">{stats.activePromotions}</p>
            </div>
            <div className="text-indigo-500 text-3xl">🎯</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="p-4 border-2 border-dashed border-blue-300 rounded-lg hover:border-blue-500 transition-colors">
            <div className="text-2xl mb-2">➕</div>
            <div className="text-sm font-medium">Add Product</div>
          </button>
          <button className="p-4 border-2 border-dashed border-green-300 rounded-lg hover:border-green-500 transition-colors">
            <div className="text-2xl mb-2">👁️</div>
            <div className="text-sm font-medium">View Analytics</div>
          </button>
          <button className="p-4 border-2 border-dashed border-purple-300 rounded-lg hover:border-purple-500 transition-colors">
            <div className="text-2xl mb-2">🎯</div>
            <div className="text-sm font-medium">Create Promotion</div>
          </button>
          <button className="p-4 border-2 border-dashed border-red-300 rounded-lg hover:border-red-500 transition-colors">
            <div className="text-2xl mb-2">🚨</div>
            <div className="text-sm font-medium">Review Alerts</div>
          </button>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Activities</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="text-blue-500">📦</div>
              <span className="text-sm">New product "Laptop Dell XPS" added</span>
            </div>
            <span className="text-xs text-gray-500">2 minutes ago</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="text-red-500">�</div>
              <span className="text-sm">Suspicious activity detected in Aisle 3</span>
            </div>
            <span className="text-xs text-gray-500">15 minutes ago</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="text-orange-500">⚠️</div>
              <span className="text-sm">Low stock alert: iPhone 15 (5 remaining)</span>
            </div>
            <span className="text-xs text-gray-500">1 hour ago</span>
          </div>
        </div>
      </div>
    </div>
  );
}