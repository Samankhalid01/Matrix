'use client';
import { useState, useEffect, useMemo, useCallback, memo } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/admin/DashboardLayout';
import { 
  FiPackage, 
  FiShoppingBag, 
  FiDollarSign, 
  FiAlertTriangle,
  FiTrendingUp,
  FiUsers,
  FiBarChart2,
  FiShield,
  FiBell,
  FiVideo,
  FiCheckCircle,
  FiClock
} from 'react-icons/fi';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

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
  
  // Memoize chart data to prevent unnecessary re-calculations
  const revenueData = useMemo(() => [
    { name: 'Mon', revenue: 4000, orders: 24 },
    { name: 'Tue', revenue: 3000, orders: 18 },
    { name: 'Wed', revenue: 5000, orders: 32 },
    { name: 'Thu', revenue: 4500, orders: 28 },
    { name: 'Fri', revenue: 6000, orders: 38 },
    { name: 'Sat', revenue: 8000, orders: 48 },
    { name: 'Sun', revenue: 7000, orders: 42 }
  ], []);

  const categoryData = useMemo(() => [
    { name: 'Electronics', value: 45, color: '#A855F7' },
    { name: 'Clothing', value: 25, color: '#EC4899' },
    { name: 'Food', value: 20, color: '#3B82F6' },
    { name: 'Others', value: 10, color: '#10B981' }
  ], []);

  const stockData = useMemo(() => [
    { name: 'In Stock', value: 120 },
    { name: 'Low Stock', value: 20 },
    { name: 'Out of Stock', value: 8 }
  ], []);

  useEffect(() => {
    // Progressive loading strategy: Load essential data first, then enhance gradually
    
    // PHASE 1: Load only critical stats (fastest - show dashboard immediately)
    const loadCriticalData = async () => {
      try {
        const statsResponse = await fetch('/api/dashboard/stats');
        const statsData = await statsResponse.json();
        
        if (statsData.success) {
          setStats({
            totalProducts: statsData.stats.totalProducts,
            totalCustomers: statsData.stats.totalCustomers,
            customersInStore: statsData.stats.customersInStore,
            totalRevenue: statsData.stats.totalRevenue,
            todayRevenue: statsData.stats.todayRevenue,
            stockAlerts: statsData.stats.stockAlerts || 0
          });
        }

        // Show dashboard immediately after critical data loads
        setLoading(false);

      } catch (error) {
        console.error('Error loading critical data:', error);
        setLoading(false);
      }
    };

    // PHASE 2: Load stock alerts after dashboard is visible (progressive enhancement)
    const loadStockAlerts = async () => {
      try {
        const stockAlertsResponse = await fetch('/api/notifications/stock-alerts?auto_generate=false');
        const stockAlertsData = await stockAlertsResponse.json();
        
        if (stockAlertsData.success) {
          // Update stock alerts count
          setStats(prev => ({
            ...prev,
            stockAlerts: stockAlertsData.alerts?.length || prev.stockAlerts
          }));
        }
      } catch (error) {
        console.log('Stock alerts loading deferred');
      }
    };

    // PHASE 3: Load surveillance data last (optional features)
    const loadSurveillanceData = async () => {
      try {
        const [incidentsResponse, notificationsResponse] = await Promise.all([
          fetch('http://localhost:5000/surveillance/incidents', {
            signal: AbortSignal.timeout(3000)
          }),
          fetch('http://localhost:5000/surveillance/notifications?unread=true', {
            signal: AbortSignal.timeout(3000)
          })
        ]);
        
        if (incidentsResponse.ok && notificationsResponse.ok) {
          const [incidentsData, notificationsData] = await Promise.all([
            incidentsResponse.json(),
            notificationsResponse.json()
          ]);
          
          setSurveillanceStats({
            totalIncidents: incidentsData.total || 0,
            flaggedIncidents: incidentsData.flagged || 0,
            pendingReview: incidentsData.pending_review || 0,
            notifications: notificationsData.unread || 0
          });
          
          setRecentNotifications(notificationsData.notifications?.slice(0, 3) || []);
        }
      } catch (error) {
        console.log('Surveillance service unavailable (optional)');
      }
    };

    // Execute progressive loading
    const timeoutId = setTimeout(() => {
      // Phase 1: Load critical data immediately
      loadCriticalData().then(() => {
        // Phase 2: Load stock alerts after 300ms
        setTimeout(() => loadStockAlerts(), 300);
        
        // Phase 3: Load surveillance data after 800ms
        setTimeout(() => loadSurveillanceData(), 800);
      });
    }, 100);

    return () => clearTimeout(timeoutId);
  }, []);

  // Memoize StatCard component to prevent unnecessary re-renders
  const StatCard = memo(({ title, value, icon: Icon, color = "purple", link, trend }) => (
    <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl p-6 rounded-3xl shadow-2xl border border-purple-500/20 hover:border-purple-500/40 transition-all hover:scale-105 duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl bg-${color}-500/20`}>
          <Icon className={`w-6 h-6 text-${color}-400`} />
        </div>
        {trend && (
          <div className="flex items-center gap-1 text-green-400 text-sm">
            <FiTrendingUp className="w-4 h-4" />
            <span>{trend}%</span>
          </div>
        )}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-400 mb-1">{title}</p>
        <p className="text-3xl font-bold text-white mb-2">{value}</p>
        {link && (
          <Link href={link} className="text-purple-400 text-sm hover:text-purple-300 transition-colors inline-flex items-center gap-1">
            View Details →
          </Link>
        )}
      </div>
    </div>
  ));

  // Memoize ShimmerCard component
  const ShimmerCard = memo(() => (
    <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl p-6 rounded-3xl shadow-2xl border border-gray-700 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="h-4 bg-gray-700 rounded w-24 mb-3"></div>
          <div className="h-8 bg-gray-600 rounded w-16 mb-2"></div>
          <div className="h-3 bg-gray-700 rounded w-20"></div>
        </div>
        <div className="w-12 h-12 bg-gray-700 rounded"></div>
      </div>
    </div>
  ));

  // Memoize ShimmerQuickAction component
  const ShimmerQuickAction = memo(() => (
    <div className="flex items-center p-3 bg-gray-700/50 rounded-lg animate-pulse">
      <div className="w-8 h-8 bg-gray-600 rounded mr-3"></div>
      <div className="h-4 bg-gray-700 rounded w-24"></div>
    </div>
  ));

  // Memoize ShimmerNotification component
  const ShimmerNotification = memo(() => (
    <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded animate-pulse">
      <div className="flex items-center space-x-3 flex-1">
        <div className="w-8 h-8 rounded-full bg-gray-600"></div>
        <div className="flex-1">
          <div className="h-4 bg-gray-600 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-700 rounded w-full mb-2"></div>
          <div className="h-3 bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>
    </div>
  ));

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6">
          {/* Header Shimmer */}
          <div className="mb-8 animate-pulse">
            <div className="h-8 bg-gray-700 rounded w-64 mb-3"></div>
            <div className="h-4 bg-gray-600 rounded w-96"></div>
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
            <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl p-6 rounded-3xl shadow-2xl border border-gray-700">
              <div className="h-6 bg-gray-700 rounded w-32 mb-4 animate-pulse"></div>
              <div className="grid grid-cols-2 gap-4">
                <ShimmerQuickAction />
                <ShimmerQuickAction />
                <ShimmerQuickAction />
                <ShimmerQuickAction />
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl p-6 rounded-3xl shadow-2xl border border-gray-700">
              <div className="h-6 bg-gray-700 rounded w-48 mb-4 animate-pulse"></div>
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
          <h1 className="text-3xl font-bold text-white drop-shadow-lg">Dashboard Overview</h1>
          <p className="text-gray-300 mt-2">Welcome back! Here's what's happening with your store today.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            title="Total Products" 
            value={stats.totalProducts} 
            icon={FiPackage} 
            color="purple"
            link="/admin/products"
            trend={12}
          />
          <StatCard 
            title="Customers In-Store" 
            value={stats.customersInStore} 
            icon={FiUsers} 
            color="blue"
            link="/admin/customers"
            trend={8}
          />
          <StatCard 
            title="Total Revenue" 
            value={`$${stats.totalRevenue.toLocaleString()}`} 
            icon={FiDollarSign} 
            color="green"
            link="/admin/analytics"
            trend={15}
          />
          <StatCard 
            title="Stock Alerts" 
            value={stats.stockAlerts} 
            icon={FiAlertTriangle} 
            color="red"
            link="/admin/notifications-center"
          />
        </div>

        {/* Surveillance Stats
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
        </div> */}

        {/* Revenue Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl p-6 rounded-3xl shadow-2xl border border-purple-500/20">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <FiTrendingUp className="text-purple-400" />
              Weekly Revenue Trend
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#A855F7" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#A855F7" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #A855F7',
                    borderRadius: '8px',
                    color: '#fff'
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#A855F7" 
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl p-6 rounded-3xl shadow-2xl border border-purple-500/20">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <FiShoppingBag className="text-pink-400" />
              Sales by Category
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #A855F7',
                    borderRadius: '8px',
                    color: '#fff'
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl p-6 rounded-3xl shadow-2xl border border-purple-500/20">
            <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-4">
              <Link href="/admin/products" className="flex items-center gap-3 p-4 bg-purple-600/20 rounded-xl hover:bg-purple-600/30 transition-all hover:scale-105 border border-purple-500/30 group">
                <FiPackage className="w-6 h-6 text-purple-400 group-hover:scale-110 transition-transform" />
                <span className="font-medium text-white">Manage Products</span>
              </Link>
              <Link href="/admin/analytics" className="flex items-center gap-3 p-4 bg-blue-600/20 rounded-xl hover:bg-blue-600/30 transition-all hover:scale-105 border border-blue-500/30 group">
                <FiBarChart2 className="w-6 h-6 text-blue-400 group-hover:scale-110 transition-transform" />
                <span className="font-medium text-white">View Analytics</span>
              </Link>
              <Link href="/admin/theft-detection" className="flex items-center gap-3 p-4 bg-red-600/20 rounded-xl hover:bg-red-600/30 transition-all hover:scale-105 border border-red-500/30 group">
                <FiShield className="w-6 h-6 text-red-400 group-hover:scale-110 transition-transform" />
                <span className="font-medium text-white">Theft Detection</span>
              </Link>
              <Link href="/admin/notifications-center" className="flex items-center gap-3 p-4 bg-orange-600/20 rounded-xl hover:bg-orange-600/30 transition-all hover:scale-105 border border-orange-500/30 group">
                <FiBell className="w-6 h-6 text-orange-400 group-hover:scale-110 transition-transform" />
                <span className="font-medium text-white">Notifications</span>
              </Link>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl p-6 rounded-3xl shadow-2xl border border-purple-500/20">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <FiBell className="text-purple-400" />
              Recent Security Notifications
            </h2>
            <div className="space-y-3">
              {recentNotifications.length > 0 ? (
                recentNotifications.map((notification, index) => (
                  <div key={notification.id || index} className="flex items-center justify-between p-4 bg-gray-700/30 rounded-xl border border-gray-600/20 hover:border-purple-500/40 transition-all">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        notification.priority === 'high' ? 'bg-red-500/20 border border-red-500/40' : 'bg-green-500/20 border border-green-500/40'
                      }`}>
                        {notification.priority === 'high' ? <FiAlertTriangle className="w-5 h-5 text-red-400" /> : <FiCheckCircle className="w-5 h-5 text-green-400" />}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-white">{notification.title}</p>
                        <p className="text-sm text-gray-300">{notification.message}</p>
                        <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                          <FiClock className="w-3 h-3" />
                          {new Date(notification.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    {notification.priority === 'high' && (
                      <span className="bg-gradient-to-r from-red-600 to-red-700 text-white text-xs px-3 py-1 rounded-full font-semibold">
                        URGENT
                      </span>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <FiCheckCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No recent notifications</p>
                </div>
              )}
            </div>
            {recentNotifications.length > 0 && (
              <div className="mt-4">
                <Link 
                  href="/admin/surveillance-monitoring" 
                  className="text-purple-400 text-sm hover:text-purple-300 transition-colors inline-flex items-center gap-1"
                >
                  View All Notifications →
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Stock Status Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl p-6 rounded-3xl shadow-2xl border border-purple-500/20">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <FiBarChart2 className="text-purple-400" />
              Orders Overview
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #A855F7',
                    borderRadius: '8px',
                    color: '#fff'
                  }} 
                />
                <Legend />
                <Bar dataKey="orders" fill="#A855F7" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl p-6 rounded-3xl shadow-2xl border border-purple-500/20">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <FiPackage className="text-purple-400" />
              Stock Status
            </h2>
            <div className="space-y-4">
              {stockData.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">{item.name}</span>
                    <span className="text-sm font-semibold text-white">{item.value}</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        index === 0 ? 'bg-green-500' : 
                        index === 1 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${(item.value / 148) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
              <Link 
                href="/admin/products" 
                className="mt-4 block text-center w-full bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-white py-3 rounded-xl transition-all font-medium"
              >
                Manage Inventory
              </Link>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}