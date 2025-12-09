'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalCustomers: 0,
    todaySales: 0,
    lowStock: 0,
    suspiciousActivities: 0,
    activePromotions: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      
      // Fetch total products
      const { count: productsCount } = await supabase
        .from('Product')
        .select('*', { count: 'exact', head: true });

      // Fetch total customers
      const { count: customersCount } = await supabase
        .from('Customer')
        .select('*', { count: 'exact', head: true });

      // Fetch today's sales
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const { data: todayTransactions } = await supabase
        .from('Transaction')
        .select('total_amount')
        .gte('transaction_date', today.toISOString());

      const todaySales = todayTransactions?.reduce((sum, t) => sum + parseFloat(t.total_amount || 0), 0) || 0;

      // Fetch low stock products (quantity < 10)
      const { count: lowStockCount } = await supabase
        .from('Product')
        .select('*', { count: 'exact', head: true })
        .lt('quantity', 10);

      // Fetch suspicious activities from theft_alerts table
      const { count: suspiciousCount } = await supabase
        .from('theft_alerts')
        .select('*', { count: 'exact', head: true })
        .gte('detected_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      // Fetch active promotions
      const { count: promotionsCount } = await supabase
        .from('Promotion')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      setStats({
        totalProducts: productsCount || 0,
        totalCustomers: customersCount || 0,
        todaySales: todaySales,
        lowStock: lowStockCount || 0,
        suspiciousActivities: suspiciousCount || 0,
        activePromotions: promotionsCount || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-white bg-black min-h-screen">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#A855F7] mb-2 drop-shadow-lg">Dashboard</h1>
            <p className="text-white">Welcome to Matrix Retail Management System</p>
          </div>
          <div className="flex items-center gap-3">
            <input
              placeholder="Search product..."
              className="px-4 py-2 rounded-lg bg-[#232136] border border-[#A855F7] text-white focus:outline-none focus:ring-2 focus:ring-[#A855F7]"
            />
            <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#A855F7] to-[#7B1FA2] text-white font-semibold">Export CSV</button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="relative bg-gradient-to-br from-[#181028] via-[#232136] to-[#2a1439] p-6 rounded-xl shadow-2xl border-2 border-[#A855F7]">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#A855F7] to-[#7B1FA2] rounded-l-lg"></div>
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-sm text-[#A855F7]">Total Products</p>
              <p className="text-2xl font-bold text-white mt-1">{stats.totalProducts}</p>
            </div>
            <div className="text-3xl text-[#A855F7]">📦</div>
          </div>
        </div>

        <div className="relative bg-gradient-to-br from-[#181028] via-[#232136] to-[#2a1439] p-6 rounded-xl shadow-2xl border-2 border-green-400">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-green-300 to-emerald-400 rounded-l-lg"></div>
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-sm text-green-400">Total Customers</p>
              <p className="text-2xl font-bold text-white mt-1">{stats.totalCustomers}</p>
            </div>
            <div className="text-3xl text-green-400">👥</div>
          </div>
        </div>

        <div className="relative bg-gradient-to-br from-[#181028] via-[#232136] to-[#2a1439] p-6 rounded-xl shadow-2xl border-2 border-yellow-400">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-yellow-300 to-yellow-500 rounded-l-lg"></div>
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-sm text-yellow-400">Total Revenue</p>
              <p className="text-2xl font-bold text-white mt-1">${stats.todaySales.toLocaleString()}</p>
            </div>
            <div className="text-3xl text-yellow-400">💰</div>
          </div>
        </div>

        <div className="relative bg-gradient-to-br from-[#181028] via-[#232136] to-[#2a1439] p-6 rounded-xl shadow-2xl border-2 border-red-400">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-red-300 to-red-500 rounded-l-lg"></div>
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-sm text-red-400">Stock Alerts</p>
              <p className="text-2xl font-bold text-white mt-1">{stats.lowStock}</p>
            </div>
            <div className="text-3xl text-red-400">🚨</div>
          </div>
        </div>
      </div>

      {/* Main analytics area - charts and lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-gradient-to-br from-[#181028] via-[#232136] to-[#2a1439] p-6 rounded-xl shadow-2xl border-2 border-[#A855F7]">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-[#A855F7]">Total Products Sales</h3>
                <p className="text-white">Overview for the last 7 days</p>
              </div>
              <div className="text-sm text-[#A855F7]">This week</div>
            </div>
            {/* Simple bar chart placeholder */}
            <div className="w-full h-48 flex items-end gap-3">
              {[120, 80, 150, 90, 170, 130, 200].map((h, i) => (
                <div key={i} className="flex-1 bg-gradient-to-t from-[#A855F7] to-[#7B1FA2] rounded-t-md hover:opacity-90 transition-opacity" style={{height: `${(h/200)*100}%`}} />
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#181028] via-[#232136] to-[#2a1439] p-6 rounded-xl shadow-2xl border-2 border-[#A855F7]">
            <h3 className="text-lg font-semibold text-[#A855F7] mb-3">Recent Orders</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead>
                  <tr className="text-gray-400 text-sm">
                    <th className="py-2">Order #</th>
                    <th className="py-2">Product</th>
                    <th className="py-2">Date</th>
                    <th className="py-2">Amount</th>
                    <th className="py-2">Status</th>
                  </tr>
                </thead>
                <tbody className="text-gray-300">
                  {[1,2,3,4].map(i => (
                    <tr key={i} className="border-t border-white/6">
                      <td className="py-3">#00{i+123}</td>
                      <td className="py-3">Example Product {i}</td>
                      <td className="py-3">20 Nov 2025</td>
                      <td className="py-3">${(i*120).toFixed(2)}</td>
                      <td className="py-3 text-sm text-green-400">Paid</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-br from-[#181028] via-[#232136] to-[#2a1439] p-6 rounded-xl shadow-2xl border-2 border-[#A855F7]">
            <h3 className="text-lg font-semibold text-[#A855F7] mb-4">Sales Statistics</h3>
            <div className="flex items-center justify-center">
              {/* Donut placeholder */}
              <div className="w-40 h-40 rounded-full bg-gradient-to-b from-[#A855F7] to-[#7B1FA2] flex items-center justify-center text-white font-bold text-xl">
                23,324
              </div>
            </div>
            <div className="mt-4 text-sm text-white">Total Number of Sales</div>
          </div>

          <div className="bg-gradient-to-br from-[#181028] via-[#232136] to-[#2a1439] p-6 rounded-xl shadow-2xl border-2 border-[#A855F7]">
            <h3 className="text-lg font-semibold text-[#A855F7] mb-3">Top Selling Products</h3>
            <div className="space-y-3 text-white">
              {["Product A","Product B","Product C"].map((p,idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#232136] rounded flex items-center justify-center text-[#A855F7]">IMG</div>
                    <div>
                      <div className="font-medium text-white">{p}</div>
                      <div className="text-sm text-[#A855F7]">${(idx+1)*120}</div>
                    </div>
                  </div>
                  <div className="text-sm text-[#A855F7]">{(idx+1)*1200} sold</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-gradient-to-br from-[#181028] via-[#232136] to-[#2a1439] rounded-xl shadow-2xl border-2 border-[#A855F7] p-6">
        <h2 className="text-xl font-semibold mb-4 text-[#A855F7]">Recent Activities</h2>
        <div className="space-y-3 text-white">
          <div className="flex items-center justify-between py-2 border-t border-[#A855F7]">
            <div className="flex items-center space-x-3">
              <div className="text-[#A855F7]">📦</div>
              <span className="text-sm">New product "Laptop Dell XPS" added</span>
            </div>
            <span className="text-xs text-[#A855F7]">2 minutes ago</span>
          </div>
          <div className="flex items-center justify-between py-2 border-t border-[#A855F7]">
            <div className="flex items-center space-x-3">
              <div className="text-red-400">🚨</div>
              <span className="text-sm">Suspicious activity detected in Aisle 3</span>
            </div>
            <span className="text-xs text-red-400">15 minutes ago</span>
          </div>
          <div className="flex items-center justify-between py-2 border-t border-[#A855F7]">
            <div className="flex items-center space-x-3">
              <div className="text-yellow-400">⚠️</div>
              <span className="text-sm">Low stock alert: iPhone 15 (5 remaining)</span>
            </div>
            <span className="text-xs text-yellow-400">1 hour ago</span>
          </div>
        </div>
      </div>
    </div>
  );
}