'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/admin/DashboardLayout';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalCustomers: 0,
    customersInStore: 0,
    totalRevenue: 0,
    todayRevenue: 0,
    stockAlerts: 0
  });
  const [surveillanceStats, setSurveillanceStats] = useState({
    totalIncidents: 0,
    flaggedIncidents: 0,
    pendingReview: 0,
    notifications: 0
  });
  const [recentNotifications, setRecentNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load all dashboard data
    const loadDashboardData = async () => {
      try {
        // Fetch dashboard stats from backend
        const statsResponse = await fetch('/api/dashboard/stats');
        const statsData = await statsResponse.json();
        
        // Fetch stock alerts from notifications API
        const stockAlertsResponse = await fetch('/api/notifications/stock-alerts');
        const stockAlertsData = await stockAlertsResponse.json();
        
        if (statsData.success) {
          setStats({
            totalProducts: statsData.stats.totalProducts,
            totalCustomers: statsData.stats.totalCustomers,
            customersInStore: statsData.stats.customersInStore,
            totalRevenue: statsData.stats.totalRevenue,
            todayRevenue: statsData.stats.todayRevenue,
            stockAlerts: stockAlertsData.success ? stockAlertsData.alerts.length : statsData.stats.stockAlerts
          });
        }

        // Fetch surveillance incidents
        const incidentsResponse = await fetch('http://localhost:5000/surveillance/incidents');
        const incidentsData = await incidentsResponse.json();
        
        // Fetch notifications
        const notificationsResponse = await fetch('http://localhost:5000/surveillance/notifications?unread=true');
        const notificationsData = await notificationsResponse.json();
        
        if (incidentsResponse.ok) {
          setSurveillanceStats({
            totalIncidents: incidentsData.total || 0,
            flaggedIncidents: incidentsData.flagged || 0,
            pendingReview: incidentsData.pending_review || 0,
            notifications: notificationsData.unread || 0
          });
        }
        
        if (notificationsResponse.ok) {
          setRecentNotifications(notificationsData.notifications?.slice(0, 3) || []);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        setLoading(false);
      }
    };

    // Load dashboard data
    loadDashboardData();
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

  // Shimmer loading component
  const ShimmerCard = () => (
    <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-gray-200 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded w-24 mb-3"></div>
          <div className="h-8 bg-gray-300 rounded w-16 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-20"></div>
        </div>
        <div className="w-12 h-12 bg-gray-200 rounded"></div>
      </div>
    </div>
  );

  const ShimmerQuickAction = () => (
    <div className="flex items-center p-3 bg-gray-100 rounded-lg animate-pulse">
      <div className="w-8 h-8 bg-gray-300 rounded mr-3"></div>
      <div className="h-4 bg-gray-300 rounded w-24"></div>
    </div>
  );

  const ShimmerNotification = () => (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded animate-pulse">
      <div className="flex items-center space-x-3 flex-1">
        <div className="w-8 h-8 rounded-full bg-gray-300"></div>
        <div className="flex-1">
          <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6">
          {/* Header Shimmer */}
          <div className="mb-8 animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-64 mb-3"></div>
            <div className="h-4 bg-gray-200 rounded w-96"></div>
          </div>

          {/* Stats Grid Shimmer */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <ShimmerCard />
            <ShimmerCard />
            <ShimmerCard />
            <ShimmerCard />
          </div>

          {/* Surveillance Stats Shimmer */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <ShimmerCard />
            <ShimmerCard />
            <ShimmerCard />
            <ShimmerCard />
          </div>

          {/* Quick Actions & Notifications Shimmer */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="h-6 bg-gray-300 rounded w-32 mb-4 animate-pulse"></div>
              <div className="grid grid-cols-2 gap-4">
                <ShimmerQuickAction />
                <ShimmerQuickAction />
                <ShimmerQuickAction />
                <ShimmerQuickAction />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="h-6 bg-gray-300 rounded w-48 mb-4 animate-pulse"></div>
              <div className="space-y-3">
                <ShimmerNotification />
                <ShimmerNotification />
                <ShimmerNotification />
              </div>
            </div>
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
            title="Customers In-Store" 
            value={stats.customersInStore} 
            icon="🏪" 
            color="green"
            link="/admin/customers"
          />
          <StatCard 
            title="Total Revenue" 
            value={`$${stats.totalRevenue.toLocaleString()}`} 
            icon="💰" 
            color="yellow"
            link="/admin/analytics"
          />
          <StatCard 
            title="Stock Alerts" 
            value={stats.stockAlerts} 
            icon="🚨" 
            color="red"
            link="/admin/notifications-center"
          />
        </div>

        {/* Surveillance Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard 
            title="Total Videos" 
            value={surveillanceStats.totalIncidents} 
            icon="📹" 
            color="blue"
            link="/admin/surveillance-monitoring"
          />
          <StatCard 
            title="Normal Videos" 
            value={surveillanceStats.totalIncidents - surveillanceStats.flaggedIncidents} 
            icon="✅" 
            color="green"
            link="/admin/surveillance-monitoring?filter=normal"
          />
          <StatCard 
            title="Flagged Videos" 
            value={surveillanceStats.flaggedIncidents} 
            icon="🚨" 
            color="red"
            link="/admin/surveillance-monitoring?filter=flagged"
          />
          <StatCard 
            title="Pending Review" 
            value={surveillanceStats.pendingReview} 
            icon="⏳" 
            color="yellow"
            link="/admin/surveillance-monitoring?filter=pending"
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
              <Link href="/admin/notifications-center" className="flex items-center p-3 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors">
                <span className="text-2xl mr-3">🔔</span>
                <span className="font-medium text-gray-900">Notifications</span>
              </Link>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Security Notifications</h2>
            <div className="space-y-3">
              {recentNotifications.length > 0 ? (
                recentNotifications.map((notification, index) => (
                  <div key={notification.id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        notification.priority === 'high' ? 'bg-red-100' : 'bg-green-100'
                      }`}>
                        {notification.priority === 'high' ? '🚨' : '📹'}
                      </div>
                      <div>
                        <p className="font-medium">{notification.title}</p>
                        <p className="text-sm text-gray-600">{notification.message}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(notification.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    {notification.priority === 'high' && (
                      <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full">
                        URGENT
                      </span>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <p>No recent notifications</p>
                </div>
              )}
            </div>
            {recentNotifications.length > 0 && (
              <div className="mt-4">
                <Link 
                  href="/admin/surveillance-monitoring" 
                  className="text-blue-500 text-sm hover:underline"
                >
                  View All Notifications →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}