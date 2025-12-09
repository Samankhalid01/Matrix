'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [complaintCount, setComplaintCount] = useState(0);
  const pathname = usePathname();
  const router = useRouter();
  const fetchInProgress = useRef(false);
  const lastFetchTime = useRef(0);
  const CACHE_DURATION = 30000; // 30 seconds cache (increased from 5s)

  // Fetch complaint count with caching and deduplication
  useEffect(() => {
    fetchComplaintCount();
    
    // Set up real-time subscription with debouncing
    const subscription = supabase
      .channel('complaints')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'Complaint' }, () => {
        // Debounce real-time updates
        setTimeout(() => fetchComplaintCount(), 500);
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchComplaintCount = async () => {
    // Prevent duplicate concurrent requests
    if (fetchInProgress.current) {
      return;
    }
    
    // Use cache if recent
    const now = Date.now();
    if (now - lastFetchTime.current < CACHE_DURATION) {
      return;
    }
    
    fetchInProgress.current = true;
    lastFetchTime.current = now;
    
    try {
      // Optimized query: Only select id field for counting (not *)
      const { count, error } = await supabase
        .from('Complaint')
        .select('id', { count: 'exact', head: true })
        .in('status', ['pending', 'in-progress'])
        .limit(100); // Add limit for faster counting
      
      if (!error) {
        setComplaintCount(count || 0);
      }
    } catch (error) {
      console.error('Error fetching complaint count:', error);
    } finally {
      fetchInProgress.current = false;
    }
  };

  const menuItems = [
    { 
      title: 'Dashboard', 
      path: '/dashboard'
    },
    { 
      title: 'QR Shopping', 
      path: '/admin/scan-shopping'
    },
    { 
      title: 'Products', 
      path: '/admin/products'
    },
    { 
      title: 'Customers', 
      path: '/admin/customers'
    },
    { 
      title: 'Analytics', 
      path: '/admin/analytics-dashboard'
    },
    { 
      title: 'Promotions', 
      path: '/admin/promotions'
    },
    { 
      title: 'Notifications', 
      path: '/admin/notifications-center'
    },
    { 
      title: 'Ad Generation', 
      path: '/admin/image-generation'
    },
    { 
      title: 'Complaints', 
      path: '/admin/complaints',
      badge: complaintCount > 0 ? complaintCount : null
    },
    { 
      title: 'Theft Detection', 
      path: '/admin/yolo-theft-detection'
    }
  ];

  const handleLogout = () => {
    router.push('/landing');
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gradient-to-b from-gray-800/90 via-gray-900/90 to-black/90 backdrop-blur-xl transition-all duration-300 flex flex-col shadow-2xl border-r border-purple-500/20`}>
        {/* Logo */}
        <div className="flex items-center justify-between p-6 border-b border-purple-500/20">
          <div className="flex items-center gap-3">
            <div className="w-21 h-21 flex items-center justify-center">
              <Image src="/imagebg.png" alt="Matrix Logo" width={380} height={740} className="w-full h-full object-contain" priority fetchpriority="high" />
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-white/70 hover:text-white lg:block"
          >
            {sidebarOpen ? '←' : '→'}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <Link
              key={item.title}
              href={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative ${
                pathname === item.path
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/50'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              {sidebarOpen && (
                <>
                  <span className="font-medium text-sm flex-1">{item.title}</span>
                  {item.badge && (
                    <span className="bg-gradient-to-r from-red-600 to-red-700 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse shadow-lg">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
              {!sidebarOpen && item.badge && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-600 to-red-700 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full animate-pulse shadow-lg">
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
        </nav>

        {/* Bottom Section - Logout */}
        <div className="p-4 space-y-2 border-t border-purple-500/20">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-300 hover:text-white hover:bg-red-600/20 hover:border hover:border-red-500/40 transition-all duration-200"
          >
            {sidebarOpen && <span className="font-medium text-sm">Logout</span>}
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto bg-gradient-to-br from-gray-900 via-purple-900 to-black">
        {children}
      </div>
    </div>
  );
};

export default DashboardLayout;