'use client';
import { useState } from 'react';

const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { title: 'Dashboard', icon: '📊', path: '/admin' },
    { title: 'Products', icon: '📦', path: '/admin/products' },
    { title: 'Customer Management', icon: '👥', path: '/admin/customers' },
    { title: 'Analytics', icon: '📈', path: '/admin/analytics' },
    { title: 'Generate Ad Images', icon: '🎨', path: '/admin/image-generation' },
    { title: 'Surveillance Monitor', icon: '🛡️', path: '/admin/surveillance-monitoring' },
    { title: 'Theft Detection', icon: '🎥', path: '/admin/theft-detection' },
    { title: 'Notifications', icon: '🔔', path: '/admin/notifications' },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}
      >
        <div className="h-full px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Admin Panel</h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden"
            >
              ✕
            </button>
          </div>
          <nav>
            <ul className="space-y-2">
              {menuItems.map((item, index) => (
                <li key={index}>
                  <a
                    href={item.path}
                    className="flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-100"
                  >
                    <span className="mr-3">{item.icon}</span>
                    {item.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 overflow-x-hidden overflow-y-auto">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="flex items-center justify-between px-6 py-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-500 lg:hidden"
            >
              ☰
            </button>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-500 hover:text-gray-600">
                🔔
              </button>
              <button className="p-2 text-gray-500 hover:text-gray-600">
                👤
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;