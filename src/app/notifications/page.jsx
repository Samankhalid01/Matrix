'use client';
import { useState } from 'react';
import DashboardLayout from '@/components/admin/DashboardLayout';

const NotificationsPage = () => {
  const [filter, setFilter] = useState('all');

  const mockNotifications = [
    {
      id: 1,
      type: 'stock',
      title: 'Low Stock Alert',
      description: 'Product XYZ is running low on stock (5 units remaining)',
      time: '5 minutes ago',
      priority: 'high'
    },
    {
      id: 2,
      type: 'theft',
      title: 'Suspicious Activity',
      description: 'Potential theft detected in Electronics section',
      time: '10 minutes ago',
      priority: 'critical'
    },
    {
      id: 3,
      type: 'customer',
      title: 'New Customer Complaint',
      description: 'Customer reported issue with product quality',
      time: '1 hour ago',
      priority: 'medium'
    }
    // Add more mock notifications as needed
  ];

  const getNotificationStyle = (priority) => {
    switch (priority) {
      case 'critical':
        return 'border-l-4 border-red-500 bg-red-50';
      case 'high':
        return 'border-l-4 border-yellow-500 bg-yellow-50';
      case 'medium':
        return 'border-l-4 border-blue-500 bg-blue-50';
      default:
        return 'border-l-4 border-gray-500 bg-gray-50';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'stock':
        return '📦';
      case 'theft':
        return '🚨';
      case 'customer':
        return '👤';
      default:
        return '📢';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Notifications</h2>
          <div className="flex gap-4">
            <select
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All Notifications</option>
              <option value="stock">Stock Alerts</option>
              <option value="theft">Theft Detection</option>
              <option value="customer">Customer Related</option>
            </select>
            <button className="px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600">
              Mark All as Read
            </button>
          </div>
        </div>

        {/* Notification Categories */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="text-2xl mb-2">📢</div>
            <h3 className="text-lg font-semibold">All Notifications</h3>
            <p className="text-3xl font-bold mt-2">24</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="text-2xl mb-2">🚨</div>
            <h3 className="text-lg font-semibold">Security Alerts</h3>
            <p className="text-3xl font-bold mt-2">5</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="text-2xl mb-2">📦</div>
            <h3 className="text-lg font-semibold">Stock Alerts</h3>
            <p className="text-3xl font-bold mt-2">8</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="text-2xl mb-2">👤</div>
            <h3 className="text-lg font-semibold">Customer Updates</h3>
            <p className="text-3xl font-bold mt-2">11</p>
          </div>
        </div>

        {/* Notification List */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold">Recent Notifications</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {mockNotifications
              .filter(notif => filter === 'all' || notif.type === filter)
              .map((notification) => (
                <div
                  key={notification.id}
                  className={`p-6 ${getNotificationStyle(notification.priority)}`}
                >
                  <div className="flex items-start">
                    <div className="text-2xl mr-4">
                      {getTypeIcon(notification.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-lg font-medium">{notification.title}</h4>
                        <span className="text-sm text-gray-500">{notification.time}</span>
                      </div>
                      <p className="mt-1 text-gray-600">{notification.description}</p>
                      <div className="mt-4 flex gap-4">
                        <button className="text-sm text-blue-600 hover:text-blue-800">
                          Mark as Read
                        </button>
                        <button className="text-sm text-gray-600 hover:text-gray-800">
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Notification Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Stock Alerts</h4>
                <p className="text-sm text-gray-600">Get notified when items are low in stock</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Security Alerts</h4>
                <p className="text-sm text-gray-600">Get notified about suspicious activities</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Customer Updates</h4>
                <p className="text-sm text-gray-600">Get notified about customer complaints and feedback</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default NotificationsPage;
